import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const PublicNavbar = ({ isDarkMode, setIsDarkMode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: '🔴 Live Scores', path: '/' },
        { label: '🏆 Leaderboard', path: '/leaderboard' },
        { label: '📖 About VNIT IG', path: '/about' },
        { label: '🎓 Student Council', path: '/student-council' },
        { label: '🔐 Admin Login', path: '/login' }
    ];

    return (
        <nav className={`border-b shadow-lg sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
            isDarkMode 
                ? 'bg-gradient-to-r from-vnit-dark via-dark-surface to-vnit-dark border-dark-border' 
                : 'bg-gradient-to-r from-light-bg via-light-surface to-light-bg border-light-border'
        }`}>
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* Logo */}
                    <div 
                        onClick={() => navigate('/')}
                        className="cursor-pointer flex items-center gap-2"
                    >
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-vnit-primary to-vnit-secondary rounded-xl shadow-lg">
                            <span className="text-lg md:text-2xl font-black text-white">🏟️</span>
                        </div>
                        <div>
                            <h1 className={`text-lg md:text-2xl font-black tracking-tight transition-colors ${
                                isDarkMode ? 'text-vnit-accent' : 'text-vnit-primary'
                            }`}>
                                VNIT GAMES
                            </h1>
                            <div className={`text-[10px] md:text-xs font-bold transition-colors ${
                                isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                            }`}>
                                Inter-Department Championship
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border ${
                                    isActive(item.path)
                                        ? isDarkMode
                                            ? 'bg-vnit-primary text-white border-vnit-secondary shadow-lg'
                                            : 'bg-vnit-primary text-white border-vnit-accent shadow-lg'
                                        : isDarkMode
                                            ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface border-dark-border'
                                            : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface border-light-border'
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                        
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`ml-4 p-2 rounded-lg border transition-all duration-300 ${
                                isDarkMode
                                    ? 'bg-dark-surface border-dark-border text-vnit-accent hover:bg-vnit-primary/20'
                                    : 'bg-light-surface border-light-border text-vnit-primary hover:bg-vnit-primary/10'
                            }`}
                            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>

                    {/* Mobile Menu Button & Theme Toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-lg border transition-all duration-300 ${
                                isDarkMode
                                    ? 'bg-dark-surface border-dark-border text-vnit-accent'
                                    : 'bg-light-surface border-light-border text-vnit-primary'
                            }`}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'hover:bg-dark-surface' : 'hover:bg-light-surface'
                            }`}
                        >
                            {isOpen ? (
                                <X className={`w-6 h-6 ${isDarkMode ? 'text-dark-text' : 'text-light-text'}`} />
                            ) : (
                                <Menu className={`w-6 h-6 ${isDarkMode ? 'text-dark-text' : 'text-light-text'}`} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className={`md:hidden border-t transition-colors ${
                        isDarkMode ? 'border-dark-border bg-dark-surface/50' : 'border-light-border bg-light-surface/50'
                    }`}>
                        <div className="py-3 px-2 space-y-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border ${
                                        isActive(item.path)
                                            ? isDarkMode
                                                ? 'bg-vnit-primary text-white border-vnit-secondary'
                                                : 'bg-vnit-primary text-white border-vnit-accent'
                                            : isDarkMode
                                                ? 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface/80 border-dark-border'
                                                : 'text-light-text-secondary hover:text-light-text hover:bg-light-surface border-light-border'
                                    }`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default PublicNavbar;
