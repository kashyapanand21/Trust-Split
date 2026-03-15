/**
 * Expense data model and constants
 */

export const EXPENSE_CATEGORIES = {
  FOOD: "Food",
  TRAVEL: "Travel",
  HOTEL: "Hotel",
  ACTIVITY: "Activity",
  OTHER: "Other",
};

export const SPLIT_TYPES = {
  EQUAL: "equal",
  CUSTOM: "custom",
  PERCENTAGE: "percentage",
  EXCLUDE: "exclude",
};

/**
 * Create a new expense object
 * @param {Object} params
 * @returns {Object} Expense object
 */
export function createExpense({
  id,
  groupId,
  payer,
  amount,
  description,
  category = EXPENSE_CATEGORIES.OTHER,
  participants = [],
  splitType = SPLIT_TYPES.EQUAL,
  customSplits = {},
  percentageSplits = {},
  receiptUrl = "",
  timestamp = Date.now(),
}) {
  return {
    id: id || `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    groupId: Number(groupId),
    payer: payer.toLowerCase(),
    amount: parseFloat(amount),
    description: description.trim(),
    category,
    participants: participants.map((p) => p.toLowerCase()),
    splitType,
    customSplits: Object.fromEntries(
      Object.entries(customSplits).map(([k, v]) => [k.toLowerCase(), parseFloat(v)])
    ),
    percentageSplits: Object.fromEntries(
      Object.entries(percentageSplits).map(([k, v]) => [k.toLowerCase(), parseFloat(v)])
    ),
    receiptUrl,
    timestamp,
  };
}

/**
 * Validate expense object
 * @param {Object} expense
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateExpense(expense) {
  if (!expense.description || expense.description.trim() === "") {
    return { valid: false, error: "Description is required" };
  }

  if (!expense.amount || expense.amount <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (!expense.payer) {
    return { valid: false, error: "Payer is required" };
  }

  if (!expense.participants || expense.participants.length === 0) {
    return { valid: false, error: "At least one participant is required" };
  }

  if (expense.splitType === SPLIT_TYPES.CUSTOM) {
    const total = Object.values(expense.customSplits || {}).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - expense.amount) > 0.01) {
      return { valid: false, error: "Custom splits must sum to expense amount" };
    }
  }

  if (expense.splitType === SPLIT_TYPES.PERCENTAGE) {
    const total = Object.values(expense.percentageSplits || {}).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      return { valid: false, error: "Percentages must sum to 100" };
    }
  }

  return { valid: true };
}

