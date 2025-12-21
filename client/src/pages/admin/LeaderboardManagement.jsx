import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { toast } from 'react-hot-toast';
import { RotateCcw, Trash2, RefreshCw, Eye } from 'lucide-react';

const LeaderboardManagement = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showConfirm, setShowConfirm] = useState({ isOpen: false, action: null });

    useEffect(() => {
        fetchLeaderboard();

        // Real-time updates
        socket.on('pointsAwarded', () => fetchLeaderboard());
        socket.on('leaderboardReset', () => fetchLeaderboard());

        return () => {
            socket.off('pointsAwarded');
            socket.off('leaderboardReset');
        };
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaderboard');
            const sorted = (response.data.data || []).sort((a, b) => b.points - a.points);
            setLeaderboard(sorted);
        } catch (err) {
            console.error('Failed to fetch leaderboard', err);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const handleResetLeaderboard = async () => {
        setActionLoading('reset');
        try {
            await api.post('/leaderboard/reset');
            setLeaderboard([]);
            setShowConfirm({ isOpen: false, action: null });
            toast.success('Leaderboard reset successfully!');
        } catch (err) {
            console.error('Failed to reset leaderboard', err);
            toast.error('Failed to reset leaderboard');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUndoLastAward = async () => {
        setActionLoading('undo');
        try {
            await api.post('/leaderboard/undo-last');
            await fetchLeaderboard();
            toast.success('Last point award undone!');
        } catch (err) {
            console.error('Failed to undo', err);
            toast.error(err.response?.data?.message || 'Failed to undo last award');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteDepartmentPoints = async (deptId) => {
        setActionLoading(`delete-${deptId}`);
        try {
            await api.delete(`/leaderboard/department/${deptId}`);
            await fetchLeaderboard();
            toast.success('Department points cleared!');
        } catch (err) {
            console.error('Failed to delete points', err);
            toast.error('Failed to clear points');
        } finally {
            setActionLoading(null);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}️⃣`;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'from-yellow-400 to-yellow-600';
        if (rank === 2) return 'from-slate-300 to-slate-500';
        if (rank === 3) return 'from-orange-400 to-orange-600';
        return 'from-indigo-500 to-indigo-700';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Leaderboard Management</h1>
                <p className="text-gray-400 font-medium">View rankings, manage points, and control the leaderboard</p>
            </div>

            {/* Admin Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => setShowConfirm({ isOpen: true, action: 'reset' })}
                    disabled={actionLoading}
                    className="p-4 bg-gradient-to-br from-red-600/40 to-red-700/40 rounded-2xl border border-red-500/30 hover:border-red-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group disabled:opacity-50"
                >
                    <Trash2 className="w-6 h-6 text-red-300 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-red-300 uppercase tracking-wider">Reset All</div>
                    <div className="text-[10px] text-red-200/60 mt-1">Clear entire leaderboard</div>
                </button>

                <button
                    onClick={handleUndoLastAward}
                    disabled={actionLoading === 'undo'}
                    className="p-4 bg-gradient-to-br from-amber-600/40 to-amber-700/40 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group disabled:opacity-50"
                >
                    <RotateCcw className="w-6 h-6 text-amber-300 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-amber-300 uppercase tracking-wider">Undo Last</div>
                    <div className="text-[10px] text-amber-200/60 mt-1">Revert last award</div>
                </button>

                <button
                    onClick={fetchLeaderboard}
                    disabled={actionLoading}
                    className="p-4 bg-gradient-to-br from-blue-600/40 to-blue-700/40 rounded-2xl border border-blue-500/30 hover:border-blue-500/60 hover:shadow-2xl transition-all duration-300 hover:scale-105 group disabled:opacity-50"
                >
                    <RefreshCw className={`w-6 h-6 text-blue-300 mb-2 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} />
                    <div className="text-sm font-bold text-blue-300 uppercase tracking-wider">Refresh</div>
                    <div className="text-[10px] text-blue-200/60 mt-1">Reload data</div>
                </button>
            </div>

            {/* Current Leaderboard */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Eye className="w-6 h-6 text-indigo-400" />
                        Current Rankings
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                        Total Departments: {leaderboard.length}
                    </p>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-5xl mb-4">📊</div>
                        <p className="text-gray-400 text-lg">No departments on leaderboard yet</p>
                        <p className="text-gray-500 text-sm mt-2">Award points to departments to see them appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700/30">
                        {leaderboard.map((dept, idx) => (
                            <div
                                key={dept._id}
                                className={`p-4 md:p-6 hover:bg-gray-700/20 transition-colors`}
                            >
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    {/* Rank and Name */}
                                    <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                                        <div className={`bg-gradient-to-br ${getRankColor(idx + 1)} rounded-full w-12 h-12 flex items-center justify-center font-black text-lg text-white shadow-lg`}>
                                            {getRankBadge(idx + 1)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Position {idx + 1}</div>
                                            <div className="text-xl font-black text-white">{dept.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">({dept.shortCode})</div>
                                        </div>
                                    </div>

                                    {/* Points Display */}
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 font-medium">Total Points</div>
                                        <div className="text-4xl font-black text-indigo-400">{dept.points}</div>
                                    </div>

                                    {/* Admin Actions */}
                                    <button
                                        onClick={() => handleDeleteDepartmentPoints(dept._id)}
                                        disabled={actionLoading === `delete-${dept._id}`}
                                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg font-medium text-xs transition-all active:scale-95 disabled:opacity-50"
                                        title="Clear this department's points"
                                    >
                                        {actionLoading === `delete-${dept._id}` ? (
                                            <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin inline-block"></span>
                                        ) : (
                                            '🗑️ Clear'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Statistics */}
            {leaderboard.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-700/20 rounded-2xl border border-indigo-500/30 p-6">
                        <div className="text-sm text-indigo-300 font-bold uppercase tracking-wider mb-1">Leader</div>
                        <div className="text-2xl font-black text-white">{leaderboard[0]?.name}</div>
                        <div className="text-3xl font-black text-indigo-400 mt-2">{leaderboard[0]?.points} pts</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-2xl border border-purple-500/30 p-6">
                        <div className="text-sm text-purple-300 font-bold uppercase tracking-wider mb-1">Total Points</div>
                        <div className="text-3xl font-black text-purple-300">
                            {leaderboard.reduce((sum, dept) => sum + dept.points, 0)}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 rounded-2xl border border-emerald-500/30 p-6">
                        <div className="text-sm text-emerald-300 font-bold uppercase tracking-wider mb-1">Departments</div>
                        <div className="text-3xl font-black text-emerald-300">{leaderboard.length}</div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {showConfirm.action === 'reset' ? '⚠️ Reset Leaderboard?' : 'Confirm Action'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {showConfirm.action === 'reset' 
                                ? 'This will permanently clear all points from the leaderboard. This action cannot be undone.'
                                : 'Are you sure?'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm({ isOpen: false, action: null })}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (showConfirm.action === 'reset') {
                                        handleResetLeaderboard();
                                    }
                                }}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardManagement;
