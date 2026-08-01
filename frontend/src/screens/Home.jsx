import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, CheckCircle } from 'lucide-react';
import { apiGet } from '../utils/apiClient';
import LoadingSkeleton from '../components/LoadingSkeleton';
import formatCurrency from '../utils/formatCurrency';

const Home = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // /analytics/dashboard only returns aggregate totals, so recent transactions
  // and human-readable category names are fetched separately and merged client-side.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, transactionsRes, categories] = await Promise.all([
        apiGet('/analytics/dashboard'),
        apiGet('/transactions?limit=5'),
        apiGet('/categories'),
      ]);
      setDashboard(dashboardRes);
      setTransactions(transactionsRes?.transactions || []);
      const names = {};
      (categories || []).forEach((c) => { names[c.categoryId] = c.name; });
      setCategoryNames(names);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const income = dashboard?.income ?? null;
  const expenses = dashboard?.expenses ?? null;
  const balance = dashboard?.balance ?? null;

  // The backend doesn't compute a financial status - derive a simple one from
  // the income/expense ratio it does give us.
  const getFinancialStatus = () => {
    if (income === null || expenses === null) return null;
    if (income === 0) return expenses > 0 ? 'alert' : 'good';
    const ratio = expenses / income;
    if (ratio > 1) return 'alert';
    if (ratio > 0.8) return 'warning';
    return 'good';
  };

  const recentTransactions = transactions.map((t) => ({
    id: t.transactionId,
    description: t.description || t.reference || 'Transaction',
    category: categoryNames[t.categoryId] || (t.categoryId === 'UNCATEGORIZED' ? 'Uncategorized' : t.categoryId),
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));

  const safeData = {
    moneyIn: income,
    moneyOut: expenses,
    currentBalance: balance,
    financialStatus: getFinancialStatus(),
    recentTransactions,
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'good':
        return { icon: CheckCircle, text: "You're within budget", color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      case 'warning':
        return { icon: CheckCircle, text: "Approaching your limit", color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
      case 'alert':
        return { icon: CheckCircle, text: "Exceeded your budget", color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      default:
        return { icon: CheckCircle, text: "Financial status unavailable", color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
  };

  const statusConfig = getStatusConfig(safeData.financialStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-white pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#04080F] mb-2">Welcome back!</h1>
          <p className="text-[#3E68A3]">Here's your financial overview</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading && (
            <div className="md:col-span-3">
              <LoadingSkeleton text="Loading dashboard..." />
            </div>
          )}
          {error && (
            <div className="md:col-span-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">Unable to load dashboard</p>
              <p className="text-sm text-gray-700">{error.message}</p>
              <div className="mt-3">
                <button onClick={() => load()} className="px-3 py-2 bg-[#3E68A3] text-white rounded-lg">Retry</button>
              </div>
            </div>
          )}
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-[#3E68A3] font-semibold">This Month</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Money In</h3>
            <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(safeData.moneyIn)}</p>
          </div>

          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm text-[#3E68A3] font-semibold">This Month</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Money Out</h3>
            <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(safeData.moneyOut)}</p>
          </div>

          <div className="bg-[#A1C6EA] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white p-3 rounded-full">
                <Wallet className="h-6 w-6 text-[#3E68A3]" />
              </div>
              <span className="text-sm text-[#04080F] font-semibold">Available</span>
            </div>
            <h3 className="text-[#04080F] text-sm mb-1">Current Balance</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(safeData.currentBalance)}</p>
          </div>
        </div>

        {/* Financial Status */}
        <div className={`${statusConfig.bgColor} border-2 ${statusConfig.borderColor} rounded-lg p-6 mb-8`}>
          <div className="flex items-center">
            <StatusIcon className={`h-8 w-8 ${statusConfig.color} mr-4`} />
            <div>
              <h3 className={`text-lg font-semibold ${statusConfig.color}`}>Financial Status</h3>
              <p className="text-gray-700">{statusConfig.text}</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#04080F]">Recent Transactions</h2>
          </div>

          {safeData.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {safeData.recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-[#E0E9F6] rounded-lg hover:bg-[#A1C6EA] transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-[#04080F]">{tx.description}</p>
                    <p className="text-sm text-[#3E68A3]">{tx.category} • {tx.date}</p>
                  </div>
                  <div className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/create-budget')}
            className="bg-[#3E68A3] hover:bg-[#04080F] text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg"
          >
            Create New Budget
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
