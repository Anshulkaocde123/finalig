import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Toss Display Component - Shows which team won the toss and their decision
 * Used for cricket matches and other sports with toss/coin flip
 */
const TossDisplay = ({ 
    match, 
    onSetToss, 
    isAdmin = false,
    compact = false 
}) => {
    const toss = match?.toss;
    const teamA = match?.teamA;
    const teamB = match?.teamB;

    // Decision options based on sport
    const getDecisionOptions = (sport) => {
        switch (sport) {
            case 'CRICKET':
                return [
                    { value: 'BAT', label: 'Bat First', icon: '🏏' },
                    { value: 'BOWL', label: 'Bowl First', icon: '⚾' }
                ];
            case 'FOOTBALL':
            case 'HOCKEY':
                return [
                    { value: 'KICK_OFF', label: 'Kick Off', icon: '⚽' },
                    { value: 'CHOOSE_SIDE', label: 'Choose Side', icon: '🔀' }
                ];
            case 'BASKETBALL':
                return [
                    { value: 'FIRST_POSSESSION', label: 'First Possession', icon: '🏀' },
                    { value: 'CHOOSE_SIDE', label: 'Choose Side', icon: '🔀' }
                ];
            case 'VOLLEYBALL':
            case 'BADMINTON':
                return [
                    { value: 'SERVE', label: 'Serve First', icon: '🏐' },
                    { value: 'CHOOSE_SIDE', label: 'Choose Side', icon: '🔀' }
                ];
            default:
                return [
                    { value: 'FIRST', label: 'Go First', icon: '1️⃣' },
                    { value: 'CHOOSE_SIDE', label: 'Choose Side', icon: '🔀' }
                ];
        }
    };

    const decisionOptions = getDecisionOptions(match?.sport);

    const handleSetToss = (winnerId, decision) => {
        onSetToss?.({
            winner: winnerId,
            decision,
            timestamp: new Date().toISOString()
        });
    };

    // Compact display for headers/summaries
    if (compact && toss?.winner) {
        // Convert IDs to strings for comparison
        const tossWinnerId = toss.winner?._id?.toString() || toss.winner?.toString();
        const teamAId = teamA?._id?.toString();
        const teamBId = teamB?._id?.toString();
        const winnerTeam = tossWinnerId === teamAId ? teamA : teamB;
        const decisionLabel = decisionOptions.find(d => d.value === toss.decision)?.label || toss.decision;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm"
            >
                <span>🪙</span>
                <span>{winnerTeam?.shortCode || 'Team'} won the toss</span>
                <span>•</span>
                <span>{decisionLabel}</span>
            </motion.div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🪙</span>
                    Toss Information
                </h3>
                {toss?.winner && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Completed
                    </span>
                )}
            </div>

            <AnimatePresence mode="wait">
                {toss?.winner ? (
                    // Toss Result Display
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center"
                    >
                        {/* Winner Display */}
                        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl p-4 mb-4">
                            <div className="text-yellow-400 text-sm mb-2">Toss Winner</div>
                            <div className="flex items-center justify-center gap-3">
                                {(() => {
                                    const tossWinnerId = toss.winner?._id?.toString() || toss.winner?.toString();
                                    const teamAId = teamA?._id?.toString();
                                    const teamBId = teamB?._id?.toString();
                                    const winnerTeam = tossWinnerId === teamAId ? teamA : teamB;
                                    
                                    return (
                                        <>
                                            {winnerTeam?.logo && (
                                                <img 
                                                    src={winnerTeam.logo}
                                                    alt="Winner"
                                                    className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1"
                                                />
                                            )}
                                            <div>
                                                <div className="text-2xl font-bold text-white">
                                                    {winnerTeam?.shortCode || 'Team'}
                                                </div>
                                                <div className="text-gray-400 text-sm">
                                                    {winnerTeam?.name}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Decision Display */}
                        <div className="bg-gray-900/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Decision</div>
                            <div className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                                <span>
                                    {decisionOptions.find(d => d.value === toss.decision)?.icon || '🎯'}
                                </span>
                                <span>
                                    {decisionOptions.find(d => d.value === toss.decision)?.label || toss.decision}
                                </span>
                            </div>
                        </div>

                        {/* Admin Reset Button */}
                        {isAdmin && onSetToss && (
                            <button
                                onClick={() => onSetToss(null)}
                                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Reset Toss
                            </button>
                        )}
                    </motion.div>
                ) : isAdmin && onSetToss ? (
                    // Admin Toss Selection
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="text-center text-gray-400 mb-4">
                            Select toss winner and their decision
                        </div>

                        {/* Team Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {[
                                { team: teamA, id: teamA?._id, key: 'teamA' },
                                { team: teamB, id: teamB?._id, key: 'teamB' }
                            ].map(({ team, id, key }) => (
                                <div key={key} className="space-y-2">
                                    <div 
                                        className="bg-gray-900/50 rounded-xl p-4 text-center cursor-pointer
                                                   hover:bg-gray-700/50 transition-colors border-2 border-transparent
                                                   hover:border-blue-500"
                                    >
                                        {team?.logo && (
                                            <img 
                                                src={team.logo}
                                                alt={team.shortCode}
                                                className="w-16 h-16 object-contain mx-auto mb-2 rounded-lg bg-white/10 p-2"
                                            />
                                        )}
                                        <div className="text-white font-semibold">{team?.shortCode}</div>
                                        <div className="text-gray-400 text-xs">{team?.name}</div>
                                    </div>
                                    
                                    {/* Decision buttons */}
                                    <div className="space-y-2">
                                        {decisionOptions.map(option => (
                                            <motion.button
                                                key={`${key}-${option.value}`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSetToss(id, option.value)}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white 
                                                           py-2 px-3 rounded-lg text-sm font-medium
                                                           flex items-center justify-center gap-2"
                                            >
                                                <span>{option.icon}</span>
                                                <span>{option.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    // No toss yet (public view)
                    <motion.div
                        key="pending"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-4"
                    >
                        <div className="text-gray-400">
                            <span className="text-4xl mb-2 block">🪙</span>
                            Toss not yet conducted
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TossDisplay;
