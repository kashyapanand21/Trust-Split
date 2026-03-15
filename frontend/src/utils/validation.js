import { ethers } from "ethers";

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAddress(address) {
  if (!address || address.trim() === "") {
    return { valid: false, error: "Address is required" };
  }
  if (!ethers.isAddress(address)) {
    return { valid: false, error: "Invalid Ethereum address" };
  }
  return { valid: true };
}

/**
 * Validate multiple addresses
 * @param {string[]} addresses - Array of addresses
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAddresses(addresses) {
  if (!addresses || addresses.length === 0) {
    return { valid: false, error: "At least one address is required" };
  }

  const seen = new Set();
  for (const addr of addresses) {
    const trimmed = addr.trim();
    if (!trimmed) continue;

    const validation = validateAddress(trimmed);
    if (!validation.valid) {
      return validation;
    }

    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) {
      return { valid: false, error: "Duplicate addresses found" };
    }
    seen.add(lower);
  }

  return { valid: true };
}

/**
 * Validate amount
 * @param {string|number} amount - Amount to validate
 * @param {number} min - Minimum value (default: 0)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAmount(amount, min = 0) {
  if (!amount || amount === "") {
    return { valid: false, error: "Amount is required" };
  }

  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { valid: false, error: "Amount must be a number" };
  }

  if (num <= min) {
    return { valid: false, error: `Amount must be greater than ${min}` };
  }

  return { valid: true };
}

/**
 * Validate percentage
 * @param {string|number} percentage - Percentage value
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePercentage(percentage) {
  const num = parseFloat(percentage);
  if (isNaN(num)) {
    return { valid: false, error: "Percentage must be a number" };
  }
  if (num < 0 || num > 100) {
    return { valid: false, error: "Percentage must be between 0 and 100" };
  }
  return { valid: true };
}

/**
 * Validate group name
 * @param {string} name - Group name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateGroupName(name) {
  if (!name || name.trim() === "") {
    return { valid: false, error: "Group name is required" };
  }
  if (name.trim().length < 3) {
    return { valid: false, error: "Group name must be at least 3 characters" };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: "Group name must be less than 50 characters" };
  }
  return { valid: true };
}

