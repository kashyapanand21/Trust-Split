import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { createGroup } = useAppContext();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newGroup = createGroup(groupName.trim(), description.trim());
    navigate(`/group/${newGroup.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Create New Trip</h1>
      <p className="text-sm text-gray-500 mb-6">
        Start a new group to track shared expenses. You can invite friends later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Trip/Group Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Summer Trip 2026"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Goa trip with college friends"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors font-sans text-sm resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!groupName.trim()}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Create Trip
        </button>
      </form>
    </div>
  );
}
