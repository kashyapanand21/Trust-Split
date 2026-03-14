/** Shorten 0xAbCd…5678 */
function shortAddr(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * @param {{ address: string, paid: boolean, isCurrentUser: boolean }} props
 */
export default function MemberRow({ address, paid, isCurrentUser }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">

      {/* Left: avatar + address */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {address.slice(2, 4).toUpperCase()}
        </div>

        <span className="font-mono text-sm text-gray-300 min-w-0">
          {shortAddr(address)}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-violet-400">(you)</span>
          )}
        </span>
      </div>

      {/* Right: paid badge */}
      {paid ? (
        <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          ✓ Paid
        </span>
      ) : (
        <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-400 border border-gray-600/30">
          • Pending
        </span>
      )}

    </div>
  );
}
