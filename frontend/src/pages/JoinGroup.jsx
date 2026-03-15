import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function JoinGroup() {
  const navigate = useNavigate();
  const { joinGroup } = useAppContext();
  
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (inviteCode.trim().length !== 6) {
      setError("Invite code must be 6 digits");
      return;
    }

    const result = joinGroup(inviteCode.trim());
    if (result.success) {
      navigate(`/group/${result.groupId}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Join Group</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Invite Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, ''))} // only numbers
            placeholder="e.g. 483921"
            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] rounded-xl bg-gray-950 border border-gray-700 text-white placeholder-gray-700 focus:outline-none focus:border-violet-500 transition-colors"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-colors disabled:opacity-50"
          disabled={inviteCode.length !== 6}
        >
          Join Group
        </button>
      </form>
    </div>
  );
}
