import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Trophy, BookOpen, GraduationCap, Menu, X, Award } from 'lucide-react';

const PublicNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Live', path: '/', icon: Radio },
        { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { label: 'About', path: '/about', icon: BookOpen },
        { label: 'Council', path: '/student-council', icon: GraduationCap }
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/')}
                        className="cursor-pointer flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                Institute <span className="text-blue-500">Gathering</span>
                            </h1>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <motion.button
                                    key={item.path}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(item.path)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        isActive(item.path)
                                            ? 'bg-blue-500 text-white'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden border-t border-slate-200 dark:border-slate-700"
                        >
                            <div className="py-3 space-y-1">
                                {navItems.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.button
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => { navigate(item.path); setIsOpen(false); }}
                                            className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-colors flex items-center gap-3 ${
                                                isActive(item.path)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default PublicNavbar;
