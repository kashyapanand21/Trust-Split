import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import WalletButton from "../components/WalletButton";

export default function Home() {
  const { account } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Hero */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-4">
          Polygon Amoy Testnet
        </span>
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent leading-tight">
          Split bills.<br />Trust the chain.
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          TrustSplit lets you pool and split payments on-chain. No intermediaries,
          no he-said-she-said — just code.
        </p>
      </div>

      {/* How it works */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 text-sm text-gray-400 max-w-lg">
        {[
          { step: "1", label: "Payer locks the full amount" },
          { step: "2", label: "Members pay their share" },
          { step: "3", label: "Contract releases funds" },
        ].map(({ step, label }) => (
          <div
            key={step}
            className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex-1"
          >
            <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {step}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {account ? (
        <div className="flex gap-3">
          <Link
            to="/create"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-colors"
          >
            Create Group
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-semibold transition-colors"
          >
            My Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <WalletButton />
          <p className="text-xs text-gray-600">Connect MetaMask to get started</p>
        </div>
      )}
    </div>
  );
}
