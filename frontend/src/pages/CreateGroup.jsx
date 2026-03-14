import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../utils/contract";
import TransactionToast from "../components/TransactionToast";

export default function CreateGroup() {
  const { account, signer } = useWallet();
  const navigate = useNavigate();

  const [totalAmount, setTotalAmount] = useState("");
  const [membersRaw, setMembersRaw]   = useState("");
  const [txStatus, setTxStatus]       = useState(null);  // null | "pending" | "success" | "error"
  const [txHash, setTxHash]           = useState("");
  const [errorMsg, setErrorMsg]       = useState("");

  const isPending = txStatus === "pending";

  // ── Parse members from comma-separated input ──────────────────────────────
  function parseMembers() {
    return membersRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // ── Client-side validation ────────────────────────────────────────────────
  function validate(members) {
    if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0)
      return "Enter a valid total bill amount.";
    if (members.length === 0)
      return "Add at least one member address.";
    for (const addr of members) {
      if (!ethers.isAddress(addr)) return `Invalid address: ${addr}`;
      if (addr.toLowerCase() === account.toLowerCase())
        return "You (the payer) cannot be listed as a member.";
    }
    const unique = new Set(members.map((a) => a.toLowerCase()));
    if (unique.size !== members.length) return "Duplicate member addresses found.";
    return null;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setTxHash("");

    const members = parseMembers();
    const validationError = validate(members);
    if (validationError) { setErrorMsg(validationError); return; }

    try {
      setTxStatus("pending");

      const contract   = getContract(signer);
      const valueInWei = ethers.parseEther(totalAmount);
      const tx = await contract.createGroup(members, { value: valueInWei });

      setTxHash(tx.hash);
      await tx.wait();

      // ── Success: clear form then redirect ──────────────────────────────
      setTxStatus("success");
      setTotalAmount("");
      setMembersRaw("");

      // Brief pause so the user sees the success toast before leaving
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("createGroup error:", err);
      setErrorMsg(err.reason || err.message || "Transaction failed.");
      setTxStatus("error");
    }
  }

  if (!account) {
    return (
      <div className="text-center py-24 text-gray-500">
        <p>Connect your wallet to create a group.</p>
      </div>
    );
  }

  const members      = parseMembers();
  const participants = members.length + 1;
  const sharePreview =
    totalAmount && members.length > 0
      ? (parseFloat(totalAmount) / participants).toFixed(6)
      : null;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Create Split Group</h1>
      <p className="text-sm text-gray-500 mb-6">
        You lock the full bill amount. Members pay you back via the contract.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Total bill */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Total Bill (ETH)
          </label>
          <input
            id="total-amount-input"
            type="number"
            step="0.0001"
            min="0.0001"
            placeholder="e.g. 0.03"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Member addresses */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Member Addresses{" "}
            <span className="text-gray-500">(comma-separated)</span>
          </label>
          <textarea
            id="member-addresses-input"
            rows={3}
            placeholder="0xAaaa…, 0xBbbb…, 0xCccc…"
            value={membersRaw}
            onChange={(e) => setMembersRaw(e.target.value)}
            required
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors font-mono text-sm resize-none disabled:opacity-50"
          />
        </div>

        {/* Live share preview */}
        {sharePreview && (
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <p className="text-sm text-violet-300">
              Each of <strong>{members.length}</strong> member
              {members.length !== 1 ? "s" : ""} will owe{" "}
              <strong>{sharePreview} ETH</strong>.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your locked amount ({totalAmount} ETH) covers your share.
            </p>
          </div>
        )}

        {/* Validation error */}
        {errorMsg && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {errorMsg}
          </p>
        )}

        {/* Transaction toast */}
        {txStatus && (
          <TransactionToast
            status={txStatus}
            message={
              txStatus === "pending" ? "Creating group…" :
              txStatus === "success" ? "Group created! Redirecting…" : undefined
            }
            txHash={txHash}
          />
        )}

        {/* Submit */}
        <button
          id="create-group-btn"
          type="submit"
          disabled={isPending || !totalAmount || members.length === 0}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isPending && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isPending ? "Creating group…" : "Lock Funds & Create Group"}
        </button>
      </form>
    </div>
  );
}
