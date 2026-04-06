const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('API Request:', url, config.method || 'GET');
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/user/me');
  }

  async updateProfile(userData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updatePassword(passwordData) {
    return this.request('/user/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Dashboard endpoints
  async getDashboardOverview(params = {}) {
    const query = new URLSearchParams();
    if (params.range) query.set('range', params.range);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const qs = query.toString();
    return this.request(`/dashboard/${qs ? '?' + qs : ''}`);
  }

  // Income endpoints
  async addIncome(incomeData) {
    return this.request('/income/add', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  }

  async getAllIncome() {
    return this.request('/income/get');
  }

  async updateIncome(id, incomeData) {
    return this.request(`/income/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(incomeData),
    });
  }

  async deleteIncome(id) {
    return this.request(`/income/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getIncomeOverview(range = 'monthly') {
    return this.request(`/income/overview?range=${range}`);
  }

  async downloadIncomeExcel() {
    const response = await fetch(`${this.baseURL}/income/downloadexcel`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
      },
    });
    return response.blob();
  }

  // Expense endpoints
  async addExpense(expenseData) {
    return this.request('/expense/add', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async getAllExpense() {
    return this.request('/expense/get');
  }

  async updateExpense(id, expenseData) {
    return this.request(`/expense/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id) {
    return this.request(`/expense/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getExpenseOverview(range = 'monthly') {
    return this.request(`/expense/overview?range=${range}`);
  }

  async downloadExpenseExcel() {
    const response = await fetch(`${this.baseURL}/expense/downloadexcel`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
      },
    });
    return response.blob();
  }

  // Goal endpoints
  async addGoal(goalData) {
    return this.request('/goal/add', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async getGoals() {
    return this.request('/goal/get');
  }

  async updateGoal(id, goalData) {
    return this.request(`/goal/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(id) {
    return this.request(`/goal/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async updateGoalProgress(id, amount) {
    return this.request(`/goal/progress/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  }

  // Budget endpoints
  async getBudgets() {
    return this.request('/budget/');
  }

  async saveBudget(budgetData) {
    return this.request('/budget/', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  async deleteBudget(id) {
    return this.request(`/budget/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();