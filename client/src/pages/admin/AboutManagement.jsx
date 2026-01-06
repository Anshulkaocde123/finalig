import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { BookOpen, Target, Eye, History, Star, Plus, Trash2, Save, Mail, Phone } from 'lucide-react';

const AboutManagement = () => {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', missionStatement: '', visionStatement: '', history: '',
        highlights: [], logoUrl: '', bannerUrl: '', contactEmail: '', contactPhone: ''
    });
    const [newHighlight, setNewHighlight] = useState({ title: '', description: '' });

    useEffect(() => { fetchAbout(); }, []);

    const fetchAbout = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/about');
            setAbout(response.data.data);
            setFormData(response.data.data || formData);
        } catch (error) { toast.error('Failed to fetch about page'); }
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAddHighlight = () => {
        if (newHighlight.title && newHighlight.description) {
            setFormData(prev => ({ ...prev, highlights: [...(prev.highlights || []), newHighlight] }));
            setNewHighlight({ title: '', description: '' });
        } else { toast.error('Please fill in both highlight fields'); }
    };

    const handleRemoveHighlight = (index) => setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) { toast.error('Please fill in title and description'); return; }
        try {
            setLoading(true);
            await axios.put('/about', formData);
            toast.success('About page updated successfully');
            fetchAbout();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to update about page'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-400" />
                        About VNIT IG
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your about page content</p>
                </motion.div>

                {loading && !formData.title ? (
                    <div className="text-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Page Title *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="About VNIT Inter-Department Games"
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter a detailed description..." rows="5"
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                            </div>

                            {/* Mission & Vision */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                                    <label className="block text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><Target className="w-4 h-4" /> Mission Statement</label>
                                    <textarea name="missionStatement" value={formData.missionStatement} onChange={handleInputChange} rows="4" placeholder="Our mission..."
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-indigo-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                                </div>
                                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                    <label className="block text-sm font-bold text-purple-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><Eye className="w-4 h-4" /> Vision Statement</label>
                                    <textarea name="visionStatement" value={formData.visionStatement} onChange={handleInputChange} rows="4" placeholder="Our vision..."
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                                </div>
                            </div>

                            {/* History */}
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <label className="block text-sm font-bold text-amber-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><History className="w-4 h-4" /> History</label>
                                <textarea name="history" value={formData.history} onChange={handleInputChange} rows="4" placeholder="History of VNIT IG..."
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
                            </div>

                            {/* Highlights */}
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <label className="block text-sm font-bold text-green-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><Star className="w-4 h-4" /> Event Highlights</label>
                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <input type="text" value={newHighlight.title} onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))} placeholder="Highlight title"
                                        className="flex-1 px-4 py-2 bg-slate-900/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none" />
                                    <input type="text" value={newHighlight.description} onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))} placeholder="Highlight description"
                                        className="flex-1 px-4 py-2 bg-slate-900/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none" />
                                    <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddHighlight}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Add
                                    </motion.button>
                                </div>
                                <AnimatePresence>
                                    {formData.highlights?.map((h, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg mb-2">
                                            <div><span className="font-bold text-white">{h.title}</span><span className="text-gray-400 ml-2">- {h.description}</span></div>
                                            <button type="button" onClick={() => handleRemoveHighlight(idx)} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><Mail className="w-4 h-4" /> Contact Email</label>
                                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="contact@vnit.ac.in"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><Phone className="w-4 h-4" /> Contact Phone</label>
                                    <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="+91 XXXXXXXXXX"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>

                            {/* Submit */}
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                {loading ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AboutManagement;
