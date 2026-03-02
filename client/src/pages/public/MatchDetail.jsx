import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, MapPin, Calendar, Clock, Tag } from 'lucide-react';
import { SPORT_ICONS, SPORT_COLORS } from '../../lib/constants';

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMatch = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/matches/${id}`);
            setMatch(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Match not found');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchMatch();
        const handleMatchUpdate = (data) => {
            if (data._id === id || data.matchId === id) fetchMatch();
        };
        socket.on('matchUpdate', handleMatchUpdate);
        return () => { socket.off('matchUpdate', handleMatchUpdate); };
    }, [id]);

    const getTeamName = (team) => team?.name || team?.shortCode || 'TBD';
    const getTeamShort = (team) => team?.shortCode || team?.name || 'TBD';

    const isWinner = (team) => {
        if (!match?.winner || !team) return false;
        const winnerId = match.winner._id || match.winner;
        return winnerId === team._id;
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <PublicNavbar />
            <div className="flex items-center justify-center pt-32">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );

    if (error || !match) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <PublicNavbar />
            <div className="flex flex-col items-center justify-center pt-32">
                <p className="text-4xl mb-3">😕</p>
                <p className="text-slate-500 dark:text-slate-400">{error || 'Match not found'}</p>
                <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                    Go Home
                </button>
            </div>
        </div>
    );

    const isCompleted = match.status === 'COMPLETED';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <PublicNavbar />

            <div className="max-w-2xl mx-auto px-4 pt-20 pb-12">
                {/* Back Button */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to matches
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">

                    {/* Header — sport-colored */}
                    <div className="p-5 text-white text-center"
                         style={{ background: `linear-gradient(135deg, ${SPORT_COLORS[match.sport]?.accent || '#3B82F6'}, ${SPORT_COLORS[match.sport]?.accent || '#3B82F6'}cc)` }}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-2xl">{SPORT_ICONS[match.sport] || '🏅'}</span>
                            <span className="text-sm font-medium opacity-90">{match.sport?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isCompleted ? 'bg-green-400/20 text-green-100' :
                                match.status === 'CANCELLED' ? 'bg-red-400/20 text-red-100' :
                                'bg-amber-400/20 text-amber-100'
                            }`}>
                                {match.status}
                            </span>
                            {match.matchCategory && match.matchCategory !== 'REGULAR' && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10">
                                    {match.matchCategory.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="p-6">
                        <div className="flex items-center justify-between py-6">
                            {/* Team A */}
                            <div className="flex-1 text-center">
                                <div className={`text-2xl sm:text-3xl font-bold mb-1 truncate ${isWinner(match.teamA) ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-white'}`}>
                                    {getTeamShort(match.teamA)}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{getTeamName(match.teamA)}</div>
                                {isCompleted && match.scoreA && (
                                    <div className="text-2xl font-bold text-blue-600">{match.scoreA}</div>
                                )}
                                {isWinner(match.teamA) && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold text-amber-600">WINNER</span>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 sm:px-6">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-300">VS</span>
                                </div>
                            </div>

                            {/* Team B */}
                            <div className="flex-1 text-center">
                                <div className={`text-2xl sm:text-3xl font-bold mb-1 truncate ${isWinner(match.teamB) ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-white'}`}>
                                    {getTeamShort(match.teamB)}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{getTeamName(match.teamB)}</div>
                                {isCompleted && match.scoreB && (
                                    <div className="text-2xl font-bold text-blue-600">{match.scoreB}</div>
                                )}
                                {isWinner(match.teamB) && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold text-amber-600">WINNER</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        {match.summary && (
                            <div className="text-center py-3 px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic">{match.summary}</p>
                            </div>
                        )}

                        {/* Match Details */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2.5">
                            {match.venue && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <span>{match.venue}</span>
                                </div>
                            )}
                            {match.scheduledAt && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <span>{new Date(match.scheduledAt).toLocaleDateString('en-IN', {
                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                    })}</span>
                                </div>
                            )}
                            {match.scheduledAt && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <span>{new Date(match.scheduledAt).toLocaleTimeString('en-IN', {
                                        hour: 'numeric', minute: '2-digit', hour12: true
                                    })}</span>
                                </div>
                            )}
                            {match.matchCategory && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <span>{match.matchCategory.replace('_', ' ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MatchDetail;
