import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';

const MatchDetail = ({ isDarkMode, setIsDarkMode }) => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMatch();

        // Real-time updates
        socket.on('matchUpdate', (updatedMatch) => {
            if (updatedMatch._id === id) {
                setMatch(updatedMatch);
            }
        });

        socket.on('matchDeleted', ({ matchId }) => {
            if (matchId === id) {
                setError('This match has been removed');
                setMatch(null);
            }
        });

        return () => {
            socket.off('matchUpdate');
            socket.off('matchDeleted');
        };
    }, [id]);

    const fetchMatch = async () => {
        try {
            setLoading(true);
            const res = await api.get('/matches');
            const foundMatch = res.data.data?.find(m => m._id === id);
            if (foundMatch) {
                setMatch(foundMatch);
            } else {
                setError('Match not found');
            }
        } catch (err) {
            setError('Failed to load match');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Sport-specific scoreboard renderer
    const renderScoreboard = () => {
        if (!match) return null;

        switch (match.sport) {
            case 'CRICKET':
                return <CricketScoreboard match={match} />;
            case 'BADMINTON':
            case 'TABLE_TENNIS':
            case 'VOLLEYBALL':
                return <SetScoreboard match={match} />;
            case 'FOOTBALL':
            case 'HOCKEY':
                return <FootballScoreboard match={match} />;
            case 'BASKETBALL':
                return <BasketballScoreboard match={match} />;
            case 'KABADDI':
            case 'KHOKHO':
                return <SimpleScoreboard match={match} sport={match.sport} />;
            case 'CHESS':
                return <ChessScoreboard match={match} />;
            default:
                return <SimpleScoreboard match={match} sport={match.sport} />;
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vnit-accent"></div>
                </div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="max-w-4xl mx-auto p-6 text-center pt-20">
                    <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error || 'Match not found'}</h1>
                    <Link to="/" className={`${isDarkMode ? 'text-vnit-accent hover:text-yellow-500' : 'text-vnit-primary hover:text-blue-700'} transition-colors`}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            <div className="max-w-4xl mx-auto p-4 md:p-6">
                {/* Back Button */}
                <Link
                    to="/"
                    className={`inline-flex items-center gap-2 mb-6 transition-colors ${
                        isDarkMode
                            ? 'text-dark-text-secondary hover:text-dark-text'
                            : 'text-light-text-secondary hover:text-light-text'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Matches
                </Link>

                {/* Match Header */}
                <div className={`rounded-2xl overflow-hidden border mb-6 transition-all duration-300 ${
                    isDarkMode
                        ? 'bg-dark-surface border-dark-border'
                        : 'bg-light-surface border-light-border'
                }`}>
                    {/* Status Bar */}
                    <div className={`px-4 py-2 flex justify-between items-center ${match.status === 'LIVE' ? 'bg-red-600' :
                            match.status === 'COMPLETED' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                        <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            {match.status === 'LIVE' && (
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            )}
                            {match.status}
                        </span>
                        <span className="text-sm">{match.sport.replace('_', ' ')}</span>
                    </div>

                    {/* Teams */}
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                                <div className="text-4xl font-black mb-2">{match.teamA?.shortCode}</div>
                                <div className="text-sm text-gray-400">{match.teamA?.name}</div>
                            </div>
                            <div className="px-6 text-gray-500 text-2xl font-bold">VS</div>
                            <div className="text-center flex-1">
                                <div className="text-4xl font-black mb-2">{match.teamB?.shortCode}</div>
                                <div className="text-sm text-gray-400">{match.teamB?.name}</div>
                            </div>
                        </div>
                    </div>

                    {/* Match Info */}
                    <div className="px-6 pb-4 flex justify-center gap-6 text-sm text-gray-400">
                        <span>📅 {formatDate(match.scheduledAt)}</span>
                        {match.venue && <span>📍 {match.venue}</span>}
                    </div>
                </div>

                {/* Sport-Specific Scoreboard */}
                {renderScoreboard()}

                {/* Winner Display */}
                {match.status === 'COMPLETED' && match.winner && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 rounded-xl border border-yellow-600/30 text-center">
                        <div className="text-yellow-400 text-sm font-bold uppercase tracking-wider mb-2">🏆 Winner</div>
                        <div className="text-3xl font-black text-yellow-300">
                            {match.winner.name || match.winner.shortCode}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// CRICKET SCOREBOARD - VNIT CHAMPIONSHIP
// ============================================
const CricketScoreboard = ({ match }) => {
    const { scoreA, scoreB, totalOvers } = match;
    const runRate = scoreA?.overs ? ((scoreA.runs / parseFloat(scoreA.overs)) || 0).toFixed(2) : 0;

    return (
        <div className="bg-gradient-to-br from-vnit-primary via-blue-900 to-vnit-dark rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-vnit-primary to-vnit-secondary px-6 py-4 border-b-2 border-vnit-accent">
                <h3 className="font-black text-white text-center text-2xl">🏏 CRICKET SCORECARD</h3>
            </div>

            <div className="p-8">
                {/* Main Scores */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Team A */}
                    <div className="text-center bg-gradient-to-br from-blue-600/40 to-blue-800/40 p-8 rounded-2xl border-2 border-blue-400/60 hover:border-blue-300/80 transition-all">
                        <div className="text-white/80 text-sm font-bold mb-2 uppercase tracking-widest">{match.teamA?.shortCode}</div>
                        <div className="mb-4">
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100 mb-1">
                                {scoreA?.runs || 0}
                            </div>
                            <div className="text-2xl text-blue-300 font-bold">/{scoreA?.wickets || 0}</div>
                        </div>
                        <div className="text-blue-200 text-sm font-semibold border-t border-blue-400/50 pt-3">
                            <div>{scoreA?.overs || 0} overs</div>
                            <div className="text-xs text-blue-300/80 mt-1">Run Rate: {runRate}</div>
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="text-center bg-gradient-to-br from-vnit-secondary/40 to-red-800/40 p-8 rounded-2xl border-2 border-red-400/60 hover:border-red-300/80 transition-all">
                        <div className="text-white/80 text-sm font-bold mb-2 uppercase tracking-widest">{match.teamB?.shortCode}</div>
                        <div className="mb-4">
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 mb-1">
                                {scoreB?.runs || 0}
                            </div>
                            <div className="text-2xl text-red-300 font-bold">/{scoreB?.wickets || 0}</div>
                        </div>
                        <div className="text-red-200 text-sm font-semibold border-t border-red-400/50 pt-3">
                            <div>{scoreB?.overs || 0} overs</div>
                            <div className="text-xs text-red-300/80 mt-1">Run Rate: {(scoreB?.overs ? (scoreB.runs / parseFloat(scoreB.overs)).toFixed(2) : 0)}</div>
                        </div>
                    </div>
                </div>

                {/* Overs Progress */}
                <div className="mb-6 px-4">
                    <div className="text-center text-vnit-accent font-bold mb-2 uppercase text-sm">Overs Progress</div>
                    <div className="w-full bg-vnit-dark rounded-full h-3 border border-vnit-accent overflow-hidden">
                        <div className="bg-gradient-to-r from-vnit-primary to-vnit-secondary h-full transition-all" style={{width: `${(scoreA?.overs / (totalOvers || 20)) * 100}%`}}></div>
                    </div>
                    <div className="text-center text-white/80 text-xs mt-2">{scoreA?.overs || 0} / {totalOvers || 20} Overs</div>
                </div>

                {/* Match Status */}
                {match.status === 'LIVE' && scoreB?.runs > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-yellow-600/40 to-yellow-700/40 border-2 border-yellow-400/60 rounded-xl text-center">
                        <div className="text-vnit-accent font-black text-lg animate-pulse">
                            {scoreA?.runs > scoreB?.runs 
                                ? `${match.teamA?.shortCode} leads by ${scoreA.runs - scoreB.runs} runs 🎯`
                                : scoreB?.runs > scoreA?.runs 
                                ? `${match.teamB?.shortCode} leads by ${scoreB.runs - scoreA.runs} runs 🎯`
                                : '⚡ Scores Level'}
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                {match.status === 'COMPLETED' && (
                    <div className="mt-4 text-center">
                        {scoreA?.runs > scoreB?.runs 
                            ? <div className="text-green-400 font-black text-lg">✅ {match.teamA?.shortCode} Won by {scoreA.runs - scoreB.runs} runs</div>
                            : scoreB?.runs > scoreA?.runs 
                            ? <div className="text-green-400 font-black text-lg">✅ {match.teamB?.shortCode} Won by {scoreB.runs - scoreA.runs} runs</div>
                            : <div className="text-yellow-400 font-black text-lg">🤝 Match Tied</div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// SET-BASED SCOREBOARD - VNIT CHAMPIONSHIP
// ============================================
const SetScoreboard = ({ match }) => {
    const { scoreA, scoreB, currentSet, setDetails, sport } = match;
    const maxPoints = sport === 'TABLE_TENNIS' ? 11 : (sport === 'VOLLEYBALL' ? 25 : 21);
    const sportEmoji = sport === 'TABLE_TENNIS' ? '🏓' : (sport === 'VOLLEYBALL' ? '🏐' : '🏸');

    return (
        <div className="bg-gradient-to-br from-vnit-primary via-purple-900 to-vnit-dark rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-vnit-primary to-vnit-secondary px-6 py-4 border-b-2 border-vnit-accent flex justify-between items-center">
                <h3 className="font-black text-white text-xl">{sportEmoji} {sport?.toUpperCase()} SCOREBOARD</h3>
                <span className="text-vnit-accent font-bold text-sm">Best of {match.maxSets || 3}</span>
            </div>

            <div className="p-8">
                {/* Sets Score */}
                <div className="text-center mb-8">
                    <div className="text-vnit-accent font-black text-sm uppercase tracking-widest mb-4">Sets Won</div>
                    <div className="flex items-center justify-center gap-12">
                        <div className="bg-gradient-to-br from-blue-600/40 to-blue-800/40 p-8 rounded-2xl border-2 border-blue-400/60 flex-1">
                            <div className="text-sm text-white/80 font-bold mb-2 uppercase">{match.teamA?.shortCode}</div>
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">{scoreA || 0}</div>
                        </div>
                        <div className="text-white/60 text-4xl font-black">-</div>
                        <div className="bg-gradient-to-br from-vnit-secondary/40 to-red-800/40 p-8 rounded-2xl border-2 border-red-400/60 flex-1">
                            <div className="text-sm text-white/80 font-bold mb-2 uppercase">{match.teamB?.shortCode}</div>
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100">{scoreB || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Current Game */}
                {match.status === 'LIVE' && currentSet && (
                    <div className="bg-gradient-to-r from-vnit-accent/20 to-yellow-600/20 p-6 rounded-2xl border-2 border-vnit-accent/60 mb-6">
                        <div className="text-center text-vnit-accent font-black text-sm uppercase tracking-widest mb-4">Current Game (to {maxPoints})</div>
                        <div className="flex items-center justify-center gap-8">
                            <div className="bg-blue-600/40 p-6 rounded-xl border border-blue-400/60 flex-1">
                                <div className="text-5xl font-black text-blue-300">{currentSet.pointsA || 0}</div>
                                <div className="text-xs text-blue-200 mt-2 uppercase font-bold">{match.teamA?.shortCode}</div>
                            </div>
                            <div className="text-white/60 text-3xl font-black">-</div>
                            <div className="bg-red-600/40 p-6 rounded-xl border border-red-400/60 flex-1">
                                <div className="text-5xl font-black text-red-300">{currentSet.pointsB || 0}</div>
                                <div className="text-xs text-red-200 mt-2 uppercase font-bold">{match.teamB?.shortCode}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Set History */}
                {setDetails && setDetails.length > 0 && (
                    <div className="mt-6 p-4 bg-vnit-dark/50 rounded-xl border border-vnit-accent/30">
                        <div className="text-vnit-accent text-xs font-black uppercase tracking-widest mb-3">Set History</div>
                        <div className="flex gap-3 flex-wrap">
                            {setDetails.map((set, i) => (
                                <div key={i} className="px-4 py-2 bg-gradient-to-r from-vnit-primary/50 to-vnit-secondary/50 border border-vnit-accent/50 rounded-lg">
                                    <div className="text-white font-bold text-sm">Set {i + 1}</div>
                                    <div className="text-vnit-accent text-xs font-semibold">{set}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status */}
                {match.status === 'COMPLETED' && (
                    <div className="mt-6 text-center p-4 bg-gradient-to-r from-green-600/40 to-green-700/40 border-2 border-green-400/60 rounded-xl">
                        <div className="text-green-300 font-black text-lg">
                            ✅ {scoreA > scoreB ? match.teamA?.shortCode : match.teamB?.shortCode} Won the Match
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// FOOTBALL/HOCKEY SCOREBOARD - VNIT CHAMPIONSHIP
// ============================================
const FootballScoreboard = ({ match }) => {
    const { scoreA, scoreB, period } = match;
    const sportEmoji = match.sport === 'FOOTBALL' ? '⚽' : '🏑';

    return (
        <div className="bg-gradient-to-br from-vnit-primary via-green-900 to-vnit-dark rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-vnit-primary to-vnit-secondary px-6 py-4 border-b-2 border-vnit-accent">
                <h3 className="font-black text-white text-center text-2xl">{sportEmoji} {match.sport} SCOREBOARD</h3>
            </div>

            {/* Status Bar */}
            {match.status === 'LIVE' && (
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-4 py-2 text-center">
                    <span className="text-white font-black text-lg">🔴 LIVE - {period || 'Match'} in Progress</span>
                </div>
            )}

            <div className="p-10">
                <div className="flex items-center justify-center gap-16">
                    {/* Team A */}
                    <div className="text-center bg-gradient-to-br from-blue-600/40 to-blue-800/40 p-10 rounded-3xl border-3 border-blue-400/60 flex-1">
                        <div className="text-white/80 text-sm font-black mb-3 uppercase tracking-widest">{match.teamA?.shortCode}</div>
                        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">
                            {scoreA || 0}
                        </div>
                        <div className="text-white/80 text-sm font-bold mt-3 uppercase">{match.teamA?.name}</div>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-white/40 text-5xl font-black">-</div>
                        {match.status === 'COMPLETED' && (scoreA > scoreB ? 
                            <div className="text-green-400 font-black text-xs px-3 py-1 bg-green-600/40 border border-green-400 rounded-full">WINNER</div>
                            : scoreB > scoreA ?
                            <div className="text-red-400 font-black text-xs px-3 py-1 bg-red-600/40 border border-red-400 rounded-full">LOSER</div>
                            : <div className="text-yellow-400 font-black text-xs px-3 py-1 bg-yellow-600/40 border border-yellow-400 rounded-full">DRAW</div>
                        )}
                    </div>

                    {/* Team B */}
                    <div className="text-center bg-gradient-to-br from-vnit-secondary/40 to-red-800/40 p-10 rounded-3xl border-3 border-red-400/60 flex-1">
                        <div className="text-white/80 text-sm font-black mb-3 uppercase tracking-widest">{match.teamB?.shortCode}</div>
                        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100">
                            {scoreB || 0}
                        </div>
                        <div className="text-white/80 text-sm font-bold mt-3 uppercase">{match.teamB?.name}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// BASKETBALL SCOREBOARD - VNIT CHAMPIONSHIP
// ============================================
const BasketballScoreboard = ({ match }) => {
    const { scoreA, scoreB, period } = match;

    return (
        <div className="bg-gradient-to-br from-vnit-primary via-orange-900 to-vnit-dark rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-vnit-primary to-orange-600 px-6 py-4 border-b-2 border-vnit-accent">
                <h3 className="font-black text-white text-center text-2xl">🏀 BASKETBALL SCOREBOARD</h3>
            </div>

            {/* Quarter Status */}
            <div className="bg-gradient-to-r from-orange-600/60 to-orange-700/60 px-4 py-3 text-center border-b border-vnit-accent/50">
                <span className="text-white font-black text-lg">QUARTER {period || 1}</span>
            </div>

            <div className="p-12">
                <div className="flex items-center justify-center gap-16">
                    {/* Team A */}
                    <div className="text-center bg-gradient-to-br from-blue-600/40 to-blue-800/40 p-12 rounded-3xl border-3 border-blue-400/60 flex-1">
                        <div className="text-white/80 text-sm font-black mb-4 uppercase tracking-widest">{match.teamA?.shortCode}</div>
                        <div className="text-10xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100 leading-none">
                            {scoreA || 0}
                        </div>
                        <div className="text-white/80 text-sm font-bold mt-4">POINTS</div>
                    </div>

                    {/* Divider */}
                    <div className="text-white/40 text-6xl font-black">:</div>

                    {/* Team B */}
                    <div className="text-center bg-gradient-to-br from-vnit-secondary/40 to-red-800/40 p-12 rounded-3xl border-3 border-red-400/60 flex-1">
                        <div className="text-white/80 text-sm font-black mb-4 uppercase tracking-widest">{match.teamB?.shortCode}</div>
                        <div className="text-10xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 leading-none">
                            {scoreB || 0}
                        </div>
                        <div className="text-white/80 text-sm font-bold mt-4">POINTS</div>
                    </div>
                </div>

                {/* Match Status */}
                {match.status === 'LIVE' && (
                    <div className="mt-8 text-center p-4 bg-gradient-to-r from-yellow-600/40 to-yellow-700/40 border-2 border-yellow-400/60 rounded-xl">
                        <div className="text-vnit-accent font-black text-lg animate-pulse">🔴 LIVE</div>
                    </div>
                )}

                {match.status === 'COMPLETED' && (
                    <div className="mt-8 text-center p-4 bg-gradient-to-r from-green-600/40 to-green-700/40 border-2 border-green-400/60 rounded-xl">
                        <div className="text-green-300 font-black text-lg">
                            ✅ Final Score | Q4 Complete
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// SIMPLE SCOREBOARD - VNIT CHAMPIONSHIP
// ============================================
const SimpleScoreboard = ({ match, sport }) => {
    const { scoreA, scoreB } = match;
    const sportEmoji = sport === 'KABADDI' ? '🏃‍♂️' : '🏃‍♀️';

    return (
        <div className="bg-gradient-to-br from-vnit-primary via-purple-900 to-vnit-dark rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-vnit-primary to-vnit-secondary px-6 py-4 border-b-2 border-vnit-accent">
                <h3 className="font-black text-white text-center text-2xl">{sportEmoji} {sport} SCOREBOARD</h3>
            </div>

            <div className="p-12">
                <div className="flex items-center justify-center gap-16">
                    {/* Team A */}
                    <div className="text-center bg-gradient-to-br from-blue-600/40 to-blue-800/40 p-12 rounded-3xl border-3 border-blue-400/60 flex-1">
                        <div className="text-white/80 text-sm font-black mb-4 uppercase tracking-widest">{match.teamA?.shortCode}</div>
                        <div className="text-10xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100 leading-none">
                            {scoreA || 0}
                        </div>
                        <div className="text-blue-300 text-sm font-bold mt-4 uppercase">Points</div>
                    </div>

                    {/* Divider */}
                    <div className="text-white/40 text-6xl font-black">-</div>

                    {/* Team B */}
                    <div className="text-center bg-gradient-to-br from-vnit-secondary/40 to-red-800/40 p-12 rounded-3xl border-3 border-red-400/60 flex-1">
                        <div className="text-white/80 text-sm font-black mb-4 uppercase tracking-widest">{match.teamB?.shortCode}</div>
                        <div className="text-10xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 leading-none">
                            {scoreB || 0}
                        </div>
                        <div className="text-red-300 text-sm font-bold mt-4 uppercase">Points</div>
                    </div>
                </div>

                {/* Status */}
                {match.status === 'LIVE' && (
                    <div className="mt-8 text-center p-4 bg-gradient-to-r from-yellow-600/40 to-yellow-700/40 border-2 border-yellow-400/60 rounded-xl">
                        <div className="text-vnit-accent font-black text-lg animate-pulse">🔴 Match in Progress</div>
                    </div>
                )}

                {match.status === 'COMPLETED' && (
                    <div className="mt-8 text-center p-4 bg-gradient-to-r from-green-600/40 to-green-700/40 border-2 border-green-400/60 rounded-xl">
                        <div className="text-green-300 font-black text-lg">
                            ✅ {scoreA > scoreB ? match.teamA?.shortCode : match.teamB?.shortCode} Won
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// CHESS SCOREBOARD - VNIT CHAMPIONSHIP
// ============================================
const ChessScoreboard = ({ match }) => {
    const resultLabels = {
        'CHECKMATE': '♔ Checkmate',
        'RESIGNATION': '🏳️ Resignation',
        'STALEMATE': '🤝 Stalemate',
        'TIME_OUT': '⏱️ Time Out',
        'DRAW': '🤝 Draw'
    };

    return (
        <div className="bg-gradient-to-br from-vnit-primary via-slate-900 to-vnit-dark rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-vnit-primary to-vnit-secondary px-6 py-4 border-b-2 border-vnit-accent">
                <h3 className="font-black text-white text-center text-2xl">♟️ CHESS CHAMPIONSHIP</h3>
            </div>

            <div className="p-12">
                {/* Teams */}
                <div className="flex items-center justify-center gap-8 mb-8">
                    <div className="text-center bg-gradient-to-br from-blue-600/40 to-blue-800/40 p-8 rounded-2xl border-2 border-blue-400/60 flex-1">
                        <div className="text-5xl mb-3">♔</div>
                        <div className="text-white font-black">{match.teamA?.name}</div>
                        <div className="text-vnit-accent text-sm font-bold mt-2 uppercase">White</div>
                    </div>

                    <div className="text-3xl text-vnit-accent font-black">vs</div>

                    <div className="text-center bg-gradient-to-br from-vnit-secondary/40 to-red-800/40 p-8 rounded-2xl border-2 border-red-400/60 flex-1">
                        <div className="text-5xl mb-3">♚</div>
                        <div className="text-white font-black">{match.teamB?.name}</div>
                        <div className="text-red-300 text-sm font-bold mt-2 uppercase">Black</div>
                    </div>
                </div>

                {/* Result */}
                {match.resultType && (
                    <div className="text-center p-6 bg-gradient-to-r from-green-600/40 to-green-700/40 border-2 border-green-400/60 rounded-2xl">
                        <div className="text-vnit-accent font-black text-xl mb-2">Match Concluded</div>
                        <div className="text-white font-black text-2xl">
                            {resultLabels[match.resultType] || match.resultType}
                        </div>
                    </div>
                )}

                {match.status === 'LIVE' && !match.resultType && (
                    <div className="text-center p-6 bg-gradient-to-r from-yellow-600/40 to-yellow-700/40 border-2 border-yellow-400/60 rounded-2xl">
                        <div className="text-vnit-accent font-black text-2xl animate-pulse">
                            ♟️ Game in Progress
                        </div>
                    </div>
                )}

                {match.status === 'SCHEDULED' && (
                    <div className="text-center p-6 bg-gradient-to-r from-blue-600/40 to-blue-700/40 border-2 border-blue-400/60 rounded-2xl">
                        <div className="text-vnit-accent font-black text-2xl">
                            📅 Match Scheduled
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchDetail;
