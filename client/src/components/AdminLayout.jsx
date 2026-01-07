import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ isDarkMode, setIsDarkMode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // Auto-close sidebar on mobile
            if (mobile) {
                setIsSidebarOpen(false);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const navItems = [
        { name: '📊 Dashboard', path: '/admin/dashboard' },
        { name: '🏢 Departments', path: '/admin/departments' },
        { name: '📅 Schedule Match', path: '/admin/schedule' },
        { name: '📢 Live Console', path: '/admin/live' },
        { name: '⭐ Award Points', path: '/admin/points' },
        { name: '🏆 Leaderboard', path: '/admin/leaderboard' },
        { name: '🎯 Seasons', path: '/admin/seasons' },
        { name: '⚙️ Scoring Presets', path: '/admin/scoring-presets' },
        { name: '👥 Admin Users', path: '/admin/users' },
        { name: '🎓 Student Council', path: '/admin/student-council' },
        { name: '📖 About VNIT IG', path: '/admin/about' }
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            navigate('/login');
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
            {/* Mobile Menu Button */}
            {isMobile && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg lg:hidden ${
                        isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
                    }`}
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.button>
            )}

            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {(isSidebarOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? { x: -280 } : false}
                        animate={{ x: 0 }}
                        exit={isMobile ? { x: -280 } : { width: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                        className={`${
                            isMobile ? 'fixed inset-y-0 left-0 w-64 z-40' : 'relative'
                        } ${
                            !isMobile && !isSidebarOpen ? 'w-0' : 'w-64'
                        } flex flex-col shadow-lg ${
                            isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-gray-200'
                        } transition-all duration-300`}
                    >
                        <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'} flex items-center justify-between`}>
                            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                VNIT Sports Admin
                            </h1>
                            {!isMobile && (
                        <nav className="p-3 sm:p-4 space-y-1 flex-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => isMobile && setIsSidebarOpen(false)}
                                        className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base ${isActive
                                            ? isDarkMode
                                                ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                                                : 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                            : isDarkMode
                                                ? 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                                                : 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                    : isDarkMode
                                        ? 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
        {/* Dark Mode Toggle & Logout */}
                        <div className={`p-3 sm:p-4 space-y-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-sm sm:text-base ${isDarkMode
                                    ? 'bg-slate-800 hover:bg-slate-700 text-yellow-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base ${isDarkMode
                                    ? 'text-red-400 hover:bg-red-600/20'
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
 ${isMobile ? 'w-full' : ''}`}>
                <div className={`p-4 sm:p-6 md:p-8 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'} ${isMobile ? 'pt-16' : '
            {!isMobile && !isSidebarOpen && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setIsSidebarOpen(true)}
                    className={`fixed top-4 left-4 z-40 p-2 rounded-lg shadow-lg ${
                        isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <ChevronRight className="w-6 h-6" />
                </motion.button>
            )}v>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
                <div className={`p-8 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
