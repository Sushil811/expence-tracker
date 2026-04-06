import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useTheme } from '../contexts/ThemeContext'

const Layout = ({onLogout, user}) => {
  const { isDarkMode, colors } = useTheme()
  const theme = isDarkMode ? colors.dark : colors.light

  return (
    <div className={theme.background}>
        <Navbar user={user} onLogout={onLogout} />
        
        <main className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] pt-4 sm:pt-6 pb-8 sm:pb-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            {/* Animated background blur elements */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
    </div>
  )
}

export default Layout;