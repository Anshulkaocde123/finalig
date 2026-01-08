import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Calendar, Radio, Star, Trophy, Target, Settings, Users, GraduationCap, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Check authentication and role
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            const userStr = localStorage.getItem('adminUser');
            
            if (!token) {
                navigate('/auth/login');
                return;
            }
            
            // Check role
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.role === 'viewer' && !user.isTrusted) {
                        toast.error('Access denied. Only admins can access this area.');
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        navigate('/auth/login');
                        return;
                    }
                    setCurrentUser(user);
                } catch (e) {
                    console.error('Error parsing user data:', e);
                    navigate('/auth/login');
                }
            }
        };
        
        checkAuth();
    }, [navigate]);

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Departments', path: '/admin/departments', icon: Building2 },
        { name: 'Schedule Match', path: '/admin/schedule', icon: Calendar },
        { name: 'Live Console', path: '/admin/live', icon: Radio },
        { name: 'Award Points', path: '/admin/points', icon: Star },
        { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
        { name: 'Seasons', path: '/admin/seasons', icon: Target },
        { name: 'Scoring Presets', path: '/admin/scoring-presets', icon: Settings },
        { name: 'Admin Users', path: '/admin/users', icon: Users },
        { name: 'Student Council', path: '/admin/student-council', icon: GraduationCap },
        { name: 'About VNIT IG', path: '/admin/about', icon: BookOpen }
    ];

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            navigate('/login');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 flex flex-col shadow-lg bg-white border-r border-gray-200
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            VNIT Sports Admin
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Management Dashboard</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-semibold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 w-full">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">VNIT Sports Admin</h2>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 text-gray-900">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
