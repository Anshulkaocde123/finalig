import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Trophy, Calendar, Users, Zap, ArrowRight, Sparkles } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        live: 0,
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
                    live: matches.filter(m => m.status === 'LIVE').length,
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
            case 'LIVE':
                return (
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border-2 border-red-300 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        LIVE
                    </span>
                );
            case 'COMPLETED':
                return <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border-2 border-green-300 shadow-sm">✓ COMPLETED</span>;
            case 'SCHEDULED':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border-2 border-blue-300 shadow-sm">📅 UPCOMING</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border-2 border-gray-300">{status}</span>;
        }
    };

    const cards = [
        {
            title: 'Total Matches',
            value: stats.total,
            icon: <Trophy className="w-7 h-7 text-white" />,
            gradient: 'from-indigo-600 to-indigo-700',
            action: '/admin/live',
            subtext: 'All matches'
        },
        {
            title: 'Live Now',
            value: stats.live,
            icon: <Activity className="w-7 h-7 text-white" />,
            gradient: 'from-red-500 to-rose-600',
            action: '/admin/live',
            subtext: 'In progress',
            pulse: true
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: <TrendingUp className="w-7 h-7 text-white" />,
            gradient: 'from-emerald-500 to-green-600',
            action: '/admin/live',
            subtext: 'Finished'
        },
        {
            title: 'Upcoming',
            value: stats.upcoming,
            icon: <Calendar className="w-7 h-7 text-white" />,
            gradient: 'from-purple-500 to-violet-600',
            action: '/admin/schedule',
            subtext: 'Scheduled'
        },
        {
            title: 'Departments',
            value: stats.departments,
            icon: <Users className="w-7 h-7 text-white" />,
            gradient: 'from-blue-500 to-cyan-600',
            action: '/admin/departments',
            subtext: 'Participating'
        }
    ];

    const quickActions = [
        { icon: '📅', title: 'Schedule', subtitle: 'Create Match', path: '/admin/schedule', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
        { icon: '🎮', title: 'Live Scoring', subtitle: 'Update Scores', path: '/admin/live', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
        { icon: '🎖️', title: 'Award Points', subtitle: 'Manual Awards', path: '/admin/points', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
        { icon: '🏢', title: 'Departments', subtitle: 'Manage Teams', path: '/admin/departments', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4 animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                            Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600 font-medium ml-11">Manage matches, scores, and events</p>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-10">
                    {cards.map((card, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(card.action)}
                            className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-left overflow-hidden shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20`}
                        >
                            {card.pulse && (
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl animate-pulse"></div>
                            )}

                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 bg-white/20 rounded-xl shadow-sm">
                                        {card.icon}
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-1">
                                    {card.value}
                                </div>
                                <div className="text-xs font-bold text-white/90 uppercase tracking-wider">
                                    {card.title}
                                </div>
                                <div className="text-[10px] text-white/70 font-medium mt-0.5">{card.subtext}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className={`p-6 ${action.bg} rounded-2xl border-2 ${action.border} hover:shadow-lg shadow-md`}
                        >
                            <div className="text-4xl mb-3">
                                {action.icon}
                            </div>
                            <div className={`text-sm font-bold ${action.text} uppercase tracking-wider`}>{action.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{action.subtitle}</div>
                        </button>
                    ))}
                </div>

                {/* Recent Matches */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-xl border-2 border-yellow-300">
                                <Zap className="w-5 h-5 text-yellow-700" />
                            </div>
                            Recent Matches
                        </h2>
                        <button 
                            onClick={() => navigate('/admin/live')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {recentMatches.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-5xl mb-4">🏟️</div>
                            <p className="text-gray-500">No matches yet. Create your first match!</p>
                            <button
                                onClick={() => navigate('/admin/schedule')}
                                className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg shadow-md"
                            >
                                Create Match
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y-2 divide-gray-100">
                            {recentMatches.map((match, idx) => (
                                <div
                                    key={match._id || idx}
                                    onClick={() => navigate(`/admin/live`)}
                                    className="p-5 cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                    {match.sport?.replace('_', ' ')}
                                                </span>
                                                {getStatusBadge(match.status)}
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-900">
                                                <span className="font-bold">{match.teamA?.shortCode || 'TBD'}</span>
                                                <span className="text-gray-400 text-sm">vs</span>
                                                <span className="font-bold">{match.teamB?.shortCode || 'TBD'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                {typeof match.scoreA === 'object' ? (match.scoreA?.runs || 0) : (match.scoreA || 0)} - {typeof match.scoreB === 'object' ? (match.scoreB?.runs || 0) : (match.scoreB || 0)}
                                            </div>
                                            <div className="text-xs text-gray-600 font-medium mt-1">
                                                {match.venue || 'TBD'}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
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
