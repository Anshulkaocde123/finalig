import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import ScoringControls from '../../components/ScoringControls';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';

const LiveConsole = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, matchId: null, action: null });
    const [actionLoading, setActionLoading] = useState(null); // Track which action is loading

    const fetchMatches = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/matches');
            if (response.data && Array.isArray(response.data.data)) {
                setMatches(response.data.data);
            } else {
                setMatches([]);
            }
        } catch (err) {
            console.error('Failed to fetch matches', err);
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMatches();

        // Real-time updates
        socket.on('matchUpdate', (updatedMatch) => {
            console.log('⚡ Admin received update:', updatedMatch._id);
            setMatches(prev => prev.map(m =>
                m._id === updatedMatch._id ? updatedMatch : m
            ));
            // Also update selected match if it's the same one
            setSelectedMatch(prev =>
                prev?._id === updatedMatch._id ? updatedMatch : prev
            );
        });

        socket.on('matchDeleted', ({ matchId }) => {
            setMatches(prev => prev.filter(m => m._id !== matchId));
            if (selectedMatch?._id === matchId) {
                setSelectedMatch(null);
            }
        });

        return () => {
            socket.off('matchUpdate');
            socket.off('matchDeleted');
        };
    }, [fetchMatches, selectedMatch]);

    const handleDelete = async () => {
        const matchId = confirmModal.matchId;
        setConfirmModal({ isOpen: false, matchId: null, action: null });
        setActionLoading(matchId);

        try {
            await api.delete(`/matches/${matchId}`);
            setMatches(matches.filter(m => m._id !== matchId));
            toast.success('Match deleted successfully');
        } catch (err) {
            console.error('Failed to delete match', err);
            toast.error('Failed to delete match');
        } finally {
            setActionLoading(null);
        }
    };

    const handleGoLive = async (match) => {
        setActionLoading(match._id + '-live');
        try {
            const sportParam = match.sport.toLowerCase();
            await api.put(`/matches/${sportParam}/update`, {
                matchId: match._id,
                status: 'LIVE'
            });
            toast.success('Match is now LIVE!');
        } catch (err) {
            console.error('Failed to go live', err);
            toast.error('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEndMatch = async (match) => {
        setActionLoading(match._id + '-end');
        try {
            const sportParam = match.sport.toLowerCase();
            await api.put(`/matches/${sportParam}/update`, {
                matchId: match._id,
                status: 'COMPLETED'
            });
            toast.success('Match completed!');
        } catch (err) {
            console.error('Failed to end match', err);
            toast.error('Failed to end match');
        } finally {
            setActionLoading(null);
        }
    };

    const handleScoreUpdate = async (updatePayload) => {
        if (!selectedMatch) return;

        try {
            const sportParam = selectedMatch.sport.toLowerCase();
            const payload = {
                matchId: selectedMatch._id,
                ...updatePayload
            };

            await api.put(`/matches/${sportParam}/update`, payload);
            toast.success('Score updated!');
            // No need to fetchMatches - Socket.io will update
        } catch (err) {
            console.error('Failed to update score', err);
            toast.error('Failed to update score');
        }
    };

    const openScoringModal = (match) => {
        setSelectedMatch(match);
    };

    const getStatusBadge = (status) => {
        const styles = {
            SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
            LIVE: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
            COMPLETED: 'bg-green-100 text-green-700 border-green-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const formatScore = (match) => {
        if (match.sport === 'CRICKET') {
            return `${match.scoreA?.runs || 0}/${match.scoreA?.wickets || 0} vs ${match.scoreB?.runs || 0}/${match.scoreB?.wickets || 0}`;
        }
        return `${match.scoreA || 0} - ${match.scoreB || 0}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Live Console</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and score live matches</p>
                </div>
                <button
                    onClick={fetchMatches}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading matches...</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-lg">No matches scheduled yet</p>
                    <p className="text-gray-400 text-sm mt-2">Create a match from the Schedule page</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {matches.map(match => (
                        <div
                            key={match._id}
                            className={`bg-white p-5 rounded-xl shadow-sm border transition-all ${match.status === 'LIVE' ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                {/* Match Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                                            {match.sport.replace('_', ' ')}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getStatusBadge(match.status)}`}>
                                            {match.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-lg font-bold text-gray-800">
                                        <span>{match.teamA?.name || match.teamA?.shortCode}</span>
                                        <span className="text-gray-400 text-sm">vs</span>
                                        <span>{match.teamB?.name || match.teamB?.shortCode}</span>
                                    </div>

                                    {match.status !== 'SCHEDULED' && (
                                        <div className="mt-2 text-xl font-bold text-indigo-600">
                                            {formatScore(match)}
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-500 mt-2">
                                        {new Date(match.scheduledAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {match.status === 'SCHEDULED' && (
                                        <button
                                            onClick={() => handleGoLive(match)}
                                            disabled={actionLoading === match._id + '-live'}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
                                        >
                                            {actionLoading === match._id + '-live' ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                            )}
                                            Go Live
                                        </button>
                                    )}

                                    {match.status === 'LIVE' && (
                                        <>
                                            <button
                                                onClick={() => openScoringModal(match)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all active:scale-95"
                                            >
                                                Update Score
                                            </button>
                                            <button
                                                onClick={() => handleEndMatch(match)}
                                                disabled={actionLoading === match._id + '-end'}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all disabled:opacity-50 active:scale-95"
                                            >
                                                {actionLoading === match._id + '-end' ? 'Ending...' : 'End Match'}
                                            </button>
                                        </>
                                    )}

                                    {match.status === 'COMPLETED' && (
                                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                            ✓ Completed
                                        </span>
                                    )}

                                    <button
                                        onClick={() => setConfirmModal({ isOpen: true, matchId: match._id, action: 'delete' })}
                                        disabled={actionLoading === match._id}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 font-medium transition-all disabled:opacity-50 active:scale-95"
                                    >
                                        {actionLoading === match._id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
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

            {/* SCORING MODAL */}
            {selectedMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Update Score
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedMatch.sport.replace('_', ' ')} • {selectedMatch.teamA?.shortCode} vs {selectedMatch.teamB?.shortCode}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Live Score Display */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                                <div className="text-sm text-gray-500 mb-2">Current Score</div>
                                <div className="text-2xl font-bold text-indigo-600">
                                    {formatScore(selectedMatch)}
                                </div>
                            </div>

                            <ScoringControls
                                match={selectedMatch}
                                onUpdate={handleScoreUpdate}
                            />

                            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                    Changes are saved instantly
                                </span>
                                <button
                                    onClick={() => handleEndMatch(selectedMatch)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm active:scale-95 transition-all"
                                >
                                    Complete Match
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveConsole;
