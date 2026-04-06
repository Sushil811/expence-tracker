import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { apiService } from '../assets/api'
import { useTheme } from '../contexts/ThemeContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRange, setSelectedRange] = useState('monthly')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const { isDarkMode, colors } = useTheme()
  const theme = isDarkMode ? colors.dark : colors.light

  const EXPENSE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']
  const INCOME_COLORS = ['#10b981', '#22d3ee', '#3b82f6', '#a78bfa', '#34d399', '#14b8a6']
  const INR = '₹'

  const tooltipStyle = {
    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: '0.75rem',
    color: isDarkMode ? '#fff' : '#000',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  }

  // Format large numbers: ₹1.2L, ₹45K, etc.
  const formatAmount = (num) => {
    if (num === undefined || num === null) return `${INR}0`
    const abs = Math.abs(num)
    const sign = num < 0 ? '-' : ''
    if (abs >= 10000000) return `${sign}${INR}${(abs / 10000000).toFixed(1)}Cr`
    if (abs >= 100000) return `${sign}${INR}${(abs / 100000).toFixed(1)}L`
    if (abs >= 1000) return `${sign}${INR}${(abs / 1000).toFixed(1)}K`
    return `${sign}${INR}${abs.toLocaleString('en-IN')}`
  }

  const fetchDashboardData = useCallback(async (range, start, end) => {
    try {
      setLoading(true)
      const params = { range: range || selectedRange }
      if (params.range === 'custom' && start && end) {
        params.startDate = start
        params.endDate = end
      }
      const response = await apiService.getDashboardOverview(params)
      if (response.success) setDashboardData(response.data)
      else throw new Error(response.message || 'Failed to load dashboard data')
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [selectedRange])

  useEffect(() => { fetchDashboardData(selectedRange) }, [])

  const handleRangeChange = (range) => {
    setSelectedRange(range)
    if (range !== 'custom') {
      fetchDashboardData(range)
    }
  }

  const handleCustomApply = () => {
    if (!customStart || !customEnd) {
      toast.error('Please select both start and end dates')
      return
    }
    if (new Date(customStart) > new Date(customEnd)) {
      toast.error('Start date must be before end date')
      return
    }
    fetchDashboardData('custom', customStart, customEnd)
  }

  // Smart Insights Generator
  const insights = useMemo(() => {
    if (!dashboardData) return []
    const { monthlyIncome, monthlyExpense, savingRate, lastMonthIncome, lastMonthExpense, expenseDistribution, totalTransactions } = dashboardData
    const tips = []

    if (lastMonthIncome > 0 && monthlyIncome > 0) {
      const c = ((monthlyIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(0)
      if (c > 0) tips.push({ icon: '📈', text: `Income is up ${c}% from previous period`, type: 'success' })
      else if (c < -10) tips.push({ icon: '📉', text: `Income dropped ${Math.abs(c)}% from previous period`, type: 'warning' })
    }
    if (lastMonthExpense > 0 && monthlyExpense > 0) {
      const c = ((monthlyExpense - lastMonthExpense) / lastMonthExpense * 100).toFixed(0)
      if (c > 15) tips.push({ icon: '⚠️', text: `Spending increased ${c}% vs previous period`, type: 'warning' })
      else if (c < -5) tips.push({ icon: '🎉', text: `You cut spending by ${Math.abs(c)}%`, type: 'success' })
    }
    if (savingRate >= 30) tips.push({ icon: '🏆', text: `${savingRate}% savings rate — above the 20% benchmark!`, type: 'success' })
    else if (savingRate >= 10) tips.push({ icon: '👍', text: `${savingRate}% savings rate — aim for 20%+`, type: 'info' })
    else if (savingRate >= 0) tips.push({ icon: '💡', text: `Only ${savingRate}% savings rate. Reduce non-essential spending`, type: 'warning' })
    else tips.push({ icon: '🚨', text: `Spending more than earning! Review expenses now`, type: 'error' })

    if (expenseDistribution?.length > 0 && expenseDistribution[0].percentage > 50)
      tips.push({ icon: '🔍', text: `${expenseDistribution[0].category} is ${expenseDistribution[0].percentage}% of spending`, type: 'info' })

    if (totalTransactions > 50) tips.push({ icon: '📊', text: `${totalTransactions} transactions tracked — impressive!`, type: 'success' })
    else if (totalTransactions === 0) tips.push({ icon: '🚀', text: 'Start by adding your first income or expense!', type: 'info' })

    return tips.slice(0, 4)
  }, [dashboardData])

  const getChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-400 border-t-teal-600"></div>
          <p className={`mt-6 text-xl ${theme.text} font-medium`}>Loading dashboard...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-red-500/20 border-red-400/50' : 'bg-red-50 border-red-200'} rounded-2xl p-8 max-w-md shadow-2xl border`}>
          <p className={`font-bold text-lg ${theme.error}`}>Unable to load dashboard</p>
          <p className={`text-sm mt-2 ${theme.textSecondary}`}>{error}</p>
          <button onClick={() => fetchDashboardData(selectedRange)} className={`mt-4 px-6 py-2 ${theme.button} text-white rounded-lg font-medium`}>Try Again</button>
        </div>
      </div>
    )
  }
  if (!dashboardData) return <div className={`flex items-center justify-center min-h-screen ${theme.textMuted}`}>No data available</div>

  const {
    monthlyIncome = 0, monthlyExpense = 0, monthlySaving = 0, totalSaving = 0,
    savingRate = 0, goals = [], recentTransactions = [],
    expenseDistribution = [], incomeDistribution = [],
    lastMonthIncome = 0, lastMonthExpense = 0, totalTransactions = 0, rangeLabel = ''
  } = dashboardData

  const incomeChange = getChange(monthlyIncome, lastMonthIncome)
  const expenseChange = getChange(monthlyExpense, lastMonthExpense)
  const incomePercent = (monthlyIncome + monthlyExpense) > 0 ? Math.round((monthlyIncome / (monthlyIncome + monthlyExpense)) * 100) : 50
  const expensePercent = 100 - incomePercent
  const daysInPeriod = selectedRange === 'weekly' ? 7 : selectedRange === 'yearly' ? 365 : 30

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ===== HEADER WITH DATE RANGE CONTROLS ===== */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border ${theme.border} shadow-2xl`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r ${theme.gradient.primary} bg-clip-text text-transparent`}>
                💼 MoneyMap Dashboard
              </h1>
              <p className={`${theme.textSecondary} mt-1`}>
                {rangeLabel && <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mr-2 ${isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>{rangeLabel}</span>}
                Overview of your finances
              </p>
            </div>
            <button onClick={() => fetchDashboardData(selectedRange, customStart, customEnd)} className={`px-4 py-2 sm:px-5 sm:py-2.5 ${theme.button} text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 text-xs sm:text-sm`}>
              ↻ Refresh
            </button>
          </div>

          {/* Date Range Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'weekly', label: '📅 Week' },
              { key: 'monthly', label: '📆 Month' },
              { key: 'yearly', label: '📈 Year' },
              { key: 'custom', label: '🔧 Custom' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleRangeChange(key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedRange === key
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : `${theme.buttonSecondary} ${theme.text}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker */}
          {selectedRange === 'custom' && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className={`block text-xs font-semibold ${theme.textMuted} mb-1`}>Start Date</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                  className={`px-3 py-2 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} text-sm`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${theme.textMuted} mb-1`}>End Date</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                  className={`px-3 py-2 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} text-sm`} />
              </div>
              <button onClick={handleCustomApply} className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all">
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-300/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} rounded-2xl p-5 border shadow-xl hover:scale-105 transition-all group`}>
          <p className={`${theme.success} font-bold text-xs uppercase tracking-wide`}>Income</p>
          <p className={`text-2xl md:text-3xl font-black ${theme.text} mt-1`}>{INR}{monthlyIncome.toLocaleString('en-IN')}</p>
          {lastMonthIncome > 0 && <p className={`text-xs mt-1 font-semibold ${Number(incomeChange) >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>{Number(incomeChange) >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}% vs prev</p>}
        </div>
        {/* Expense */}
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-300/30' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'} rounded-2xl p-5 border shadow-xl hover:scale-105 transition-all group`}>
          <p className={`${theme.error} font-bold text-xs uppercase tracking-wide`}>Expenses</p>
          <p className={`text-2xl md:text-3xl font-black ${theme.text} mt-1`}>{INR}{monthlyExpense.toLocaleString('en-IN')}</p>
          {lastMonthExpense > 0 && <p className={`text-xs mt-1 font-semibold ${Number(expenseChange) <= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>{Number(expenseChange) >= 0 ? '↑' : '↓'} {Math.abs(expenseChange)}% vs prev</p>}
        </div>
        {/* Total Savings */}
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-300/30' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} rounded-2xl p-5 border shadow-xl hover:scale-105 transition-all`}>
          <p className={`${theme.info} font-bold text-xs uppercase tracking-wide`}>Total Savings</p>
          <p className={`text-2xl md:text-3xl font-black ${theme.text} mt-1`}>{INR}{totalSaving.toLocaleString('en-IN')}</p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>{totalTransactions} transactions</p>
        </div>
        {/* Rate */}
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-300/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-5 border shadow-xl hover:scale-105 transition-all`}>
          <p className={`${isDarkMode ? 'text-purple-300' : 'text-purple-600'} font-bold text-xs uppercase tracking-wide`}>Savings Rate</p>
          <p className={`text-2xl md:text-3xl font-black ${theme.text} mt-1`}>{savingRate}%</p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>{savingRate >= 20 ? '✅ On target' : '⚠️ Below 20%'}</p>
        </div>
      </div>

      {/* ===== SMART INSIGHTS ===== */}
      {insights.length > 0 && (
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-5 border ${theme.border} shadow-xl`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-3 flex items-center gap-2`}><span>💡</span> Smart Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.map((tip, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                tip.type === 'success' ? (isDarkMode ? 'bg-green-500/10 border-green-400/30' : 'bg-green-50 border-green-200') :
                tip.type === 'warning' ? (isDarkMode ? 'bg-yellow-500/10 border-yellow-400/30' : 'bg-yellow-50 border-yellow-200') :
                tip.type === 'error' ? (isDarkMode ? 'bg-red-500/10 border-red-400/30' : 'bg-red-50 border-red-200') :
                (isDarkMode ? 'bg-blue-500/10 border-blue-400/30' : 'bg-blue-50 border-blue-200')
              }`}>
                <span className="text-lg flex-shrink-0">{tip.icon}</span>
                <p className={`text-sm ${theme.text} font-medium`}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== INCOME VS EXPENSE RATIO (IMPROVED) ===== */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
        <h3 className={`text-xl font-bold ${theme.text} mb-5 flex items-center gap-2`}>
          <span className="text-2xl">💰</span> Income vs Expense Ratio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Donut */}
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[{ name: 'Income', value: monthlyIncome || 1 }, { name: 'Expense', value: monthlyExpense || 1 }]}
                  dataKey="value" cx="50%" cy="50%" innerRadius={65} outerRadius={95} startAngle={90} endAngle={-270} paddingAngle={3}>
                  <Cell fill="#10b981" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(v) => `${INR}${v.toLocaleString('en-IN')}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className={`text-lg font-black ${monthlySaving >= 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                {formatAmount(monthlySaving)}
              </p>
              <p className={`text-xs ${theme.textMuted}`}>Net Balance</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="flex flex-col justify-center space-y-5 md:col-span-2">
            {/* Income */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className={`font-semibold text-sm ${theme.text}`}>Income</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>{incomePercent}%</span>
                </div>
                <span className={`font-bold ${theme.success}`}>{INR}{monthlyIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className={`w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-4`}>
                <div className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  style={{ width: `${incomePercent}%` }}></div>
              </div>
            </div>

            {/* Expense */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className={`font-semibold text-sm ${theme.text}`}>Expenses</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'}`}>{expensePercent}%</span>
                </div>
                <span className={`font-bold ${theme.error}`}>{INR}{monthlyExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className={`w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-4`}>
                <div className="h-4 rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-700 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  style={{ width: `${expensePercent}%` }}></div>
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className={`font-semibold text-sm ${theme.text}`}>Savings</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>{Math.abs(savingRate)}%</span>
                </div>
                <span className={`font-bold ${monthlySaving >= 0 ? theme.success : theme.error}`}>{monthlySaving >= 0 ? '+' : ''}{INR}{monthlySaving.toLocaleString('en-IN')}</span>
              </div>
              <div className={`w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-4`}>
                <div className={`h-4 rounded-full transition-all duration-700 ${monthlySaving >= 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-gradient-to-r from-yellow-500 to-orange-400'}`}
                  style={{ width: `${Math.max(Math.min(Math.abs(savingRate), 100), 5)}%` }}></div>
              </div>
            </div>

            {/* Health Badge */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              savingRate >= 20 ? (isDarkMode ? 'bg-green-500/15 border border-green-400/30' : 'bg-green-50 border border-green-200') :
              savingRate >= 0 ? (isDarkMode ? 'bg-yellow-500/15 border border-yellow-400/30' : 'bg-yellow-50 border border-yellow-200') :
              (isDarkMode ? 'bg-red-500/15 border border-red-400/30' : 'bg-red-50 border border-red-200')
            }`}>
              <span className="text-xl">{savingRate >= 20 ? '🟢' : savingRate >= 0 ? '🟡' : '🔴'}</span>
              <div>
                <p className={`font-bold text-sm ${theme.text}`}>
                  {savingRate >= 20 ? 'Healthy Finances!' : savingRate >= 0 ? 'Room for Improvement' : 'Overspending Alert'}
                </p>
                <p className={`text-xs ${theme.textMuted}`}>
                  {savingRate >= 20 ? `Saving ${savingRate}% — above 20% benchmark` : savingRate >= 0 ? `Saving only ${savingRate}% — try to reach 20%` : 'Expenses exceed income this period'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DUAL PIE CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Pie */}
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>🥧</span> Expense Distribution</h3>
          {expenseDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expenseDistribution} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={4}
                  label={({ category, percentage }) => `${category} ${percentage}%`}>
                  {expenseDistribution.map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${INR}${v.toLocaleString('en-IN')}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className={`${theme.textMuted} text-center py-12`}>No expense data yet</p>}
        </div>
        {/* Income Pie */}
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>💚</span> Income Sources</h3>
          {incomeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={incomeDistribution} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={4}
                  label={({ category, percentage }) => `${category} ${percentage}%`}>
                  {incomeDistribution.map((_, i) => <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${INR}${v.toLocaleString('en-IN')}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className={`${theme.textMuted} text-center py-12`}>No income data yet</p>}
        </div>
      </div>

      {/* ===== TOP SPENDING + BAR CHART ===== */}
      {expenseDistribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Spending */}
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
            <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>🏆</span> Top Spending</h3>
            <div className="space-y-3">
              {expenseDistribution.slice(0, 5).map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold text-sm ${theme.text}`}>#{i + 1} {cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${theme.error}`}>{INR}{cat.amount.toLocaleString('en-IN')}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'} rounded-full h-2`}>
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${cat.percentage}%`, backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Bar Chart */}
          <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
            <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>📊</span> Category Comparison</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expenseDistribution} margin={{ left: 0, right: 0, top: 5, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0.08)"} />
                <XAxis dataKey="category" angle={-35} textAnchor="end" height={60} stroke={isDarkMode ? "#94a3b8" : "#64748b"} fontSize={11} />
                <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                <Tooltip formatter={(v) => `${INR}${v.toLocaleString('en-IN')}`} contentStyle={tooltipStyle} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {expenseDistribution.map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ===== LINE CHART + SAVINGS GOALS + QUICK STATS (MERGED) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl lg:col-span-2`}>
          <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>📈</span> Income vs Expense Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { month: 'Jan', income: monthlyIncome * 0.8, expense: monthlyExpense * 0.9 },
              { month: 'Feb', income: monthlyIncome * 0.9, expense: monthlyExpense * 0.8 },
              { month: 'Mar', income: monthlyIncome, expense: monthlyExpense },
              { month: 'Apr', income: monthlyIncome * 1.1, expense: monthlyExpense * 1.2 },
              { month: 'May', income: monthlyIncome * 1.05, expense: monthlyExpense * 1.1 },
              { month: 'Jun', income: monthlyIncome * 1.15, expense: monthlyExpense * 1.05 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0.08)"} />
              <XAxis dataKey="month" stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
              <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
              <Tooltip formatter={(v) => `${INR}${Math.round(v).toLocaleString('en-IN')}`} contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ===== SAVINGS GOALS + QUICK STATS (SAME CARD) ===== */}
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
          {/* Quick Stats */}
          <h3 className={`text-lg font-bold ${theme.text} mb-3 flex items-center gap-2`}><span>⚡</span> Quick Stats</h3>
          <div className="space-y-2 mb-5">
            {[
              { label: 'Daily Avg Spend', value: `${INR}${Math.round(monthlyExpense / daysInPeriod).toLocaleString('en-IN')}`, color: theme.warning },
              { label: 'Daily Avg Income', value: `${INR}${Math.round(monthlyIncome / daysInPeriod).toLocaleString('en-IN')}`, color: theme.success },
              { label: 'Period Balance', value: `${INR}${monthlySaving.toLocaleString('en-IN')}`, color: monthlySaving >= 0 ? theme.success : theme.error },
              { label: 'Transactions', value: totalTransactions, color: theme.info },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className={`${theme.textSecondary} text-xs`}>{s.label}</span>
                <span className={`${s.color} font-bold text-xs`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className={`h-px mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

          {/* Savings Goals */}
          <h3 className={`text-lg font-bold ${theme.text} mb-3 flex items-center gap-2`}><span>🎯</span> Savings Goals</h3>
          <div className="space-y-3">
            {goals.length > 0 ? goals.slice(0, 3).map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              const done = goal.isCompleted || goal.currentAmount >= goal.targetAmount
              return (
                <div key={goal._id} className={`border-b ${theme.border} pb-2.5 last:border-b-0`}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-semibold ${theme.text} text-xs`}>{goal.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${done ? (isDarkMode ? 'bg-green-500/30 text-green-300' : 'bg-green-100 text-green-700') : (isDarkMode ? 'bg-yellow-500/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700')}`}>
                      {done ? '✓ Done' : `${progress.toFixed(0)}%`}
                    </span>
                  </div>
                  <p className={`text-[10px] mb-1 ${theme.textMuted}`}>{INR}{goal.currentAmount.toLocaleString('en-IN')} / {INR}{goal.targetAmount.toLocaleString('en-IN')}</p>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5`}>
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )
            }) : (
              <div className={`text-center py-4 ${theme.textMuted}`}>
                <span className="text-2xl block mb-1">🎯</span>
                <p className="text-xs">No goals yet</p>
              </div>
            )}
            {goals.length > 3 && <p className={`text-[10px] text-center ${theme.textMuted}`}>+{goals.length - 3} more</p>}
          </div>
        </div>
      </div>

      {/* ===== AREA CHART ===== */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
        <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>📊</span> Financial Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={[
            { month: 'Jan', income: monthlyIncome * 0.8, expense: monthlyExpense * 0.9, savings: (monthlyIncome * 0.8) - (monthlyExpense * 0.9) },
            { month: 'Feb', income: monthlyIncome * 0.9, expense: monthlyExpense * 0.8, savings: (monthlyIncome * 0.9) - (monthlyExpense * 0.8) },
            { month: 'Mar', income: monthlyIncome, expense: monthlyExpense, savings: monthlySaving },
            { month: 'Apr', income: monthlyIncome * 1.1, expense: monthlyExpense * 1.2, savings: (monthlyIncome * 1.1) - (monthlyExpense * 1.2) },
            { month: 'May', income: monthlyIncome * 1.05, expense: monthlyExpense * 1.1, savings: (monthlyIncome * 1.05) - (monthlyExpense * 1.1) },
            { month: 'Jun', income: monthlyIncome * 1.15, expense: monthlyExpense * 1.05, savings: (monthlyIncome * 1.15) - (monthlyExpense * 1.05) }
          ]}>
            <defs>
              <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0.08)"} />
            <XAxis dataKey="month" stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
            <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
            <Tooltip formatter={(v) => `${INR}${Math.round(v).toLocaleString('en-IN')}`} contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gI)" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gE)" />
            <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="url(#gS)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ===== RECENT TRANSACTIONS ===== */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-xl`}>
        <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}><span>📝</span> Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
            {recentTransactions.slice(0, 10).map((t, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.005] ${
                t.type === 'income'
                  ? (isDarkMode ? 'bg-green-500/10 border border-green-400/20' : 'bg-green-50 border border-green-200')
                  : (isDarkMode ? 'bg-red-500/10 border border-red-400/20' : 'bg-red-50 border border-red-200')
              }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg">{t.type === 'income' ? '📥' : '📤'}</span>
                  <div className="min-w-0">
                    <p className={`${theme.text} font-semibold text-sm truncate`}>{t.description}</p>
                    <p className={`${theme.textMuted} text-xs`}>{t.category} • {t.date ? new Date(t.date).toLocaleDateString('en-IN') : ''}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm flex-shrink-0 ml-2 ${t.type === 'income' ? theme.success : theme.error}`}>
                  {t.type === 'income' ? '+' : '-'}{INR}{t.amount?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        ) : <p className={`${theme.textSecondary} text-center py-8`}>No recent transactions</p>}
      </div>
    </div>
  )
}

export default Dashboard