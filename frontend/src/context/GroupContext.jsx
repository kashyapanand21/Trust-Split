import { createContext, useContext, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import { useContract } from "../hooks/useContract";

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const { account, provider } = useWallet();
  const contract = useContract();
  const [groups, setGroups] = useState({}); // groupId -> group data
  const [expenses, setExpenses] = useState({}); // groupId -> expenses array

  /**
   * Load group data
   */
  const loadGroup = useCallback(async (groupId) => {
    if (!contract || !provider) return null;

    try {
      const [payer, members, totalAmount, shareAmount, paidCount, settled] =
        await contract.getGroup(groupId);

      const groupData = {
        id: Number(groupId),
        payer,
        members: [...members],
        totalAmount: ethers.formatEther(totalAmount),
        shareAmount: ethers.formatEther(shareAmount),
        paidCount: Number(paidCount),
        settled,
      };

      setGroups((prev) => ({ ...prev, [groupId]: groupData }));
      return groupData;
    } catch (err) {
      console.error("loadGroup error:", err);
      return null;
    }
  }, [contract, provider]);

  /**
   * Load expenses for a group
   */
  const loadExpenses = useCallback(async (groupId) => {
    if (!contract || !provider) return [];

    try {
      const expenseIds = await contract.getGroupExpenses(groupId);
      
      const fetched = await Promise.all(
        expenseIds.map(async (expId) => {
          const [payer, amount, description, timestamp, participants, settled] =
            await contract.getExpense(groupId, expId);
          
          const amountWei = typeof amount === "bigint" ? amount : BigInt(amount);
          
          // Fetch shares for each participant
          // If all shares are zero, it means equal split (calculated off-chain)
          const shares = {};
          let allZero = true;
          for (const participant of participants) {
            const share = await contract.getExpenseShare(groupId, expId, participant);
            shares[participant.toLowerCase()] = share;
            if (share > 0n) allZero = false;
          }
          
          // If all shares are zero, calculate equal split
          if (allZero && participants.length > 0) {
            const shareAmount = amountWei / BigInt(participants.length);
            const remainder = amountWei % BigInt(participants.length);
            participants.forEach((addr, index) => {
              shares[addr.toLowerCase()] = shareAmount + (index === 0 ? remainder : 0n);
            });
          }

          return {
            id: Number(expId),
            groupId: Number(groupId),
            payer,
            amount: ethers.formatEther(amountWei),
            description,
            timestamp: Number(timestamp),
            participants: [...participants],
            shares: Object.fromEntries(
              Object.entries(shares).map(([addr, share]) => [addr, ethers.formatEther(share)])
            ),
            settled,
          };
        })
      );

      setExpenses((prev) => ({ ...prev, [groupId]: fetched }));
      return fetched;
    } catch (err) {
      console.error("loadExpenses error:", err);
      return [];
    }
  }, [contract, provider]);

  /**
   * Add expense to a group
   */
  const addExpense = useCallback(async (groupId, expenseData) => {
    if (!contract) throw new Error("Contract not available");

    const { amount, description, participants, shares } = expenseData;
    const amountWei = ethers.parseEther(amount.toString());
    
    // Convert shares to array matching participants order
    const sharesArray = participants.map((addr) => {
      const share = shares[addr.toLowerCase()] || "0";
      return typeof share === "string" ? ethers.parseEther(share) : share;
    });

    const tx = await contract.addExpense(
      groupId,
      amountWei,
      description,
      participants,
      sharesArray
    );

    await tx.wait();
    await loadExpenses(groupId);
    return tx;
  }, [contract, loadExpenses]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        expenses,
        loadGroup,
        loadExpenses,
        addExpense,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroup must be used inside <GroupProvider>");
  return ctx;
}

