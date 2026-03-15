import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import Navbar      from "./components/Navbar";
import Dashboard   from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup   from "./pages/JoinGroup";
import GroupDetail from "./pages/GroupDetail";
import AddExpense  from "./pages/AddExpense";
import Balances    from "./pages/Balances";

// Onboarding Wrapper ensures user is registered before accessing app logic
function AppContent() {
  const { currentUser, saveUser } = useAppContext();

  if (!currentUser) {
    return <Onboarding onComplete={saveUser} />;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/"                      element={<Dashboard />} />
          <Route path="/dashboard"             element={<Dashboard />} />
          <Route path="/create"                element={<CreateGroup />} />
          <Route path="/join"                  element={<JoinGroup />} />
          <Route path="/group/:id"             element={<GroupDetail />} />
          <Route path="/group/:id/add-expense" element={<AddExpense />} />
          <Route path="/group/:id/balances"   element={<Balances />} />
        </Routes>
      </main>
    </>
  );
}

function Onboarding({ onComplete }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const upiId = formData.get("upiId");
    if (name.trim()) onComplete(name.trim(), upiId.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans text-white">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2 text-center">
          Welcome to TrustSplitz
        </h1>
        <p className="text-gray-400 mb-8 text-center text-sm">
          A simple way to split trip expenses and settle via UPI.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Name *</label>
            <input 
              name="name" 
              required 
              placeholder="e.g. Anand" 
              className="w-full px-4 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">UPI ID (Optional)</label>
            <input 
              name="upiId" 
              placeholder="e.g. anand@okhdfcbank" 
              className="w-full px-4 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold transition-colors mt-4">
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}
