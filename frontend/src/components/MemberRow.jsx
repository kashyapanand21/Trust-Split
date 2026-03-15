export default function MemberRow({ member, isCurrentUser }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">

      {/* Left: avatar + address */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">
          {member.name.slice(0, 2).toUpperCase()}
        </div>

        <span className="font-sans text-sm text-gray-300 min-w-0">
          {member.name}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-violet-400">(you)</span>
          )}
        </span>
      </div>

      {member.upiId && (
        <span className="text-xs text-gray-500">UPI: {member.upiId}</span>
      )}
    </div>
  );
}
