import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Radio, Award } from 'lucide-react';

/**
 * Football/Basketball Scoreboard with Timer, Cards, and Scorers
 * Features timed match display with fouls/cards tracking
 */
const FootballScoreboard = ({ match, onUpdate, isAdmin = false }) => {
    const [showGoalAnimation, setShowGoalAnimation] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    // Timer logic with enhanced logging
    useEffect(() => {
        console.log('⏱️ Timer state changed:', {
            isRunning: match?.timer?.isRunning,
            isPaused: match?.timer?.isPaused,
            elapsedSeconds: match?.timer?.elapsedSeconds,
            startTime: match?.timer?.startTime,
            addedTime: match?.timer?.addedTime
        });

        if (match?.timer?.isRunning && !match?.timer?.isPaused) {
            const startTime = new Date(match.timer.startTime).getTime();
            const baseElapsed = match.timer.elapsedSeconds || 0;

            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = baseElapsed + Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            setElapsedTime(match?.timer?.elapsedSeconds || 0);
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [match?.timer]);

    if (!match) return null;

    const { 
        teamA, teamB, scoreA, scoreB, 
        period = 1, maxPeriods = 2,
        toss, cardsA, cardsB,
        scorers = [], fouls = [],
        status, sport
    } = match;

    const isFootball = sport === 'FOOTBALL';
    const isBasketball = sport === 'BASKETBALL';

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getPeriodName = () => {
        if (isFootball) {
            // Check for special statuses first
            if (status === 'HALF_TIME') return 'Half Time';
            if (status === 'FULL_TIME') return 'Full Time';
            if (status === 'PENALTIES') return 'Penalty Shootout';
            
            // Check period for match phase
            if (period === 1) return '1st Half';
            if (period === 2) return '2nd Half';
            if (period === 3) return 'Extra Time - 1st Half';
            if (period === 4) return 'Extra Time - 2nd Half';
            return `Period ${period}`;
        }
        if (isBasketball) {
            return `Q${period}`;
        }
        return `Period ${period}`;
    };

    // Team scorers
    const teamAScorers = scorers.filter(s => s.team === 'A');
    const teamBScorers = scorers.filter(s => s.team === 'B');

    return (
        <div className="relative bg-gradient-to-br from-gray-900 via-emerald-900/30 to-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Goal Animation Overlay */}
            <AnimatePresence>
                {showGoalAnimation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="bg-green-600 px-12 py-8 rounded-lg shadow-2xl"
                        >
                            <div className="text-6xl font-bold text-white text-center flex items-center gap-3">
                                {isFootball ? (
                                    <><Circle className="w-12 h-12" /> GOAL!</>
                                ) : (
                                    <><Circle className="w-12 h-12" /> SCORE!</>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Match Header with Timer */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className={`text-white font-semibold px-3 py-1 rounded-lg ${
                            status === 'HALF_TIME' ? 'bg-orange-500' :
                            status === 'FULL_TIME' || status === 'COMPLETED' ? 'bg-blue-500' :
                            status === 'PENALTIES' ? 'bg-purple-500' :
                            'bg-black/20'
                        }`}>
                            {getPeriodName()}
                        </span>
                        {status === 'LIVE' && (
                            <motion.span
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md flex items-center gap-1"
                            >
                                <Radio className="w-3 h-3" />
                                LIVE
                            </motion.span>
                        )}
                    </div>
                    
                    {/* Match Timer */}
                    {(status === 'HALF_TIME' || status === 'FULL_TIME') ? (
                        <div className="bg-black/30 px-4 py-2 rounded-md">
                            <span className="text-2xl font-mono font-bold text-yellow-300">
                                {status === 'HALF_TIME' ? 'HT' : 'FT'}
                            </span>
                        </div>
                    ) : (
                        <motion.div 
                            animate={match?.timer?.isRunning ? { opacity: [1, 0.8, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="bg-black/30 px-4 py-2 rounded-md"
                        >
                            <span className="text-3xl font-mono font-bold text-white">
                                {formatTime(elapsedTime)}
                            </span>
                            {match?.timer?.addedTime > 0 && (
                                <span className="text-yellow-300 text-sm ml-2">+{match.timer.addedTime}'</span>
                            )}
                        </motion.div>
                    )}

                    <div className="text-white/90 text-sm font-medium">
                        {match.matchCategory || 'Match'} • {sport}
                    </div>
                </div>
            </div>

            {/* Toss Info */}
            {toss?.winner && (
                <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-2 text-center">
                    <span className="text-yellow-700 text-sm font-medium">
                        {toss.winner?.shortCode || 'Team'} won the toss and chose to {toss.decision?.toLowerCase()}
                    </span>
                </div>
            )}

            {/* Main Score Display */}
            <div className="p-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Team A */}
                    <div className="text-center">
                        {teamA?.logo && (
                            <img 
                                src={teamA.logo} 
                                alt={teamA.shortCode}
                                className="w-20 h-20 object-contain mx-auto mb-3 rounded-xl bg-white/10 p-2"
                            />
                        )}
                        <h2 className="text-xl font-bold text-white mb-1">
                            {teamA?.shortCode || 'Team A'}
                        </h2>
                        <span className="text-gray-400 text-sm">{teamA?.name}</span>
                        
                        {/* Cards */}
                        <div className="flex justify-center gap-2 mt-2">
                            {(cardsA?.yellow || 0) > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-5 bg-yellow-400 rounded-sm"></div>
                                    <span className="text-yellow-400 text-sm">{cardsA.yellow}</span>
                                </div>
                            )}
                            {(cardsA?.red || 0) > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-5 bg-red-500 rounded-sm"></div>
                                    <span className="text-red-400 text-sm">{cardsA.red}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                        <motion.div 
                            key={`${scoreA}-${scoreB}`}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center gap-4"
                        >
                            <span className="text-6xl font-black text-white">{scoreA || 0}</span>
                            <span className="text-3xl text-gray-500">-</span>
                            <span className="text-6xl font-black text-white">{scoreB || 0}</span>
                        </motion.div>
                        
                        {isBasketball && (
                            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                                {match.periodScores?.map((ps, idx) => (
                                    <div key={idx} className="bg-gray-800/50 rounded px-2 py-1">
                                        <div className="text-xs text-gray-400">Q{ps.period}</div>
                                        <div className="text-sm text-white">{ps.scoreA}-{ps.scoreB}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Team B */}
                    <div className="text-center">
                        {teamB?.logo && (
                            <img 
                                src={teamB.logo} 
                                alt={teamB.shortCode}
                                className="w-20 h-20 object-contain mx-auto mb-3 rounded-xl bg-white/10 p-2"
                            />
                        )}
                        <h2 className="text-xl font-bold text-white mb-1">
                            {teamB?.shortCode || 'Team B'}
                        </h2>
                        <span className="text-gray-400 text-sm">{teamB?.name}</span>
                        
                        {/* Cards */}
                        <div className="flex justify-center gap-2 mt-2">
                            {(cardsB?.yellow || 0) > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-5 bg-yellow-400 rounded-sm"></div>
                                    <span className="text-yellow-400 text-sm">{cardsB.yellow}</span>
                                </div>
                            )}
                            {(cardsB?.red || 0) > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-5 bg-red-500 rounded-sm"></div>
                                    <span className="text-red-400 text-sm">{cardsB.red}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scorers */}
                {(teamAScorers.length > 0 || teamBScorers.length > 0) && (
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-700">
                        <div className="space-y-1">
                            {teamAScorers.map((scorer, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <Circle className="w-4 h-4 text-green-500 fill-green-500" />
                                    <span className="text-white">{scorer.playerName}</span>
                                    <span className="text-gray-400">{scorer.time}'</span>
                                    {scorer.type === 'PENALTY' && (
                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 rounded">P</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        <div className="space-y-1 text-right">
                            {teamBScorers.map((scorer, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 text-sm justify-end"
                                >
                                    {scorer.type === 'PENALTY' && (
                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 rounded">P</span>
                                    )}
                                    <span className="text-gray-400">{scorer.time}'</span>
                                    <span className="text-white">{scorer.playerName}</span>
                                    <Circle className="w-4 h-4 text-green-500 fill-green-500" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Fouls/Cards */}
                {fouls.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="text-gray-400 text-sm mb-2">Recent Cards</div>
                        <div className="flex flex-wrap gap-2">
                            {fouls.slice(-5).map((foul, idx) => (
                                <div 
                                    key={idx}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                        foul.foulType === 'RED_CARD' ? 'bg-red-500/20 text-red-400' :
                                        foul.foulType === 'YELLOW_CARD' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-gray-700 text-gray-300'
                                    }`}
                                >
                                    {foul.foulType === 'RED_CARD' && <div className="w-3 h-4 bg-red-500 rounded-sm"></div>}
                                    {foul.foulType === 'YELLOW_CARD' && <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>}
                                    <span>{foul.playerName}</span>
                                    <span>({foul.team === 'A' ? teamA?.shortCode : teamB?.shortCode})</span>
                                    <span>{foul.gameTime}'</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FootballScoreboard;
