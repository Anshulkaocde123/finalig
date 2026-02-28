import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Plus, Edit, Archive, Calendar, X, Save, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const SeasonManagement = () => {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', year: new Date().getFullYear(), description: '', startDate: '', endDate: '' });

    useEffect(() => { fetchSeasons(); }, []);

    const fetchSeasons = async () => {
        try {
            const res = await axios.get('/seasons');
            setSeasons(res.data.data || []);
        } catch (error) { toast.error('Failed to fetch seasons'); }
        finally { setLoading(false); }
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
        } catch (error) { toast.error(error.response?.data?.message || 'Error saving season'); }
    };

    const handleArchive = async (id) => {
        if (window.confirm('Archive this season?')) {
            try {
                await axios.post(`/seasons/${id}/archive`, { reason: 'Archived from admin panel' });
                toast.success('Season archived');
                fetchSeasons();
            } catch (error) { toast.error('Failed to archive season'); }
        }
    };

    const handleEdit = (season) => {
        setFormData({ name: season.name, year: season.year, description: season.description, startDate: season.startDate?.split('T')[0] || '', endDate: season.endDate?.split('T')[0] || '' });
        setEditingId(season._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', year: new Date().getFullYear(), description: '', startDate: '', endDate: '' });
        setEditingId(null);
        setShowForm(false);
    };

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
                            <Trophy className="w-8 h-8 text-blue-500" />
                            Season Management
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Create and manage competition seasons</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                        {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> New Season</>}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 md:p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">{editingId ? 'Edit' : 'Create'} Season</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Season Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Winter Championship 2025"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Year *</label>
                                    <input type="number" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date *</label>
                                    <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> End Date *</label>
                                    <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Season description..." rows="3"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit"
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                                    <Save className="w-5 h-5" /> {editingId ? 'Update' : 'Create'} Season
                                </button>
                                <button type="button" onClick={resetForm}
                                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Seasons Grid */}
                {seasons.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 text-lg">No seasons yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Create your first season to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {seasons.map((season) => (
                            <div key={season._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{season.name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{season.year}</p>
                                    </div>
                                    {season.isActive ? (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ACTIVE
                                        </span>
                                    ) : season.isArchived ? (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-full text-sm font-medium">ARCHIVED</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full text-sm font-medium">UPCOMING</span>
                                    )}
                                </div>
                                {season.description && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{season.description}</p>}
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(season.startDate).toLocaleDateString()}</div>
                                    <span>→</span>
                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(season.endDate).toLocaleDateString()}</div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(season)}
                                        className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                    {!season.isArchived && (
                                        <button onClick={() => handleArchive(season._id)}
                                            className="p-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg transition-colors"><Archive className="w-4 h-4" /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeasonManagement;
