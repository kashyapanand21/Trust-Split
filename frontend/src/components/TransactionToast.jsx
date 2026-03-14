/**
 * TransactionToast — inline status banner for blockchain transactions.
 *
 * Props:
 *   status  : "pending" | "success" | "error"
 *   message : string   — override default message label
 *   txHash  : string   — optional, shows Polygonscan link
 */

const DEFAULTS = {
  pending: "Transaction pending…",
  success: "Transaction confirmed!",
  error:   "Transaction failed.",
};

const STYLES = {
  pending: "bg-blue-950/80 border-blue-500/40 text-blue-200",
  success: "bg-green-950/80 border-green-500/40 text-green-200",
  error:   "bg-red-950/80 border-red-500/40 text-red-200",
};

function SpinnerIcon() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
  );
}

export default function TransactionToast({ status, message, txHash }) {
  if (!status) return null;

  const label = message || DEFAULTS[status];

  return (
    <div
      role="status"
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${STYLES[status]}`}
    >
      {/* Icon */}
      <span className="flex-shrink-0 mt-0.5">
        {status === "pending" && <SpinnerIcon />}
        {status === "success" && <span className="font-bold">✓</span>}
        {status === "error"   && <span className="font-bold">✕</span>}
      </span>

      <div className="flex flex-col min-w-0">
        <span className="font-medium">{label}</span>
        {txHash && (
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline opacity-60 hover:opacity-100 transition-opacity mt-0.5 truncate"
          >
            View on Polygonscan ↗
          </a>
        )}
      </div>
    </div>
  );
}
