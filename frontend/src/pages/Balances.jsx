import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { calculateBalances, simplifySettlements } from "../utils/balanceEngine";
import BalanceCard from "../components/BalanceCard";
import SettlementList from "../components/SettlementList";

export default function Balances() {
  const { id } = useParams();
  const { currentUser, groups, expenses } = useAppContext();

  const safeGroups = groups || [];
  const safeExpenses = expenses || [];

  const group = safeGroups.find(g => g.id === id);
  const groupExpenses = safeExpenses.filter(e => e.groupId === id);

  // Calculate balances
  const balances = useMemo(() => {
    if (!group || groupExpenses.length === 0) return {};
    return calculateBalances(group.members, groupExpenses);
  }, [group, groupExpenses]);

  // Simplify settlements
  const settlements = useMemo(() => {
    if (!balances || Object.keys(balances).length === 0) return [];
    return simplifySettlements(balances);
  }, [balances]);

  if (!group) {
    return (
      <div className="text-center py-24 text-gray-500">
        <p>Group not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Group Balances</h1>
          <p className="text-sm text-gray-500">Net balances and settlement suggestions</p>
        </div>
        <Link
          to={`/group/${id}`}
          className="px-4 py-2 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          ← Back to Trip
        </Link>
      </div>

      {/* Balances */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Net Balances</h2>
        {groupExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 rounded-xl bg-gray-900 border border-gray-800">
            <p>No expenses yet. Add expenses to see balances.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {group.members.map((member) => {
              const balance = balances[member.id] || 0;
              return (
                <BalanceCard
                  key={member.id}
                  address={member.name} // Repurposing address prop for name
                  balance={parseFloat(balance).toFixed(2)}
                  currency="INR"
                  isCurrentUser={member.id === currentUser?.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Settlement Suggestions</h2>
          <SettlementList
            settlements={settlements}
            currency="INR"
            currentUser={currentUser}
            groupMembers={group.members}
            groupId={group.id}
          />
        </div>
      )}

      {/* Info */}
      {groupExpenses.length > 0 && settlements.length === 0 && (
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            💡 All balances are settled. No transactions needed.
          </p>
        </div>
      )}
    </div>
  );
}
