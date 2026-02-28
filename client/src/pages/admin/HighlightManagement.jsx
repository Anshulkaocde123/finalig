import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Camera, Plus, Trash2, Edit3, X, Save, Calendar } from 'lucide-react';

const HighlightManagement = () => {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        type: 'REEL_OF_THE_DAY', title: '', description: '',
        videoUrl: '', credit: '', sport: '', date: new Date().toISOString().split('T')[0]
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fetchHighlights = async () => {
        try {
            setLoading(true);
            const res = await api.get('/highlights');
            setHighlights(res.data.data || []);
        } catch (err) { toast.error('Failed to load highlights'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHighlights(); }, []);

    const resetForm = () => {
        setFormData({
            type: 'REEL_OF_THE_DAY', title: '', description: '',
            videoUrl: '', credit: '', sport: '', date: new Date().toISOString().split('T')[0]
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    const startEdit = (highlight) => {
        setEditingId(highlight._id);
        setFormData({
            type: highlight.type || 'REEL_OF_THE_DAY',
            title: highlight.title || '',
            description: highlight.description || '',
            videoUrl: highlight.videoUrl || '',
            credit: highlight.credit || '',
            sport: highlight.sport || '',
            date: highlight.date ? new Date(highlight.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setImagePreview(highlight.imageUrl || null);
        setImageFile(null);
        setShowForm(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) { toast.error('Title is required'); return; }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('type', formData.type);
            data.append('title', formData.title);
            if (formData.description) data.append('description', formData.description);
            if (formData.videoUrl) data.append('videoUrl', formData.videoUrl);
            if (formData.credit) data.append('credit', formData.credit);
            if (formData.sport) data.append('sport', formData.sport);
            if (formData.date) data.append('date', formData.date);
            if (imageFile) data.append('image', imageFile);

            if (editingId) {
                await api.put(`/highlights/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Highlight updated!');
            } else {
                await api.post('/highlights', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Highlight created!');
            }
            resetForm();
            fetchHighlights();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const deleteHighlight = async (id) => {
        if (!window.confirm('Delete this highlight?')) return;
        try {
            await api.delete(`/highlights/${id}`);
            toast.success('Deleted');
            fetchHighlights();
        } catch (err) { toast.error('Failed to delete'); }
    };

    const isReel = formData.type === 'REEL_OF_THE_DAY';

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
                        <p className="text-sm text-slate-500 mt-1">Manage Reel of the Day & Pic of the Day</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Add Highlight
                    </button>
                </div>

                {/* Create/Edit Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-6">
                            <div className="bg-white border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-slate-900">
                                        {editingId ? 'Edit Highlight' : 'New Highlight'}
                                    </h2>
                                    <button onClick={resetForm} className="p-1 text-slate-400 hover:text-slate-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'REEL_OF_THE_DAY' }))}
                                            className={`p-3 rounded-lg border text-center transition-colors ${
                                                isReel ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}>
                                            <Film className="w-5 h-5 mx-auto mb-1" />
                                            <div className="text-xs font-medium">Reel of the Day</div>
                                        </button>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'PIC_OF_THE_DAY' }))}
                                            className={`p-3 rounded-lg border text-center transition-colors ${
                                                !isReel ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}>
                                            <Camera className="w-5 h-5 mx-auto mb-1" />
                                            <div className="text-xs font-medium">Pic of the Day</div>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Enter a catchy title" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            rows={2} placeholder="Brief description..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                    </div>

                                    {isReel ? (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Video URL (YouTube/Instagram)</label>
                                            <input type="url" value={formData.videoUrl} onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                                placeholder="https://..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Image</label>
                                            <input type="file" accept="image/*" onChange={handleImageChange}
                                                className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-200" />
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Credit</label>
                                            <input type="text" value={formData.credit} onChange={(e) => setFormData(prev => ({ ...prev, credit: e.target.value }))}
                                                placeholder="Photographer/Creator" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                                            <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button type="submit" disabled={saving}
                                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                                            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
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
                                    h.type === 'REEL_OF_THE_DAY' ? 'border-purple-200' : 'border-amber-200'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        {h.type === 'REEL_OF_THE_DAY' ? (
                                            <Film className="w-4 h-4 text-purple-500" />
                                        ) : (
                                            <Camera className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className={`text-xs font-semibold ${h.type === 'REEL_OF_THE_DAY' ? 'text-purple-600' : 'text-amber-600'}`}>
                                            {h.type === 'REEL_OF_THE_DAY' ? 'Reel' : 'Pic'} of the Day
                                        </span>
                                        {h.isActive && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">Active</span>}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => startEdit(h)} className="p-1 text-slate-400 hover:text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => deleteHighlight(h._id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm">{h.title}</h3>
                                {h.description && <p className="text-xs text-slate-500 mt-0.5">{h.description}</p>}
                                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                                    {h.date && <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(h.date).toLocaleDateString()}</span>}
                                    {h.credit && <span>📸 {h.credit}</span>}
                                    {h.videoUrl && <a href={h.videoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">🔗 Video</a>}
                                </div>
                                {h.imageUrl && (
                                    <img src={h.imageUrl} alt={h.title} className="mt-2 w-full h-24 object-cover rounded-lg border border-slate-200" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HighlightManagement;
