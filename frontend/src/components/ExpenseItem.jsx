import { formatCurrency, formatDate } from "../utils/format";

export default function ExpenseItem({ expense, currency = "INR", isCurrentUser = false, groupMembers = [] }) {
  if (!expense) return null;

  const { id, payerId, amount, description, category, date, participants } = expense;

  const getMemberName = (mId) => {
    const m = groupMembers.find(member => member.id === mId);
    return m ? m.name : "Unknown";
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white truncate">{description}</h3>
            {category && (
              <span className="px-2 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {category}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-mono mb-1">
            Paid by {isCurrentUser ? "you" : getMemberName(payerId)}
          </p>
          {date && (
            <p className="text-xs text-gray-600">{formatDate(date)}</p>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-base font-bold text-violet-300">
            {formatCurrency(amount.toString(), currency)}
          </p>
        </div>
      </div>

      {participants && participants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">
            Split among {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-1">
            {participants.slice(0, 3).map((pId) => (
              <span
                key={pId}
                className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400"
              >
                {getMemberName(pId)}
              </span>
            ))}
            {participants.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                +{participants.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

