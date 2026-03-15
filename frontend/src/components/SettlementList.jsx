import { generateUPILink } from "../utils/upi";

export default function SettlementList({ settlements = [], currency = "INR", currentUser = null, groupMembers = [], groupId }) {
  if (!settlements || settlements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No settlements needed. All balances are zero.</p>
      </div>
    );
  }

  const getMember = (id) => groupMembers.find(m => m.id === id);

  return (
    <div className="space-y-3">
      {settlements.map((settlement, index) => {
        const { from, to, amount } = settlement;
        const fromMember = getMember(from);
        const toMember = getMember(to);
        const isFromUser = currentUser && from === currentUser.id;
        const isToUser = currentUser && to === currentUser.id;

        const upiLink = toMember?.upiId ? generateUPILink(toMember.upiId, toMember.name, amount) : null;

        return (
          <div
            key={index}
            className="rounded-xl border border-gray-800 bg-gray-900 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <span className="text-xs text-red-400">→</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className={isFromUser ? "text-violet-400 font-semibold" : ""}>
                      {isFromUser ? "You" : fromMember?.name}
                    </span>
                    {" owes "}
                    <span className={isToUser ? "text-violet-400 font-semibold" : ""}>
                      {isToUser ? "you" : toMember?.name}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right ml-4 flex flex-col items-end gap-2">
                <p className="text-base font-bold text-violet-300">
                  {parseFloat(amount).toFixed(2)} {currency}
                </p>
                {isFromUser && upiLink && (
                  <a href={upiLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-xs rounded-lg text-white font-semibold transition-colors">
                    Pay via UPI
                  </a>
                )}
                {isFromUser && !upiLink && (
                  <span className="text-xs text-gray-500">No UPI ID added</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

