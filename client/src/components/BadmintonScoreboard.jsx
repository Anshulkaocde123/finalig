import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BadmintonScoreboard = ({ match, isDarkMode = false }) => {
    const { scoreA, scoreB, currentSet, setDetails = [], maxSets = 3, server } = match;
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
            <div className={`backdrop-blur-xl rounded-3xl border overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-white/10' : 'bg-white border-gray-200'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">🏸</span>
                        <div>
                            <h3 className="font-black text-white text-xl">BADMINTON</h3>
                            <p className="text-white/70 text-xs">Best of {maxSets}</p>
                        </div>
                    </div>
                    {match.status === 'LIVE' && (
                        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-400/30">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-bold">LIVE</span>
                        </div>
                    )}
                </div>

                {/* Sets Score */}
                <div className="p-8">
                    <div className="flex items-center justify-center gap-12 mb-8">
                        {/* Team A */}
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {match.teamA?.shortCode || 'Team A'}
                            </div>
                            <div className="relative">
                                <div className="text-8xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                    {scoreA || 0}
                                </div>
                                {server === 'A' && match.status === 'LIVE' && (
                                    <div className="absolute -right-4 top-0">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                    </div>
                                )}
                            </div>
                            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Sets Won
                            </div>
                        </motion.div>

                        <div className={`text-5xl font-black ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>-</div>

                        {/* Team B */}
                        <motion.div 
                            className="text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                                {match.teamB?.shortCode || 'Team B'}
                            </div>
                            <div className="relative">
                                <div className="text-8xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                                    {scoreB || 0}
                                </div>
                                {server === 'B' && match.status === 'LIVE' && (
                                    <div className="absolute -right-4 top-0">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                                    </div>
                                )}
                            </div>
                            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Sets Won
                            </div>
                        </motion.div>
                    </div>

                    {/* Current Game Score */}
                    {currentSet && match.status === 'LIVE' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-2xl border ${
                                isMatchPoint 
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40' 
                                    : isDeuce
                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/40'
                                    : isDarkMode 
                                    ? 'bg-white/5 border-white/10' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Current Game - Set {(scoreA + scoreB + 1)}
                                </span>
                                {isMatchPoint && (
                                    <span className="text-xs font-black text-yellow-500 animate-pulse">
                                        MATCH POINT! 🔥
                                    </span>
                                )}
                                {isDeuce && !isMatchPoint && (
                                    <span className="text-xs font-black text-blue-500">
                                        DEUCE!
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-center gap-12 items-center">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-purple-400">
                                        {currentSet.pointsA || 0}
                                    </div>
                                </div>
                                <div className={`text-3xl ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>-</div>
                                <div className="text-center">
                                    <div className="text-5xl font-black text-pink-400">
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
                            className={`mt-4 w-full py-3 rounded-xl font-bold transition-all ${
                                isDarkMode 
                                    ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                            }`}
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
                        className={`backdrop-blur-xl rounded-2xl border overflow-hidden ${
                            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                        }`}
                    >
                        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                            <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                📊 Set History
                            </h4>
                        </div>
                        <div className="p-4 space-y-2">
                            {setDetails.map((set, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl border ${
                                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Set {index + 1}
                                        </span>
                                        <div className="flex gap-4 items-center">
                                            <span className={`text-2xl font-black ${
                                                set.pointsA > set.pointsB ? 'text-purple-400' : 'text-gray-500'
                                            }`}>
                                                {set.pointsA}
                                            </span>
                                            <span className={`text-xl ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>-</span>
                                            <span className={`text-2xl font-black ${
                                                set.pointsB > set.pointsA ? 'text-pink-400' : 'text-gray-500'
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
            <div className={`backdrop-blur-xl rounded-2xl border p-4 ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Status</div>
                        <div className={`text-sm font-bold ${
                            match.status === 'LIVE' ? 'text-green-500' : 
                            match.status === 'COMPLETED' ? 'text-blue-500' : 
                            'text-yellow-500'
                        }`}>
                            {match.status}
                        </div>
                    </div>
                    <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sets to Win</div>
                        <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {setsToWin}
                        </div>
                    </div>
                    <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Format</div>
                        <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Best of {maxSets}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadmintonScoreboard;
