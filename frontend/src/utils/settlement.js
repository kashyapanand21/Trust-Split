/**
 * Debt simplification algorithm using greedy matching
 */

/**
 * Simplify balances using greedy algorithm
 * @param {Object} balances - Map of address -> net balance (positive = creditor, negative = debtor)
 * @returns {Array} Array of settlement transactions { from, to, amount }
 */
export function simplifySettlements(balances) {
  if (!balances || Object.keys(balances).length === 0) {
    return [];
  }

  // Separate into creditors and debtors
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([address, balance]) => {
    const amount = parseFloat(balance) || 0;
    if (amount > 0.01) {
      // Creditor (should receive money)
      creditors.push({ address: address.toLowerCase(), amount });
    } else if (amount < -0.01) {
      // Debtor (owes money)
      debtors.push({ address: address.toLowerCase(), amount: Math.abs(amount) });
    }
    // Ignore balances close to zero (within 0.01)
  });

  // Sort by amount (largest first)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let creditorIdx = 0;
  let debtorIdx = 0;

  // Greedy matching: match highest creditor with highest debtor
  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx];
    const debtor = debtors[debtorIdx];

    // Settlement amount is the minimum of what creditor should receive and debtor owes
    const settlementAmount = Math.min(creditor.amount, debtor.amount);

    // Only create settlement if amount is significant (> 0.01)
    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.address,
        to: creditor.address,
        amount: parseFloat(settlementAmount.toFixed(6)), // Round to 6 decimal places
      });
    }

    // Update balances
    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    // Move to next creditor/debtor if their balance is settled
    if (creditor.amount < 0.01) {
      creditorIdx++;
    }
    if (debtor.amount < 0.01) {
      debtorIdx++;
    }
  }

  return settlements;
}

/**
 * Calculate total amount to be settled
 * @param {Array} settlements
 * @returns {number}
 */
export function getTotalSettlementAmount(settlements) {
  return settlements.reduce((total, settlement) => total + settlement.amount, 0);
}

/**
 * Get settlement summary
 * @param {Array} settlements
 * @returns {Object}
 */
export function getSettlementSummary(settlements) {
  const totalAmount = getTotalSettlementAmount(settlements);
  const transactionCount = settlements.length;

  // Count unique participants
  const participants = new Set();
  settlements.forEach((s) => {
    participants.add(s.from);
    participants.add(s.to);
  });

  return {
    totalAmount,
    transactionCount,
    participantCount: participants.size,
  };
}
