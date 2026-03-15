import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("trustsplitz_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem("trustsplitz_groups");
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("trustsplitz_expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("trustsplitz_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("trustsplitz_user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("trustsplitz_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("trustsplitz_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("trustsplitz_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const saveUser = (name, upiId) => {
    const newUser = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      name,
      upiId: upiId || "",
    };
    setCurrentUser(newUser);
  };

  const createGroup = (name, description) => {
    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newGroup = {
      id: "g_" + inviteCode,
      inviteCode,
      name,
      description,
      members: [currentUser],
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [...(prev || []), newGroup]);
    return newGroup;
  };

  const joinGroup = (inviteCode) => {
    const safeGroups = groups || [];
    const targetGroup = safeGroups.find(g => g.inviteCode === inviteCode);
    if (!targetGroup) return { success: false, error: "Invalid invite code" };
    
    if (targetGroup.members.some(m => m.id === currentUser?.id)) {
      return { success: false, error: "Already a member of this group" };
    }

    const updatedGroup = {
      ...targetGroup,
      members: [...targetGroup.members, currentUser],
    };

    setGroups(prev => (prev || []).map(g => g.id === targetGroup.id ? updatedGroup : g));
    return { success: true, groupId: targetGroup.id };
  };

  const addExpense = (groupId, expenseData) => {
    const { amount, description, category, payerId, splitType, participants, splits } = expenseData;
    
    const newExpense = {
      id: "e_" + Math.random().toString(36).substr(2, 9),
      groupId,
      amount: parseFloat(amount),
      description,
      category,
      payerId,
      splitType,
      participants, // Array of user objects or IDs
      splits, // Object mapping userId to amount
      date: new Date().toISOString(),
    };

    setExpenses(prev => [...(prev || []), newExpense]);
    return { success: true, expenseId: newExpense.id };
  };

  const recordSettlement = (groupId, fromId, toId, amount) => {
    const newTx = {
      id: "tx_" + Math.random().toString(36).substr(2, 9),
      groupId,
      fromId,
      toId,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      status: "paid"
    };

    setTransactions(prev => [...(prev || []), newTx]);
    return { success: true, txId: newTx.id };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        groups,
        expenses,
        transactions,
        saveUser,
        createGroup,
        joinGroup,
        addExpense,
        recordSettlement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
