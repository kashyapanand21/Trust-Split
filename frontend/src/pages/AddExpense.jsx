import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, groups, addExpense } = useAppContext();
  
  const safeGroups = groups || [];
  const group = safeGroups.find(g => g.id === id);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [splitType, setSplitType] = useState("EQUAL");
  const [participants, setParticipants] = useState(group?.members.map(m => m.id) || []);
  const [customAmounts, setCustomAmounts] = useState({});
  const [error, setError] = useState("");

  if (!group) {
    return (
      <div className="text-center py-24 text-red-400">
        <p>Group not found.</p>
      </div>
    );
  }

  const allMembers = group.members || [];

  const handleParticipantToggle = (id) => {
    setParticipants((prev) =>
      prev.includes(id)
        ? prev.filter((a) => a !== id)
        : [...prev, id]
    );
  };

  const handleCustomAmountChange = (id, value) => {
    setCustomAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (participants.length === 0) {
      setError("Select at least one participant");
      return;
    }

    if (splitType === "CUSTOM") {
      const total = participants.reduce((sum, pId) => sum + parseFloat(customAmounts[pId] || 0), 0);
      if (Math.abs(total - parseFloat(amount)) > 0.01) {
        setError(`Custom amounts sum to ${total}, not ${amount}`);
        return;
      }
    }

    const expenseData = {
      groupId: id,
      payerId: currentUser.id,
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      participants,
      splitType,
      splits: splitType === "CUSTOM" ? customAmounts : {},
    };

    const result = addExpense(id, expenseData);
    if (!result.success) {
      setError(result.error || "Failed to add expense");
      return;
    }

    navigate(`/group/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Add Expense</h1>
        <Link
          to={`/group/${id}`}
          className="px-4 py-2 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          ← Back to Trip
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner at restaurant"
            required
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Amount (INR) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            required
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            {["Food", "Travel", "Hotel", "Activity", "Other"].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Split Type *
          </label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="EQUAL">Equal Split</option>
            <option value="CUSTOM">Manual Amount</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Participants
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-gray-900 border border-gray-700 p-3">
            {allMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={participants.includes(member.id)}
                    onChange={() => handleParticipantToggle(member.id)}
                    className="rounded border-gray-700 bg-gray-900 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-300">
                    {member.name} {member.id === currentUser?.id ? "(you)" : ""}
                  </span>
                </label>
                {splitType === "CUSTOM" && participants.includes(member.id) && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customAmounts[member.id] || ""}
                    onChange={(e) => handleCustomAmountChange(member.id, e.target.value)}
                    placeholder="0.00"
                    className="w-24 px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-colors disabled:opacity-50"
          disabled={!description || !amount || participants.length === 0}
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
