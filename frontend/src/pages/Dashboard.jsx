import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import GroupCard from "../components/GroupCard";

export default function Dashboard() {
  const { currentUser, groups } = useAppContext();

  const safeGroups = groups || [];

  // Filter groups where current user is a member
  const myGroups = safeGroups.filter(g => 
    g?.members?.some(m => m.id === currentUser?.id)
  ).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : 0;
    const dateB = b.createdAt ? new Date(b.createdAt) : 0;
    return dateB - dateA;
  });

  // Count by simple status (just for display, no on-chain status anymore)
  const totalGroups = myGroups.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Trips</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your shared expenses and settlements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/join"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Join Group
          </Link>
          <Link
            to="/create"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            + New Trip
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {myGroups.length === 0 ? (
        <div className="text-center py-20 text-gray-600 border border-dashed border-gray-800 rounded-xl">
          <p className="mb-3">No trips yet.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/create" className="text-violet-400 hover:underline text-sm">
              Create a new trip
            </Link>
            <span className="text-gray-700">or</span>
            <Link to="/join" className="text-violet-400 hover:underline text-sm">
              Join an existing one
            </Link>
          </div>
        </div>
      ) : (
        /* Group grid */
        <div className="grid gap-4 sm:grid-cols-2">
          {myGroups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
