/**
 * Address utility functions
 */

import { ethers } from "ethers";

/**
 * Shorten an Ethereum address for display
 * @param {string} address - Full Ethereum address
 * @returns {string} Shortened address (0x1234...abcd)
 */
export function shortenAddress(address) {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Validate Ethereum address
 * @param {string} address
 * @returns {boolean}
 */
export function isValidAddress(address) {
  if (!address) return false;
  try {
    return ethers.isAddress(address);
  } catch {
    // Fallback to basic format check if ethers not available
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

