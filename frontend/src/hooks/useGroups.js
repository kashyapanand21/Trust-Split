import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { useContract } from "./useContract";

/**
 * Hook to fetch and manage user groups
 * @returns {Object} { groups, loading, error, refresh }
 */
export function useGroups() {
  const { account, provider } = useWallet();
  const contract = useContract();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadGroups = useCallback(async () => {
    if (!account || !contract || !provider) {
      setGroups([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const groupIds = await contract.getUserGroups(account);

      const fetched = await Promise.all(
        groupIds.map(async (id) => {
          const [payer, members, totalAmount, shareAmount, paidCount, settled] =
            await contract.getGroup(id);
          return {
            id: Number(id),
            payer,
            members: [...members],
            totalAmount: ethers.formatEther(totalAmount),
            shareAmount: ethers.formatEther(shareAmount),
            paidCount: Number(paidCount),
            settled,
          };
        })
      );

      // Most recent groups first
      setGroups(fetched.reverse());
    } catch (err) {
      console.error("loadGroups error:", err);
      setError("Failed to load groups. Check your connection and try again.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [account, contract, provider]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return { groups, loading, error, refresh: loadGroups };
}

