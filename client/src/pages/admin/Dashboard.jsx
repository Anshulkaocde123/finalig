import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Trophy, Calendar, Users, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        upcoming: 0,
        departments: 0
    });
    const [recentMatches, setRecentMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchRes, deptRes] = await Promise.all([
                    api.get('/matches'),
                    api.get('/departments')
                ]);
                const matches = matchRes.data.data || [];
                const departments = deptRes.data.data || [];

                setStats({
                    total: matches.length,
                    completed: matches.filter(m => m.status === 'COMPLETED').length,
                    upcoming: matches.filter(m => m.status === 'SCHEDULED').length,
                    departments: departments.length
                });
                
                const recentMatches = matches
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setRecentMatches(recentMatches);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        socket.on('matchUpdate', () => fetchData());
        socket.on('matchCreated', () => fetchData());
        socket.on('matchDeleted', () => fetchData());

        return () => {
            socket.off('matchUpdate');
            socket.off('matchCreated');
            socket.off('matchDeleted');
        };
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">Completed</span>;
            case 'SCHEDULED':
                return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">Upcoming</span>;
            case 'CANCELLED':
                return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">Cancelled</span>;
            default:
                return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{status}</span>;
        }
    };

    const cards = [
        { title: 'Total', value: stats.total, icon: <Trophy className="w-5 h-5" />, action: '/admin/live' },
        { title: 'Completed', value: stats.completed, icon: <TrendingUp className="w-5 h-5" />, action: '/admin/live' },
        { title: 'Upcoming', value: stats.upcoming, icon: <Calendar className="w-5 h-5" />, action: '/admin/schedule' },
        { title: 'Departments', value: stats.departments, icon: <Users className="w-5 h-5" />, action: '/admin/departments' }
    ];

    const quickActions = [
        { icon: '📅', title: 'Schedule Match', path: '/admin/schedule' },
        { icon: '🏆', title: 'Match Manager', path: '/admin/live' },
        { icon: '✨', title: 'Highlights', path: '/admin/highlights' },
        { icon: '🎖️', title: 'Award Points', path: '/admin/points' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 mx-auto mb-4 animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard className="w-6 h-6 text-blue-500" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 ml-8">Manage matches and events</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {cards.map((card, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(card.action)}
                            className="relative bg-white dark:bg-slate-800 rounded-xl p-4 text-left border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                                    {card.icon}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.title}</div>
                        </button>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">{action.icon}</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{action.title}</div>
                        </button>
                    ))}
                </div>

                {/* Recent Matches */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            Recent Matches
                        </h2>
                        <button 
                            onClick={() => navigate('/admin/live')}
                            className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {recentMatches.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-3xl mb-2">🏟️</div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No matches yet</p>
                            <button
                                onClick={() => navigate('/admin/schedule')}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Create Match
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {recentMatches.map((match, idx) => (
                                <div
                                    key={match._id || idx}
                                    onClick={() => navigate(`/admin/live`)}
                                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                                    {match.sport?.replace('_', ' ')}
                                                </span>
                                                {getStatusBadge(match.status)}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                                                <span className="font-medium">{match.teamA?.shortCode || 'TBD'}</span>
                                                <span className="text-slate-400">vs</span>
                                                <span className="font-medium">{match.teamB?.shortCode || 'TBD'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                                {match.scoreA || '-'} vs {match.scoreB || '-'}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {match.venue || 'TBD'}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
