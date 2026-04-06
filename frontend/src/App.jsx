import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Budget from './pages/Budget';
import Layout from './componensts/Layout';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        JSON.parse(userData); // Just test parsing
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Clear user state
    setUser(null);
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expense" element={<Expense />} />
          <Route path="goals" element={<Goals />} />
          <Route path="budget" element={<Budget />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;