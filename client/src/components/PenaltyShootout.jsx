import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Penalty Shootout Mode for Knockout Matches
 * Tracks penalty kicks for both teams in football/hockey
 */
const PenaltyShootout = ({ match, onUpdate, disabled = false }) => {
    const [shootoutActive, setShootoutActive] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentTeam, setCurrentTeam] = useState('A');
    const [teamAKicks, setTeamAKicks] = useState([]);
    const [teamBKicks, setTeamBKicks] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [kickResult, setKickResult] = useState(null);

    // Load existing shootout data if available
    useEffect(() => {
        if (match?.penaltyShootout) {
            setShootoutActive(match.penaltyShootout.status === 'IN_PROGRESS' || match.penaltyShootout.status === 'COMPLETED');
            setTeamAKicks(match.penaltyShootout.teamA || []);
            setTeamBKicks(match.penaltyShootout.teamB || []);
            setCurrentRound(match.penaltyShootout.currentRound || 1);
        }
    }, [match]);

    const calculateScore = (kicks) => kicks.filter(k => k.scored).length;

    const teamAScore = calculateScore(teamAKicks);
    const teamBScore = calculateScore(teamBKicks);

    const startShootout = () => {
        setShootoutActive(true);
        setCurrentRound(1);
        setCurrentTeam('A');
        setTeamAKicks([]);
        setTeamBKicks([]);
        
        onUpdate?.({
            matchId: match._id,
            penaltyShootout: {
                status: 'IN_PROGRESS',
                teamA: [],
                teamB: [],
                currentRound: 1
            }
        });
    };

    const recordKick = (scored, savedBy = '', missType = '') => {
        const kick = {
            round: currentRound,
            scored,
            playerName: '',
            savedBy: scored ? '' : savedBy,
            missType: scored ? '' : missType, // 'SAVED', 'MISSED', 'HIT_POST'
            timestamp: new Date().toISOString()
        };

        if (currentTeam === 'A') {
            const newKicks = [...teamAKicks, kick];
            setTeamAKicks(newKicks);
            setCurrentTeam('B');
            
            updateShootout(newKicks, teamBKicks);
        } else {
            const newKicks = [...teamBKicks, kick];
            setTeamBKicks(newKicks);
            
            // Check if round is complete
            if (teamAKicks.length === newKicks.length) {
                setCurrentRound(currentRound + 1);
                
                // Check for winner after 5 rounds or sudden death
                checkWinner(teamAKicks, newKicks, currentRound);
            }
            
            setCurrentTeam('A');
            updateShootout(teamAKicks, newKicks);
        }

        // Show animation
        setKickResult(scored ? 'GOAL' : 'MISS');
        setTimeout(() => setKickResult(null), 2000);
    };

    const checkWinner = (kicksA, kicksB, round) => {
        const scoreA = calculateScore(kicksA);
        const scoreB = calculateScore(kicksB);

        // After 5 rounds
        if (round >= 5) {
            const remainingA = 5 - kicksA.length;
            const remainingB = 5 - kicksB.length;
            const maxPossibleA = scoreA + remainingA;
            const maxPossibleB = scoreB + remainingB;

            // Clear winner
            if (scoreA > maxPossibleB) {
                declareWinner('A', scoreA, scoreB);
            } else if (scoreB > maxPossibleA) {
                declareWinner('B', scoreA, scoreB);
            } else if (round === 5 && scoreA !== scoreB) {
                // After exactly 5 rounds, if scores are different
                declareWinner(scoreA > scoreB ? 'A' : 'B', scoreA, scoreB);
            }
        }

        // Sudden death after 5 rounds
        if (round > 5) {
            const lastIndexA = kicksA.length - 1;
            const lastIndexB = kicksB.length - 1;

            if (kicksA[lastIndexA]?.scored !== kicksB[lastIndexB]?.scored) {
                // One scored, one didn't in sudden death
                const winner = kicksA[lastIndexA]?.scored ? 'A' : 'B';
                declareWinner(winner, scoreA, scoreB);
            }
        }
    };

    const declareWinner = (team, scoreA, scoreB) => {
        setShootoutActive(false);
        setShowResultModal(true);
        
        onUpdate?.({
            matchId: match._id,
            status: 'COMPLETED',
            winner: team === 'A' ? match.teamA._id : match.teamB._id,
            penaltyShootout: {
                status: 'COMPLETED',
                teamA: teamAKicks,
                teamB: teamBKicks,
                currentRound,
                winner: team,
                finalScore: { A: scoreA, B: scoreB }
            }
        });
    };

    const KickButton = ({ label, scored, icon, color, missType, savedBy }) => (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => recordKick(scored, savedBy, missType)}
            disabled={disabled || !shootoutActive}
            className={`${color} text-white font-bold py-4 px-6 rounded-xl 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-lg hover:shadow-xl`}
        >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-sm">{label}</div>
        </motion.button>
    );

    return (
        <div className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>⚽</span>
                    Penalty Shootout
                </h3>
                {!shootoutActive ? (
                    <button
                        onClick={startShootout}
                        disabled={disabled || match?.status === 'COMPLETED'}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 
                                   hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600
                                   text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg"
                    >
                        🥅 Start Shootout
                    </button>
                ) : (
                    <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm">
                        ROUND {currentRound} • {currentTeam === 'A' ? match.teamA?.shortCode : match.teamB?.shortCode}'s Turn
                    </div>
                )}
            </div>

            {/* Kick Result Animation */}
            <AnimatePresence>
                {kickResult && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none`}
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 360, 0]
                            }}
                            transition={{ duration: 0.6 }}
                            className={`text-8xl font-black ${
                                kickResult === 'GOAL' 
                                    ? 'text-green-400' 
                                    : 'text-red-400'
                            }`}
                        >
                            {kickResult === 'GOAL' ? '⚽ GOAL!' : '❌ MISS!'}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scoreboard */}
            <div className="grid grid-cols-3 gap-4 items-center mb-6">
                {/* Team A */}
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">{match.teamA?.shortCode}</div>
                    <motion.div 
                        key={teamAScore}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-black text-indigo-400"
                    >
                        {teamAScore}
                    </motion.div>
                    <div className="flex gap-1 justify-center mt-2 flex-wrap">
                        {teamAKicks.map((kick, idx) => (
                            <div
                                key={idx}
                                className={`w-6 h-6 rounded-full ${
                                    kick.scored ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                title={kick.scored ? 'Goal' : kick.missType}
                            />
                        ))}
                    </div>
                </div>

                {/* VS */}
                <div className="text-4xl font-black text-gray-600 text-center">VS</div>

                {/* Team B */}
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">{match.teamB?.shortCode}</div>
                    <motion.div 
                        key={teamBScore}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-black text-pink-400"
                    >
                        {teamBScore}
                    </motion.div>
                    <div className="flex gap-1 justify-center mt-2 flex-wrap">
                        {teamBKicks.map((kick, idx) => (
                            <div
                                key={idx}
                                className={`w-6 h-6 rounded-full ${
                                    kick.scored ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                title={kick.scored ? 'Goal' : kick.missType}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Kick Recording Buttons */}
            {shootoutActive && (
                <div className="space-y-3">
                    <div className="text-center text-gray-400 text-sm mb-2">
                        Record penalty kick result:
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <KickButton 
                            label="GOAL" 
                            scored={true} 
                            icon="⚽" 
                            color="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                        />
                        <KickButton 
                            label="SAVED" 
                            scored={false} 
                            icon="🧤" 
                            color="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                            missType="SAVED"
                            savedBy="Goalkeeper"
                        />
                        <KickButton 
                            label="MISSED" 
                            scored={false} 
                            icon="➡️" 
                            color="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                            missType="MISSED"
                        />
                        <KickButton 
                            label="HIT POST" 
                            scored={false} 
                            icon="🎯" 
                            color="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                            missType="HIT_POST"
                        />
                    </div>
                </div>
            )}

            {/* Current Round Info */}
            {shootoutActive && (
                <div className="mt-4 text-center text-sm text-gray-400">
                    {currentRound <= 5 ? (
                        `Round ${currentRound} of 5 (Best of 5)`
                    ) : (
                        `⚡ SUDDEN DEATH - Round ${currentRound}`
                    )}
                </div>
            )}

            {/* Winner Modal */}
            <AnimatePresence>
                {showResultModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowResultModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-8 max-w-md text-center"
                        >
                            <div className="text-6xl mb-4">🏆</div>
                            <h2 className="text-3xl font-black text-black mb-2">
                                {teamAScore > teamBScore ? match.teamA?.name : match.teamB?.name}
                            </h2>
                            <div className="text-xl font-bold text-black/80 mb-4">
                                WINS ON PENALTIES!
                            </div>
                            <div className="text-4xl font-black text-black mb-6">
                                {teamAScore} - {teamBScore}
                            </div>
                            <button
                                onClick={() => setShowResultModal(false)}
                                className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800"
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

export default PenaltyShootout;
