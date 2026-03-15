import { formatCurrency, shortenAddress } from "../utils/format";

/**
 * Balance card component showing member balance
 * @param {Object} props
 * @param {string} props.address - Member address
 * @param {string|bigint} props.balance - Net balance (positive = creditor, negative = debtor)
 * @param {string} props.currency - Currency type
 * @param {boolean} props.isCurrentUser - Whether this is the current user
 */
export default function BalanceCard({ address, balance, currency = "ETH", isCurrentUser = false }) {
  if (!address) return null;

  const balanceNum = typeof balance === "string" ? parseFloat(balance) : parseFloat(balance.toString());
  const isCreditor = balanceNum > 0;
  const isDebtor = balanceNum < 0;
  const isZero = balanceNum === 0;

  const bgColor = isCreditor
    ? "bg-green-500/10 border-green-500/30"
    : isDebtor
    ? "bg-red-500/10 border-red-500/30"
    : "bg-gray-800 border-gray-700";

  const textColor = isCreditor
    ? "text-green-400"
    : isDebtor
    ? "text-red-400"
    : "text-gray-400";

  return (
    <div className={`rounded-xl border p-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">
            {isCurrentUser ? "You" : shortenAddress(address)}
          </p>
          <p className="font-mono text-sm text-gray-300 truncate">{address}</p>
        </div>
        <div className="text-right ml-4">
          <p className={`text-lg font-bold ${textColor}`}>
            {isCreditor ? "+" : ""}
            {formatCurrency(Math.abs(balanceNum).toString(), currency)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isCreditor ? "owed to you" : isDebtor ? "you owe" : "settled"}
          </p>
        </div>
      </div>
    </div>
  );
}

