import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { toast } from 'react-hot-toast';
import { RotateCcw, Trash2, RefreshCw, Trophy, TrendingUp } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const LeaderboardManagement = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [showConfirm, setShowConfirm] = useState({ isOpen: false, action: null });

    useEffect(() => {
        fetchLeaderboard();
        socket.on('pointsAwarded', () => fetchLeaderboard());
        socket.on('leaderboardReset', () => fetchLeaderboard());
        return () => { socket.off('pointsAwarded'); socket.off('leaderboardReset'); };
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaderboard');
            const sorted = (response.data.data || []).sort((a, b) => b.points - a.points);
            setLeaderboard(sorted);
        } catch (err) { toast.error('Failed to load leaderboard'); }
        finally { setLoading(false); }
    };

    const handleResetLeaderboard = async () => {
        setActionLoading('reset');
        try {
            await api.post('/leaderboard/reset');
            setLeaderboard([]);
            setShowConfirm({ isOpen: false, action: null });
            toast.success('Leaderboard reset successfully!');
        } catch (err) { toast.error('Failed to reset leaderboard'); }
        finally { setActionLoading(null); }
    };

    const handleUndoLastAward = async () => {
        setActionLoading('undo');
        try {
            await api.post('/leaderboard/undo-last');
            await fetchLeaderboard();
            toast.success('Last point award undone!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to undo last award'); }
        finally { setActionLoading(null); }
    };

    const handleDeleteDepartmentPoints = async (deptId) => {
        setActionLoading(`delete-${deptId}`);
        try {
            await api.delete(`/leaderboard/department/${deptId}`);
            await fetchLeaderboard();
            toast.success('Department points cleared!');
        } catch (err) { toast.error('Failed to clear points'); }
        finally { setActionLoading(null); }
    };

    const getRankBadge = (rank) => ['🥇', '🥈', '🥉'][rank - 1] || `#${rank}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-blue-500" />
                    Leaderboard Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">View rankings, manage points, and control the leaderboard</p>
            </div>

            {/* Admin Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button onClick={() => setShowConfirm({ isOpen: true, action: 'reset' })} disabled={actionLoading}
                    className="p-5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded-xl hover:border-red-400 dark:hover:border-red-700 transition-all group disabled:opacity-50">
                    <Trash2 className="w-7 h-7 text-red-500 mb-2" />
                    <div className="text-sm font-semibold text-red-600 dark:text-red-400">Reset All</div>
                    <div className="text-sm text-red-400 dark:text-red-300/60 mt-1">Clear entire leaderboard</div>
                </button>

                <button onClick={handleUndoLastAward} disabled={actionLoading === 'undo'}
                    className="p-5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 rounded-xl hover:border-amber-400 dark:hover:border-amber-700 transition-all group disabled:opacity-50">
                    <RotateCcw className={`w-7 h-7 text-amber-500 mb-2 ${actionLoading === 'undo' ? 'animate-spin' : ''}`} />
                    <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">Undo Last</div>
                    <div className="text-sm text-amber-400 dark:text-amber-300/60 mt-1">Revert last award</div>
                </button>

                <button onClick={fetchLeaderboard} disabled={actionLoading}
                    className="p-5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 rounded-xl hover:border-blue-400 dark:hover:border-blue-700 transition-all group disabled:opacity-50">
                    <RefreshCw className={`w-7 h-7 text-blue-500 mb-2 ${loading ? 'animate-spin' : ''}`} />
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">Refresh</div>
                    <div className="text-sm text-blue-400 dark:text-blue-300/60 mt-1">Reload data</div>
                </button>
            </div>

            {/* Current Leaderboard */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        Current Rankings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Total Departments: {leaderboard.length}</p>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-5xl mb-4">📊</div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">No departments on leaderboard yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Award points to departments to see them appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {leaderboard.map((dept, idx) => (
                            <div key={dept._id} className="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    {/* Rank and Name */}
                                    <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                                        <div className={`${idx < 3 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'} rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl text-white`}>
                                            {getRankBadge(idx + 1)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Position {idx + 1}</div>
                                            <div className="text-xl font-bold text-slate-800 dark:text-white">{dept.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">({dept.shortCode})</div>
                                        </div>
                                    </div>

                                    {/* Points Display */}
                                    <div className="text-right">
                                        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Points</div>
                                        <div className="text-4xl font-bold text-blue-500">{dept.points}</div>
                                    </div>

                                    {/* Admin Actions */}
                                    <button onClick={() => handleDeleteDepartmentPoints(dept._id)} disabled={actionLoading === `delete-${dept._id}`}
                                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm transition-all disabled:opacity-50">
                                        {actionLoading === `delete-${dept._id}` ? (
                                            <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                        ) : (
                                            <>Clear</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal isOpen={showConfirm.isOpen} title="Reset Leaderboard" message="This will permanently delete all department points. This action cannot be undone."
                confirmText={actionLoading === 'reset' ? 'Resetting...' : 'Reset All'} onConfirm={handleResetLeaderboard} onCancel={() => setShowConfirm({ isOpen: false, action: null })} variant="danger" />
        </div>
    );
};

export default LeaderboardManagement;
