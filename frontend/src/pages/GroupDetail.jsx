import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../utils/contract";
import MemberRow from "../components/MemberRow";
import TransactionToast from "../components/TransactionToast";

export default function GroupDetail() {
  const { id }                        = useParams();
  const { account, provider, signer } = useWallet();

  const [group, setGroup]           = useState(null);
  const [memberPaid, setMemberPaid] = useState({});
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Separate tx state per action
  const [payTx, setPayTx]       = useState({ status: null, hash: "" });
  const [settleTx, setSettleTx] = useState({ status: null, hash: "" });

  // ── Load group data ───────────────────────────────────────────────────────
  const loadGroup = useCallback(async () => {
    if (!provider || id === undefined) return;
    setLoading(true);
    setError("");

    try {
      const contract = getContract(provider);
      const [payer, members, totalAmount, shareAmount, paidCount, settled] =
        await contract.getGroup(Number(id));

      const parsedMembers = [...members];

      // Fetch paid status for every member in parallel
      const flags = await Promise.all(
        parsedMembers.map((addr) => contract.hasMemberPaid(Number(id), addr))
      );
      const paidMap = {};
      parsedMembers.forEach((addr, i) => {
        paidMap[addr.toLowerCase()] = flags[i];
      });

      setGroup({
        id:         Number(id),
        payer,
        members:    parsedMembers,
        totalAmount: ethers.formatEther(totalAmount),
        shareAmount: ethers.formatEther(shareAmount),
        paidCount:  Number(paidCount),
        settled,
      });
      setMemberPaid(paidMap);
    } catch (err) {
      console.error("loadGroup error:", err);
      setError("Failed to load group. It may not exist or the contract is unreachable.");
    } finally {
      setLoading(false);
    }
  }, [provider, id]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  // ── payShare ──────────────────────────────────────────────────────────────
  async function handlePayShare() {
    setPayTx({ status: "pending", hash: "" });
    try {
      const contract = getContract(signer);
      const valueWei = ethers.parseEther(group.shareAmount);
      const tx = await contract.payShare(group.id, { value: valueWei });
      setPayTx({ status: "pending", hash: tx.hash });
      await tx.wait();
      setPayTx({ status: "success", hash: tx.hash });
      await loadGroup();
    } catch (err) {
      console.error("payShare error:", err);
      setPayTx({ status: "error", hash: "" });
    }
  }

  // ── settleGroup ───────────────────────────────────────────────────────────
  async function handleSettle() {
    setSettleTx({ status: "pending", hash: "" });
    try {
      const contract = getContract(signer);
      const tx = await contract.settleGroup(group.id);
      setSettleTx({ status: "pending", hash: tx.hash });
      await tx.wait();
      setSettleTx({ status: "success", hash: tx.hash });
      await loadGroup();
    } catch (err) {
      console.error("settleGroup error:", err);
      setSettleTx({ status: "error", hash: "" });
    }
  }

  // ── Derived role flags ────────────────────────────────────────────────────
  const isPayer    = group && account?.toLowerCase() === group.payer.toLowerCase();
  const isMember   = group?.members.some((m) => m.toLowerCase() === account?.toLowerCase());
  const myPaid     = isMember && memberPaid[account?.toLowerCase()];
  const allPaid    = group && group.paidCount === group.members.length;
  const canPayShare = isMember && !myPaid && !group?.settled;
  const canSettle  = isPayer && allPaid && !group?.settled;

  // ── Render guards ─────────────────────────────────────────────────────────
  if (!account) {
    return (
      <div className="text-center py-24 text-gray-500">
        <p>Connect your wallet to view this group.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 bg-gray-900 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-24 text-red-400">{error}</div>;
  }

  if (!group) return null;

  const statusLabel = group.settled ? "SETTLED" : allPaid ? "FULLY PAID" : "OPEN";
  const statusStyle = group.settled
    ? "bg-green-500/20 text-green-400 border-green-500/30"
    : allPaid
    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">Group #{group.id}</p>
          <h1 className="text-2xl font-bold text-white">
            {group.settled ? "Settled" : allPaid ? "Ready to Settle" : "Awaiting Payments"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadGroup}
            disabled={loading}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            ↺
          </button>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Amount summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Bill",  value: `${group.totalAmount} ETH` },
          { label: "Per Share",   value: `${group.shareAmount} ETH` },
          { label: "Paid",        value: `${group.paidCount} / ${group.members.length}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Payer */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 mb-4">
        <p className="text-xs text-gray-500 mb-1">
          Payer {isPayer && <span className="text-violet-400">(you)</span>}
        </p>
        <p className="font-mono text-sm text-violet-300 break-all">{group.payer}</p>
      </div>

      {/* Member list */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 px-4 mb-6">
        <p className="text-xs text-gray-500 py-3 border-b border-gray-800">
          Members ({group.members.length})
        </p>
        {group.members.map((addr) => (
          <MemberRow
            key={addr}
            address={addr}
            paid={memberPaid[addr.toLowerCase()] ?? false}
            isCurrentUser={addr.toLowerCase() === account?.toLowerCase()}
          />
        ))}
      </div>

      {/* Transaction toasts */}
      <div className="flex flex-col gap-2 mb-4">
        {payTx.status && (
          <TransactionToast
            status={payTx.status}
            message={
              payTx.status === "pending" ? "Processing payment…" :
              payTx.status === "success" ? "Share paid successfully!" : "Payment failed."
            }
            txHash={payTx.hash}
          />
        )}
        {settleTx.status && (
          <TransactionToast
            status={settleTx.status}
            message={
              settleTx.status === "pending" ? "Settling group…" :
              settleTx.status === "success" ? "Group settled! Funds released." : "Settlement failed."
            }
            txHash={settleTx.hash}
          />
        )}
      </div>

      {/* Action buttons + contextual info */}
      <div className="flex flex-col gap-3">
        {/* Pay Share — only for unpaid members */}
        {canPayShare && (
          <button
            id="pay-share-btn"
            onClick={handlePayShare}
            disabled={payTx.status === "pending"}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {payTx.status === "pending" && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {payTx.status === "pending"
              ? "Confirming payment…"
              : `Pay My Share (${group.shareAmount} ETH)`}
          </button>
        )}

        {/* Member already paid */}
        {isMember && myPaid && !group.settled && (
          <div className="w-full py-3 rounded-xl bg-gray-800 text-center text-green-400 text-sm">
            ✓ You have paid your share
          </div>
        )}

        {/* Settle — only for payer when all paid */}
        {canSettle && (
          <button
            id="settle-group-btn"
            onClick={handleSettle}
            disabled={settleTx.status === "pending"}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {settleTx.status === "pending" && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {settleTx.status === "pending"
              ? "Settling…"
              : "Settle Group & Receive Funds"}
          </button>
        )}

        {/* Payer waiting for members */}
        {isPayer && !allPaid && !group.settled && (
          <div className="w-full py-3 rounded-xl bg-gray-800 text-center text-gray-500 text-sm">
            Waiting for members to pay ({group.paidCount} / {group.members.length})
          </div>
        )}

        {/* Settled */}
        {group.settled && (
          <div className="w-full py-3 rounded-xl bg-gray-800 text-center text-gray-400 text-sm">
            This group has been settled ✓
          </div>
        )}

        {/* Not a participant */}
        {!isPayer && !isMember && (
          <div className="w-full py-3 rounded-xl bg-gray-800 text-center text-gray-400 text-sm">
            You are not part of this group.
          </div>
        )}
      </div>
    </div>
  );
}
