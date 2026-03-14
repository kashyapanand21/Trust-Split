import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar      from "./components/Navbar";
import Home        from "./pages/Home";
import Dashboard   from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950 text-white">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/dashboard"  element={<Dashboard />} />
              <Route path="/create"     element={<CreateGroup />} />
              <Route path="/group/:id"  element={<GroupDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}
