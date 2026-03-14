import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../utils/contract";
import GroupCard from "../components/GroupCard";

export default function Dashboard() {
  const { account, provider } = useWallet();

  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    if (!account || !provider) return;
    setLoading(true);
    setError("");

    try {
      const contract = getContract(provider);
      const groupIds = await contract.getUserGroups(account);

      const fetched = await Promise.all(
        groupIds.map(async (id) => {
          const [payer, members, totalAmount, shareAmount, paidCount, settled] =
            await contract.getGroup(id);
          return {
            id:         Number(id),
            payer,
            members:    [...members],
            totalAmount: ethers.formatEther(totalAmount),
            shareAmount: ethers.formatEther(shareAmount),
            paidCount:  Number(paidCount),
            settled,
          };
        })
      );

      // Most recent groups first
      setGroups(fetched.reverse());
    } catch (err) {
      console.error("loadGroups error:", err);
      setError("Failed to load groups. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  if (!account) {
    return (
      <div className="text-center py-24 text-gray-500">
        <p>Connect your wallet to view your groups.</p>
      </div>
    );
  }

  // ── Status counts for summary row ─────────────────────────────────────────
  const openCount     = groups.filter((g) => !g.settled && g.paidCount < g.members.length).length;
  const fullyPaidCount = groups.filter((g) => !g.settled && g.paidCount === g.members.length).length;
  const settledCount  = groups.filter((g) => g.settled).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Groups</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Groups where you are the payer or a member
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadGroups}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            {loading ? "Loading…" : "↺ Refresh"}
          </button>
          <Link
            to="/create"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            + New Group
          </Link>
        </div>
      </div>

      {/* Status summary badges */}
      {groups.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {openCount} OPEN
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            {fullyPaidCount} FULLY PAID
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            {settledCount} SETTLED
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && groups.length === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5 animate-pulse h-36" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && groups.length === 0 && !error && (
        <div className="text-center py-20 text-gray-600 border border-dashed border-gray-800 rounded-xl">
          <p className="mb-3">No groups yet.</p>
          <Link to="/create" className="text-violet-400 hover:underline text-sm">
            Create your first split →
          </Link>
        </div>
      )}

      {/* Group grid */}
      {groups.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
