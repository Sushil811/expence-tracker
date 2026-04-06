import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = () => {
  const { isDarkMode, colors } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // Define handleLogout once using useCallback for stability
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (!storedUser) {
        // If no user is found in storage, treat as logged out
        handleLogout();
      }
    } catch (e) {
      console.error("Failed to parse user from storage", e);
      handleLogout();
    }
  }, [handleLogout]);

  return (
    <div className={theme.background}>
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="min-h-[calc(100vh-80px)] pt-6 pb-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
    </div>
  );
};

export default MainLayout;