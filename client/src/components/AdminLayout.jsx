import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Calendar, Radio, Star, Trophy, Target, Settings, Users, GraduationCap, BookOpen, LogOut, Menu, X, Sparkles } from 'lucide-react';
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
            
            console.log('🔐 AdminLayout Auth Check:', { hasToken: !!token, hasUser: !!userStr });
            
            if (!token) {
                console.log('❌ No token found, redirecting to login');
                navigate('/auth/login', { replace: true });
                return;
            }
            
            // Check role
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    console.log('👤 User role:', user.role, 'isTrusted:', user.isTrusted);
                    
                    // Allow super_admin, admin, and trusted users
                    if (user.role === 'viewer' && !user.isTrusted) {
                        console.log('🚫 Access denied for untrusted viewer');
                        toast.error('Access denied. Only admins can access this area.');
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        navigate('/auth/login', { replace: true });
                        return;
                    }
                    
                    console.log('✅ Auth check passed');
                    setCurrentUser(user);
                } catch (e) {
                    console.error('❌ Error parsing user data:', e);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    navigate('/auth/login', { replace: true });
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
        { name: 'Highlights', path: '/admin/highlights', icon: Sparkles },
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
            console.log('👋 Logging out...');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/auth/login', { replace: true });
            toast.success('Logged out successfully');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                            VNIT Sports
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin Dashboard</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 w-full">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">VNIT Sports</h2>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
