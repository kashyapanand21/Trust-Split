import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import MemberRow from "../components/MemberRow";
import ExpenseItem from "../components/ExpenseItem";

export default function GroupDetail() {
  const { id } = useParams();
  const { currentUser, groups, expenses } = useAppContext();

  const safeGroups = groups || [];
  const safeExpenses = expenses || [];

  const group = safeGroups.find(g => g.id === id);
  const groupExpenses = safeExpenses.filter(e => e.groupId === id);

  if (!group) return (
    <div className="text-center py-24 text-red-400">
      <p>Group not found.</p>
    </div>
  );

  const isMember = group.members.some(m => m.id === currentUser?.id);
  const totalAmount = groupExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 font-mono mb-1">Trip #{group.inviteCode}</p>
          <h1 className="text-2xl font-bold text-white">
            {group.name}
          </h1>
          {group.description && (
            <p className="text-sm text-gray-400 mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-500/20 text-blue-400 border-blue-500/30">
            INVITE: {group.inviteCode}
          </span>
        </div>
      </div>

      {/* Amount summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Total Trip Expenses",  value: `${totalAmount.toFixed(2)} INR` },
          { label: "Members",   value: `${group.members.length}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-gray-900 border border-gray-800 p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Member list */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 px-4 mb-6">
        <p className="text-xs text-gray-500 py-3 border-b border-gray-800">
          Members ({group.members.length})
        </p>
        <div className="divide-y divide-gray-800">
          {group.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.id === currentUser?.id}
            />
          ))}
        </div>
      </div>

      {/* Expenses section */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Expenses</h2>
          {isMember && (
            <Link
              to={`/group/${id}/add-expense`}
              className="px-3 py-1.5 rounded-lg text-sm bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              + Add Expense
            </Link>
          )}
        </div>

        {groupExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses yet.</p>
            {isMember && (
              <Link
                to={`/group/${id}/add-expense`}
                className="text-violet-400 hover:underline text-sm mt-2 inline-block"
              >
                Add your first expense →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {groupExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                currency="INR"
                isCurrentUser={expense.payerId === currentUser?.id}
                groupMembers={group.members}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col gap-3 mb-4">
        <Link
          to={`/group/${id}/balances`}
          className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-center text-sm font-medium transition-colors"
        >
          View Settlements & Balances
        </Link>
      </div>

      {/* Action buttons + contextual info */}
      <div className="flex flex-col gap-3">
        {/* Not a participant */}
        {!isMember && (
          <div className="w-full py-3 rounded-xl bg-gray-800 text-center text-gray-400 text-sm">
            You are not part of this trip.
          </div>
        )}
      </div>
    </div>
  );
}
