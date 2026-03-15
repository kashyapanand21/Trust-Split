import { ethers } from "ethers";

/**
 * Shorten an Ethereum address for display
 * @param {string} address - Full Ethereum address
 * @returns {string} Shortened address (0x1234...abcd)
 */
export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Format ETH amount with appropriate decimals
 * @param {string|bigint} amount - Amount in wei or as string
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted amount
 */
export function formatETH(amount, decimals = 4) {
  if (!amount) return "0";
  try {
    const formatted = ethers.formatEther(amount);
    const num = parseFloat(formatted);
    return num.toFixed(decimals);
  } catch {
    return "0";
  }
}

/**
 * Format currency based on type
 * @param {string|bigint} amount - Amount in wei or as string
 * @param {string} currency - Currency type (ETH, USDC, INR)
 * @returns {string} Formatted amount with currency symbol
 */
export function formatCurrency(amount, currency = "ETH") {
  // Handle both string numbers and wei amounts
  let formatted;
  try {
    if (typeof amount === "string" && amount.includes(".")) {
      // Already a decimal string
      formatted = parseFloat(amount).toFixed(4);
    } else {
      // Try to format as ETH (wei)
      formatted = formatETH(amount);
    }
  } catch {
    formatted = parseFloat(amount || 0).toFixed(4);
  }
  
  switch (currency.toUpperCase()) {
    case "ETH":
      return `${formatted} ETH`;
    case "USDC":
      return `$${formatted}`;
    case "INR":
      return `₹${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
}

/**
 * Format date to readable string
 * @param {number|Date} timestamp - Unix timestamp or Date object
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
  if (!timestamp) return "";
  // Handle both Unix timestamp (seconds) and milliseconds
  const date = typeof timestamp === "number" 
    ? (timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp))
    : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export function isValidAddress(address) {
  if (!address) return false;
  return ethers.isAddress(address);
}

