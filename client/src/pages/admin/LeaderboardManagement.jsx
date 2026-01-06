import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import socket from '../../socket';
import { toast } from 'react-hot-toast';
import { RotateCcw, Trash2, RefreshCw, Eye, Trophy, TrendingUp } from 'lucide-react';
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
    const getRankColor = (rank) => {
        const colors = ['from-yellow-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600'];
        return colors[rank - 1] || 'from-indigo-500 to-purple-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    Leaderboard Management
                </h1>
                <p className="text-gray-400 mt-1">View rankings, manage points, and control the leaderboard</p>
            </motion.div>

            {/* Admin Controls */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowConfirm({ isOpen: true, action: 'reset' })} disabled={actionLoading}
                    className="p-5 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl hover:border-red-500/50 transition-all group disabled:opacity-50">
                    <Trash2 className="w-7 h-7 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-bold text-red-300 uppercase tracking-wider">Reset All</div>
                    <div className="text-xs text-red-200/60 mt-1">Clear entire leaderboard</div>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleUndoLastAward} disabled={actionLoading === 'undo'}
                    className="p-5 backdrop-blur-xl bg-amber-500/10 border border-amber-500/30 rounded-2xl hover:border-amber-500/50 transition-all group disabled:opacity-50">
                    <RotateCcw className={`w-7 h-7 text-amber-400 mb-2 group-hover:scale-110 transition-transform ${actionLoading === 'undo' ? 'animate-spin' : ''}`} />
                    <div className="text-sm font-bold text-amber-300 uppercase tracking-wider">Undo Last</div>
                    <div className="text-xs text-amber-200/60 mt-1">Revert last award</div>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={fetchLeaderboard} disabled={actionLoading}
                    className="p-5 backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-2xl hover:border-blue-500/50 transition-all group disabled:opacity-50">
                    <RefreshCw className={`w-7 h-7 text-blue-400 mb-2 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} />
                    <div className="text-sm font-bold text-blue-300 uppercase tracking-wider">Refresh</div>
                    <div className="text-xs text-blue-200/60 mt-1">Reload data</div>
                </motion.button>
            </motion.div>

            {/* Current Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-indigo-400" />
                        Current Rankings
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">Total Departments: {leaderboard.length}</p>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-5xl mb-4">📊</div>
                        <p className="text-gray-400 text-lg">No departments on leaderboard yet</p>
                        <p className="text-gray-500 text-sm mt-2">Award points to departments to see them appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        <AnimatePresence>
                            {leaderboard.map((dept, idx) => (
                                <motion.div key={dept._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: idx * 0.05 }} className="p-4 md:p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        {/* Rank and Name */}
                                        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                                                className={`bg-gradient-to-br ${getRankColor(idx + 1)} rounded-full w-14 h-14 flex items-center justify-center font-black text-xl text-white shadow-lg`}>
                                                {getRankBadge(idx + 1)}
                                            </motion.div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Position {idx + 1}</div>
                                                <div className="text-xl font-black text-white">{dept.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">({dept.shortCode})</div>
                                            </div>
                                        </div>

                                        {/* Points Display */}
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Points</div>
                                            <div className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{dept.points}</div>
                                        </div>

                                        {/* Admin Actions */}
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDeleteDepartmentPoints(dept._id)} disabled={actionLoading === `delete-${dept._id}`}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg font-medium text-sm transition-all disabled:opacity-50">
                                            {actionLoading === `delete-${dept._id}` ? (
                                                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                            ) : (
                                                <>Clear</>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            <ConfirmModal isOpen={showConfirm.isOpen} title="Reset Leaderboard" message="This will permanently delete all department points. This action cannot be undone."
                confirmText={actionLoading === 'reset' ? 'Resetting...' : 'Reset All'} onConfirm={handleResetLeaderboard} onCancel={() => setShowConfirm({ isOpen: false, action: null })} variant="danger" />
        </div>
    );
};

export default LeaderboardManagement;
