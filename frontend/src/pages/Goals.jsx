import React, { useState, useEffect } from 'react';
import { apiService } from '../assets/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const { isDarkMode, colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const INR_SYMBOL = '₹';

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'General',
    description: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGoals();
      if (response.success) {
        setGoals(response.data);
      } else {
        throw new Error(response.message || 'Failed to load goals');
      }
    } catch (err) {
      console.error('Goals error:', err);
      toast.error(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...formData,
        targetAmount: Number(formData.targetAmount)
      };

      let response;
      if (editingGoal) {
        response = await apiService.updateGoal(editingGoal._id, goalData);
      } else {
        response = await apiService.addGoal(goalData);
      }

      if (response.success) {
        await fetchGoals();
        resetForm();
        setShowAddForm(false);
        toast.success(editingGoal ? 'Goal updated!' : 'Goal created!');
        setEditingGoal(null);
      } else {
        throw new Error(response.message || 'Failed to save goal');
      }
    } catch (err) {
      console.error('Save goal error:', err);
      toast.error(err.message || 'Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      deadline: new Date(goal.deadline).toISOString().split('T')[0],
      category: goal.category,
      description: goal.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (goalId) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete this goal?</span>
        <button onClick={async () => { toast.dismiss(t.id); try { const response = await apiService.deleteGoal(goalId); if (response.success) { await fetchGoals(); toast.success('Goal deleted!'); } } catch (err) { toast.error(err.message); }}} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold">Delete</button>
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm">Cancel</button>
      </div>
    ), { duration: 10000 });
  };

  const handleAddSavings = async (goalId) => {
    const amount = prompt('Enter amount to add to savings:');
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      if (amount !== null) toast.error('Please enter a valid positive number');
      return;
    }

    try {
      const response = await apiService.updateGoalProgress(goalId, Number(amount));
      if (response.success) {
        await fetchGoals();
        toast.success(`₹${Number(amount).toLocaleString('en-IN')} added to savings!`);
      } else {
        throw new Error(response.message || 'Failed to update goal progress');
      }
    } catch (err) {
      console.error('Update progress error:', err);
      toast.error(err.message || 'Failed to update goal progress');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      targetAmount: '',
      deadline: '',
      category: 'General',
      description: ''
    });
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setShowAddForm(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-400 border-t-teal-600"></div>
          <p className={`mt-6 text-xl ${theme.text} font-medium`}>Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`backdrop-blur-xl ${theme.card} rounded-3xl p-8 border ${theme.border} shadow-2xl ${theme.cardHover} transition-all`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-5xl font-black bg-gradient-to-r ${theme.gradient.primary} bg-clip-text text-transparent`}>
              🎯 Savings Goals
            </h1>
            <p className={`${theme.textSecondary} mt-2 text-lg`}>Set and track your financial goals</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-6 py-3 ${theme.button} text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95`}
          >
            {showAddForm ? 'Cancel' : '+ Add Goal'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-2xl`}>
          <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Goal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Target Amount</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  className={`w-full px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}
                  placeholder="50000"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}
                >
                  <option value="General">General</option>
                  <option value="Emergency">Emergency Fund</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Investment">Investment</option>
                  <option value="Car">Car Purchase</option>
                  <option value="House">House Down Payment</option>
                  <option value="Education">Education</option>
                  <option value="Retirement">Retirement</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme.text} mb-2`}>Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className={`w-full px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`w-full px-4 py-3 ${theme.input} rounded-lg border ${theme.border} focus:outline-none ${theme.inputFocus} transition-all`}
                rows="3"
                placeholder="Additional details about your goal..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className={`px-6 py-3 ${theme.button} text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95`}
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
              {editingGoal && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={`px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95`}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = goal.isCompleted || goal.currentAmount >= goal.targetAmount;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div key={goal._id} className={`backdrop-blur-xl ${theme.card} rounded-2xl p-6 border ${theme.border} shadow-2xl ${theme.cardHover} transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${theme.text} mb-1`}>{goal.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? (isDarkMode ? 'bg-green-500/30 text-green-300' : 'bg-green-100 text-green-800') : (isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800')}`}>
                      {goal.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className={`p-2 ${theme.buttonSecondary} rounded-lg hover:scale-110 transition-transform`}
                      title="Edit Goal"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className={`p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg hover:scale-110 transition-transform`}
                      title="Delete Goal"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>Progress</span>
                    <span className={theme.success}>
                      {INR_SYMBOL}{goal.currentAmount.toLocaleString('en-IN')} / {INR_SYMBOL}{goal.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className={theme.textMuted}>{progress.toFixed(1)}% complete</span>
                    <span className={daysLeft < 0 ? theme.error : theme.textMuted}>
                      {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                    </span>
                  </div>

                  {goal.description && (
                    <p className={`text-xs ${theme.textMuted} italic`}>{goal.description}</p>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => handleAddSavings(goal._id)}
                      className={`w-full mt-3 px-4 py-2 ${theme.button} text-white rounded-lg transition-all font-medium hover:scale-105 active:scale-95`}
                    >
                      + Add Savings
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={`col-span-full backdrop-blur-xl ${theme.card} rounded-2xl p-12 border ${theme.border} shadow-2xl text-center`}>
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className={`text-2xl font-bold ${theme.text} mb-2`}>No Goals Yet</h3>
            <p className={`${theme.textSecondary} mb-6`}>Start your savings journey by creating your first goal</p>
            <button
              onClick={() => setShowAddForm(true)}
              className={`px-8 py-4 ${theme.button} text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95`}
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-red-500/20 border-red-400/50' : 'bg-red-50 border-red-200'} rounded-2xl p-6 max-w-md shadow-2xl`}>
          <p className={`font-bold text-lg ${theme.error}`}>Error</p>
          <p className={`text-sm mt-2 ${theme.textSecondary}`}>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Goals;