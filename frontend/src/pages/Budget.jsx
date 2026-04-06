import React, { useState, useEffect } from 'react';
import { apiService } from '../assets/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Budget = () => {
  const { isDarkMode, colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', limit: '', period: 'monthly' });
  const INR = '₹';

  const CATEGORIES = ['Food', 'Housing', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await apiService.getBudgets();
      if (res.success) setBudgets(res.budgets || []);
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const res = await apiService.saveBudget({
        category: formData.category,
        limit: Number(formData.limit),
        period: formData.period
      });
      if (res.success) {
        toast.success('Budget saved!');
        setFormData({ category: '', limit: '', period: 'monthly' });
        setShowForm(false);
        fetchBudgets();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
    }
  };

  const handleDelete = (id, category) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete {category} budget?</span>
        <button onClick={async () => { toast.dismiss(t.id); try { await apiService.deleteBudget(id); fetchBudgets(); toast.success('Budget deleted!'); } catch { toast.error('Failed'); }}} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold">Delete</button>
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm">Cancel</button>
      </div>
    ), { duration: 10000 });
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'from-red-500 to-red-600';
    if (pct >= 80) return 'from-yellow-500 to-orange-500';
    if (pct >= 50) return 'from-blue-500 to-cyan-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusBadge = (budget) => {
    if (budget.isOverBudget) return { text: '🔴 Over Budget', cls: isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700' };
    if (budget.isNearLimit) return { text: '🟡 Near Limit', cls: isDarkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700' };
    return { text: '🟢 On Track', cls: isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700' };
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.isOverBudget).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-3xl p-8 border ${theme.border} shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${theme.gradient.primary} bg-clip-text text-transparent`}>
            💳 Budget Limits
          </h1>
          <p className={`${theme.textSecondary} mt-2`}>Set spending limits per category</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`px-8 py-4 ${theme.button} text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95`}>
          {showForm ? '✕ Close' : '➕ Add Budget'}
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-300/30' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'} rounded-2xl p-5 border shadow-xl text-center`}>
            <p className={`text-xs uppercase ${theme.textMuted} mb-1`}>Total Budget</p>
            <p className={`text-2xl font-black ${theme.text}`}>{INR}{totalBudget.toLocaleString('en-IN')}</p>
          </div>
          <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-300/30' : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'} rounded-2xl p-5 border shadow-xl text-center`}>
            <p className={`text-xs uppercase ${theme.textMuted} mb-1`}>Total Spent</p>
            <p className={`text-2xl font-black ${theme.error}`}>{INR}{totalSpent.toLocaleString('en-IN')}</p>
          </div>
          <div className={`backdrop-blur-xl ${isDarkMode ? (overBudgetCount > 0 ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-300/30' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-300/30') : (overBudgetCount > 0 ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200')} rounded-2xl p-5 border shadow-xl text-center`}>
            <p className={`text-xs uppercase ${theme.textMuted} mb-1`}>Over Budget</p>
            <p className={`text-2xl font-black ${overBudgetCount > 0 ? theme.error : theme.success}`}>{overBudgetCount} / {budgets.length}</p>
          </div>
        </div>
      )}

      {/* Add Budget Form */}
      {showForm && (
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Set Category Budget</h3>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`flex-1 px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus}`} required>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Budget Limit (₹)" value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className={`flex-1 px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus}`} required min="1" />
            <select value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className={`px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus}`}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-bold hover:shadow-lg transition-all">
              Save
            </button>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-400 border-t-teal-600"></div>
            <p className={`${theme.text} mt-4`}>Loading budgets...</p>
          </div>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const status = getStatusBadge(budget);
            return (
              <div key={budget._id} className={`backdrop-blur-xl ${theme.card} rounded-2xl p-5 border ${theme.border} shadow-xl hover:shadow-2xl transition-all`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`text-lg font-bold ${theme.text}`}>{budget.category}</h3>
                    <p className={`text-xs ${theme.textMuted} capitalize`}>{budget.period} budget</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${status.cls}`}>{status.text}</span>
                    <button onClick={() => handleDelete(budget._id, budget.category)} className="text-red-400 hover:text-red-500 transition-colors text-lg">🗑️</button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme.textSecondary}`}>
                    {INR}{budget.spent.toLocaleString('en-IN')} / {INR}{budget.limit.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-sm font-bold ${budget.isOverBudget ? theme.error : theme.success}`}>
                    {budget.isOverBudget ? `Over by ${INR}${Math.abs(budget.remaining).toLocaleString('en-IN')}` : `${INR}${budget.remaining.toLocaleString('en-IN')} left`}
                  </span>
                </div>

                <div className={`w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-3`}>
                  <div className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(budget.percentage)} transition-all duration-700 ${budget.percentage >= 80 ? 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' : ''}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}></div>
                </div>
                <p className={`text-xs mt-1 text-right ${theme.textMuted}`}>{budget.percentage}% used</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-12 border ${theme.border} shadow-xl text-center`}>
          <span className="text-5xl block mb-4">💳</span>
          <p className={`text-lg ${theme.textSecondary}`}>No budgets set yet</p>
          <p className={`text-sm ${theme.textMuted} mt-1`}>Click "Add Budget" to set spending limits for each category</p>
        </div>
      )}
    </div>
  );
};

export default Budget;
