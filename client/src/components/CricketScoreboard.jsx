import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Professional Cricket Scoreboard Component
 * Features real player names, batting/bowling stats, and animated score updates
 */
const CricketScoreboard = ({ match, onUpdate, isAdmin = false }) => {
    const [showAnimation, setShowAnimation] = useState(null);
    const [previousScore, setPreviousScore] = useState(null);

    // Detect score changes for animations
    useEffect(() => {
        if (previousScore && match) {
            const currentTeam = match.battingTeam || 'A';
            const currentScore = match[`score${currentTeam}`]?.runs || 0;
            const prevScore = previousScore[`score${currentTeam}`]?.runs || 0;
            
            if (currentScore > prevScore) {
                const diff = currentScore - prevScore;
                if (diff === 4) setShowAnimation('FOUR');
                else if (diff === 6) setShowAnimation('SIX');
                else if (diff === 1) setShowAnimation('RUN');
                
                setTimeout(() => setShowAnimation(null), 2000);
            }
        }
        setPreviousScore(match ? { ...match } : null);
    }, [match?.scoreA?.runs, match?.scoreB?.runs]);

    if (!match) return null;

    const { 
        teamA, teamB, scoreA, scoreB, 
        currentInnings = 1, battingTeam = 'A',
        toss, squadA = [], squadB = [],
        currentBatsmen, currentBowler,
        target, requiredRunRate, currentRunRate,
        currentOverBalls = [], totalOvers = 20,
        status
    } = match;

    const battingScore = battingTeam === 'A' ? scoreA : scoreB;
    const bowlingScore = battingTeam === 'A' ? scoreB : scoreA;
    const battingTeamData = battingTeam === 'A' ? teamA : teamB;
    const bowlingTeamData = battingTeam === 'A' ? teamB : teamA;
    const battingSquad = battingTeam === 'A' ? squadA : squadB;
    const bowlingSquad = battingTeam === 'A' ? squadB : squadA;

    const overs = `${Math.floor(battingScore?.overs || 0)}.${battingScore?.balls || 0}`;
    const runRate = battingScore?.overs > 0 
        ? (battingScore?.runs / battingScore?.overs).toFixed(2) 
        : '0.00';

    return (
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Score Animation Overlay */}
            <AnimatePresence>
                {showAnimation && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-50 bg-black/60"
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: showAnimation === 'SIX' ? [0, 360] : 0 
                            }}
                            transition={{ duration: 0.5 }}
                            className={`text-6xl font-black ${
                                showAnimation === 'SIX' ? 'text-yellow-400' :
                                showAnimation === 'FOUR' ? 'text-green-400' :
                                'text-white'
                            }`}
                        >
                            {showAnimation === 'SIX' && '🔥 SIX! 🔥'}
                            {showAnimation === 'FOUR' && '💫 FOUR! 💫'}
                            {showAnimation === 'RUN' && '👍'}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Match Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-white/80 text-sm">
                            {currentInnings === 1 ? '1st Innings' : '2nd Innings'}
                        </span>
                        {status === 'LIVE' && (
                            <motion.span
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full"
                            >
                                LIVE
                            </motion.span>
                        )}
                    </div>
                    <div className="text-white/80 text-sm">
                        {match.matchCategory || 'Match'} • {totalOvers} Overs
                    </div>
                </div>
            </div>

            {/* Toss Info */}
            {toss?.winner && (
                <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-6 py-2 text-center">
                    <span className="text-yellow-400 text-sm">
                        🪙 {toss.winner?.shortCode || 'Team'} won the toss and chose to {toss.decision?.toLowerCase()}
                    </span>
                </div>
            )}

            {/* Main Score Display */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    {/* Batting Team */}
                    <div className="flex items-center gap-4">
                        {battingTeamData?.logo && (
                            <img 
                                src={battingTeamData.logo} 
                                alt={battingTeamData.shortCode}
                                className="w-16 h-16 object-contain rounded-lg bg-white/10 p-2"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {battingTeamData?.shortCode || 'Team'}
                            </h2>
                            <span className="text-gray-400 text-sm">Batting</span>
                        </div>
                    </div>

                    {/* Score */}
                    <motion.div 
                        key={battingScore?.runs}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-center"
                    >
                        <div className="text-5xl font-black text-white">
                            {battingScore?.runs || 0}
                            <span className="text-3xl text-gray-400">/{battingScore?.wickets || 0}</span>
                        </div>
                        <div className="text-gray-400 mt-1">
                            <span className="text-lg">{overs}</span>
                            <span className="text-sm ml-1">overs</span>
                        </div>
                    </motion.div>

                    {/* Run Rate */}
                    <div className="text-right">
                        <div className="text-gray-400 text-sm">Run Rate</div>
                        <div className="text-2xl font-bold text-green-400">{runRate}</div>
                        {currentInnings === 2 && target && (
                            <div className="mt-2">
                                <div className="text-gray-400 text-xs">Target: {target}</div>
                                <div className="text-yellow-400 text-xs">
                                    Need {target - (battingScore?.runs || 0)} from {(totalOvers * 6) - ((battingScore?.overs || 0) * 6 + (battingScore?.balls || 0))} balls
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Over Display */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <div className="text-gray-400 text-sm mb-2">This Over</div>
                    <div className="flex gap-2 flex-wrap">
                        {currentOverBalls.length > 0 ? (
                            currentOverBalls.map((ball, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                        ${ball === 'W' ? 'bg-red-500 text-white' :
                                          ball === '4' ? 'bg-green-500 text-white' :
                                          ball === '6' ? 'bg-yellow-500 text-black' :
                                          ball === 'Wd' || ball === 'Nb' ? 'bg-orange-500 text-white' :
                                          'bg-gray-700 text-white'
                                        }`}
                                >
                                    {ball}
                                </motion.div>
                            ))
                        ) : (
                            <span className="text-gray-500">New over</span>
                        )}
                    </div>
                </div>

                {/* Batsmen at Crease */}
                {(currentBatsmen?.striker || currentBatsmen?.nonStriker || battingSquad.filter(p => p.isCurrentBatsman).length > 0) && (
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                        <div className="text-gray-400 text-sm mb-3">Batsmen</div>
                        <div className="space-y-2">
                            {[currentBatsmen?.striker, currentBatsmen?.nonStriker].filter(Boolean).map((batsman, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex justify-between items-center p-2 rounded-lg ${
                                        batsman?.isOnStrike ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-700/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {batsman?.isOnStrike && (
                                            <span className="text-green-400 text-xl">🏏</span>
                                        )}
                                        <span className="text-white font-medium">
                                            {batsman?.playerName || 'Batsman'}
                                        </span>
                                        {batsman?.jerseyNumber && (
                                            <span className="text-gray-500 text-sm">#{batsman.jerseyNumber}</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-bold">{batsman?.runsScored || 0}</span>
                                        <span className="text-gray-400 text-sm ml-1">({batsman?.ballsFaced || 0})</span>
                                        <div className="text-xs text-gray-500">
                                            {batsman?.fours || 0}×4 {batsman?.sixes || 0}×6
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Current Bowler */}
                {currentBowler && (
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                        <div className="text-gray-400 text-sm mb-3">Bowler</div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <span className="text-blue-400 text-xl">🎯</span>
                                <span className="text-white font-medium">
                                    {currentBowler?.playerName || 'Bowler'}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-white font-bold">
                                    {currentBowler?.wicketsTaken || 0}/{currentBowler?.runsConceded || 0}
                                </span>
                                <span className="text-gray-400 text-sm ml-1">
                                    ({currentBowler?.oversBowled || 0}.{currentBowler?.ballsBowled % 6 || 0})
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Extras */}
                <div className="flex justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
                    <span>Extras: {
                        (battingScore?.extras?.wides || 0) + 
                        (battingScore?.extras?.noBalls || 0) + 
                        (battingScore?.extras?.byes || 0) + 
                        (battingScore?.extras?.legByes || 0)
                    }</span>
                    <span className="text-xs">
                        (W: {battingScore?.extras?.wides || 0}, 
                        NB: {battingScore?.extras?.noBalls || 0}, 
                        B: {battingScore?.extras?.byes || 0}, 
                        LB: {battingScore?.extras?.legByes || 0})
                    </span>
                </div>
            </div>

            {/* Partnership Info (if available) */}
            {currentBatsmen?.striker && currentBatsmen?.nonStriker && (
                <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-center">
                    <span className="text-gray-400 text-sm">
                        Partnership: {(currentBatsmen.striker.runsScored || 0) + (currentBatsmen.nonStriker.runsScored || 0)} runs
                    </span>
                </div>
            )}
        </div>
    );
};

export default CricketScoreboard;
