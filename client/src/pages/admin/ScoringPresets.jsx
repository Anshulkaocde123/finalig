import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Plus, Trash2, Edit, Copy, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ScoringPresets = () => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        sport: 'CRICKET',
        name: '',
        description: '',
        winPoints: 10,
        lossPoints: 0,
        drawPoints: 5,
        bonusPoints: 0,
        dominantVictoryMargin: null,
        isDefault: false
    });

    const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];

    useEffect(() => {
        fetchPresets();
    }, []);

    const fetchPresets = async () => {
        try {
            const res = await axios.get('/scoring-presets');
            setPresets(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch presets');
        } finally {
            setLoading(false);
        }
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
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving preset');
        }
    };

    const handleDuplicate = async (presetId) => {
        try {
            await axios.post(`/scoring-presets/${presetId}/duplicate`, { newName: `${formData.name} (Copy)` });
            toast.success('Preset duplicated');
            fetchPresets();
        } catch (error) {
            toast.error('Failed to duplicate preset');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this preset?')) {
            try {
                await axios.delete(`/scoring-presets/${id}`);
                toast.success('Preset deleted');
                fetchPresets();
            } catch (error) {
                toast.error('Failed to delete preset');
            }
        }
    };

    const handleEdit = (preset) => {
        setFormData({
            sport: preset.sport,
            name: preset.name,
            description: preset.description,
            winPoints: preset.winPoints,
            lossPoints: preset.lossPoints,
            drawPoints: preset.drawPoints,
            bonusPoints: preset.bonusPoints,
            dominantVictoryMargin: preset.dominantVictoryMargin,
            isDefault: preset.isDefault
        });
        setEditingId(preset._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            sport: 'CRICKET',
            name: '',
            description: '',
            winPoints: 10,
            lossPoints: 0,
            drawPoints: 5,
            bonusPoints: 0,
            dominantVictoryMargin: null,
            isDefault: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return <div className="text-center p-8"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-500"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Scoring Presets</h1>
                    <p className="text-gray-400 font-medium">Configure points for each sport</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                >
                    <Plus className="w-5 h-5" /> New Preset
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">{editingId ? 'Edit' : 'Create'} Preset</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
                                <select
                                    value={formData.sport}
                                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                >
                                    {SPORTS.map(sport => (
                                        <option key={sport} value={sport}>{sport}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Preset Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                    placeholder="e.g., Standard, Tournament"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                placeholder="Preset description..."
                                rows="2"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Win Points</label>
                                <input
                                    type="number"
                                    value={formData.winPoints}
                                    onChange={(e) => setFormData({ ...formData, winPoints: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Loss Points</label>
                                <input
                                    type="number"
                                    value={formData.lossPoints}
                                    onChange={(e) => setFormData({ ...formData, lossPoints: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Draw Points</label>
                                <input
                                    type="number"
                                    value={formData.drawPoints}
                                    onChange={(e) => setFormData({ ...formData, drawPoints: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Points</label>
                                <input
                                    type="number"
                                    value={formData.bonusPoints}
                                    onChange={(e) => setFormData({ ...formData, bonusPoints: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label className="text-sm font-medium text-gray-300">Set as default for this sport</label>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                            >
                                {editingId ? 'Update' : 'Create'} Preset
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {presets.map(preset => (
                    <div key={preset._id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-white">{preset.name}</h3>
                                    {preset.isDefault && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                                </div>
                                <p className="text-sm text-indigo-400 font-medium">{preset.sport}</p>
                                <p className="text-gray-400 text-sm mt-1">{preset.description}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                            <div className="bg-slate-700 rounded p-2">
                                <div className="text-gray-400">Win</div>
                                <div className="text-lg font-bold text-green-400">{preset.winPoints}</div>
                            </div>
                            <div className="bg-slate-700 rounded p-2">
                                <div className="text-gray-400">Loss</div>
                                <div className="text-lg font-bold text-red-400">{preset.lossPoints}</div>
                            </div>
                            <div className="bg-slate-700 rounded p-2">
                                <div className="text-gray-400">Draw</div>
                                <div className="text-lg font-bold text-yellow-400">{preset.drawPoints}</div>
                            </div>
                            <div className="bg-slate-700 rounded p-2">
                                <div className="text-gray-400">Bonus</div>
                                <div className="text-lg font-bold text-purple-400">{preset.bonusPoints}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(preset)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-all"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={() => handleDuplicate(preset._id)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded-lg transition-all"
                            >
                                <Copy className="w-4 h-4" /> Duplicate
                            </button>
                            <button
                                onClick={() => handleDelete(preset._id)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScoringPresets;
