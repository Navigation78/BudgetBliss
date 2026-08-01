import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';
import { apiGet, apiPost } from '../utils/apiClient';
import { getCurrentUser } from '../utils/auth';
import formatCurrency from '../utils/formatCurrency';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Budgets are per real category (backend/middleware/validators.js requires a
// categoryId uuid), so the category list comes from GET /categories - the
// screen no longer uses a fixed set of hardcoded categories.
const CreateBudget = () => {
  const user = getCurrentUser();
  const [categories, setCategories] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetPercentages, setBudgetPercentages] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    setError(null);
    try {
      const [categoriesRes, userRes] = await Promise.all([
        apiGet('/categories'),
        apiGet(`/users/${user.userId}`),
      ]);
      setCategories(categoriesRes || []);
      setCurrentBalance(userRes?.user?.stats?.currentBalance ?? null);
      setBudgetPercentages((prev) => {
        const next = {};
        (categoriesRes || []).forEach((c) => { next[c.categoryId] = prev[c.categoryId] ?? 0; });
        return next;
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => { load(); }, [load]);

  const totalPercentage = Object.values(budgetPercentages).reduce((sum, val) => sum + val, 0);
  const isValid = totalPercentage === 100;

  const handlePercentageChange = (categoryId, value) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.min(Math.max(numValue, 0), 100);
    setBudgetPercentages(prev => ({ ...prev, [categoryId]: clampedValue }));
  };

  const calculateAmount = (percentage) => {
    if (currentBalance === null || currentBalance === undefined) return null;
    const amt = (Number(currentBalance) * Number(percentage)) / 100;
    return Math.round(amt);
  };

  const handleSaveBudget = async () => {
    if (!isValid) {
      alert('Please balance your budget first');
      return;
    }

    const entries = Object.entries(budgetPercentages).filter(([, pct]) => pct > 0);
    if (entries.length === 0) {
      alert('Allocate at least one category before saving');
      return;
    }
    if (!currentBalance || currentBalance <= 0) {
      alert("We can't create a budget until you have a positive balance (record some transactions first).");
      return;
    }

    setSaving(true);
    try {
      const startDate = new Date().toISOString();
      await Promise.all(entries.map(([categoryId, pct]) =>
        apiPost('/budgets', {
          categoryId,
          amount: calculateAmount(pct),
          period: 'monthly',
          startDate,
        })
      ));
      alert('Budget saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
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
              {/* Show loading state while fetching categories/balance */}
              {loading && (
                <div className="p-4">
                  <LoadingSkeleton text="Loading your categories..." />
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-red-600 font-semibold">Unable to load your categories</p>
                  <p className="text-sm text-gray-700">{error.message}</p>
                  <div className="mt-3">
                    <button onClick={() => load()} className="px-3 py-2 bg-[#3E68A3] text-white rounded-lg">Retry</button>
                  </div>
                </div>
              )}

            {!loading && !error && (
              <>
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
                {categories.map((category) => {
                  const percentage = budgetPercentages[category.categoryId] ?? 0;
                  return (
                    <div key={category.categoryId} className="bg-white border-2 border-[#E0E9F6] rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-3 rounded-full text-xl"
                            style={{ backgroundColor: `${category.color}33` }}
                          >
                            {category.icon || '📌'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#04080F] text-lg">{category.name}</h3>
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
                            onChange={(e) => handlePercentageChange(category.categoryId, e.target.value)}
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
                        onChange={(e) => handlePercentageChange(category.categoryId, e.target.value)}
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
                  disabled={!isValid || saving}
                  className={`w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
                    isValid && !saving ? 'bg-[#3E68A3] hover:bg-[#04080F] cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-5 w-5" />
                  {saving ? 'Saving...' : isValid ? 'Save Budget' : 'Balance Your Budget First'}
                </button>
              </>
            )}
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
                {categories.map((category) => {
                  const percentage = budgetPercentages[category.categoryId] ?? 0;
                  const amount = calculateAmount(percentage);
                  return (
                    <div key={category.categoryId} className="bg-white bg-opacity-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#04080F]">{category.name}</span>
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
