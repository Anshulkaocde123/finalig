import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Plus, Trash2, Edit, Archive, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SeasonManagement = () => {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        description: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchSeasons();
    }, []);

    const fetchSeasons = async () => {
        try {
            const res = await axios.get('/seasons');
            setSeasons(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch seasons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/seasons/${editingId}`, formData);
                toast.success('Season updated successfully');
            } else {
                await axios.post('/seasons', formData);
                toast.success('Season created successfully');
            }
            resetForm();
            fetchSeasons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving season');
        }
    };

    const handleArchive = async (id) => {
        if (window.confirm('Archive this season?')) {
            try {
                await axios.post(`/seasons/${id}/archive`, { reason: 'Archived from admin panel' });
                toast.success('Season archived');
                fetchSeasons();
            } catch (error) {
                toast.error('Failed to archive season');
            }
        }
    };

    const handleEdit = (season) => {
        setFormData({
            name: season.name,
            year: season.year,
            description: season.description,
            startDate: season.startDate.split('T')[0],
            endDate: season.endDate.split('T')[0]
        });
        setEditingId(season._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            year: new Date().getFullYear(),
            description: '',
            startDate: '',
            endDate: ''
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
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Season Management</h1>
                    <p className="text-gray-400 font-medium">Create and manage competition seasons</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                >
                    <Plus className="w-5 h-5" /> New Season
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">{editingId ? 'Edit' : 'Create'} Season</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Season Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                    placeholder="e.g., Winter Championship 2025"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                                placeholder="Season description..."
                                rows="3"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                            >
                                {editingId ? 'Update' : 'Create'} Season
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seasons.map(season => (
                    <div key={season._id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{season.name}</h3>
                                <p className="text-gray-400 text-sm">{season.year}</p>
                            </div>
                            {season.isActive && (
                                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold">ACTIVE</span>
                            )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{season.description}</p>
                        <div className="text-xs text-gray-400 mb-4">
                            {new Date(season.startDate).toLocaleDateString()} → {new Date(season.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(season)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-all"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={() => handleArchive(season._id)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 rounded-lg transition-all"
                            >
                                <Archive className="w-4 h-4" /> Archive
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeasonManagement;
