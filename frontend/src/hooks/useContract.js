import { useMemo } from "react";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../utils/contract";

/**
 * Hook to get contract instance with current signer/provider
 * @returns {ethers.Contract|null} Contract instance or null
 */
export function useContract() {
  const { signer, provider } = useWallet();

  return useMemo(() => {
    let contract = null;
    if (signer) {
      contract = getContract(signer);
    } else if (provider) {
      contract = getContract(provider);
    }
    if (!contract) return null;
    return contract;
  }, [signer, provider]);
}

