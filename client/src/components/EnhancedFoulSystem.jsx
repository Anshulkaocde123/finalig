import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Foul Management System
 * Features: Pitch location tracking, consequences, cumulative fouls, suspensions
 */
const EnhancedFoulSystem = ({ match, onAddFoul, onRemoveFoul, disabled = false }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('A');
    const [foulType, setFoulType] = useState('YELLOW_CARD');
    const [playerName, setPlayerName] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [gameTime, setGameTime] = useState('');
    const [consequence, setConsequence] = useState('');
    const [pitchLocation, setPitchLocation] = useState(null);
    const [reason, setReason] = useState('');

    const sport = match?.sport || 'FOOTBALL';
    const fouls = match?.fouls || [];

    // Foul types with consequences
    const foulTypesWithConsequences = {
        FOOTBALL: [
            { value: 'YELLOW_CARD', label: 'Yellow Card', icon: '🟨', consequences: ['Warning', 'Team Foul'] },
            { value: 'RED_CARD', label: 'Red Card', icon: '🟥', consequences: ['Dismissal', 'Suspension'] },
            { value: 'PENALTY', label: 'Penalty Foul', icon: '⚽', consequences: ['Penalty Kick Awarded'] },
            { value: 'FREE_KICK', label: 'Free Kick', icon: '🥅', consequences: ['Direct Free Kick', 'Indirect Free Kick'] },
            { value: 'OFFSIDE', label: 'Offside', icon: '🚩', consequences: ['Free Kick to Opposition'] },
            { value: 'HANDBALL', label: 'Handball', icon: '🖐️', consequences: ['Free Kick', 'Penalty'] }
        ],
        BASKETBALL: [
            { value: 'PERSONAL_FOUL', label: 'Personal Foul', icon: '👋', consequences: ['Free Throws', 'Team Foul'] },
            { value: 'TECHNICAL_FOUL', label: 'Technical Foul', icon: '🔧', consequences: ['Free Throw + Possession'] },
            { value: 'FLAGRANT_FOUL', label: 'Flagrant Foul', icon: '🚨', consequences: ['Ejection', '2 Free Throws + Possession'] }
        ]
    };

    const availableFoulTypes = foulTypesWithConsequences[sport] || foulTypesWithConsequences.FOOTBALL;

    // Get consequences for selected foul type
    const getConsequences = (type) => {
        const foul = availableFoulTypes.find(f => f.value === type);
        return foul?.consequences || [];
    };

    // Calculate cumulative fouls per team
    const teamAFouls = fouls.filter(f => f.team === 'A' || f.team?.toString() === match.teamA?._id?.toString());
    const teamBFouls = fouls.filter(f => f.team === 'B' || f.team?.toString() === match.teamB?._id?.toString());

    // Check for player suspensions (2 yellows or 1 red)
    const getPlayerSuspensions = () => {
        const playerCards = {};
        
        fouls.forEach(foul => {
            if (!foul.playerName) return;
            
            if (!playerCards[foul.playerName]) {
                playerCards[foul.playerName] = { yellow: 0, red: 0, team: foul.team };
            }
            
            if (foul.foulType === 'YELLOW_CARD') {
                playerCards[foul.playerName].yellow++;
            } else if (foul.foulType === 'RED_CARD') {
                playerCards[foul.playerName].red++;
            }
        });

        return Object.entries(playerCards)
            .filter(([_, cards]) => cards.yellow >= 2 || cards.red >= 1)
            .map(([name, cards]) => ({ name, ...cards }));
    };

    const suspendedPlayers = getPlayerSuspensions();

    // Pitch location selector (simplified tactical view)
    const pitchZones = [
        { x: 0, y: 0, label: 'Defensive Left' },
        { x: 1, y: 0, label: 'Defensive Center' },
        { x: 2, y: 0, label: 'Defensive Right' },
        { x: 0, y: 1, label: 'Midfield Left' },
        { x: 1, y: 1, label: 'Midfield Center' },
        { x: 2, y: 1, label: 'Midfield Right' },
        { x: 0, y: 2, label: 'Attacking Left' },
        { x: 1, y: 2, label: 'Attacking Center' },
        { x: 2, y: 2, label: 'Attacking Right' },
        { x: 1, y: 3, label: 'Penalty Box' }
    ];

    const handleAddFoul = () => {
        if (!playerName.trim()) {
            alert('Please enter player name');
            return;
        }

        const foulData = {
            team: selectedTeam,
            foulType,
            playerName: playerName.trim(),
            jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined,
            gameTime: gameTime ? parseInt(gameTime) : undefined,
            consequence: consequence || undefined,
            pitchLocation: pitchLocation ? pitchZones[pitchLocation]?.label : undefined,
            reason: reason.trim() || undefined,
            timestamp: new Date().toISOString()
        };

        console.log('🔵 Adding enhanced foul:', foulData);
        onAddFoul?.(foulData);

        // Reset form
        setPlayerName('');
        setJerseyNumber('');
        setGameTime('');
        setConsequence('');
        setPitchLocation(null);
        setReason('');
        setShowAddModal(false);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>⚠️</span>
                    Enhanced Foul Management
                </h3>
                <button
                    onClick={() => setShowAddModal(true)}
                    disabled={disabled}
                    className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-black 
                               font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                    + Add Card/Foul
                </button>
            </div>

            {/* Cumulative Fouls Counter */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 p-3 rounded-lg border border-indigo-600/30">
                    <div className="text-xs text-indigo-300 mb-1">{match.teamA?.shortCode} Fouls</div>
                    <div className="text-2xl font-bold text-white">{teamAFouls.length}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        🟨 {teamAFouls.filter(f => f.foulType === 'YELLOW_CARD').length} | 
                        🟥 {teamAFouls.filter(f => f.foulType === 'RED_CARD').length}
                    </div>
                </div>
                <div className="bg-gradient-to-r from-pink-900/50 to-pink-800/50 p-3 rounded-lg border border-pink-600/30">
                    <div className="text-xs text-pink-300 mb-1">{match.teamB?.shortCode} Fouls</div>
                    <div className="text-2xl font-bold text-white">{teamBFouls.length}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        🟨 {teamBFouls.filter(f => f.foulType === 'YELLOW_CARD').length} | 
                        🟥 {teamBFouls.filter(f => f.foulType === 'RED_CARD').length}
                    </div>
                </div>
            </div>

            {/* Player Suspensions */}
            {suspendedPlayers.length > 0 && (
                <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 mb-4">
                    <div className="text-sm font-bold text-red-400 mb-2">🚨 Suspended Players</div>
                    <div className="space-y-1">
                        {suspendedPlayers.map((player, idx) => (
                            <div key={idx} className="text-xs text-white flex items-center gap-2">
                                <span>{player.name}</span>
                                {player.yellow >= 2 && <span className="text-yellow-400">(2 Yellow Cards)</span>}
                                {player.red >= 1 && <span className="text-red-400">(Red Card)</span>}
                            </div>
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
                        onClick={() => setShowAddModal(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Add Enhanced Foul Record</h3>

                            {/* Team Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Team</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'A', name: match.teamA?.shortCode || 'Team A' },
                                        { id: 'B', name: match.teamB?.shortCode || 'Team B' }
                                    ].map(team => (
                                        <button
                                            key={team.id}
                                            onClick={() => setSelectedTeam(team.id)}
                                            className={`py-2 rounded-lg font-bold transition-colors ${
                                                selectedTeam === team.id
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {team.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Foul Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Foul Type</label>
                                <select
                                    value={foulType}
                                    onChange={(e) => {
                                        setFoulType(e.target.value);
                                        setConsequence(''); // Reset consequence when type changes
                                    }}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    {availableFoulTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Consequence */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Consequence</label>
                                <select
                                    value={consequence}
                                    onChange={(e) => setConsequence(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="">Select consequence...</option>
                                    {getConsequences(foulType).map((cons, idx) => (
                                        <option key={idx} value={cons}>{cons}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Player Details */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Player Name *</label>
                                    <input
                                        type="text"
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value)}
                                        placeholder="Enter name"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Jersey #</label>
                                    <input
                                        type="number"
                                        value={jerseyNumber}
                                        onChange={(e) => setJerseyNumber(e.target.value)}
                                        placeholder="Number"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            {/* Game Time */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Minute</label>
                                <input
                                    type="number"
                                    value={gameTime}
                                    onChange={(e) => setGameTime(e.target.value)}
                                    placeholder="Game minute"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                            </div>

                            {/* Pitch Location */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Pitch Location (Tactical View)</label>
                                <div className="bg-green-900/30 border-2 border-green-600 rounded-lg p-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {pitchZones.filter((_, idx) => idx < 9).map((zone, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setPitchLocation(idx)}
                                                className={`py-2 px-1 text-xs rounded transition-all ${
                                                    pitchLocation === idx
                                                        ? 'bg-yellow-500 text-black font-bold'
                                                        : 'bg-green-800/50 text-white hover:bg-green-700/50'
                                                }`}
                                            >
                                                {zone.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPitchLocation(9)}
                                        className={`w-full mt-2 py-2 text-xs rounded transition-all ${
                                            pitchLocation === 9
                                                ? 'bg-red-500 text-white font-bold'
                                                : 'bg-green-800/50 text-white hover:bg-green-700/50'
                                        }`}
                                    >
                                        ⚽ Penalty Box
                                    </button>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-400 mb-2">Reason/Notes</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Description of the foul..."
                                    rows="2"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddFoul}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-3 rounded-lg font-bold"
                                >
                                    Add Foul
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnhancedFoulSystem;
