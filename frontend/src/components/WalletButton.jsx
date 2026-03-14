import { useWallet } from "../context/WalletContext";

/** Truncate 0xAbCd…1234 */
function shortAddress(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { account, isConnecting, wrongNetwork, connectWallet, switchNetwork } =
    useWallet();

  // MetaMask not installed
  if (!window.ethereum) {
    return (
      <a
        href="https://metamask.io/download"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-lg text-sm bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30 transition-colors"
      >
        Install MetaMask
      </a>
    );
  }

  // Connected but on wrong network
  if (account && wrongNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-colors"
      >
        Switch to Polygon Amoy
      </button>
    );
  }

  // Connected on correct network — show truncated address
  if (account) {
    return (
      <span className="px-3 py-1.5 rounded-lg text-sm bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono select-all">
        {shortAddress(account)}
      </span>
    );
  }

  // Not connected — primary CTA
  return (
    <button
      id="connect-wallet-btn"
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
