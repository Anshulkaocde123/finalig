import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            Season Management
                        </h1>
                        <p className="text-gray-400 mt-1">Create and manage competition seasons</p>
                    </motion.div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white shadow-lg`}>
                        {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> New Season</>}
                    </motion.button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit' : 'Create'} Season</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Season Name *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Winter Championship 2025"
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Year *</label>
                                        <input type="number" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <label className="block text-sm font-bold text-green-300 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date *</label>
                                        <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none" />
                                    </div>
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                        <label className="block text-sm font-bold text-red-300 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> End Date *</label>
                                        <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-red-500/30 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Season description..." rows="3"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                                </div>
                                <div className="flex gap-4">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                                        <Save className="w-5 h-5" /> {editingId ? 'Update' : 'Create'} Season
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={resetForm}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold">Cancel</motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Seasons Grid */}
                {seasons.length === 0 ? (
                    <div className="text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl">
                        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No seasons yet</p>
                        <p className="text-gray-500 text-sm mt-2">Create your first season to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {seasons.map((season, idx) => (
                            <motion.div key={season._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{season.name}</h3>
                                        <p className="text-gray-500 text-sm">{season.year}</p>
                                    </div>
                                    {season.isActive ? (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ACTIVE
                                        </span>
                                    ) : season.isArchived ? (
                                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs font-bold">ARCHIVED</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold">UPCOMING</span>
                                    )}
                                </div>
                                {season.description && <p className="text-sm text-gray-400 mb-4">{season.description}</p>}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(season.startDate).toLocaleDateString()}</div>
                                    <span>→</span>
                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(season.endDate).toLocaleDateString()}</div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(season)}
                                        className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-lg"><Edit className="w-4 h-4" /></motion.button>
                                    {!season.isArchived && (
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleArchive(season._id)}
                                            className="p-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 rounded-lg"><Archive className="w-4 h-4" /></motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeasonManagement;
