import React, { useState, useEffect } from "react";

// Predefined categories
const categories = [
  { name: "Rent", color: "bg-blue-400" },
  { name: "Food", color: "bg-blue-500" },
  { name: "Transport", color: "bg-blue-600" },
  { name: "Savings", color: "bg-green-500" },
  { name: "Entertainment", color: "bg-blue-700" },
  { name: "Insurance", color: "bg-blue-800" },
];

const CreateBudget = ({ currentBalance = 15000 }) => {
  // State for percentages
  const [percentages, setPercentages] = useState(() => {
    const initial = {};
    categories.forEach((cat) => (initial[cat.name] = 0));
    return initial;
  });

  const [notification, setNotification] = useState("");

  // Helper: calculate allocations
  const allocations = categories.map((cat) => ({
    name: cat.name,
    percentage: percentages[cat.name],
    amount: Math.round((percentages[cat.name] / 100) * currentBalance),
    color: cat.color,
  }));

  // Auto-normalize function: adjust largest category
  const handlePercentageChange = (name, value) => {
    value = Math.max(0, Math.min(100, Number(value))); // Clamp 0-100

    let totalExcluding = Object.entries(percentages)
      .filter(([key]) => key !== name)
      .reduce((acc, [, val]) => acc + val, 0);

    // New total with change
    let newTotal = totalExcluding + value;

    let updated = { ...percentages, [name]: value };

    if (newTotal > 100) {
      // Need to reduce largest other category
      let others = Object.entries(updated)
        .filter(([key]) => key !== name)
        .sort((a, b) => b[1] - a[1]); // Descending

      if (others.length > 0) {
        let [largestName, largestValue] = others[0];
        let excess = newTotal - 100;
        let newLargest = Math.max(0, largestValue - excess);
        updated[largestName] = newLargest;
        setNotification(
          `Adjusted ${largestName} by -${excess}% to keep total at 100%`
        );
        setTimeout(() => setNotification(""), 3000);
      }
    }

    setPercentages(updated);
  };

  return (
    <div className="min-h-screen bg-softBlue p-6">
      <h1 className="text-3xl font-bold text-royalBlue mb-6">Create Monthly Budget</h1>

      {/* Notification */}
      {notification && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
          {notification}
        </div>
      )}

      {/* Sliders + Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-white p-4 rounded shadow-md">
            <label className="block font-semibold text-gray-700 mb-2">{cat.name}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={percentages[cat.name]}
              onChange={(e) => handlePercentageChange(cat.name, e.target.value)}
              className={`w-full h-2 rounded ${cat.color}`}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={percentages[cat.name]}
              onChange={(e) => handlePercentageChange(cat.name, e.target.value)}
              className="mt-2 w-20 p-1 border rounded"
            />
          </div>
        ))}
      </div>

      {/* Preview Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-royalBlue">Budget Preview</h2>
        <div className="space-y-3">
          {allocations.map((alloc) => (
            <div key={alloc.name} className="flex justify-between items-center">
              <span className="font-semibold">{alloc.name}</span>
              <span className={`font-bold ${alloc.name === "Savings" ? "text-green-600" : "text-blue-600"}`}>
                {alloc.percentage}% → KES {alloc.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-3 text-right font-semibold text-gray-700">
          Total Allocated: KES {allocations.reduce((acc, a) => acc + a.amount, 0).toLocaleString()}
        </div>
        <div className="text-right text-gray-500">
          Remaining Balance: KES {currentBalance - allocations.reduce((acc, a) => acc + a.amount, 0)}
        </div>
      </div>
    </div>
  );
};

export default CreateBudget;
