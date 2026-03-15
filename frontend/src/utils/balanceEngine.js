/**
 * Calculate balances for all members in a group.
 * Positive balance means the person is owed money.
 * Negative balance means the person owes money.
 */
export function calculateBalances(members, expensesList) {
  const balances = {};
  
  // Initialize balances for all members
  members.forEach(member => {
    balances[member.id] = 0;
  });

  if (!expensesList || expensesList.length === 0) {
    return balances;
  }

  expensesList.forEach(expense => {
    const { amount, payerId, splits, splitType, participants } = expense;
    
    // Add to payer's balance
    if (balances[payerId] !== undefined) {
      balances[payerId] += parseFloat(amount);
    } else {
      balances[payerId] = parseFloat(amount);
    }

    // Subtract from participants' balances
    if (splitType === "EQUAL") {
      const splitAmount = amount / participants.length;
      participants.forEach(p => {
        const pId = typeof p === 'object' ? p.id : p;
        if (balances[pId] !== undefined) {
          balances[pId] -= splitAmount;
        } else {
          balances[pId] = -splitAmount;
        }
      });
    } else if (splitType === "CUSTOM") {
      Object.entries(splits).forEach(([pId, splitAmount]) => {
        if (balances[pId] !== undefined) {
          balances[pId] -= parseFloat(splitAmount);
        } else {
          balances[pId] = -parseFloat(splitAmount);
        }
      });
    }
  });

  return balances;
}

/**
 * Simplify debts using a greedy algorithm.
 * Returns an array of settlements: { from, to, amount }
 */
export function simplifySettlements(balances) {
  const debtors = [];
  const creditors = [];

  // Separate members into debtors and creditors
  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance < -0.01) {
      debtors.push({ id: memberId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id: memberId, amount: balance });
    }
  });

  // Sort by amount descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const settleAmount = Math.min(debtor.amount, creditor.amount);
    
    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: settleAmount
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}
