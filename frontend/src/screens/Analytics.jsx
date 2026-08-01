import React, { useCallback, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, AlertTriangle, Target, Award, Calendar } from 'lucide-react';
import { apiGet } from '../utils/apiClient';
import LoadingSkeleton from '../components/LoadingSkeleton';
import formatCurrency from '../utils/formatCurrency';

// The backend has no /analytics?range= endpoint - only an aggregate-totals
// /analytics/dashboard and plain /transactions + /categories lists. Everything
// below (category breakdown, daily trend, savings goal) is computed client-side
// from the raw transaction/category data instead.
const RANGE_DAYS = { '7days': 7, '30days': 30 };

function buildAnalytics(transactions, categories, rangeDays) {
  const categoryById = {};
  categories.forEach((c) => { categoryById[c.categoryId] = c; });

  const cutoff = Date.now() - rangeDays * 86400000;
  const inRange = transactions.filter((t) => t.createdAt >= cutoff);
  const expenses = inRange.filter((t) => t.type === 'expense');
  const income = inRange.filter((t) => t.type === 'income');

  const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const byCategory = {};
  expenses.forEach((t) => {
    const cat = categoryById[t.categoryId];
    const key = t.categoryId || 'UNCATEGORIZED';
    if (!byCategory[key]) {
      byCategory[key] = { name: cat?.name || 'Uncategorized', color: cat?.color || '#95A5A6', value: 0 };
    }
    byCategory[key].value += t.amount;
  });
  const categoryData = Object.values(byCategory).sort((a, b) => b.value - a.value);

  // Daily trend - one bucket per day across the range, oldest to newest
  const dayBuckets = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    dayBuckets.push({
      key: d.toDateString(),
      day: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      amount: 0,
    });
  }
  const bucketByKey = Object.fromEntries(dayBuckets.map((b) => [b.key, b]));
  expenses.forEach((t) => {
    const key = new Date(t.createdAt).toDateString();
    if (bucketByKey[key]) bucketByKey[key].amount += t.amount;
  });

  const biggestCategory = categoryData[0]
    ? { ...categoryData[0], percentage: totalSpending ? Math.round((categoryData[0].value / totalSpending) * 100) : 0 }
    : { name: '--', amount: 0, percentage: 0 };

  const largestExpense = expenses.reduce((max, t) => (!max || t.amount > max.amount ? t : max), null);
  const largestTransaction = largestExpense
    ? {
        description: largestExpense.description || largestExpense.reference || 'Transaction',
        amount: largestExpense.amount,
        date: new Date(largestExpense.createdAt).toLocaleDateString(),
        category: categoryById[largestExpense.categoryId]?.name || 'Uncategorized',
      }
    : { description: '--', amount: 0, date: '--', category: '--' };

  // No backend concept of a savings goal - approximate one from the 50/30/20 rule
  // (20% of income) already referenced in the app's daily tips.
  const savingsTarget = Math.round(totalIncome * 0.2);
  const savingsCurrent = Math.max(totalIncome - totalSpending, 0);
  const savingsGoal = {
    target: savingsTarget,
    current: Math.min(savingsCurrent, savingsTarget || savingsCurrent),
    percentage: savingsTarget ? Math.min(100, Math.round((savingsCurrent / savingsTarget) * 100)) : 0,
  };

  return {
    categoryData,
    trendData: dayBuckets,
    insights: { biggestCategory, largestTransaction, totalSpending, savingsGoal },
  };
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        apiGet('/transactions?limit=500'),
        apiGet('/categories'),
      ]);
      setTransactions(transactionsRes?.transactions || []);
      setCategories(categoriesRes || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { categoryData, trendData, insights } = buildAnalytics(transactions, categories, RANGE_DAYS[timeRange]);

  // Custom Pie Chart Label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#04080F] mb-2">Analytics Dashboard</h1>
          <p className="text-[#3E68A3]">Insights from your spending patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-5 w-5 text-[#3E68A3]" />
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === '7days' ? 'bg-[#3E68A3] text-white' : 'bg-[#E0E9F6] text-[#3E68A3] hover:bg-[#A1C6EA]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === '30days' ? 'bg-[#3E68A3] text-white' : 'bg-[#E0E9F6] text-[#3E68A3] hover:bg-[#A1C6EA]'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading && (
            <div className="md:col-span-3">
              <LoadingSkeleton text="Loading analytics..." />
            </div>
          )}
          {error && (
            <div className="md:col-span-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">Unable to load analytics</p>
              <p className="text-sm text-gray-700">{error.message}</p>
              <div className="mt-3">
                <button onClick={() => load()} className="px-3 py-2 bg-[#3E68A3] text-white rounded-lg">Retry</button>
              </div>
            </div>
          )}

          {/* Total Spending */}
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Spending</h3>
            <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(insights.totalSpending)}</p>
            <p className="text-xs text-gray-500 mt-1">Last {timeRange === '7days' ? '7 days' : '30 days'}</p>
          </div>

          {/* Biggest Category */}
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Top Category</h3>
            <p className="text-2xl font-bold text-[#04080F]">{insights.biggestCategory.name}</p>
            <p className="text-xs text-gray-500 mt-1">{insights.biggestCategory.percentage}% of spending</p>
          </div>

          {/* Savings Progress */}
          <div className="bg-[#A1C6EA] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white p-3 rounded-full">
                <Target className="h-6 w-6 text-[#3E68A3]" />
              </div>
            </div>
            <h3 className="text-[#04080F] text-sm mb-1">Savings Goal</h3>
            <p className="text-2xl font-bold text-white">{insights.savingsGoal.percentage}%</p>
            <p className="text-xs text-[#04080F] mt-1">
              {formatCurrency(insights.savingsGoal.current)} / {formatCurrency(insights.savingsGoal.target)}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category - Pie Chart */}
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#04080F] mb-4">Spending by Category</h2>
            <div className="h-80 flex items-center justify-center">
              {loading ? (
                <LoadingSkeleton text="Loading chart..." />
              ) : categoryData.length === 0 ? (
                <p className="text-gray-500">No spending in this period</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#04080F', border: 'none', borderRadius: '8px', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold text-[#04080F] ml-auto">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Spending Trend - Line Chart */}
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#04080F] mb-4">Daily Spending Trend</h2>
            <div className="h-80">
              {loading ? (
                <LoadingSkeleton text="Loading chart..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E9F6" />
                    <XAxis dataKey="day" stroke="#3E68A3" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#3E68A3" style={{ fontSize: '12px' }} tickFormatter={(value) => `${value / 1000}K`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#04080F', border: 'none', borderRadius: '8px', color: 'white' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#3E68A3" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Average daily spending: {trendData.length ? formatCurrency(trendData.reduce((sum, t) => sum + t.amount, 0) / trendData.length) : '--'}
            </p>
          </div>
        </div>

        {/* Insights & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Largest Transaction Alert */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 mb-2">Largest Transaction</h3>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-[#04080F] mb-1">{insights.largestTransaction.description}</p>
                  <p className="text-sm text-gray-600 mb-2">{insights.largestTransaction.category} • {insights.largestTransaction.date}</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(insights.largestTransaction.amount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Goal Progress */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-700 mb-2">Savings Goal Progress</h3>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Current Progress</span>
                    <span className="text-lg font-bold text-green-600">{insights.savingsGoal.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${insights.savingsGoal.percentage}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Saved: <span className="font-semibold text-[#04080F]">{formatCurrency(insights.savingsGoal.current)}</span>
                    </span>
                    <span className="text-gray-600">
                      Goal (20% of income): <span className="font-semibold text-[#04080F]">{formatCurrency(insights.savingsGoal.target)}</span>
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-3 font-medium">
                    {insights.savingsGoal.percentage >= 75 ? '🎉 Great progress!' : '💪 Keep going!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
