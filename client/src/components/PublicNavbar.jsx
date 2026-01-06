import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PublicNavbar = ({ isDarkMode, setIsDarkMode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Live', path: '/', icon: '🔴' },
        { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
        { label: 'About', path: '/about', icon: '📖' },
        { label: 'Council', path: '/student-council', icon: '🎓' },
        { label: 'Admin', path: '/login', icon: '🔐' }
    ];

    return (
        <nav className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-500 ${
            isDarkMode 
                ? 'bg-[#0a0a0f]/90 border-b border-white/5' 
                : 'bg-white/90 border-b border-gray-200/50'
        }`}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/')}
                        className="cursor-pointer flex items-center gap-3"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                            isDarkMode 
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
                                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                        }`}>
                            🏟️
                        </div>
                        <div>
                            <h1 className={`text-lg font-bold tracking-tight ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                VNIT <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Games</span>
                            </h1>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <motion.button
                                key={item.path}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(item.path)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive(item.path)
                                        ? isDarkMode
                                            ? 'bg-white/10 text-white'
                                            : 'bg-gray-900 text-white'
                                        : isDarkMode
                                            ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-1.5">{item.icon}</span>
                                {item.label}
                            </motion.button>
                        ))}
                        
                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`ml-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isDarkMode
                                    ? 'bg-white/10 text-yellow-400 hover:bg-white/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                            }`}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                                isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                            }`}
                        >
                            {isOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="py-4 space-y-2">
                                {navItems.map((item, idx) => (
                                    <motion.button
                                        key={item.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => { navigate(item.path); setIsOpen(false); }}
                                        className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                                            isActive(item.path)
                                                ? isDarkMode
                                                    ? 'bg-white/10 text-white'
                                                    : 'bg-gray-900 text-white'
                                                : isDarkMode
                                                    ? 'text-gray-400 hover:bg-white/5'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default PublicNavbar;
