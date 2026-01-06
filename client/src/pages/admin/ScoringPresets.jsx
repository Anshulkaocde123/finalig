import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axios';
import { Plus, Trash2, Edit, Copy, Star, X, Save, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const ScoringPresets = () => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ sport: 'CRICKET', name: '', description: '', winPoints: 10, lossPoints: 0, drawPoints: 5, bonusPoints: 0, dominantVictoryMargin: null, isDefault: false });

    const SPORTS = [
        { value: 'CRICKET', emoji: '🏏', color: 'from-green-500 to-emerald-600' },
        { value: 'BADMINTON', emoji: '🏸', color: 'from-purple-500 to-pink-600' },
        { value: 'TABLE_TENNIS', emoji: '🏓', color: 'from-yellow-500 to-orange-600' },
        { value: 'VOLLEYBALL', emoji: '🏐', color: 'from-indigo-500 to-purple-600' },
        { value: 'FOOTBALL', emoji: '⚽', color: 'from-blue-500 to-cyan-600' },
        { value: 'BASKETBALL', emoji: '🏀', color: 'from-orange-500 to-red-600' },
        { value: 'KHOKHO', emoji: '🎯', color: 'from-teal-500 to-green-600' },
        { value: 'KABADDI', emoji: '🤼', color: 'from-rose-500 to-pink-600' },
        { value: 'CHESS', emoji: '♚', color: 'from-gray-500 to-slate-600' }
    ];

    useEffect(() => { fetchPresets(); }, []);

    const fetchPresets = async () => {
        try {
            const res = await axios.get('/scoring-presets');
            setPresets(res.data.data || []);
        } catch (error) { toast.error('Failed to fetch presets'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/scoring-presets/${editingId}`, formData);
                toast.success('Preset updated successfully');
            } else {
                await axios.post('/scoring-presets', formData);
                toast.success('Preset created successfully');
            }
            resetForm();
            fetchPresets();
        } catch (error) { toast.error(error.response?.data?.message || 'Error saving preset'); }
    };

    const handleDuplicate = async (preset) => {
        try {
            await axios.post(`/scoring-presets/${preset._id}/duplicate`, { newName: `${preset.name} (Copy)` });
            toast.success('Preset duplicated');
            fetchPresets();
        } catch (error) { toast.error('Failed to duplicate preset'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this preset?')) {
            try {
                await axios.delete(`/scoring-presets/${id}`);
                toast.success('Preset deleted');
                fetchPresets();
            } catch (error) { toast.error('Failed to delete preset'); }
        }
    };

    const handleEdit = (preset) => {
        setFormData({ sport: preset.sport, name: preset.name, description: preset.description, winPoints: preset.winPoints, lossPoints: preset.lossPoints, drawPoints: preset.drawPoints, bonusPoints: preset.bonusPoints, dominantVictoryMargin: preset.dominantVictoryMargin, isDefault: preset.isDefault });
        setEditingId(preset._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ sport: 'CRICKET', name: '', description: '', winPoints: 10, lossPoints: 0, drawPoints: 5, bonusPoints: 0, dominantVictoryMargin: null, isDefault: false });
        setEditingId(null);
        setShowForm(false);
    };

    const getSportData = (sport) => SPORTS.find(s => s.value === sport) || SPORTS[0];

    if (loading) {
        return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                            <Settings className="w-8 h-8 text-indigo-400" />
                            Scoring Presets
                        </h1>
                        <p className="text-gray-400 mt-1">Configure points for each sport</p>
                    </motion.div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white shadow-lg`}>
                        {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> New Preset</>}
                    </motion.button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit' : 'Create'} Preset</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Sport</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {SPORTS.map(sport => (
                                                <motion.button key={sport.value} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                    onClick={() => setFormData({ ...formData, sport: sport.value })}
                                                    className={`p-3 rounded-xl border transition-all ${formData.sport === sport.value 
                                                        ? `bg-gradient-to-r ${sport.color} border-white/30 shadow-lg` 
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                                    <div className="text-xl">{sport.emoji}</div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Preset Name *</label>
                                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Standard, Tournament"
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Description</label>
                                            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Preset description..."
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <label className="block text-sm font-bold text-green-300 mb-2">Win Points</label>
                                        <input type="number" value={formData.winPoints} onChange={(e) => setFormData({ ...formData, winPoints: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none text-center text-xl font-bold" />
                                    </div>
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                        <label className="block text-sm font-bold text-red-300 mb-2">Loss Points</label>
                                        <input type="number" value={formData.lossPoints} onChange={(e) => setFormData({ ...formData, lossPoints: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-red-500/30 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none text-center text-xl font-bold" />
                                    </div>
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                        <label className="block text-sm font-bold text-yellow-300 mb-2">Draw Points</label>
                                        <input type="number" value={formData.drawPoints} onChange={(e) => setFormData({ ...formData, drawPoints: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-yellow-500/30 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 outline-none text-center text-xl font-bold" />
                                    </div>
                                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                        <label className="block text-sm font-bold text-purple-300 mb-2">Bonus Points</label>
                                        <input type="number" value={formData.bonusPoints} onChange={(e) => setFormData({ ...formData, bonusPoints: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none text-center text-xl font-bold" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            className="w-5 h-5 rounded bg-slate-900/50 border-white/10 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-gray-300 font-medium">Set as default for this sport</span>
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                                        <Save className="w-5 h-5" /> {editingId ? 'Update' : 'Create'} Preset
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={resetForm}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold">Cancel</motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Presets Grid */}
                {presets.length === 0 ? (
                    <div className="text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl">
                        <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No scoring presets yet</p>
                        <p className="text-gray-500 text-sm mt-2">Create your first preset to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {presets.map((preset, idx) => {
                            const sportData = getSportData(preset.sport);
                            return (
                                <motion.div key={preset._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${sportData.color} flex items-center justify-center text-2xl shadow-lg`}>
                                                {sportData.emoji}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{preset.name}</h3>
                                                <p className="text-gray-500 text-xs">{preset.sport}</p>
                                            </div>
                                        </div>
                                        {preset.isDefault && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Star className="w-3 h-3" /> Default
                                            </span>
                                        )}
                                    </div>
                                    {preset.description && <p className="text-sm text-gray-400 mb-4">{preset.description}</p>}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="text-center p-2 bg-green-500/10 rounded-lg"><div className="text-lg font-black text-green-400">{preset.winPoints}</div><div className="text-[10px] text-gray-500">Win</div></div>
                                        <div className="text-center p-2 bg-red-500/10 rounded-lg"><div className="text-lg font-black text-red-400">{preset.lossPoints}</div><div className="text-[10px] text-gray-500">Loss</div></div>
                                        <div className="text-center p-2 bg-yellow-500/10 rounded-lg"><div className="text-lg font-black text-yellow-400">{preset.drawPoints}</div><div className="text-[10px] text-gray-500">Draw</div></div>
                                        <div className="text-center p-2 bg-purple-500/10 rounded-lg"><div className="text-lg font-black text-purple-400">{preset.bonusPoints}</div><div className="text-[10px] text-gray-500">Bonus</div></div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(preset)}
                                            className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-lg"><Edit className="w-4 h-4" /></motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDuplicate(preset)}
                                            className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg"><Copy className="w-4 h-4" /></motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(preset._id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoringPresets;
