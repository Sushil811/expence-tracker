/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true // Default to dark mode
  })

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')

    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Dark theme colors
      dark: {
        background: 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900',
        card: 'backdrop-blur-xl bg-white/10 border border-white/20',
        cardHover: 'hover:bg-white/15',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        border: 'border-white/10',
        input: 'bg-white/10 border-white/20 text-white placeholder-gray-400',
        inputFocus: 'focus:border-teal-400 focus:bg-white/15',
        button: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400',
        buttonSecondary: 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40',
        success: 'text-green-300',
        error: 'text-red-300',
        warning: 'text-yellow-300',
        info: 'text-blue-300',
        gradient: {
          income: 'from-green-300 via-emerald-300 to-cyan-300',
          expense: 'from-orange-300 via-red-300 to-pink-300',
          savings: 'from-blue-300 via-indigo-300 to-purple-300',
          primary: 'from-teal-300 via-cyan-300 to-blue-300'
        }
      },
      // Light theme colors
      light: {
        background: 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
        card: 'backdrop-blur-xl bg-white/90 border border-gray-200/50 shadow-lg',
        cardHover: 'hover:bg-white/95 hover:shadow-xl',
        text: 'text-gray-900',
        textSecondary: 'text-gray-700',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
        inputFocus: 'focus:border-blue-500 focus:bg-blue-50/50',
        button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400',
        buttonSecondary: 'bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400',
        success: 'text-green-600',
        error: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
        gradient: {
          income: 'from-green-500 via-emerald-500 to-teal-500',
          expense: 'from-orange-500 via-red-500 to-pink-500',
          savings: 'from-blue-500 via-indigo-500 to-purple-500',
          primary: 'from-blue-500 via-indigo-500 to-purple-500'
        }
      }
    }
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}