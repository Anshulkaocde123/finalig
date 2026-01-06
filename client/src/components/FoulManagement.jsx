import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Foul Management Component for Admin
 * Allows adding yellow/red cards, fouls, and penalties
 */
const FoulManagement = ({ 
    match, 
    onAddFoul, 
    onRemoveFoul, 
    disabled = false 
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('A');
    const [foulType, setFoulType] = useState('YELLOW_CARD');
    const [playerName, setPlayerName] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [gameTime, setGameTime] = useState('');
    const [reason, setReason] = useState('');

    const sport = match?.sport || 'FOOTBALL';

    // Sport-specific foul types
    const foulTypes = {
        FOOTBALL: [
            { value: 'YELLOW_CARD', label: 'Yellow Card', icon: '🟨', color: 'yellow' },
            { value: 'RED_CARD', label: 'Red Card', icon: '🟥', color: 'red' },
            { value: 'FOUL', label: 'Foul', icon: '⚠️', color: 'gray' },
            { value: 'PENALTY', label: 'Penalty', icon: '⚽', color: 'blue' },
            { value: 'FREE_KICK', label: 'Free Kick', icon: '🥅', color: 'gray' },
            { value: 'OFFSIDE', label: 'Offside', icon: '🚩', color: 'orange' }
        ],
        BASKETBALL: [
            { value: 'PERSONAL_FOUL', label: 'Personal Foul', icon: '👋', color: 'yellow' },
            { value: 'TECHNICAL_FOUL', label: 'Technical Foul', icon: '🔧', color: 'orange' },
            { value: 'FLAGRANT_FOUL', label: 'Flagrant Foul', icon: '🚨', color: 'red' },
            { value: 'OFFENSIVE_FOUL', label: 'Offensive Foul', icon: '💥', color: 'orange' }
        ],
        HOCKEY: [
            { value: 'GREEN_CARD', label: 'Green Card', icon: '🟢', color: 'green' },
            { value: 'YELLOW_CARD', label: 'Yellow Card', icon: '🟨', color: 'yellow' },
            { value: 'RED_CARD', label: 'Red Card', icon: '🟥', color: 'red' },
            { value: 'PENALTY_CORNER', label: 'Penalty Corner', icon: '🥅', color: 'blue' },
            { value: 'PENALTY_STROKE', label: 'Penalty Stroke', icon: '🎯', color: 'purple' }
        ],
        KABADDI: [
            { value: 'BONUS', label: 'Bonus Point', icon: '⭐', color: 'yellow' },
            { value: 'SUPER_TACKLE', label: 'Super Tackle', icon: '💪', color: 'green' },
            { value: 'ALL_OUT', label: 'All Out', icon: '💀', color: 'red' }
        ],
        CRICKET: [
            { value: 'NO_BALL', label: 'No Ball', icon: '❌', color: 'red' },
            { value: 'WIDE', label: 'Wide', icon: '↔️', color: 'orange' },
            { value: 'OVERTHROW', label: 'Overthrow', icon: '🔄', color: 'gray' }
        ]
    };

    const availableFoulTypes = foulTypes[sport] || foulTypes.FOOTBALL;

    const handleAddFoul = () => {
        if (!playerName.trim()) {
            alert('Please enter player name');
            return;
        }

        console.log('🔵 Submitting foul:', {
            team: selectedTeam,
            foulType,
            playerName: playerName.trim(),
            jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined,
            gameTime: gameTime ? parseInt(gameTime) : undefined,
            reason: reason.trim() || undefined
        });

        onAddFoul?.({
            team: selectedTeam,
            foulType,
            playerName: playerName.trim(),
            jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined,
            gameTime: gameTime ? parseInt(gameTime) : undefined,
            reason: reason.trim() || undefined,
            timestamp: new Date().toISOString()
        });

        // Reset form
        setPlayerName('');
        setJerseyNumber('');
        setGameTime('');
        setReason('');
        setShowAddModal(false);
    };

    const handleQuickCard = (team, type) => {
        setSelectedTeam(team);
        setFoulType(type);
        setShowAddModal(true);
    };

    // Get fouls from match
    const fouls = match?.fouls || [];
    const teamAFouls = fouls.filter(f => f.team === 'A');
    const teamBFouls = fouls.filter(f => f.team === 'B');

    const cardsA = match?.cardsA || { yellow: 0, red: 0 };
    const cardsB = match?.cardsB || { yellow: 0, red: 0 };

    const getCardColor = (type) => {
        if (type.includes('RED')) return 'bg-red-500';
        if (type.includes('YELLOW')) return 'bg-yellow-400';
        if (type.includes('GREEN')) return 'bg-green-500';
        return 'bg-gray-500';
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🃏</span>
                    Foul Management
                </h3>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    disabled={disabled}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 
                               text-white font-medium px-3 py-1 rounded-lg text-sm"
                >
                    + Add Card/Foul
                </motion.button>
            </div>

            {/* Card Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Team A */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-2">
                        {match?.teamA?.shortCode || 'Team A'}
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-6 bg-yellow-400 rounded"></div>
                            <span className="text-yellow-400 font-bold">{cardsA.yellow}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-6 bg-red-500 rounded"></div>
                            <span className="text-red-400 font-bold">{cardsA.red}</span>
                        </div>
                    </div>
                </div>

                {/* Team B */}
                <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-2">
                        {match?.teamB?.shortCode || 'Team B'}
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-6 bg-yellow-400 rounded"></div>
                            <span className="text-yellow-400 font-bold">{cardsB.yellow}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-6 bg-red-500 rounded"></div>
                            <span className="text-red-400 font-bold">{cardsB.red}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Card Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="space-y-2">
                    <div className="text-xs text-gray-400 text-center">
                        {match?.teamA?.shortCode || 'Team A'}
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickCard('A', 'YELLOW_CARD')}
                            disabled={disabled}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold 
                                       py-2 rounded-lg disabled:opacity-50"
                        >
                            🟨
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickCard('A', 'RED_CARD')}
                            disabled={disabled}
                            className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold 
                                       py-2 rounded-lg disabled:opacity-50"
                        >
                            🟥
                        </motion.button>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-xs text-gray-400 text-center">
                        {match?.teamB?.shortCode || 'Team B'}
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickCard('B', 'YELLOW_CARD')}
                            disabled={disabled}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold 
                                       py-2 rounded-lg disabled:opacity-50"
                        >
                            🟨
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickCard('B', 'RED_CARD')}
                            disabled={disabled}
                            className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold 
                                       py-2 rounded-lg disabled:opacity-50"
                        >
                            🟥
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Recent Fouls List */}
            {fouls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Match Fouls ({fouls.length})</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {fouls.slice().reverse().map((foul, idx) => (
                            <motion.div
                                key={foul._id || idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between bg-gray-900/50 rounded-lg p-2"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-5 rounded-sm ${getCardColor(foul.foulType)}`}></div>
                                    <div>
                                        <span className="text-white text-sm">{foul.playerName}</span>
                                        {foul.jerseyNumber && (
                                            <span className="text-gray-400 text-xs ml-1">#{foul.jerseyNumber}</span>
                                        )}
                                        <span className="text-gray-500 text-xs ml-2">
                                            ({foul.team === 'A' ? match?.teamA?.shortCode : match?.teamB?.shortCode})
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {foul.gameTime && (
                                        <span className="text-gray-400 text-xs">{foul.gameTime}'</span>
                                    )}
                                    {!disabled && onRemoveFoul && (
                                        <button
                                            onClick={() => onRemoveFoul(foul._id || idx)}
                                            className="text-red-400 hover:text-red-300 text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Foul Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 w-96 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Add Card/Foul</h3>

                            {/* Team Selection */}
                            <div className="mb-4">
                                <label className="text-gray-400 text-sm block mb-2">Team</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setSelectedTeam('A')}
                                        className={`py-2 rounded-lg font-medium transition-colors ${
                                            selectedTeam === 'A'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {match?.teamA?.shortCode || 'Team A'}
                                    </button>
                                    <button
                                        onClick={() => setSelectedTeam('B')}
                                        className={`py-2 rounded-lg font-medium transition-colors ${
                                            selectedTeam === 'B'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {match?.teamB?.shortCode || 'Team B'}
                                    </button>
                                </div>
                            </div>

                            {/* Foul Type */}
                            <div className="mb-4">
                                <label className="text-gray-400 text-sm block mb-2">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableFoulTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setFoulType(type.value)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors 
                                                        flex items-center gap-2 ${
                                                foulType === type.value
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Player Name */}
                            <div className="mb-4">
                                <label className="text-gray-400 text-sm block mb-2">Player Name *</label>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={e => setPlayerName(e.target.value)}
                                    placeholder="Enter player name"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                                               text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Jersey Number & Game Time */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-gray-400 text-sm block mb-2">Jersey #</label>
                                    <input
                                        type="number"
                                        value={jerseyNumber}
                                        onChange={e => setJerseyNumber(e.target.value)}
                                        placeholder="10"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                                                   text-white placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm block mb-2">Time (min)</label>
                                    <input
                                        type="number"
                                        value={gameTime}
                                        onChange={e => setGameTime(e.target.value)}
                                        placeholder="45"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                                                   text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                                <label className="text-gray-400 text-sm block mb-2">Reason (optional)</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="e.g., Dangerous tackle"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                                               text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddFoul}
                                    disabled={!playerName.trim()}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 
                                               text-white font-bold rounded-lg"
                                >
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoulManagement;
