import React, { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Award, Calendar } from 'lucide-react';

const Analytics = () => {
  // Sample data - this will come from your AWS SageMaker model
  const [timeRange, setTimeRange] = useState('7days'); // 7days or 30days

  // Spending by category (for pie chart)
  const categoryData = [
    { name: 'Food', value: 15000, color: '#10B981' },
    { name: 'Transport', value: 8000, color: '#8B5CF6' },
    { name: 'Entertainment', value: 3500, color: '#EC4899' },
    { name: 'Utilities', value: 5000, color: '#F59E0B' },
    { name: 'Shopping', value: 6500, color: '#3B82F6' },
    { name: 'Other', value: 2000, color: '#6B7280' }
  ];

  // Daily spending trend (last 7 days)
  const trendData = [
    { day: 'Mon', amount: 2500 },
    { day: 'Tue', amount: 3200 },
    { day: 'Wed', amount: 1800 },
    { day: 'Thu', amount: 4100 },
    { day: 'Fri', amount: 5500 },
    { day: 'Sat', amount: 7200 },
    { day: 'Sun', amount: 3800 }
  ];

  // Analytics insights
  const insights = {
    biggestCategory: { name: 'Food', amount: 15000, percentage: 37.5 },
    largestTransaction: { description: 'Weekend Shopping', amount: 7200, date: '2025-11-06', category: 'Shopping' },
    totalSpending: 40000,
    savingsGoal: { target: 20000, current: 14500, percentage: 72.5 }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Custom label for pie chart
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
          <p className="text-[#3E68A3]">Insights powered by AI analysis of your spending patterns</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-5 w-5 text-[#3E68A3]" />
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === '7days'
                  ? 'bg-[#3E68A3] text-white'
                  : 'bg-[#E0E9F6] text-[#3E68A3] hover:bg-[#A1C6EA]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === '30days'
                  ? 'bg-[#3E68A3] text-white'
                  : 'bg-[#E0E9F6] text-[#3E68A3] hover:bg-[#A1C6EA]'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Spending */}
          <div className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Spending</h3>
            <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(insights.totalSpending)}</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#04080F', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E9F6" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#3E68A3"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#3E68A3"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#04080F', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3E68A3" 
                    strokeWidth={3}
                    dot={{ fill: '#3E68A3', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Average daily spending: {formatCurrency(insights.totalSpending / 7)}
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
                <h3 className="text-lg font-bold text-red-700 mb-2">Largest Transaction This Week</h3>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-[#04080F] mb-1">{insights.largestTransaction.description}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    {insights.largestTransaction.category} • {insights.largestTransaction.date}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(insights.largestTransaction.amount)}
                  </p>
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
                    <span className="text-lg font-bold text-green-600">
                      {insights.savingsGoal.percentage}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${insights.savingsGoal.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Saved: <span className="font-semibold text-[#04080F]">{formatCurrency(insights.savingsGoal.current)}</span>
                    </span>
                    <span className="text-gray-600">
                      Goal: <span className="font-semibold text-[#04080F]">{formatCurrency(insights.savingsGoal.target)}</span>
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-3 font-medium">
                    {insights.savingsGoal.percentage >= 75 
                      ? '🎉 Great progress! You\'re almost there!' 
                      : '💪 Keep going! You\'re on the right track!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Badge */}
        <div className="mt-8 bg-[#E0E9F6] border-2 border-[#A1C6EA] rounded-lg p-4 text-center">
          <p className="text-sm text-[#3E68A3]">
            <span className="font-semibold">🤖 AI Insight:</span> Based on your spending patterns, 
            you could save an additional {formatCurrency(2500)} this month by reducing {insights.biggestCategory.name} expenses by 15%.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Analytics;