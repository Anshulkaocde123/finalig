import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Camera, Plus, Trash2, X, Save, Calendar, ExternalLink } from 'lucide-react';

const HighlightManagement = () => {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        type: 'reel',
        instagramUrl: '',
        caption: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchHighlights = async () => {
        try {
            setLoading(true);
            const res = await api.get('/highlights');
            setHighlights(res.data.data || res.data || []);
        } catch (err) { toast.error('Failed to load highlights'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHighlights(); }, []);

    const resetForm = () => {
        setFormData({
            type: 'reel',
            instagramUrl: '',
            caption: '',
            date: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.instagramUrl) { toast.error('Instagram URL is required'); return; }

        setSaving(true);
        try {
            await api.post('/highlights', {
                type: formData.type,
                instagramUrl: formData.instagramUrl,
                caption: formData.caption,
                date: formData.date
            });
            toast.success('Highlight created!');
            resetForm();
            fetchHighlights();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const deleteHighlight = async (id) => {
        if (!window.confirm('Delete this highlight?')) return;
        try {
            await api.delete(`/highlights/${id}`);
            setHighlights(prev => prev.filter(h => h._id !== id));
            toast.success('Deleted');
        } catch (err) { toast.error('Failed to delete'); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-amber-500" />
                            Highlights
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage Reel & Pic of the Day (Instagram embeds)</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Add Highlight
                    </button>
                </div>

                {/* Create Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-6">
                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-slate-900">New Highlight</h2>
                                    <button onClick={resetForm} className="p-1 text-slate-400 hover:text-slate-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'reel' }))}
                                            className={`p-3 rounded-lg border text-center transition-colors ${
                                                formData.type === 'reel' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}>
                                            <Film className="w-5 h-5 mx-auto mb-1" />
                                            <div className="text-xs font-medium">Reel of the Day</div>
                                        </button>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'pic' }))}
                                            className={`p-3 rounded-lg border text-center transition-colors ${
                                                formData.type === 'pic' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}>
                                            <Camera className="w-5 h-5 mx-auto mb-1" />
                                            <div className="text-xs font-medium">Pic of the Day</div>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Instagram URL *</label>
                                        <input type="url" value={formData.instagramUrl}
                                            onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                                            placeholder="https://www.instagram.com/reel/... or https://www.instagram.com/p/..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                        <p className="text-xs text-slate-400 mt-1">Paste the full Instagram post or reel URL</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Caption (optional)</label>
                                        <textarea value={formData.caption}
                                            onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                                            rows={2} placeholder="Brief caption..."
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                                        <input type="date" value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button type="submit" disabled={saving}
                                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                                            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Create'}
                                        </button>
                                        <button type="button" onClick={resetForm}
                                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Highlights List */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading highlights...</div>
                ) : highlights.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No highlights yet. Add your first one!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {highlights.map((h) => (
                            <motion.div key={h._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`bg-white border rounded-xl p-4 ${
                                    h.type === 'reel' ? 'border-purple-200' : 'border-amber-200'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        {h.type === 'reel' ? (
                                            <Film className="w-4 h-4 text-purple-500" />
                                        ) : (
                                            <Camera className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className={`text-xs font-semibold ${h.type === 'reel' ? 'text-purple-600' : 'text-amber-600'}`}>
                                            {h.type === 'reel' ? 'Reel' : 'Pic'} of the Day
                                        </span>
                                    </div>
                                    <button onClick={() => deleteHighlight(h._id)} className="p-1 text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {h.caption && <p className="text-sm text-slate-700 mb-2">{h.caption}</p>}

                                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                    {h.date && (
                                        <span className="flex items-center gap-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {h.date}
                                        </span>
                                    )}
                                    {h.instagramUrl && (
                                        <a href={h.instagramUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-0.5 text-blue-500 hover:underline">
                                            <ExternalLink className="w-3 h-3" /> View on Instagram
                                        </a>
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

export default HighlightManagement;
