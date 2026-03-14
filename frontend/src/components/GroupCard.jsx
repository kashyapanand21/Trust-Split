import { Link } from "react-router-dom";

/** Shorten 0xAbCd…5678 */
function shortAddr(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const STATUS_META = (settled, fullyPaid) => {
  if (settled)   return { label: "SETTLED",    style: "bg-green-500/20 text-green-400 border-green-500/30" };
  if (fullyPaid) return { label: "FULLY PAID", style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return           { label: "OPEN",       style: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
};

/**
 * @param {{ group: { id: number, payer: string, members: string[],
 *   totalAmount: string, shareAmount: string, paidCount: number,
 *   settled: boolean } }} props
 */
export default function GroupCard({ group }) {
  const { id, payer, members, shareAmount, paidCount, settled } = group;

  const fullyPaid  = paidCount === members.length;
  const progress   = members.length > 0 ? Math.round((paidCount / members.length) * 100) : 0;
  const { label, style } = STATUS_META(settled, fullyPaid);

  return (
    <Link to={`/group/${id}`} className="block group">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-violet-500/50 transition-colors">

        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 mr-3">
            <p className="text-xs text-gray-500 font-mono mb-1">Group #{id}</p>
            <p className="text-sm text-gray-400 font-mono">
              Payer: {shortAddr(payer)}
            </p>
          </div>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
            {label}
          </span>
        </div>

        {/* Share amount */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-0.5">Per share</p>
          <p className="text-base font-semibold text-violet-300">{shareAmount} ETH</p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Members paid</span>
            <span className="font-mono">{paidCount} / {members.length}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </Link>
  );
}
