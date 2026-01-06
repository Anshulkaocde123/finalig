import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import socket from '../../socket';
import ScoringControls from '../../components/ScoringControls';
import ConfirmModal from '../../components/ConfirmModal';
import CricketScoreboard from '../../components/CricketScoreboard';
import ProfessionalCricketScorecard from '../../components/ProfessionalCricketScorecard';
import CricketSquadManager from '../../components/CricketSquadManager';
import FootballScoreboard from '../../components/FootballScoreboard';
import EnhancedFoulSystem from '../../components/EnhancedFoulSystem';
import PenaltyShootout from '../../components/PenaltyShootout';
import { toast } from 'react-hot-toast';
import { RefreshCw, Play, Square, Trash2, X, Radio, Users } from 'lucide-react';

const LiveConsole = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [squadManagerMatch, setSquadManagerMatch] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, matchId: null, action: null });
    const [actionLoading, setActionLoading] = useState(null);

    const fetchMatches = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/matches');
            setMatches(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (err) {
            console.error('Failed to fetch matches', err);
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMatches();
        socket.on('matchUpdate', (updatedMatch) => {
            console.log('🔄 Socket matchUpdate received:', {
                matchId: updatedMatch._id,
                striker: updatedMatch.currentBatsmen?.striker?.playerName,
                nonStriker: updatedMatch.currentBatsmen?.nonStriker?.playerName
            });
            setMatches(prev => prev.map(m => m._id === updatedMatch._id ? updatedMatch : m));
            setSelectedMatch(prev => prev?._id === updatedMatch._id ? updatedMatch : prev);
        });
        socket.on('matchDeleted', ({ matchId }) => {
            setMatches(prev => prev.filter(m => m._id !== matchId));
            if (selectedMatch?._id === matchId) setSelectedMatch(null);
        });
        return () => { socket.off('matchUpdate'); socket.off('matchDeleted'); };
    }, [fetchMatches, selectedMatch]);

    const handleDelete = async () => {
        const matchId = confirmModal.matchId;
        setConfirmModal({ isOpen: false, matchId: null, action: null });
        setActionLoading(matchId);
        try {
            await api.delete(`/matches/${matchId}`);
            setMatches(matches.filter(m => m._id !== matchId));
            toast.success('Match deleted successfully');
        } catch (err) { toast.error('Failed to delete match'); }
        finally { setActionLoading(null); }
    };

    const handleGoLive = async (match) => {
        setActionLoading(match._id + '-live');
        try {
            await api.put(`/matches/${match.sport.toLowerCase()}/update`, { matchId: match._id, status: 'LIVE' });
            toast.success('Match is now LIVE!');
        } catch (err) { toast.error('Failed to update status'); }
        finally { setActionLoading(null); }
    };

    const handleEndMatch = async (match) => {
        setActionLoading(match._id + '-end');
        try {
            await api.put(`/matches/${match.sport.toLowerCase()}/update`, { matchId: match._id, status: 'COMPLETED' });
            toast.success('Match completed!');
        } catch (err) { toast.error('Failed to end match'); }
        finally { setActionLoading(null); }
    };

    const handleScoreUpdate = async (updatePayload) => {
        if (!selectedMatch) return;
        try {
            console.log('📤 Sending score update:', { sport: selectedMatch.sport, matchId: selectedMatch._id, payload: updatePayload });
            const response = await api.put(`/matches/${selectedMatch.sport.toLowerCase()}/update`, { matchId: selectedMatch._id, ...updatePayload });
            console.log('✅ Score update response:', response.data);
            
            // Immediately update selected match with the response data
            if (response.data?.data) {
                setSelectedMatch(response.data.data);
            }
            
            toast.success('Score updated!');
        } catch (err) {
            console.error('❌ Score update error:', err);
            console.error('❌ Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            toast.error(err.response?.data?.message || 'Failed to update score');
        }
    };

    const handleTimerAction = async (timerData) => {
        if (!selectedMatch) return;
        try {
            await api.put(`/matches/${selectedMatch.sport.toLowerCase()}/update`, { matchId: selectedMatch._id, timerAction: timerData.action, timerData });
            toast.success(`Timer ${timerData.action}`);
        } catch (err) { toast.error('Timer update failed'); }
    };

    const handleAddFoul = async (foulData) => {
        if (!selectedMatch) return;
        try {
            console.log('🔵 Adding foul:', { ...foulData, matchId: selectedMatch._id });
            const response = await api.post('/fouls', { ...foulData, matchId: selectedMatch._id });
            console.log('✅ Foul added:', response.data);
            toast.success('Card/Foul added');
        } catch (err) { 
            console.error('❌ Failed to add foul:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to add card'); 
        }
    };

    const handleRemoveFoul = async (foulId) => {
        if (!selectedMatch) return;
        try {
            console.log('🔵 Removing foul:', foulId);
            await api.delete(`/fouls/${foulId}`);
            console.log('✅ Foul removed');
            toast.success('Card/Foul removed');
        } catch (err) { 
            console.error('❌ Failed to remove foul:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to remove card'); 
        }
    };

    const handleSetToss = async (tossData) => {
        if (!selectedMatch) return;
        try {
            await api.put(`/matches/${selectedMatch.sport.toLowerCase()}/update`, { matchId: selectedMatch._id, toss: tossData });
            toast.success('Toss recorded');
        } catch (err) { toast.error('Failed to record toss'); }
    };

    // Handle squad updates for cricket matches
    const handleSquadUpdate = async (squadData) => {
        if (!squadManagerMatch) return;
        try {
            await api.put(`/matches/cricket/update`, { 
                matchId: squadManagerMatch._id, 
                squadA: squadData.squadA,
                squadB: squadData.squadB
            });
            toast.success('Squads updated successfully!');
            fetchMatches(); // Refresh matches
        } catch (err) { 
            console.error('Squad update error:', err);
            toast.error('Failed to update squads'); 
        }
    };

    const formatScore = (match) => {
        if (match.sport === 'CRICKET') return `${match.scoreA?.runs || 0}/${match.scoreA?.wickets || 0} vs ${match.scoreB?.runs || 0}/${match.scoreB?.wickets || 0}`;
        return `${match.scoreA || 0} - ${match.scoreB || 0}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                        <Radio className="w-8 h-8 text-red-500" />
                        Live Console
                    </h1>
                    <p className="text-gray-400 mt-1">Manage and score live matches in real-time</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={fetchMatches}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </motion.button>
            </motion.div>

            {loading ? (
                <div className="text-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
                    <p className="text-gray-400 mt-4">Loading matches...</p>
                </div>
            ) : matches.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-5xl mb-4">🏟️</div>
                    <p className="text-gray-400 text-lg">No matches scheduled yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create a match from the Schedule page</p>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    {matches.map((match, idx) => (
                        <motion.div
                            key={match._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`backdrop-blur-xl rounded-2xl border p-5 transition-all ${
                                match.status === 'LIVE' 
                                    ? 'bg-red-500/10 border-red-500/30 ring-2 ring-red-500/20' 
                                    : match.status === 'COMPLETED'
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                {/* Match Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 text-xs font-bold bg-white/10 text-gray-300 rounded-lg uppercase tracking-wider">
                                            {match.sport.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                                            match.status === 'LIVE' ? 'bg-red-500 text-white' :
                                            match.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                            {match.status === 'LIVE' && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                            {match.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-black text-white">{match.teamA?.shortCode || match.teamA?.name}</span>
                                        <span className="text-gray-500 font-medium">vs</span>
                                        <span className="text-xl font-black text-white">{match.teamB?.shortCode || match.teamB?.name}</span>
                                    </div>

                                    {match.status !== 'SCHEDULED' && (
                                        <div className="mt-2 text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                            {formatScore(match)}
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-500 mt-2">
                                        {new Date(match.scheduledAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Manage Squad Button - Cricket Only */}
                                    {match.sport === 'CRICKET' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => setSquadManagerMatch(match)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25"
                                        >
                                            <Users className="w-4 h-4" />
                                            {match.squadA?.length > 0 || match.squadB?.length > 0 ? 'Edit Squads' : 'Add Players'}
                                        </motion.button>
                                    )}

                                    {match.status === 'SCHEDULED' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleGoLive(match)}
                                            disabled={actionLoading === match._id + '-live'}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 disabled:opacity-50"
                                        >
                                            {actionLoading === match._id + '-live' ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Play className="w-4 h-4" />
                                            )}
                                            Go Live
                                        </motion.button>
                                    )}

                                    {match.status === 'LIVE' && (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedMatch(match)}
                                                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25"
                                            >
                                                Update Score
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEndMatch(match)}
                                                disabled={actionLoading === match._id + '-end'}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 disabled:opacity-50"
                                            >
                                                <Square className="w-4 h-4" />
                                                {actionLoading === match._id + '-end' ? 'Ending...' : 'End Match'}
                                            </motion.button>
                                        </>
                                    )}

                                    {match.status === 'COMPLETED' && (
                                        <span className="px-4 py-2.5 bg-green-500/20 text-green-400 rounded-xl font-medium border border-green-500/30">
                                            ✓ Completed
                                        </span>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => setConfirmModal({ isOpen: true, matchId: match._id, action: 'delete' })}
                                        disabled={actionLoading === match._id}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl font-medium border border-white/10 hover:border-red-500/30 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Delete Match"
                message="Are you sure you want to delete this match? This action cannot be undone."
                confirmText="Delete"
                onConfirm={handleDelete}
                onCancel={() => setConfirmModal({ isOpen: false, matchId: null, action: null })}
                variant="danger"
            />

            {/* Scoring Modal */}
            <AnimatePresence>
                {selectedMatch && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
                        >
                            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl p-6 border-b border-white/10 flex justify-between items-center z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white">Score Management</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedMatch.sport.replace('_', ' ')} • {selectedMatch.teamA?.shortCode} vs {selectedMatch.teamB?.shortCode}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedMatch(null)}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </motion.button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Live Scoreboard Preview */}
                                <div className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Score</div>
                                        <div className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                            {formatScore(selectedMatch)}
                                        </div>
                                    </div>
                                </div>

                                {/* Scoring Controls */}
                                <ScoringControls
                                    match={selectedMatch}
                                    onUpdate={handleScoreUpdate}
                                    onTimerAction={handleTimerAction}
                                    onAddFoul={handleAddFoul}
                                    onRemoveFoul={handleRemoveFoul}
                                    onSetToss={handleSetToss}
                                />
                                
                                {/* Enhanced Foul System for Football/Hockey */}
                                {['FOOTBALL', 'HOCKEY'].includes(selectedMatch.sport) && (
                                    <EnhancedFoulSystem
                                        match={selectedMatch}
                                        onAddFoul={handleAddFoul}
                                        onRemoveFoul={handleRemoveFoul}
                                        disabled={selectedMatch.status !== 'LIVE'}
                                    />
                                )}
                                
                                {/* Penalty Shootout for Football/Hockey */}
                                {['FOOTBALL', 'HOCKEY'].includes(selectedMatch.sport) && (
                                    <PenaltyShootout
                                        match={selectedMatch}
                                        onUpdate={handleScoreUpdate}
                                        disabled={selectedMatch.status === 'COMPLETED'}
                                    />
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-xs text-gray-500">Changes saved instantly via Socket.io</span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => handleEndMatch(selectedMatch)}
                                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-green-500/25"
                                    >
                                        Complete Match
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Squad Manager Modal */}
            {squadManagerMatch && (
                <CricketSquadManager
                    match={squadManagerMatch}
                    onUpdate={handleSquadUpdate}
                    onClose={() => setSquadManagerMatch(null)}
                />
            )}
        </div>
    );
};

export default LiveConsole;
