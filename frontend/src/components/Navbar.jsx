import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Navbar() {
  const { currentUser } = useAppContext();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            TrustSplitz
          </span>
        </Link>

        {/* Nav links + Current User Info */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/create"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            New Group
          </Link>
          <Link
            to="/join"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Join Group
          </Link>
          
          {currentUser && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-800">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block">
                {currentUser.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
