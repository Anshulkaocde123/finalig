import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const AdminLayout = ({ isDarkMode, setIsDarkMode }) => {
    const location = useLocation();
    const navigate = useNavigate();

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
        <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
            {/* Sidebar */}
            <aside className={`w-64 z-10 flex flex-col shadow-lg ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-gray-200'}`}>
                <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        VNIT Sports Admin
                    </h1>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
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
                </nav>

                {/* Dark Mode Toggle & Logout */}
                <div className={`p-4 space-y-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-yellow-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${isDarkMode
                            ? 'text-red-400 hover:bg-red-600/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
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
