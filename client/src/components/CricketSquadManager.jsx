import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, Save, X, UserPlus } from 'lucide-react';

/**
 * Cricket Squad Management Component
 * Allows admin to add/edit team squads with player names
 */
const CricketSquadManager = ({ match, onUpdate, onClose }) => {
    const [squadA, setSquadA] = useState(
        match?.squadA?.length > 0 
            ? match.squadA.map(p => ({ ...p }))
            : Array(11).fill(null).map((_, i) => ({ 
                playerName: '', 
                jerseyNumber: null, 
                role: 'BATSMAN',
                battingOrder: i + 1 
            }))
    );
    
    const [squadB, setSquadB] = useState(
        match?.squadB?.length > 0 
            ? match.squadB.map(p => ({ ...p }))
            : Array(11).fill(null).map((_, i) => ({ 
                playerName: '', 
                jerseyNumber: null, 
                role: 'BATSMAN',
                battingOrder: i + 1 
            }))
    );
    
    const [activeTeam, setActiveTeam] = useState('A');
    const [saving, setSaving] = useState(false);

    const roles = [
        { value: 'BATSMAN', label: 'Batsman', icon: '🏏' },
        { value: 'BOWLER', label: 'Bowler', icon: '🎯' },
        { value: 'ALL_ROUNDER', label: 'All-Rounder', icon: '⭐' },
        { value: 'WICKET_KEEPER', label: 'Wicketkeeper', icon: '🧤' }
    ];

    const handlePlayerChange = (index, field, value, team) => {
        const setSquad = team === 'A' ? setSquadA : setSquadB;
        setSquad(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addPlayer = (team) => {
        const setSquad = team === 'A' ? setSquadA : setSquadB;
        const squad = team === 'A' ? squadA : squadB;
        if (squad.length >= 15) return; // Max 15 players including subs
        
        setSquad(prev => [...prev, {
            playerName: '',
            jerseyNumber: null,
            role: 'BATSMAN',
            battingOrder: prev.length + 1
        }]);
    };

    const removePlayer = (index, team) => {
        const setSquad = team === 'A' ? setSquadA : setSquadB;
        const squad = team === 'A' ? squadA : squadB;
        if (squad.length <= 1) return;
        
        setSquad(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        // Validate at least some players have names
        const validSquadA = squadA.filter(p => p.playerName.trim());
        const validSquadB = squadB.filter(p => p.playerName.trim());

        if (validSquadA.length === 0 && validSquadB.length === 0) {
            alert('Please add at least one player name');
            return;
        }

        setSaving(true);
        try {
            await onUpdate({
                squadA: validSquadA.map((p, i) => ({
                    ...p,
                    battingOrder: i + 1,
                    runsScored: p.runsScored || 0,
                    ballsFaced: p.ballsFaced || 0,
                    fours: p.fours || 0,
                    sixes: p.sixes || 0,
                    isOut: p.isOut || false,
                    oversBowled: p.oversBowled || 0,
                    ballsBowled: p.ballsBowled || 0,
                    runsConceded: p.runsConceded || 0,
                    wicketsTaken: p.wicketsTaken || 0,
                    maidens: p.maidens || 0,
                    wides: p.wides || 0,
                    noBalls: p.noBalls || 0
                })),
                squadB: validSquadB.map((p, i) => ({
                    ...p,
                    battingOrder: i + 1,
                    runsScored: p.runsScored || 0,
                    ballsFaced: p.ballsFaced || 0,
                    fours: p.fours || 0,
                    sixes: p.sixes || 0,
                    isOut: p.isOut || false,
                    oversBowled: p.oversBowled || 0,
                    ballsBowled: p.ballsBowled || 0,
                    runsConceded: p.runsConceded || 0,
                    wicketsTaken: p.wicketsTaken || 0,
                    maidens: p.maidens || 0,
                    wides: p.wides || 0,
                    noBalls: p.noBalls || 0
                }))
            });
            onClose && onClose();
        } catch (err) {
            console.error('Failed to save squads:', err);
            alert('Failed to save squads');
        } finally {
            setSaving(false);
        }
    };

    const quickFillTemplate = (team) => {
        const setSquad = team === 'A' ? setSquadA : setSquadB;
        const teamData = team === 'A' ? match?.teamA : match?.teamB;
        const prefix = teamData?.shortCode || (team === 'A' ? 'Team A' : 'Team B');
        
        setSquad([
            { playerName: `${prefix} Player 1`, role: 'BATSMAN', battingOrder: 1, jerseyNumber: 1 },
            { playerName: `${prefix} Player 2`, role: 'BATSMAN', battingOrder: 2, jerseyNumber: 2 },
            { playerName: `${prefix} Player 3`, role: 'BATSMAN', battingOrder: 3, jerseyNumber: 3 },
            { playerName: `${prefix} Player 4`, role: 'BATSMAN', battingOrder: 4, jerseyNumber: 4 },
            { playerName: `${prefix} Player 5`, role: 'ALL_ROUNDER', battingOrder: 5, jerseyNumber: 5 },
            { playerName: `${prefix} Player 6`, role: 'WICKET_KEEPER', battingOrder: 6, jerseyNumber: 6 },
            { playerName: `${prefix} Player 7`, role: 'ALL_ROUNDER', battingOrder: 7, jerseyNumber: 7 },
            { playerName: `${prefix} Player 8`, role: 'BOWLER', battingOrder: 8, jerseyNumber: 8 },
            { playerName: `${prefix} Player 9`, role: 'BOWLER', battingOrder: 9, jerseyNumber: 9 },
            { playerName: `${prefix} Player 10`, role: 'BOWLER', battingOrder: 10, jerseyNumber: 10 },
            { playerName: `${prefix} Player 11`, role: 'BOWLER', battingOrder: 11, jerseyNumber: 11 },
        ]);
    };

    const currentSquad = activeTeam === 'A' ? squadA : squadB;
    const currentTeamData = activeTeam === 'A' ? match?.teamA : match?.teamB;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Manage Team Squads</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Team Tabs */}
                <div className="flex border-b border-slate-700 flex-shrink-0">
                    <button
                        onClick={() => setActiveTeam('A')}
                        className={`flex-1 px-6 py-4 font-bold transition-all ${
                            activeTeam === 'A'
                                ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span className="text-lg">{match?.teamA?.shortCode || 'Team A'}</span>
                        <span className="ml-2 text-xs text-slate-500">
                            ({squadA.filter(p => p.playerName.trim()).length} players)
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTeam('B')}
                        className={`flex-1 px-6 py-4 font-bold transition-all ${
                            activeTeam === 'B'
                                ? 'text-pink-400 bg-pink-500/10 border-b-2 border-pink-500'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span className="text-lg">{match?.teamB?.shortCode || 'Team B'}</span>
                        <span className="ml-2 text-xs text-slate-500">
                            ({squadB.filter(p => p.playerName.trim()).length} players)
                        </span>
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="px-6 py-3 bg-slate-800/50 flex gap-3 flex-shrink-0">
                    <button
                        onClick={() => quickFillTemplate(activeTeam)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        ⚡ Quick Fill Template
                    </button>
                    <button
                        onClick={() => addPlayer(activeTeam)}
                        disabled={currentSquad.length >= 15}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> Add Player
                    </button>
                </div>

                {/* Player List */}
                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    <div className="space-y-3">
                        {currentSquad.map((player, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex gap-3 items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700"
                            >
                                {/* Order Number */}
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                    {index + 1}
                                </div>

                                {/* Player Name */}
                                <input
                                    type="text"
                                    value={player.playerName}
                                    onChange={(e) => handlePlayerChange(index, 'playerName', e.target.value, activeTeam)}
                                    placeholder="Player Name"
                                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                                />

                                {/* Jersey Number */}
                                <input
                                    type="number"
                                    value={player.jerseyNumber || ''}
                                    onChange={(e) => handlePlayerChange(index, 'jerseyNumber', parseInt(e.target.value) || null, activeTeam)}
                                    placeholder="#"
                                    className="w-16 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-center placeholder-slate-500 focus:border-indigo-500 outline-none"
                                />

                                {/* Role */}
                                <select
                                    value={player.role}
                                    onChange={(e) => handlePlayerChange(index, 'role', e.target.value, activeTeam)}
                                    className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                >
                                    {roles.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.icon} {r.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removePlayer(index, activeTeam)}
                                    disabled={currentSquad.length <= 1}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer - Always visible at bottom */}
                <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="text-sm text-slate-400">
                        💡 Add all 11 players + substitutes for complete scorecard
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Squads
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CricketSquadManager;
