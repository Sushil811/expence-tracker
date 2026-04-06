import React from 'react'
import img1 from '../assets/moneymap_logo.png'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = ({user:propUser, onLogout}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isDarkMode, toggleTheme } = useTheme()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    const isActive = (path) => location.pathname === path

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/income', label: 'Income', icon: '📥' },
        { path: '/expense', label: 'Expense', icon: '📤' },
        { path: '/goals', label: 'Goals', icon: '🎯' },
        { path: '/budget', label: 'Budget', icon: '💳' },
    ]
    
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3 md:px-8">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div onClick={()=>navigate('/')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                    <img src={img1} alt="logo" className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg" />
                    <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">MoneyMap</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navLinks.map(({path, label}) => (
                        <button key={path} onClick={() => navigate(path)}
                            className={`px-3 py-2 rounded-lg transition-all font-medium text-sm ${isActive(path) ? 'bg-teal-500 text-white shadow-md' : 'text-white/90 hover:bg-teal-500/50'}`}>
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme}
                        className="p-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 transition-all border border-teal-400/30 text-sm"
                        title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    
                    {/* Desktop Profile */}
                    <div onClick={() => navigate('/profile')} className="hidden lg:flex items-center gap-2 bg-teal-500 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-400 transition-all">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-teal-700 text-sm">
                            {propUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden xl:block">
                            <p className="text-white font-medium text-sm leading-tight">{propUser?.name || 'User'}</p>
                            <p className="text-teal-100 text-xs leading-tight">{propUser?.email || ''}</p>
                        </div>
                    </div>
                    
                    {/* Desktop Logout */}
                    <button onClick={onLogout}
                        className="hidden lg:block bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all font-medium text-sm">
                        Logout
                    </button>

                    {/* Mobile Hamburger */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-teal-500/30 transition-all">
                        <span className={`block w-5 h-0.5 bg-white rounded transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-white rounded transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-white rounded transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <nav className="lg:hidden mt-3 space-y-1 border-t border-teal-500/50 pt-3 pb-1">
                    {navLinks.map(({path, label, icon}) => (
                        <button key={path}
                            onClick={() => { navigate(path); setIsMenuOpen(false); }}
                            className={`block w-full text-left text-white px-3 py-2.5 rounded-lg transition-all text-sm ${isActive(path) ? 'bg-teal-500 font-bold' : 'hover:bg-teal-500/50'}`}>
                            {icon} {label}
                        </button>
                    ))}
                    <button
                        onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                        className={`block w-full text-left text-white px-3 py-2.5 rounded-lg transition-all text-sm ${isActive('/profile') ? 'bg-teal-500 font-bold' : 'hover:bg-teal-500/50'}`}>
                        👤 Profile
                    </button>
                    <div className="pt-2 border-t border-teal-500/30">
                        <button onClick={() => { onLogout(); setIsMenuOpen(false); }}
                            className="block w-full text-left text-red-200 hover:bg-red-500/30 px-3 py-2.5 rounded-lg transition-all text-sm font-medium">
                            🚪 Logout
                        </button>
                    </div>
                </nav>
            )}
        </div>
    </header>
  )
}

export default Navbar