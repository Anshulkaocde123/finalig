import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Radio } from 'lucide-react';

// Professional redesign - clean icons, no emojis
const BadmintonScoreboard = ({ match }) => {
    const { scoreA, scoreB, currentSet, setDetails = [], maxSets = 3, currentServer } = match;
    const [showSetHistory, setShowSetHistory] = useState(false);
    
    const setsToWin = Math.ceil(maxSets / 2);
    const isMatchPoint = currentSet && (
        (currentSet.pointsA >= 20 && currentSet.pointsA - currentSet.pointsB >= 1) ||
        (currentSet.pointsB >= 20 && currentSet.pointsB - currentSet.pointsA >= 1)
    );
    
    const isDeuce = currentSet && currentSet.pointsA >= 20 && currentSet.pointsB >= 20;
    
    return (
        <div className="space-y-4">
            {/* Main Scoreboard */}
            <div className="rounded-lg border overflow-hidden shadow-lg bg-white border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-white" />
                        <div>
                            <h3 className="font-bold text-white text-xl">BADMINTON</h3>
                            <p className="text-white/80 text-xs">Best of {maxSets}</p>
                        </div>
                    </div>
                    {match.status === 'LIVE' && (
                        <div className="flex items-center gap-2 bg-red-600/90 px-4 py-2 rounded-md">
                            <Radio className="w-4 h-4 text-white animate-pulse" />
                            <span className="text-white text-sm font-semibold">LIVE</span>
                        </div>
                    )}
                </div>

                {/* Sets Score */}
                <div className="p-8">
                    <div className="flex items-center justify-center gap-12 mb-8">
                        {/* Team A */}
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-sm font-semibold mb-2 uppercase tracking-wide text-blue-600">
                                {match.teamA?.shortCode || 'Team A'}
                            </div>
                            <div className="relative">
                                <div className="text-8xl font-extrabold text-blue-600">
                                    {scoreA || 0}
                                </div>
                                {currentServer === 'A' && match.status === 'LIVE' && (
                                    <div className="absolute -right-4 top-0">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs mt-1 text-gray-500">
                                Sets Won
                            </div>
                        </motion.div>

                        <div className="text-5xl font-bold text-gray-300">-</div>

                        {/* Team B */}
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-sm font-semibold mb-2 uppercase tracking-wide text-red-600">
                                {match.teamB?.shortCode || 'Team B'}
                            </div>
                            <div className="relative">
                                <div className="text-8xl font-extrabold text-red-600">
                                    {scoreB || 0}
                                </div>
                                {currentServer === 'B' && match.status === 'LIVE' && (
                                    <div className="absolute -right-4 top-0">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs mt-1 text-gray-500">
                                Sets Won
                            </div>
                        </motion.div>
                    </div>

                    {/* Current Game Score */}
                    {currentSet && match.status === 'LIVE' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-lg border ${
                                isMatchPoint 
                                    ? 'bg-yellow-50 border-yellow-300' 
                                    : isDeuce
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold uppercase text-gray-600">
                                    Current Game - Set {(scoreA + scoreB + 1)}
                                </span>
                                {isMatchPoint && (
                                    <span className="text-xs font-bold text-yellow-600">
                                        MATCH POINT
                                    </span>
                                )}
                                {isDeuce && !isMatchPoint && (
                                    <span className="text-xs font-bold text-blue-600">
                                        DEUCE
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-center gap-12 items-center">
                                <div className="text-center">
                                    <div className="text-5xl font-extrabold text-blue-600">
                                        {currentSet.pointsA || 0}
                                    </div>
                                </div>
                                <div className="text-3xl text-gray-300">-</div>
                                <div className="text-center">
                                    <div className="text-5xl font-extrabold text-red-600">
                                        {currentSet.pointsB || 0}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Set History Button */}
                    {setDetails.length > 0 && (
                        <button
                            onClick={() => setShowSetHistory(!showSetHistory)}
                            className="mt-4 w-full py-3 rounded-lg font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                        >
                            {showSetHistory ? '▲ Hide Set History' : '▼ View Set History'}
                        </button>
                    )}
                </div>
            </div>

            {/* Set History */}
            <AnimatePresence>
                {showSetHistory && setDetails.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg border overflow-hidden bg-white border-gray-200"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900">
                                Set History
                            </h4>
                        </div>
                        <div className="p-4 space-y-2">
                            {setDetails.map((set, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border bg-gray-50 border-gray-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-600">
                                            Set {index + 1}
                                        </span>
                                        <div className="flex gap-4 items-center">
                                            <span className={`text-2xl font-bold ${
                                                set.pointsA > set.pointsB ? 'text-blue-600' : 'text-gray-400'
                                            }`}>
                                                {set.pointsA}
                                            </span>
                                            <span className="text-xl text-gray-300">-</span>
                                            <span className={`text-2xl font-bold ${
                                                set.pointsB > set.pointsA ? 'text-red-600' : 'text-gray-400'
                                            }`}>
                                                {set.pointsB}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Match Info */}
            <div className="rounded-lg border p-4 bg-white border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className={`text-sm font-semibold ${
                            match.status === 'LIVE' ? 'text-green-600' : 
                            match.status === 'COMPLETED' ? 'text-blue-600' : 
                            'text-yellow-600'
                        }`}>
                            {match.status}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Sets to Win</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {setsToWin}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Format</div>
                        <div className="text-sm font-semibold text-gray-900">
                            Best of {maxSets}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadmintonScoreboard;
