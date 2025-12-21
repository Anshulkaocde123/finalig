import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Trophy, Calendar, Users, Zap } from 'lucide-react';

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
                const [matchRes, deptRes, pointRes] = await Promise.all([
                    api.get('/matches'),
                    api.get('/departments'),
                    api.get('/leaderboard')
                ]);
                const matches = matchRes.data.data || [];
                const departments = deptRes.data.data || [];
                const leaderboard = pointRes.data.data || [];

                setStats({
                    total: matches.length,
                    live: matches.filter(m => m.status === 'LIVE').length,
                    completed: matches.filter(m => m.status === 'COMPLETED').length,
                    upcoming: matches.filter(m => m.status === 'SCHEDULED').length,
                    departments: departments.length
                });
                
                // Get 5 most recent or most impactful matches
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

        // Real-time updates
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
                return <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/40">🔴 LIVE</span>;
            case 'COMPLETED':
                return <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/40">✅ COMPLETED</span>;
            case 'SCHEDULED':
                return <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/40">📅 UPCOMING</span>;
            default:
                return <span className="px-3 py-1 bg-gray-500/20 text-gray-300 text-xs font-bold rounded-full">{status}</span>;
        }
    };

    const cards = [
        {
            title: 'Total Matches',
            value: stats.total,
            icon: <Trophy className="w-6 h-6" />,
            color: 'from-blue-600 to-blue-700',
            textColor: 'text-blue-100',
            action: '/admin/live',
            subtext: 'All matches'
        },
        {
            title: 'Live Now',
            value: stats.live,
            icon: <Activity className="w-6 h-6 animate-pulse" />,
            color: 'from-red-600 to-red-700',
            textColor: 'text-red-100',
            action: '/admin/live',
            subtext: 'In progress'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'from-green-600 to-green-700',
            textColor: 'text-green-100',
            action: '/admin/live',
            subtext: 'Finished'
        },
        {
            title: 'Upcoming',
            value: stats.upcoming,
            icon: <Calendar className="w-6 h-6" />,
            color: 'from-purple-600 to-purple-700',
            textColor: 'text-purple-100',
            action: '/admin/schedule',
            subtext: 'Scheduled'
        },
        {
            title: 'Departments',
            value: stats.departments,
            icon: <Users className="w-6 h-6" />,
            color: 'from-indigo-600 to-indigo-700',
            textColor: 'text-indigo-100',
            action: '/admin/departments',
            subtext: 'Participating'
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Admin Dashboard</h1>
                <p className="text-gray-400 font-medium">Manage matches, scores, and events</p>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                {cards.map((card, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(card.action)}
                        className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-2xl border border-white/10 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group relative overflow-hidden`}
                    >
                        {/* Background accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <span className={`${card.textColor}`}>{card.icon}</span>
                                <span className="text-2xl font-black text-white">{card.value}</span>
                            </div>
                            <div className={`text-xs font-bold ${card.textColor} uppercase tracking-wider mb-1`}>
                                {card.title}
                            </div>
                            <div className="text-[10px] text-white/70 font-medium">{card.subtext}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/schedule')}
                    className="p-6 bg-gradient-to-br from-blue-600/40 to-blue-700/40 rounded-2xl border border-blue-500/30 hover:border-blue-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">📅</div>
                    <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">Schedule</div>
                    <div className="text-[10px] text-blue-200/60 mt-1">Create Match</div>
                </button>

                <button
                    onClick={() => navigate('/admin/live')}
                    className="p-6 bg-gradient-to-br from-red-600/40 to-red-700/40 rounded-2xl border border-red-500/30 hover:border-red-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">🎮</div>
                    <div className="text-xs font-bold text-red-300 uppercase tracking-wider">Live Scoring</div>
                    <div className="text-[10px] text-red-200/60 mt-1">Update Scores</div>
                </button>

                <button
                    onClick={() => navigate('/admin/points')}
                    className="p-6 bg-gradient-to-br from-yellow-600/40 to-yellow-700/40 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">🎖️</div>
                    <div className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Award Points</div>
                    <div className="text-[10px] text-yellow-200/60 mt-1">Manual Awards</div>
                </button>

                <button
                    onClick={() => navigate('/admin/departments')}
                    className="p-6 bg-gradient-to-br from-purple-600/40 to-purple-700/40 rounded-2xl border border-purple-500/30 hover:border-purple-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                    <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">🏢</div>
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Departments</div>
                    <div className="text-[10px] text-purple-200/60 mt-1">Manage Teams</div>
                </button>
            </div>

            {/* Recent Matches */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Recent Matches
                    </h2>
                </div>

                <div className="divide-y divide-gray-700/30">
                    {recentMatches.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <p>No matches yet. Create your first match!</p>
                        </div>
                    ) : (
                        recentMatches.map((match, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(`/admin/live`)}
                                className="p-4 md:p-6 cursor-pointer hover:bg-gray-700/20 transition-colors group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                                {match.sport.replace('_', ' ')}
                                            </span>
                                            {getStatusBadge(match.status)}
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <span className="text-white font-bold text-sm md:text-base">{match.teamA?.shortCode}</span>
                                            <span className="text-gray-500">vs</span>
                                            <span className="text-white font-bold text-sm md:text-base">{match.teamB?.shortCode}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl md:text-3xl font-black text-indigo-400">
                                            {typeof match.scoreA === 'object' ? (match.scoreA?.runs || 0) : (match.scoreA || 0)} - {typeof match.scoreB === 'object' ? (match.scoreB?.runs || 0) : (match.scoreB || 0)}
                                        </div>
                                        <div className="text-[10px] md:text-xs text-gray-500 font-medium">
                                            {match.venue || 'TBD'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
