import React, { useState, useEffect } from 'react';
import { Home, Utensils, Car, PiggyBank, Gamepad2, Shield, AlertCircle, CheckCircle, Save } from 'lucide-react';

const CreateBudget = () => {
  // Placeholder before backend data comes in
  const currentBalance = null; // replace with backend data later

  // Predefined categories with icons and colors
  const categoryConfig = {
    rent: { name: 'Rent', icon: Home, color: 'bg-blue-100 text-blue-600' },
    food: { name: 'Food', icon: Utensils, color: 'bg-green-100 text-green-600' },
    transport: { name: 'Transport', icon: Car, color: 'bg-purple-100 text-purple-600' },
    savings: { name: 'Savings', icon: PiggyBank, color: 'bg-yellow-100 text-yellow-600' },
    entertainment: { name: 'Entertainment', icon: Gamepad2, color: 'bg-pink-100 text-pink-600' },
    insurance: { name: 'Insurance', icon: Shield, color: 'bg-red-100 text-red-600' }
  };

  // Budget percentages state (empty initially)
  const [budgetPercentages, setBudgetPercentages] = useState(
    Object.keys(categoryConfig).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  );

  const [totalPercentage, setTotalPercentage] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Calculate total percentage whenever budgetPercentages changes
  useEffect(() => {
    const total = Object.values(budgetPercentages).reduce((sum, val) => sum + val, 0);
    setTotalPercentage(total);
    setIsValid(total === 100);
  }, [budgetPercentages]);

  // Handle slider/input change
  const handlePercentageChange = (category, value) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.min(Math.max(numValue, 0), 100);
    setBudgetPercentages(prev => ({ ...prev, [category]: clampedValue }));
  };

  const calculateAmount = (percentage) => {
    if (!currentBalance) return 0; // placeholder if backend data missing
    return (currentBalance * percentage) / 100;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === 0) return '--'; // placeholder
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSaveBudget = () => {
    if (isValid) {
      console.log('Saving budget:', budgetPercentages);
      alert('Budget saved successfully!');
    } else {
      alert('Please balance your budget first');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#04080F] mb-2">Create Your Budget</h1>
          <p className="text-[#3E68A3]">Allocate your income across different categories</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Categories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Total Percentage Indicator */}
            <div className={`${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isValid ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className={`font-semibold ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                      Total Allocation: {totalPercentage}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {isValid
                        ? 'Perfect! Your budget is balanced.'
                        : `You need to ${totalPercentage > 100 ? 'reduce' : 'add'} ${Math.abs(100 - totalPercentage)}% to reach 100%`}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                    {totalPercentage}%
                  </span>
                  <span className="text-gray-400"> / 100%</span>
                </div>
              </div>
            </div>

            {/* Category Sliders */}
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              const percentage = budgetPercentages[key];
              return (
                <div key={key} className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${config.color} p-3 rounded-full`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#04080F] text-lg">{config.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(calculateAmount(percentage))}
                        </p>
                      </div>
                    </div>

                    {/* Number Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => handlePercentageChange(key, e.target.value)}
                        className="w-16 px-2 py-1 text-center border-2 border-[#A1C6EA] rounded-md font-semibold text-[#04080F] focus:outline-none focus:ring-2 focus:ring-[#3E68A3]"
                      />
                      <span className="text-[#3E68A3] font-semibold">%</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => handlePercentageChange(key, e.target.value)}
                    className="w-full h-2 bg-[#E0E9F6] rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3E68A3 0%, #3E68A3 ${percentage}%, #E0E9F6 ${percentage}%, #E0E9F6 100%)`
                    }}
                  />
                </div>
              );
            })}

            {/* Save Button */}
            <button
              onClick={handleSaveBudget}
              disabled={!isValid}
              className={`w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
                isValid ? 'bg-[#3E68A3] hover:bg-[#04080F] cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <Save className="h-5 w-5" />
              {isValid ? 'Save Budget' : 'Balance Your Budget First'}
            </button>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#A1C6EA] rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-[#04080F] mb-4">Budget Preview</h2>

              {/* Current Balance */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-[#04080F]">{formatCurrency(currentBalance)}</p>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3 mb-4">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const percentage = budgetPercentages[key];
                  const amount = calculateAmount(percentage);
                  return (
                    <div key={key} className="bg-white bg-opacity-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#04080F]">{config.name}</span>
                        <span className="text-xs font-semibold text-[#3E68A3]">{percentage}%</span>
                      </div>
                      <p className="text-lg font-bold text-[#04080F]">{formatCurrency(amount)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="bg-[#04080F] rounded-lg p-4 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Total Allocated</span>
                  <span className="text-sm font-semibold">{totalPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Remaining</span>
                  <span className={`text-lg font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(currentBalance ? (currentBalance * (100 - totalPercentage)) / 100 : 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBudget;
