import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Hand, Footprints, Play, Zap, AlertTriangle, RefreshCw, ArrowRight, Users } from 'lucide-react';

/**
 * Advanced Cricket Admin Controls
 * - Switch batsmen (striker/non-striker)
 * - Select dismissal types with proper outBy handling
 * - Manage current bowler
 * - End over
 * - Fall of wickets tracking
 */
const CricketAdminControls = ({ match, onUpdate }) => {
    const [showDismissalModal, setShowDismissalModal] = useState(false);
    const [showBowlerModal, setShowBowlerModal] = useState(false);
    const [showBatsmanModal, setShowBatsmanModal] = useState(false);
    const [loading, setLoading] = useState(null);
    const [selectedDismissalType, setSelectedDismissalType] = useState('BOWLED');
    const [selectedCatcher, setSelectedCatcher] = useState('');
    const [selectedBowler, setSelectedBowler] = useState('');

    if (!match) return null;

    const {
        teamA, teamB, scoreA, scoreB,
        battingTeam = 'A', currentInnings = 1,
        squadA = [], squadB = [],
        currentBatsmen, currentBowler,
        innings = []
    } = match;

    const battingSquad = battingTeam === 'A' ? squadA : squadB;
    const bowlingSquad = battingTeam === 'A' ? squadB : squadA;
    const battingTeamData = battingTeam === 'A' ? teamA : teamB;
    const bowlingTeamData = battingTeam === 'A' ? teamB : teamA;

    // Debug logging
    console.log('🏏 CricketAdminControls render:', {
        striker: currentBatsmen?.striker?.playerName,
        nonStriker: currentBatsmen?.nonStriker?.playerName,
        matchId: match._id
    });

    // Check if squads are configured
    const hasSquads = battingSquad.length > 0 && bowlingSquad.length > 0;

    // Get batsmen who haven't batted yet or are not currently batting
    const availableBatsmen = useMemo(() => {
        return battingSquad.filter(p => {
            const playerName = p.playerName || p.name;
            const isCurrentStriker = currentBatsmen?.striker?.playerName === playerName;
            const isCurrentNonStriker = currentBatsmen?.nonStriker?.playerName === playerName;
            return !p.isOut && !isCurrentStriker && !isCurrentNonStriker && playerName;
        });
    }, [battingSquad, currentBatsmen, match._id, squadA, squadB]);

    // Get bowlers (all bowlers are available except current)
    const availableBowlers = useMemo(() => {
        return bowlingSquad.filter(p => {
            const playerName = p.playerName || p.name;
            const isCurrentBowler = currentBowler?.playerName === playerName;
            return !isCurrentBowler && playerName;
        });
    }, [bowlingSquad, currentBowler, match._id, squadA, squadB]);

    const dismissalTypes = [
        { value: 'BOWLED', label: 'Bowled', Icon: Target, needsCatcher: false },
        { value: 'CAUGHT', label: 'Caught', Icon: Hand, needsCatcher: true },
        { value: 'LBW', label: 'LBW', Icon: Footprints, needsCatcher: false },
        { value: 'RUN_OUT', label: 'Run Out', Icon: Play, needsCatcher: true },
        { value: 'STUMPED', label: 'Stumped', Icon: Hand, needsCatcher: true },
        { value: 'HIT_WICKET', label: 'Hit Wicket', Icon: Target, needsCatcher: false },
        { value: 'RETIRED', label: 'Retired Hurt', Icon: Users, needsCatcher: false },
    ];

    const handleUpdate = async (key, payload) => {
        setLoading(key);
        try {
            await onUpdate(payload);
            // Close modal immediately after successful update so user can see changes
            if (key === 'select-batsman') {
                setShowBatsmanModal(false);
            } else if (key === 'select-bowler') {
                setShowBowlerModal(false);
            } else if (key === 'dismissal') {
                setShowDismissalModal(false);
            }
        } catch (error) {
            console.error('Failed to update:', error);
            alert('Failed to update. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    // Switch striker and non-striker
    const handleSwitchStrike = () => {
        handleUpdate('switch-strike', { matchId: match._id, switchStrike: true });
    };

    // End current over
    const handleEndOver = () => {
        handleUpdate('end-over', { matchId: match._id, endOver: true });
    };

    // Swap innings
    const handleSwapInnings = () => {
        handleUpdate('swap-innings', { matchId: match._id, swapInnings: true });
    };

    // Record dismissal with proper type
    const handleRecordDismissal = () => {
        const dismissalInfo = dismissalTypes.find(d => d.value === selectedDismissalType);
        let outBy = '';
        
        if (selectedDismissalType === 'CAUGHT') {
            outBy = `${selectedCatcher}|${currentBowler?.playerName || selectedBowler}`;
        } else if (selectedDismissalType === 'STUMPED') {
            outBy = `${selectedCatcher}|${currentBowler?.playerName || selectedBowler}`;
        } else if (selectedDismissalType === 'RUN_OUT') {
            outBy = selectedCatcher;
        } else {
            outBy = currentBowler?.playerName || selectedBowler;
        }

        handleUpdate('dismissal', {
            matchId: match._id,
            team: battingTeam,
            isWicket: true,
            outType: selectedDismissalType,
            outBy: outBy,
            dismissedBatsman: currentBatsmen?.striker?.playerId
        });

        setShowDismissalModal(false);
        setSelectedCatcher('');
    };

    // Select new batsman
    const handleSelectBatsman = (player, position) => {
        handleUpdate('select-batsman', {
            matchId: match._id,
            selectBatsman: {
                playerId: player._id || player.playerId,
                playerName: player.name || player.playerName,
                position: position // 'striker' or 'nonStriker'
            }
        });
    };

    // Select bowler
    const handleSelectBowler = (player) => {
        handleUpdate('select-bowler', {
            matchId: match._id,
            selectBowler: {
                bowlerId: player._id || player.playerId,
                bowlerName: player.name || player.playerName
            }
        });
    };

    const btnClass = (color = 'bg-slate-700') => 
        `${color} text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md 
        transition-all hover:brightness-110 active:scale-95 disabled:opacity-50
        flex items-center justify-center gap-2`;

    return (
        <div className="space-y-4">
            {/* No Squad Warning */}
            {!hasSquads && (
                <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-400 font-bold mb-1">
                        <AlertTriangle className="w-5 h-5" />
                        No Squad Configured
                    </div>
                    <div className="text-amber-300/70 text-sm">
                        Add player names using the "Add Players" button to enable full scorecard features.
                    </div>
                </div>
            )}

            {/* Current Status Header */}
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-4 border border-green-500/30">
                <div className="text-xs text-green-400 uppercase tracking-wider font-bold mb-2">
                    {battingTeamData?.name || battingTeamData?.shortCode || 'Team'} Batting • {currentInnings === 1 ? '1st' : '2nd'} Innings
                </div>
                
                {/* Current Batsmen */}
                <div className="grid grid-cols-2 gap-4 mb-4" key={`batsmen-${currentBatsmen?.striker?.playerName}-${currentBatsmen?.nonStriker?.playerName}`}>
                    <div className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                            <Zap className="w-3 h-3" /> STRIKER
                        </div>
                        <div className="text-white font-bold text-lg">
                            {currentBatsmen?.striker?.playerName || 'Not Selected'}
                        </div>
                        {currentBatsmen?.striker && (
                            <div className="text-slate-400 text-xs mt-1">
                                {currentBatsmen.striker.runsScored || 0}({currentBatsmen.striker.ballsFaced || 0})
                            </div>
                        )}
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                            <Play className="w-3 h-3" /> NON-STRIKER
                        </div>
                        <div className="text-white font-bold text-lg">
                            {currentBatsmen?.nonStriker?.playerName || 'Not Selected'}
                        </div>
                        {currentBatsmen?.nonStriker && (
                            <div className="text-slate-400 text-xs mt-1">
                                {currentBatsmen.nonStriker.runsScored || 0}({currentBatsmen.nonStriker.ballsFaced || 0})
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Bowler */}
                <div className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-blue-400 font-bold">
                        <Target className="w-3 h-3" /> CURRENT BOWLER
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-white font-bold text-lg">
                            {currentBowler?.playerName || 'Not Selected'}
                        </div>
                        {currentBowler && (
                            <div className="text-slate-400 text-sm">
                                {currentBowler.oversBowled || 0}-{currentBowler.maidens || 0}-{currentBowler.runsConceded || 0}-{currentBowler.wicketsTaken || 0}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Switch Strike */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSwitchStrike}
                    disabled={loading === 'switch-strike'}
                    className={btnClass('bg-indigo-600')}
                >
                    <RefreshCw className="w-4 h-4" />
                    Switch Strike
                </motion.button>

                {/* End Over */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEndOver}
                    disabled={loading === 'end-over'}
                    className={btnClass('bg-purple-600')}
                >
                    <ArrowRight className="w-4 h-4" />
                    End Over
                </motion.button>

                {/* Select Batsman */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBatsmanModal(true)}
                    className={btnClass('bg-green-600')}
                >
                    <Target className="w-4 h-4" />
                    Select Batsman
                </motion.button>

                {/* Select Bowler */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBowlerModal(true)}
                    className={btnClass('bg-blue-600')}
                >
                    <Target className="w-4 h-4" />
                    Change Bowler
                </motion.button>

                {/* Dismissal with Details */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDismissalModal(true)}
                    className={btnClass('bg-red-600 col-span-2')}
                >
                    🚨 Record Wicket with Details
                </motion.button>

                {/* Swap Innings */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSwapInnings}
                    disabled={loading === 'swap-innings'}
                    className={btnClass('bg-amber-600 col-span-2')}
                >
                    🔃 Swap Innings (All Out / Overs Complete)
                </motion.button>
            </div>

            {/* Dismissal Modal */}
            <AnimatePresence>
                {showDismissalModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDismissalModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Record Dismissal</h3>
                            
                            {/* Dismissed Batsman */}
                            <div className="mb-4">
                                <label className="text-xs text-slate-400 block mb-1">Dismissed Batsman</label>
                                <div className="bg-red-500/20 text-red-300 p-3 rounded-lg font-bold">
                                    {currentBatsmen?.striker?.playerName || 'Striker'}
                                </div>
                            </div>

                            {/* Dismissal Type */}
                            <div className="mb-4">
                                <label className="text-xs text-slate-400 block mb-2">Dismissal Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {dismissalTypes.map(dt => (
                                        <button
                                            key={dt.value}
                                            onClick={() => setSelectedDismissalType(dt.value)}
                                            className={`p-3 rounded-lg text-sm font-bold transition-all ${
                                                selectedDismissalType === dt.value
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {dt.icon} {dt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fielder/Catcher (if needed) */}
                            {dismissalTypes.find(d => d.value === selectedDismissalType)?.needsCatcher && (
                                <div className="mb-4">
                                    <label className="text-xs text-slate-400 block mb-2">
                                        {selectedDismissalType === 'RUN_OUT' ? 'Fielder' : 'Catcher/Keeper'}
                                    </label>
                                    <select
                                        value={selectedCatcher}
                                        onChange={(e) => setSelectedCatcher(e.target.value)}
                                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700"
                                    >
                                        <option value="">Select Player</option>
                                        {bowlingSquad.map(p => (
                                            <option key={p._id || p.playerId} value={p.name || p.playerName}>
                                                {p.name || p.playerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Bowler (for bowled, caught, lbw, stumped, hit wicket) */}
                            {['BOWLED', 'CAUGHT', 'LBW', 'STUMPED', 'HIT_WICKET'].includes(selectedDismissalType) && !currentBowler && (
                                <div className="mb-4">
                                    <label className="text-xs text-slate-400 block mb-2">Bowler</label>
                                    <select
                                        value={selectedBowler}
                                        onChange={(e) => setSelectedBowler(e.target.value)}
                                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700"
                                    >
                                        <option value="">Select Bowler</option>
                                        {bowlingSquad.map(p => (
                                            <option key={p._id || p.playerId} value={p.name || p.playerName}>
                                                {p.name || p.playerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDismissalModal(false)}
                                    className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRecordDismissal}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold"
                                >
                                    Confirm Wicket
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Select Batsman Modal */}
            <AnimatePresence>
                {showBatsmanModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowBatsmanModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-slate-700"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Select Next Batsman</h3>
                            <p className="text-sm text-slate-400 mb-4">Choose position for the batsman</p>
                            
                            {availableBatsmen.length > 0 ? (
                                <div className="space-y-3">
                                    {availableBatsmen.map(player => (
                                        <div key={player._id || player.playerId} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <div className="text-white font-bold text-lg">
                                                        {player.name || player.playerName}
                                                    </div>
                                                    {player.jerseyNumber && (
                                                        <div className="text-xs text-slate-500">
                                                            #{player.jerseyNumber}
                                                        </div>
                                                    )}
                                                </div>
                                                {player.role && (
                                                    <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full font-bold">
                                                        {player.role === 'WICKET_KEEPER' ? 'WK' : 
                                                         player.role === 'ALL_ROUNDER' ? 'AR' :
                                                         player.role === 'BATSMAN' ? 'BAT' :
                                                         player.role === 'BOWLER' ? 'BOWL' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => handleSelectBatsman(player, 'striker')}
                                                    disabled={loading === 'select-batsman'}
                                                    className="py-3 px-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    {loading === 'select-batsman' ? (
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Zap className="w-4 h-4" />
                                                            Striker
                                                        </>
                                                    )}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => handleSelectBatsman(player, 'nonStriker')}
                                                    disabled={loading === 'select-batsman'}
                                                    className="py-3 px-4 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    {loading === 'select-batsman' ? (
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4" />
                                                            Non-Striker
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-8 bg-slate-800/50 rounded-xl">
                                    <Target className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                                    <div>No batsmen available</div>
                                    <div className="text-xs mt-1">All players are either batting or out</div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowBatsmanModal(false)}
                                className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Select Bowler Modal */}
            <AnimatePresence>
                {showBowlerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowBowlerModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto border border-slate-700"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Select Bowler</h3>
                            
                            {availableBowlers.length > 0 ? (
                                <div className="space-y-2">
                                    {availableBowlers.map(player => (
                                        <motion.button
                                            key={player._id || player.playerId}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelectBowler(player)}
                                            disabled={loading === 'select-bowler'}
                                            className="w-full p-4 bg-slate-800 hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-left transition-colors border border-slate-700 hover:border-blue-500"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-bold">
                                                        {player.name || player.playerName}
                                                    </span>
                                                    {loading === 'select-bowler' && (
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                </div>
                                                {player.oversBowled > 0 && (
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {player.oversBowled}-{player.maidens || 0}-{player.runsConceded || 0}-{player.wicketsTaken || 0}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-8">
                                    No bowlers available
                                </div>
                            )}

                            <button
                                onClick={() => setShowBowlerModal(false)}
                                className="w-full mt-4 py-3 bg-slate-700 text-white rounded-lg font-bold"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CricketAdminControls;
