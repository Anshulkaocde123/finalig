import React, { useState, useEffect } from 'react';
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
        { value: 'CRICKET', emoji: '🏏' },
        { value: 'BADMINTON', emoji: '🏸' },
        { value: 'TABLE_TENNIS', emoji: '🏓' },
        { value: 'VOLLEYBALL', emoji: '🏐' },
        { value: 'FOOTBALL', emoji: '⚽' },
        { value: 'BASKETBALL', emoji: '🏀' },
        { value: 'KHOKHO', emoji: '🎯' },
        { value: 'KABADDI', emoji: '🤼' },
        { value: 'CHESS', emoji: '♚' }
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
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Settings className="w-8 h-8 text-blue-500" />
                            Scoring Presets
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Configure points for each sport</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                        {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> New Preset</>}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 md:p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">{editingId ? 'Edit' : 'Create'} Preset</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sport</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {SPORTS.map(sport => (
                                            <button key={sport.value} type="button" onClick={() => setFormData({ ...formData, sport: sport.value })}
                                                className={`p-3 rounded-lg border transition-all ${formData.sport === sport.value 
                                                    ? 'bg-blue-500 border-blue-500 text-white' 
                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'}`}>
                                                <div className="text-xl">{sport.emoji}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Preset Name *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Standard, Tournament"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Preset description..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Win Points</label>
                                    <input type="number" value={formData.winPoints} onChange={(e) => setFormData({ ...formData, winPoints: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none text-center text-xl font-bold" />
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Loss Points</label>
                                    <input type="number" value={formData.lossPoints} onChange={(e) => setFormData({ ...formData, lossPoints: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none text-center text-xl font-bold" />
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <label className="block text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Draw Points</label>
                                    <input type="number" value={formData.drawPoints} onChange={(e) => setFormData({ ...formData, drawPoints: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-center text-xl font-bold" />
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Bonus Points</label>
                                    <input type="number" value={formData.bonusPoints} onChange={(e) => setFormData({ ...formData, bonusPoints: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl font-bold" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="w-5 h-5 rounded bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Set as default for this sport</span>
                                </label>
                            </div>
                            <div className="flex gap-4">
                                <button type="submit"
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                                    <Save className="w-5 h-5" /> {editingId ? 'Update' : 'Create'} Preset
                                </button>
                                <button type="button" onClick={resetForm}
                                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Presets Grid */}
                {presets.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <Settings className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 text-lg">No scoring presets yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Create your first preset to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {presets.map((preset) => {
                            const sportData = getSportData(preset.sport);
                            return (
                                <div key={preset._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-2xl">
                                                {sportData.emoji}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{preset.name}</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">{preset.sport}</p>
                                            </div>
                                        </div>
                                        {preset.isDefault && (
                                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                <Star className="w-3 h-3" /> Default
                                            </span>
                                        )}
                                    </div>
                                    {preset.description && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{preset.description}</p>}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><div className="text-lg font-bold text-green-600 dark:text-green-400">{preset.winPoints}</div><div className="text-[10px] text-slate-400">Win</div></div>
                                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"><div className="text-lg font-bold text-red-600 dark:text-red-400">{preset.lossPoints}</div><div className="text-[10px] text-slate-400">Loss</div></div>
                                        <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><div className="text-lg font-bold text-amber-600 dark:text-amber-400">{preset.drawPoints}</div><div className="text-[10px] text-slate-400">Draw</div></div>
                                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><div className="text-lg font-bold text-blue-600 dark:text-blue-400">{preset.bonusPoints}</div><div className="text-[10px] text-slate-400">Bonus</div></div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(preset)}
                                            className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDuplicate(preset)}
                                            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(preset._id)}
                                            className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoringPresets;
