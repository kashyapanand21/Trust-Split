import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createExpense, validateExpense } from "../utils/expenseModel";

const STORAGE_KEY = "trustsplitz_expenses";

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);

  // Load expenses from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpenses(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error("Failed to load expenses from localStorage:", err);
      setExpenses([]);
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (err) {
      console.error("Failed to save expenses to localStorage:", err);
    }
  }, [expenses]);

  /**
   * Add a new expense
   * @param {Object} expenseData
   * @returns {{ success: boolean, expense?: Object, error?: string }}
   */
  const addExpense = useCallback((expenseData) => {
    try {
      const expense = createExpense(expenseData);
      const validation = validateExpense(expense);
      
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      setExpenses((prev) => [...prev, expense]);
      return { success: true, expense };
    } catch (err) {
      console.error("addExpense error:", err);
      return { success: false, error: err.message || "Failed to add expense" };
    }
  }, []);

  /**
   * Get all expenses for a group
   * @param {number} groupId
   * @returns {Array}
   */
  const getGroupExpenses = useCallback((groupId) => {
    return expenses.filter((exp) => exp.groupId === Number(groupId));
  }, [expenses]);

  /**
   * Get all expenses where user is payer or participant
   * @param {string} userAddress
   * @returns {Array}
   */
  const getUserExpenses = useCallback((userAddress) => {
    if (!userAddress) return [];
    const addr = userAddress.toLowerCase();
    return expenses.filter(
      (exp) =>
        exp.payer === addr || exp.participants.some((p) => p === addr)
    );
  }, [expenses]);

  /**
   * Delete an expense
   * @param {string} expenseId
   * @returns {boolean}
   */
  const deleteExpense = useCallback((expenseId) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
    return true;
  }, []);

  /**
   * Update an expense
   * @param {string} expenseId
   * @param {Object} updates
   * @returns {{ success: boolean, error?: string }}
   */
  const updateExpense = useCallback((expenseId, updates) => {
    try {
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === expenseId ? { ...exp, ...updates } : exp))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Clear all expenses (useful for testing)
   */
  const clearAllExpenses = useCallback(() => {
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        getGroupExpenses,
        getUserExpenses,
        deleteExpense,
        updateExpense,
        clearAllExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) {
    throw new Error("useExpenses must be used inside <ExpenseProvider>");
  }
  return ctx;
}

