import { Link } from "react-router-dom";
import WalletButton from "./WalletButton";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            TrustSplit
          </span>
        </Link>

        {/* Nav links + wallet */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/create"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            New Group
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
