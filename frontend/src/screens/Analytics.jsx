import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Mock transaction data (last 7 days)
const transactions = [
  { category: "Food", amount: -2000, date: "2025-11-03" },
  { category: "Rent", amount: -5000, date: "2025-11-02" },
  { category: "Savings", amount: -3000, date: "2025-11-01" },
  { category: "Transport", amount: -800, date: "2025-11-05" },
  { category: "Entertainment", amount: -1200, date: "2025-11-04" },
  { category: "Insurance", amount: -1000, date: "2025-11-06" },
];

const categoryColors = {
  Rent: "#3B82F6",
  Food: "#60A5FA",
  Transport: "#2563EB",
  Savings: "#16A34A",
  Entertainment: "#1D4ED8",
  Insurance: "#1E40AF",
};

const Analytics = ({ savingsGoal = 5000 }) => {
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [biggestCategory, setBiggestCategory] = useState("");
  const [largestTransaction, setLargestTransaction] = useState({});
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    // Pie Chart: sum per category
    const categorySums = {};
    transactions.forEach((tx) => {
      if (!categorySums[tx.category]) categorySums[tx.category] = 0;
      categorySums[tx.category] += Math.abs(tx.amount);
    });

    const pie = Object.entries(categorySums).map(([name, value]) => ({
      name,
      value,
    }));
    setPieData(pie);

    // Biggest Category
    let maxCategory = pie.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), { value: 0 });
    setBiggestCategory(maxCategory.name);

    // Largest Transaction
    let largestTx = transactions.reduce((prev, curr) => (Math.abs(curr.amount) > Math.abs(prev.amount) ? curr : prev), transactions[0]);
    setLargestTransaction(largestTx);

    // Line Chart: sum per day
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const line = daysOfWeek.map((day, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx)); // last 7 days
      const dateStr = date.toISOString().split("T")[0];
      const total = transactions
        .filter((tx) => tx.date === dateStr)
        .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
      return { day, amount: total };
    });
    setLineData(line);

    // Total saved
    const saved = transactions
      .filter((tx) => tx.category === "Savings")
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    setTotalSaved(saved);
  }, []);

  const savingsProgress = Math.min((totalSaved / savingsGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-softBlue p-6">
      <h1 className="text-3xl font-bold text-royalBlue mb-6">Analytics</h1>

      {/* Top Row: Pie + Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Spending by Category (Pie Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-royalBlue">Spending by Category (7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Trend (Line Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-royalBlue">Spending Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biggest Category */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-royalBlue mb-2">Biggest Category This Week</h3>
          <p className="text-gray-700 text-xl">{biggestCategory}</p>
        </div>

        {/* Largest Money Out */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-royalBlue mb-2">Largest Transaction</h3>
          <p className="text-gray-700">{largestTransaction.category}</p>
          <p className="text-gray-700">KES {Math.abs(largestTransaction.amount).toLocaleString()}</p>
          <p className="text-gray-500 text-sm">{largestTransaction.date}</p>
        </div>

        {/* Savings Progress */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-royalBlue mb-2">Savings Goal</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${savingsProgress}%` }}></div>
          </div>
          <p className="text-gray-700">{totalSaved.toLocaleString()} / {savingsGoal.toLocaleString()} KES ({savingsProgress.toFixed(0)}%)</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
