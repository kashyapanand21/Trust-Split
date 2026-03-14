import { ethers } from "ethers";
import TrustSplitABI from "../abi/TrustSplit.json";
import addressData   from "../abi/address.json";

const CONTRACT_ADDRESS =
  addressData?.address || import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * Returns an ethers.Contract instance.
 * @param {ethers.Signer | ethers.Provider} providerOrSigner
 */
export function getContract(providerOrSigner) {
  return new ethers.Contract(CONTRACT_ADDRESS, TrustSplitABI, providerOrSigner);
}

export { CONTRACT_ADDRESS };
