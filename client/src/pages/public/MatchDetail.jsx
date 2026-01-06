import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import ProfessionalCricketScorecard from '../../components/ProfessionalCricketScorecard';
import { ArrowLeft, Calendar, MapPin, Trophy, Circle, Clock } from 'lucide-react';

// Lazy load 3D background
const ThreeBackground = React.lazy(() => import('../../components/ThreeBackground'));

// Timer Display Component for Public View
const PublicTimerDisplay = ({ timer, isDarkMode }) => {
    const [elapsed, setElapsed] = useState(0);
    
    useEffect(() => {
        if (!timer?.isRunning || timer?.isPaused) return;
        
        const interval = setInterval(() => {
            const start = new Date(timer.startTime);
            const now = new Date();
            const diff = Math.floor((now - start) / 1000);
            setElapsed((timer.elapsedSeconds || 0) + diff);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [timer?.isRunning, timer?.isPaused, timer?.startTime, timer?.elapsedSeconds]);
    
    const displayTime = timer?.isPaused ? (timer?.elapsedSeconds || 0) : elapsed;
    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;
    const addedTime = timer?.addedTime || 0;
    
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold text-lg">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            {addedTime > 0 && (
                <span className="text-green-400 text-xs font-bold">+{addedTime}"</span>
            )}
            {timer?.isPaused && (
                <span className="text-yellow-400 text-xs font-bold ml-2">⏸ PAUSED</span>
            )}
        </div>
    );
};

