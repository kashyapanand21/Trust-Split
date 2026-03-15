import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID) || 80002; // Polygon Amoy

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount]           = useState(null);
  const [provider, setProvider]         = useState(null);
  const [signer, setSigner]             = useState(null);
  const [chainId, setChainId]           = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // ── Internal: build provider/signer state from window.ethereum ────────────
  const _sync = useCallback(async () => {
    const _provider = new ethers.BrowserProvider(window.ethereum);
    const _signer   = await _provider.getSigner();
    const _account  = await _signer.getAddress();
    const { chainId: _cid } = await _provider.getNetwork();
    const _chainId  = Number(_cid);

    setProvider(_provider);
    setSigner(_signer);
    setAccount(_account);
    setChainId(_chainId);
    setWrongNetwork(_chainId !== CHAIN_ID);
  }, []);

  // ── Auto-reconnect if MetaMask is already connected ───────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => { if (accounts.length > 0) _sync(); })
      .catch(console.error);

    // MetaMask events
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null); setProvider(null); setSigner(null);
        setChainId(null); setWrongNetwork(false);
      } else {
        _sync();
      }
    };

    const onChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged",    onChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged",    onChainChanged);
    };
  }, [_sync]);

  // ── connectWallet: request accounts then sync state ───────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download", "_blank");
      return;
    }
    setIsConnecting(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await _sync();
    } catch (err) {
      console.error("connectWallet error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [_sync]);

  // ── switchNetwork: switch to Polygon Amoy, add if missing ─────────────────
  const switchNetwork = useCallback(async () => {
    const hexChainId = `0x${CHAIN_ID.toString(16)}`;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: hexChainId,
            chainName: import.meta.env.VITE_NETWORK_NAME || "Polygon Amoy Testnet",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: [import.meta.env.VITE_RPC_URL || "https://rpc-amoy.polygon.technology"],
            blockExplorerUrls: ["https://amoy.polygonscan.com"],
          }],
        });
      } else {
        console.error("switchNetwork error:", err);
      }
    }
  }, []);

  // ── disconnect: clear local state (MetaMask has no programmatic revoke) ───
  const disconnect = useCallback(() => {
    setAccount(null); setProvider(null); setSigner(null);
    setChainId(null); setWrongNetwork(false);
  }, []);

  // ── signMessage: sign a message for authentication ─────────────────────────
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }
    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error("signMessage error:", err);
      throw err;
    }
  }, [signer]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        wrongNetwork,
        connectWallet,
        switchNetwork,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
