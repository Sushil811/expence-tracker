import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../assets/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Income = () => {
  const { isDarkMode, colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const COLORS = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];
  const INR = '₹';

  const getChartData = () => {
    const categoryMap = incomes.reduce((acc, income) => {
      acc[income.category] = (acc[income.category] || 0) + income.amount;
      return acc;
    }, {});
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = incomes.reduce((sum, i) => sum + i.amount, 0);
    const avg = incomes.length > 0 ? total / incomes.length : 0;
    const highest = incomes.length > 0 ? Math.max(...incomes.map(i => i.amount)) : 0;
    const categories = new Set(incomes.map(i => i.category)).size;
    return { total, avg, highest, categories };
  }, [incomes]);

  // Filtered and sorted list
  const filteredIncomes = useMemo(() => {
    let result = [...incomes];
    if (searchTerm) {
      result = result.filter(i =>
        (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory) {
      result = result.filter(i => i.category === filterCategory);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.date) - new Date(b.date);
      else if (sortBy === 'amount') cmp = a.amount - b.amount;
      else cmp = (a.description || '').localeCompare(b.description || '');
      return sortOrder === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [incomes, searchTerm, filterCategory, sortBy, sortOrder]);

  const uniqueCategories = useMemo(() => [...new Set(incomes.map(i => i.category))], [incomes]);

  const handleExportExcel = async () => {
    try {
      const blob = await apiService.downloadIncomeExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Income_Details.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Excel file downloaded!');
    } catch (err) {
      toast.error('Failed to download Excel file');
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllIncome();
      if (response.success) {
        setIncomes(response.income || []);
      } else {
        throw new Error(response.message || 'Failed to load incomes');
      }
    } catch (err) {
      console.error('Income fetch error:', err);
      toast.error(err.message || 'Failed to load incomes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        await apiService.updateIncome(editingIncome._id, formData);
      } else {
        await apiService.addIncome(formData);
      }
      setShowModal(false);
      setEditingIncome(null);
      setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
      fetchIncomes();
      toast.success(editingIncome ? 'Income updated!' : 'Income added!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      description: income.description,
      amount: income.amount,
      category: income.category,
      date: new Date(income.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete this income?</span>
        <button onClick={async () => { toast.dismiss(t.id); try { await apiService.deleteIncome(id); fetchIncomes(); toast.success('Income deleted!'); } catch (err) { toast.error(err.message); }}} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold">Delete</button>
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm">Cancel</button>
      </div>
    ), { duration: 10000 });
  };

  const openAddModal = () => {
    setEditingIncome(null);
    setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-3xl p-8 border ${theme.border} shadow-2xl ${theme.cardHover} transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
        <div>
          <h1 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${theme.gradient.income} bg-clip-text text-transparent`}>
            📥 Income Management
          </h1>
          <p className={`${theme.textSecondary} mt-2`}>Track and manage your income sources</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportExcel} className={`px-6 py-4 ${theme.buttonSecondary} rounded-2xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 whitespace-nowrap`}>
            📥 Export
          </button>
          <button onClick={openAddModal} className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-2xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 whitespace-nowrap">
            ➕ Add Income
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && incomes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-5 border ${theme.border} shadow-lg text-center`}>
            <p className={`text-xs uppercase tracking-wide ${theme.textMuted} mb-1`}>Total Income</p>
            <p className={`text-2xl font-black ${theme.success}`}>{INR}{stats.total.toLocaleString('en-IN')}</p>
          </div>
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-5 border ${theme.border} shadow-lg text-center`}>
            <p className={`text-xs uppercase tracking-wide ${theme.textMuted} mb-1`}>Average</p>
            <p className={`text-2xl font-black ${theme.info}`}>{INR}{Math.round(stats.avg).toLocaleString('en-IN')}</p>
          </div>
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-5 border ${theme.border} shadow-lg text-center`}>
            <p className={`text-xs uppercase tracking-wide ${theme.textMuted} mb-1`}>Highest</p>
            <p className={`text-2xl font-black ${theme.text}`}>{INR}{stats.highest.toLocaleString('en-IN')}</p>
          </div>
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-5 border ${theme.border} shadow-lg text-center`}>
            <p className={`text-xs uppercase tracking-wide ${theme.textMuted} mb-1`}>Categories</p>
            <p className={`text-2xl font-black ${theme.text}`}>{stats.categories}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && incomes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-2xl`}>
            <h2 className={`text-xl font-bold ${theme.text} mb-4`}>Category Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getChartData()} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={5} dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${INR}${value.toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: isDarkMode ? '#fff' : '#000' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-2xl`}>
            <h2 className={`text-xl font-bold ${theme.text} mb-4`}>Income by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ left: 0, right: 0, top: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.1)"} />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} stroke={isDarkMode ? "#cbd5e1" : "#64748b"} />
                  <YAxis stroke={isDarkMode ? "#cbd5e1" : "#64748b"} />
                  <RechartsTooltip formatter={(value) => `${INR}${value.toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: isDarkMode ? '#fff' : '#000' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-red-500/20 border-red-400/50' : 'bg-red-50 border-red-200'} border rounded-2xl p-6 shadow-2xl`}>
          <p className={`${theme.error} font-bold`}>{error}</p>
        </div>
      )}

      {/* Search & Filter Bar */}
      {!loading && incomes.length > 0 && (
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-4 border ${theme.border} shadow-lg flex flex-col sm:flex-row gap-3`}>
          <input
            type="text"
            placeholder="🔍 Search income..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 px-4 py-2.5 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-4 py-2.5 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}>
            <option value="">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [s, o] = e.target.value.split('-'); setSortBy(s); setSortOrder(o); }}
            className={`px-4 py-2.5 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}>
            <option value="date-desc">Date ↓</option>
            <option value="date-asc">Date ↑</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
            <option value="description-asc">Name A-Z</option>
            <option value="description-desc">Name Z-A</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-green-600"></div>
            <p className={`${theme.text} mt-4 font-medium`}>Loading your income...</p>
          </div>
        </div>
      ) : (
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl border ${theme.border} shadow-2xl overflow-hidden ${theme.cardHover} transition-all`}>
          {filteredIncomes.length > 0 ? (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <th className={`px-6 py-4 text-left ${theme.text} font-bold uppercase text-sm tracking-wide`}>Description</th>
                    <th className={`px-6 py-4 text-left ${theme.text} font-bold uppercase text-sm tracking-wide`}>Amount</th>
                    <th className={`px-6 py-4 text-left ${theme.text} font-bold uppercase text-sm tracking-wide`}>Category</th>
                    <th className={`px-6 py-4 text-left ${theme.text} font-bold uppercase text-sm tracking-wide`}>Date</th>
                    <th className={`px-6 py-4 text-left ${theme.text} font-bold uppercase text-sm tracking-wide`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income) => (
                    <tr key={income._id} className={`border-t ${theme.border} ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-all`}>
                      <td className={`px-6 py-4 ${theme.text} font-medium`}>{income.description}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${theme.success} text-lg`}>{INR}{income.amount?.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${isDarkMode ? 'bg-green-500/30 text-green-200 border-green-400/50' : 'bg-green-100 text-green-700 border-green-300'} px-3 py-1 rounded-full text-sm font-medium border`}>
                          {income.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${theme.textSecondary}`}>
                        {new Date(income.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button onClick={() => handleEdit(income)} className="px-3 py-2 bg-blue-500/50 hover:bg-blue-500 text-white rounded-lg transition-all font-medium hover:scale-105 active:scale-95">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(income._id)} className="px-3 py-2 bg-red-500/50 hover:bg-red-500 text-white rounded-lg transition-all font-medium hover:scale-105 active:scale-95">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📭</p>
              <p className={`${theme.textSecondary} text-lg`}>
                {searchTerm || filterCategory ? 'No matching income records' : 'No income records found'}
              </p>
              <p className={`${theme.textMuted} text-sm mt-2`}>
                {searchTerm || filterCategory ? 'Try adjusting your filters' : 'Click "Add Income" to get started!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`backdrop-blur-3xl ${isDarkMode ? 'bg-slate-800/90' : 'bg-white'} rounded-3xl p-8 border ${isDarkMode ? 'border-white/20' : 'border-gray-200'} shadow-2xl max-w-md w-full transform transition-all`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-3xl font-bold ${theme.text}`}>
                {editingIncome ? '✏️ Edit Income' : '➕ Add Income'}
              </h2>
              <button onClick={() => setShowModal(false)} className={`text-3xl ${theme.textMuted} hover:${theme.text} transition-colors`}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block ${theme.text} font-bold mb-2`}>Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full ${theme.input} border ${theme.border} rounded-lg px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
                  placeholder="Enter description" required />
              </div>
              <div>
                <label className={`block ${theme.text} font-bold mb-2`}>Amount</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className={`w-full ${theme.input} border ${theme.border} rounded-lg px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`}
                  placeholder="Enter amount" required />
              </div>
              <div>
                <label className={`block ${theme.text} font-bold mb-2`}>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full ${theme.input} border ${theme.border} rounded-lg px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`} required>
                  <option value="">Select Category</option>
                  <option value="Salary">💼 Salary</option>
                  <option value="Freelance">🎨 Freelance</option>
                  <option value="Business">🏢 Business</option>
                  <option value="Investment">📈 Investment</option>
                  <option value="Other">🎯 Other</option>
                </select>
              </div>
              <div>
                <label className={`block ${theme.text} font-bold mb-2`}>Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className={`w-full ${theme.input} border ${theme.border} rounded-lg px-4 py-3 focus:outline-none ${theme.inputFocus} transition-all`} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-3 ${theme.buttonSecondary} rounded-lg transition-all font-bold`}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-lg transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95">
                  {editingIncome ? '✓ Update' : '✓ Add'} Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;