const MatchDetail = ({ isDarkMode, setIsDarkMode }) => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [fouls, setFouls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMatch();
        fetchFouls();
        socket.on('matchUpdate', (updatedMatch) => {
            if (updatedMatch._id === id) {
                console.log('📡 Match updated via socket');
                setMatch(updatedMatch);
            }
        });
        socket.on('matchDeleted', ({ matchId }) => {
            if (matchId === id) { setError('Match removed'); setMatch(null); }
        });
        socket.on('foulAdded', (foul) => {
            console.log('📡 Foul added via socket:', foul);
            // Check if foul belongs to this match (handle both _id and toString formats)
            const foulMatchId = typeof foul.match === 'object' ? foul.match._id || foul.match : foul.match;
            if (foulMatchId?.toString() === id?.toString()) {
                setFouls(prev => {
                    // Avoid duplicates
                    const exists = prev.find(f => f._id === foul._id);
                    if (exists) return prev;
                    return [...prev, foul];
                });
            }
        });
        socket.on('foulRemoved', ({ foulId }) => {
            console.log('📡 Foul removed via socket:', foulId);
            setFouls(prev => prev.filter(f => f._id !== foulId));
        });
        return () => { 
            socket.off('matchUpdate'); 
            socket.off('matchDeleted');
            socket.off('foulAdded');
            socket.off('foulRemoved');
        };
    }, [id]);

    const fetchMatch = async () => {
        try {
            setLoading(true);
            const res = await api.get('/matches');
            const foundMatch = res.data.data?.find(m => m._id === id);
            foundMatch ? setMatch(foundMatch) : setError('Match not found');
        } catch (err) { 
            console.error('Failed to load match:', err);
            setError('Failed to load match'); 
        }
        finally { setLoading(false); }
    };

    const fetchFouls = async () => {
        try {
            const res = await api.get(`/fouls/match/${id}`);
            if (res.data?.success) {
                setFouls(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to load fouls:', err);
            // Don't set error state for fouls - just log it
        }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    const FallbackBg = () => (
        <div className={`fixed inset-0 -z-10 ${isDarkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
            <div className="absolute inset-0">
                <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-200/30'}`} />
                <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-200/30'}`} />
            </div>
        </div>
    );

    const renderScoreboard = () => {
        if (!match) return null;
        const props = { match, isDarkMode, fouls };
        switch (match.sport) {
            case 'CRICKET': return <ProfessionalCricketScorecard match={match} isDarkMode={isDarkMode} />;
            case 'BADMINTON': case 'TABLE_TENNIS': case 'VOLLEYBALL': return <SetScoreboard {...props} />;
            case 'FOOTBALL': case 'HOCKEY': return <FootballScoreboard {...props} />;
            case 'BASKETBALL': return <BasketballScoreboard {...props} />;
            case 'CHESS': return <ChessScoreboard {...props} />;
            default: return <SimpleScoreboard {...props} />;
        }
    };

    if (loading) return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex flex-col items-center justify-center h-96">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
            </div>
        </div>
    );

    if (error || !match) return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="max-w-4xl mx-auto p-6 text-center pt-20">
                <h1 className="text-2xl font-bold mb-4 text-red-400">{error || 'Match not found'}</h1>
                <Link to="/" className="text-indigo-400 hover:text-indigo-300">← Back to Home</Link>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isDarkMode ? <Suspense fallback={<FallbackBg />}><ThreeBackground variant="default" /></Suspense> : <FallbackBg />}
            <div className="relative z-10">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="max-w-4xl mx-auto p-4 md:p-6 pt-8">
                    <Link to="/">
                        <motion.button whileHover={{ x: -5 }} className={`flex items-center gap-2 mb-6 font-medium ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                            <ArrowLeft className="w-5 h-5" /> Back to Matches
                        </motion.button>
                    </Link>

                    {/* Match Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`backdrop-blur-xl rounded-3xl border overflow-hidden mb-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                        {/* Status Bar */}
                        <div className={`px-6 py-3 flex justify-between items-center text-white font-bold ${match.status === 'LIVE' ? 'bg-gradient-to-r from-red-600 to-red-500' : match.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-600 to-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}>
                            <span className="flex items-center gap-2 uppercase tracking-wider text-sm">
                                {match.status === 'LIVE' && <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-white rounded-full" />}
                                {match.status}
                            </span>
                            <span className="text-sm opacity-80">{match.sport.replace('_', ' ')}</span>
                        </div>

                        {/* Teams */}
                        <div className="p-8">
                            <div className="flex items-center justify-between">
                                <motion.div whileHover={{ scale: 1.05 }} className="text-center flex-1">
                                    <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">{match.teamA?.shortCode}</div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{match.teamA?.name}</div>
                                </motion.div>
                                <div className={`px-8 text-3xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>VS</div>
                                <motion.div whileHover={{ scale: 1.05 }} className="text-center flex-1">
                                    <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-pink-400 to-red-500 bg-clip-text text-transparent mb-2">{match.teamB?.shortCode}</div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{match.teamB?.name}</div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Match Info */}
                        <div className={`px-6 pb-4 flex justify-center gap-6 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(match.scheduledAt)}</span>
                            {match.venue && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {match.venue}</span>}
                        </div>
                    </motion.div>

                    {/* Scoreboard */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        {renderScoreboard()}
                    </motion.div>

                    {/* Winner */}
                    {match.status === 'COMPLETED' && match.winner && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className={`mt-6 p-6 rounded-3xl text-center border ${isDarkMode ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30' : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'}`}>
                            <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
                            <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Winner</div>
                            <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{match.winner.name || match.winner.shortCode}</div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Scoreboard Components with glassmorphism
const CricketScoreboard = ({ match, isDarkMode }) => {
    const { scoreA, scoreB, totalOvers } = match;
    const runRate = scoreA?.overs ? (scoreA.runs / parseFloat(scoreA.overs)).toFixed(2) : 0;
    return (
        <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4"><h3 className="font-black text-white text-center text-xl">🏏 CRICKET SCORECARD</h3></div>
            <div className="p-8 grid grid-cols-2 gap-6">
                <div className={`text-center p-6 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                    <div className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{match.teamA?.shortCode}</div>
                    <div className="text-6xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{scoreA?.runs || 0}<span className="text-2xl">/{scoreA?.wickets || 0}</span></div>
                    <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{scoreA?.overs || 0} overs • RR: {runRate}</div>
                </div>
                <div className={`text-center p-6 rounded-2xl border ${isDarkMode ? 'bg-pink-500/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'}`}>
                    <div className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>{match.teamB?.shortCode}</div>
                    <div className="text-6xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">{scoreB?.runs || 0}<span className="text-2xl">/{scoreB?.wickets || 0}</span></div>
                    <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{scoreB?.overs || 0} overs</div>
                </div>
            </div>
        </div>
    );
};

const SetScoreboard = ({ match, isDarkMode }) => {
    const { scoreA, scoreB, currentSet, setDetails = [], maxSets } = match;
    const setsToWin = Math.ceil((maxSets || 3) / 2);
    const emoji = sport === 'TABLE_TENNIS' ? '🏓' : sport === 'VOLLEYBALL' ? '��' : '🏸';
    return (
        <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-4 flex justify-between items-center">
                <h3 className="font-black text-white text-xl">{emoji} {sport?.replace('_', ' ')}</h3>
                <span className="text-white/80 text-sm">Best of {match.maxSets || 3}</span>
            </div>
            <div className="p-8">
                <div className="flex items-center justify-center gap-12 mb-6">
                    <div className="text-center">
                        <div className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamA?.shortCode}</div>
                        <div className="text-7xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{scoreA || 0}</div>
                    </div>
                    <div className={`text-4xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>-</div>
                    <div className="text-center">
                        <div className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamB?.shortCode}</div>
                        <div className="text-7xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">{scoreB || 0}</div>
                    </div>
                </div>
                {currentSet && match.status === 'LIVE' && (
                    <div className={`p-4 rounded-2xl text-center border ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Current Game</div>
                        <div className="flex justify-center gap-8">
                            <span className="text-3xl font-black text-indigo-400">{currentSet.pointsA || 0}</span>
                            <span className={`text-2xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>-</span>
                            <span className="text-3xl font-black text-pink-400">{currentSet.pointsB || 0}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FootballScoreboard = ({ match, isDarkMode, fouls = [] }) => {
    const { scoreA, scoreB, period, half, timer } = match;
    const emoji = match.sport === 'FOOTBALL' ? '⚽' : '🏑';
    const [selectedFoul, setSelectedFoul] = React.useState(null);
    
    const teamACards = fouls.filter(f => f.team?.toString() === match.teamA?._id?.toString());
    const teamBCards = fouls.filter(f => f.team?.toString() === match.teamB?._id?.toString());
    
    const getFoulTypeLabel = (type) => {
        const labels = {
            'YELLOW_CARD': 'Yellow Card',
            'RED_CARD': 'Red Card',
            'PENALTY': 'Penalty',
            'FREE_KICK': 'Free Kick',
            'OFFSIDE': 'Offside',
            'FOUL': 'Foul'
        };
        return labels[type] || type.replace('_', ' ');
    };
    
    const CardDisplay = ({ cards }) => {
        const yellowCards = cards.filter(c => c.foulType === 'YELLOW_CARD');
        const redCards = cards.filter(c => c.foulType === 'RED_CARD');
        if (yellowCards.length === 0 && redCards.length === 0) return null;
        return (
            <div className="mt-3 space-y-1">
                {yellowCards.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center justify-center">
                        {yellowCards.map((card, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedFoul(card)}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                            >
                                🟨 {card.playerName} {card.gameTime && <span className="opacity-70">({card.gameTime}')</span>}
                            </button>
                        ))}
                    </div>
                )}
                {redCards.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center justify-center">
                        {redCards.map((card, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedFoul(card)}
                                className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                            >
                                🟥 {card.playerName} {card.gameTime && <span className="opacity-70">({card.gameTime}')</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="bg-gradient-to-r from-green-600 to-teal-500 px-6 py-4">
                <h3 className="font-black text-white text-center text-xl">{emoji} {match.sport}</h3>
            </div>
            
            {/* Status and Timer Bar */}
            <div className={`px-6 py-3 flex justify-between items-center ${match.status === 'LIVE' ? 'bg-gradient-to-r from-red-600 to-red-500' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                    {match.status === 'LIVE' && <span className="text-white font-bold text-sm">🔴 LIVE</span>}
                    <span className={`font-bold text-sm ${match.status === 'LIVE' ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {half === 1 ? '1st Half' : half === 2 ? '2nd Half' : `Period ${period || 1}`}
                    </span>
                </div>
                {timer && match.status === 'LIVE' && <PublicTimerDisplay timer={timer} isDarkMode={isDarkMode} />}
            </div>
            
            <div className="p-10 flex items-center justify-center gap-16">
                <div className="text-center flex-1">
                    <div className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamA?.shortCode}</div>
                    <div className="text-8xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{scoreA || 0}</div>
                    <CardDisplay cards={teamACards} />
                </div>
                <div className={`text-5xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>:</div>
                <div className="text-center flex-1">
                    <div className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamB?.shortCode}</div>
                    <div className="text-8xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">{scoreB || 0}</div>
                    <CardDisplay cards={teamBCards} />
                </div>
            </div>
            
            {/* Match Events Section */}
            {fouls.length > 0 && (
                <div className={`px-6 pb-6 ${isDarkMode ? 'border-t border-white/10' : 'border-t border-gray-200'}`}>
                    <h4 className={`text-center font-bold text-sm mb-4 mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MATCH EVENTS</h4>
                    <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                        {/* Team A Events */}
                        <div className="space-y-2">
                            <div className={`text-xs font-bold text-center mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{match.teamA?.shortCode}</div>
                            {teamACards.map((card, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedFoul(card)}
                                    className={`w-full p-2 rounded-lg text-xs transition-all hover:scale-105 cursor-pointer ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {card.foulType === 'YELLOW_CARD' ? '🟨' : card.foulType === 'RED_CARD' ? '🟥' : '⚠️'}
                                        <span className="font-bold">{card.playerName}</span>
                                    </div>
                                    {card.gameTime && <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{card.gameTime}'</div>}
                                </button>
                            ))}
                        </div>
                        {/* Team B Events */}
                        <div className="space-y-2">
                            <div className={`text-xs font-bold text-center mb-2 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>{match.teamB?.shortCode}</div>
                            {teamBCards.map((card, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedFoul(card)}
                                    className={`w-full p-2 rounded-lg text-xs transition-all hover:scale-105 cursor-pointer ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {card.foulType === 'YELLOW_CARD' ? '🟨' : card.foulType === 'RED_CARD' ? '🟥' : '⚠️'}
                                        <span className="font-bold">{card.playerName}</span>
                                    </div>
                                    {card.gameTime && <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{card.gameTime}'</div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Foul Detail Modal */}
            <AnimatePresence>
                {selectedFoul && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedFoul(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`rounded-2xl p-6 max-w-md w-full shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {selectedFoul.foulType === 'YELLOW_CARD' ? '🟨' : selectedFoul.foulType === 'RED_CARD' ? '🟥' : '⚠️'} Card Details
                                </h3>
                                <button
                                    onClick={() => setSelectedFoul(null)}
                                    className={`text-2xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    ×
                                </button>
                            </div>
                            
                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <div className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Foul Type</div>
                                    <div className={`text-lg font-bold ${selectedFoul.foulType === 'YELLOW_CARD' ? 'text-yellow-500' : selectedFoul.foulType === 'RED_CARD' ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {getFoulTypeLabel(selectedFoul.foulType)}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Player</div>
                                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedFoul.playerName}
                                    </div>
                                </div>
                                
                                {selectedFoul.gameTime && (
                                    <div>
                                        <div className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Time</div>
                                        <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedFoul.gameTime}' minute
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <div className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Team</div>
                                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedFoul.team?.shortCode || selectedFoul.team?.name || 'Unknown Team'}
                                    </div>
                                </div>
                                
                                {selectedFoul.description && (
                                    <div>
                                        <div className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Description</div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {selectedFoul.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedFoul(null)}
                                className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BasketballScoreboard = ({ match, isDarkMode, fouls = [] }) => {
    const { scoreA, scoreB, period, timer } = match;
    
    const teamAFouls = fouls.filter(f => f.team?.toString() === match.teamA?._id?.toString());
    const teamBFouls = fouls.filter(f => f.team?.toString() === match.teamB?._id?.toString());
    
    const FoulDisplay = ({ fouls }) => {
        const personalFouls = fouls.filter(f => f.foulType === 'PERSONAL_FOUL').length;
        const technicalFouls = fouls.filter(f => f.foulType === 'TECHNICAL_FOUL').length;
        if (personalFouls === 0 && technicalFouls === 0) return null;
        return (
            <div className="flex gap-1 items-center justify-center mt-2">
                {personalFouls > 0 && <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold">PF: {personalFouls}</span>}
                {technicalFouls > 0 && <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">TF: {technicalFouls}</span>}
            </div>
        );
    };
    
    return (
        <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="bg-gradient-to-r from-orange-600 to-red-500 px-6 py-4">
                <h3 className="font-black text-white text-center text-xl">🏀 BASKETBALL</h3>
            </div>
            
            {/* Quarter and Timer Bar */}
            <div className={`px-6 py-3 flex justify-between items-center ${match.status === 'LIVE' ? 'bg-gradient-to-r from-red-600 to-red-500' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                    {match.status === 'LIVE' && <span className="text-white font-bold text-sm">🔴 LIVE</span>}
                    <span className={`font-bold text-sm ${match.status === 'LIVE' ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        QUARTER {period || 1}
                    </span>
                </div>
                {timer && match.status === 'LIVE' && <PublicTimerDisplay timer={timer} isDarkMode={isDarkMode} />}
            </div>
            
            <div className="p-12 flex items-center justify-center gap-16">
                <div className="text-center">
                    <div className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamA?.shortCode}</div>
                    <div className="text-9xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent leading-none">{scoreA || 0}</div>
                    <FoulDisplay fouls={teamAFouls} />
                </div>
                <div className={`text-6xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>:</div>
                <div className="text-center">
                    <div className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamB?.shortCode}</div>
                    <div className="text-9xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent leading-none">{scoreB || 0}</div>
                    <FoulDisplay fouls={teamBFouls} />
                </div>
            </div>
        </div>
    );
};

const SimpleScoreboard = ({ match, isDarkMode }) => {
    const { scoreA, scoreB, sport, half, timer } = match;
    const emoji = sport === 'KABADDI' ? '🏃‍♂️' : sport === 'KHOKHO' ? '🏃‍♀️' : '🏅';
    const isTimedSport = ['KABADDI', 'KHOKHO'].includes(sport);
    
    return (
        <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-500 px-6 py-4">
                <h3 className="font-black text-white text-center text-xl">{emoji} {sport}</h3>
            </div>
            
            {/* Status and Timer Bar for timed sports */}
            {isTimedSport && (
                <div className={`px-6 py-3 flex justify-between items-center ${match.status === 'LIVE' ? 'bg-gradient-to-r from-red-600 to-red-500' : isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                        {match.status === 'LIVE' && <span className="text-white font-bold text-sm">🔴 LIVE</span>}
                        <span className={`font-bold text-sm ${match.status === 'LIVE' ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {half === 1 ? '1st Half' : half === 2 ? '2nd Half' : 'In Progress'}
                        </span>
                    </div>
                    {timer && match.status === 'LIVE' && <PublicTimerDisplay timer={timer} isDarkMode={isDarkMode} />}
                </div>
            )}
            
            <div className="p-12 flex items-center justify-center gap-16">
                <div className="text-center">
                    <div className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamA?.shortCode}</div>
                    <div className="text-8xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{scoreA || 0}</div>
                </div>
                <div className={`text-5xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>-</div>
                <div className="text-center">
                    <div className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{match.teamB?.shortCode}</div>
                    <div className="text-8xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">{scoreB || 0}</div>
                </div>
            </div>
        </div>
    );
};

const ChessScoreboard = ({ match, isDarkMode }) => {
    const labels = { 'CHECKMATE': '♔ Checkmate', 'RESIGNATION': '🏳️ Resignation', 'STALEMATE': '🤝 Stalemate', 'TIME_OUT': '⏱️ Time Out', 'DRAW': '�� Draw' };
    return (
        <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'}`}>
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4"><h3 className="font-black text-white text-center text-xl">♟️ CHESS</h3></div>
            <div className="p-8 flex items-center justify-center gap-8">
                <div className={`text-center p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="text-5xl mb-3">♔</div>
                    <div className="font-black text-lg">{match.teamA?.name}</div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>White</div>
                </div>
                <div className={`text-3xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>vs</div>
                <div className={`text-center p-6 rounded-2xl border ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="text-5xl mb-3">♚</div>
                    <div className="font-black text-lg text-white">{match.teamB?.name}</div>
                    <div className="text-xs mt-1 text-gray-400">Black</div>
                </div>
            </div>
            {match.resultType && <div className={`text-center p-4 border-t font-bold ${isDarkMode ? 'border-white/10 text-yellow-400' : 'border-gray-200 text-yellow-600'}`}>{labels[match.resultType] || match.resultType}</div>}
        </div>
    );
};

export default MatchDetail;
