import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw, ServerCog } from 'lucide-react';

const BadmintonAdminControls = ({ match, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const { currentSet, scoreA, scoreB, currentServer, maxSets = 3 } = match;

    const handlePointUpdate = async (team, increment) => {
        if (!currentSet) {
            // Start first set
            await handleUpdate({
                action: 'startSet',
                setNumber: 1
            });
            // Then add the point
            setTimeout(() => {
                handleUpdate({
                    action: 'updateSetPoints',
                    team,
                    points: increment
                });
            }, 100);
            return;
        }

        await handleUpdate({
            action: 'updateSetPoints',
            team,
            points: increment
        });
    };

    const handleUpdate = async (payload) => {
        setLoading(true);
        try {
            await onUpdate(payload);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleServer = () => {
        handleUpdate({
            action: 'toggleServer'
        });
    };

    const handleWinSet = async (team) => {
        if (!currentSet) return;
        
        await handleUpdate({
            action: 'endSet',
            winner: team,
            finalPointsA: currentSet.pointsA || 0,
            finalPointsB: currentSet.pointsB || 0
        });
    };

    const handleNewSet = () => {
        const nextSetNumber = (scoreA + scoreB + 1);
        handleUpdate({
            action: 'startSet',
            setNumber: nextSetNumber
        });
    };

    const setsToWin = Math.ceil(maxSets / 2);
    const canStartNewSet = !currentSet && match.status === 'LIVE' && (scoreA < setsToWin && scoreB < setsToWin);

    return (
        <div className="space-y-4">
            {/* Current Set Info */}
            {currentSet && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-blue-700">
                            Current Set: {(scoreA + scoreB + 1)} of {maxSets}
                        </span>
                        <button
                            onClick={handleToggleServer}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-all text-white"
                        >
                            <ServerCog className="w-4 h-4" />
                            <span className="text-xs font-semibold">
                                Server: {currentServer || 'A'}
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-4 justify-center items-center text-gray-900">
                        <div className="text-3xl font-bold">{currentSet.pointsA || 0}</div>
                        <div className="text-xl text-gray-400">-</div>
                        <div className="text-3xl font-bold">{currentSet.pointsB || 0}</div>
                    </div>
                </div>
            )}

            {/* Point Controls */}
            <div className="grid grid-cols-2 gap-4">
                {/* Team A Controls */}
                <div className="space-y-3">
                    <div className="text-center">
                        <div className="text-sm font-semibold text-blue-600 mb-2">
                            {match.teamA?.shortCode || 'Team A'}
                        </div>
                        <div className="text-4xl font-bold text-white">
                            {scoreA || 0}
                        </div>
                        <div className="text-xs text-gray-400">Sets Won</div>
                    </div>

                    <div className="space-y-2">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePointUpdate('A', 1)}
                            disabled={loading || !currentSet}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Point
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePointUpdate('A', -1)}
                            disabled={loading || !currentSet || (currentSet.pointsA || 0) === 0}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold 
                                     flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed 
                                     transition-all border border-gray-600"
                        >
                            <Minus className="w-4 h-4" />
                            Undo
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleWinSet('A')}
                            disabled={loading || !currentSet || (currentSet.pointsA || 0) < 21}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            Win Set
                        </motion.button>
                    </div>
                </div>

                {/* Team B Controls */}
                <div className="space-y-3">
                    <div className="text-center">
                        <div className="text-sm font-semibold text-red-600 mb-2">
                            {match.teamB?.shortCode || 'Team B'}
                        </div>
                        <div className="text-4xl font-bold text-white">
                            {scoreB || 0}
                        </div>
                        <div className="text-xs text-gray-400">Sets Won</div>
                    </div>

                    <div className="space-y-2">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePointUpdate('B', 1)}
                            disabled={loading || !currentSet}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Point
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePointUpdate('B', -1)}
                            disabled={loading || !currentSet || (currentSet.pointsB || 0) === 0}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold 
                                     flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed 
                                     transition-all border border-gray-600"
                        >
                            <Minus className="w-4 h-4" />
                            Undo
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleWinSet('B')}
                            disabled={loading || !currentSet || (currentSet.pointsB || 0) < 21}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            Win Set
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* New Set Button */}
            {canStartNewSet && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewSet}
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    <RotateCcw className="w-5 h-5" />
                    Start Set {(scoreA + scoreB + 1)}
                </motion.button>
            )}

            {/* Match Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <div className="text-gray-400 text-xs">Sets to Win</div>
                        <div className="text-white font-semibold">{setsToWin}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">Format</div>
                        <div className="text-white font-semibold">Best of {maxSets}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">Server</div>
                        <div className="text-white font-semibold flex items-center justify-center gap-1">
                            {currentServer === 'A' ? (
                                <span className="text-blue-400">{match.teamA?.shortCode}</span>
                            ) : (
                                <span className="text-red-400">{match.teamB?.shortCode}</span>
                            )}
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadmintonAdminControls;
