import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Film, Camera, Trash2, Plus, Link, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminHighlights = () => {
    const [highlights, setHighlights] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [form, setForm] = useState({ type: 'reel', instagramUrl: '', caption: '', date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    const fetchHighlights = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/highlights?date=${selectedDate}`);
            setHighlights(data);
        } catch (err) {
            console.error(err);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchHighlights();
    }, [fetchHighlights]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.instagramUrl) {
            toast.error('Instagram URL is required');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/highlights', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${form.type === 'reel' ? 'Reel' : 'Pic'} of the Day uploaded!`);
            setForm({ type: 'reel', instagramUrl: '', caption: '', date: form.date });
            fetchHighlights();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload highlight');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this highlight?')) return;
        try {
            await axios.delete(`/api/highlights/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Highlight deleted');
            // Immediately remove from state
            setHighlights(prev => prev.filter(h => h._id !== id));
        } catch (err) {
            toast.error('Failed to delete highlight');
        }
    };

    const existingReel = highlights.find(h => h.type === 'reel');
    const existingPic = highlights.find(h => h.type === 'pic');

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Highlights</h2>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Highlight
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        >
                            <option value="reel">Reel of the Day</option>
                            <option value="pic">Pic of the Day</option>
                        </select>
                        {form.type === 'reel' && existingReel && (
                            <p className="text-xs text-amber-500 mt-1">⚠ A reel already exists for {selectedDate}. Delete it first.</p>
                        )}
                        {form.type === 'pic' && existingPic && (
                            <p className="text-xs text-amber-500 mt-1">⚠ A pic already exists for {selectedDate}. Delete it first.</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => { setForm({ ...form, date: e.target.value }); setSelectedDate(e.target.value); }}
                            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        <Link className="w-4 h-4 inline mr-1" /> Instagram URL
                    </label>
                    <input
                        type="url"
                        value={form.instagramUrl}
                        onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                        placeholder="https://www.instagram.com/reel/... or https://www.instagram.com/p/..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Caption (optional)</label>
                    <input
                        type="text"
                        value={form.caption}
                        onChange={(e) => setForm({ ...form, caption: e.target.value })}
                        placeholder="Optional caption"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload Highlight'}
                </button>
            </form>

            {/* Existing highlights for selected date */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Highlights for {selectedDate}</span>
                </div>
                {highlights.length === 0 ? (
                    <p className="text-sm text-slate-500">No highlights for this date.</p>
                ) : (
                    highlights.map(h => (
                        <motion.div
                            key={h._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                        >
                            <div className="flex items-center gap-3">
                                {h.type === 'reel' ? <Film className="w-5 h-5 text-pink-500" /> : <Camera className="w-5 h-5 text-blue-500" />}
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {h.type === 'reel' ? 'Reel' : 'Pic'} of the Day
                                    </p>
                                    <a href={h.instagramUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-xs">
                                        {h.instagramUrl}
                                    </a>
                                    {h.caption && <p className="text-xs text-slate-500 mt-1">{h.caption}</p>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(h._id)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminHighlights;
