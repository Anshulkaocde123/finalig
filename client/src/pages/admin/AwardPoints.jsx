import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { Award, Trash2, Clock, Send } from 'lucide-react';

const AwardPoints = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({ department: '', category: 'Sports', eventName: '', position: '', points: '', description: '' });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data.data || res.data);
            } catch (error) { toast.error('Failed to load departments'); }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.department || !formData.eventName || !formData.points) { toast.error('Please fill required fields'); return; }
        setLoading(true);
        try {
            const res = await api.post('/leaderboard/award', { ...formData, points: Number(formData.points) });
            toast.success('Points Awarded Successfully!');
            const deptName = departments.find(d => d._id === formData.department)?.name || 'Unknown';
            setRecentLogs([{ ...res.data, departmentName: deptName, id: res.data._id || Date.now(), awardedAt: new Date().toISOString() }, ...recentLogs].slice(0, 10));
            setFormData({ department: '', category: 'Sports', eventName: '', position: '', points: '', description: '' });
        } catch (error) { toast.error('Failed to award points'); }
        finally { setLoading(false); }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'Just now';
        const diff = (new Date() - new Date(dateStr)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-500" />
                    Judge's Console
                </h1>
                <p className="text-gray-400 mt-1">Award points to departments for events and achievements</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Department <span className="text-red-400">*</span></label>
                                <select name="department" value={formData.department} onChange={handleChange} required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name} ({dept.shortCode})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Event Name <span className="text-red-400">*</span></label>
                                    <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="e.g. Cricket Finals" required
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="Sports">Sports</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Literary">Literary</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Position</label>
                                    <select name="position" value={formData.position} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">Select Position</option>
                                        <option value="Winner">🥇 Winner (1st)</option>
                                        <option value="Runner-up">🥈 Runner-up (2nd)</option>
                                        <option value="2nd Runner-up">🥉 2nd Runner-up (3rd)</option>
                                        <option value="Participation">📜 Participation</option>
                                        <option value="Special">⭐ Special Award</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Points <span className="text-red-400">*</span></label>
                                    <input type="number" name="points" value={formData.points} onChange={handleChange} placeholder="e.g. 10, 25, -5" required
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <p className="text-xs text-gray-500 mt-2">Use negative for deductions</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Notes (Optional)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Additional notes..."
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                            </div>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-yellow-500/25 disabled:opacity-50">
                                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                {loading ? 'Awarding...' : 'Award Points'}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>

                {/* Recent Logs */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-400" /> Recent Awards</h3>
                            {recentLogs.length > 0 && (
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowClearConfirm(true)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
                            )}
                        </div>
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-3xl mb-2">📝</div>
                                <p className="text-sm">No awards yet this session</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                <AnimatePresence>
                                    {recentLogs.map((log, idx) => (
                                        <motion.div key={log.id || idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-white">{log.departmentName || log.department?.name}</div>
                                                    <div className="text-sm text-gray-400">{log.eventName}</div>
                                                    {log.position && <div className="text-xs text-indigo-400 mt-1">📍 {log.position}</div>}
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xl font-black ${log.points > 0 ? 'text-green-400' : 'text-red-400'}`}>{log.points > 0 ? '+' : ''}{log.points}</div>
                                                    <div className="text-xs text-gray-500">{formatTime(log.awardedAt)}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <ConfirmModal isOpen={showClearConfirm} title="Clear History" message="Clear all session logs?" confirmText="Clear" onConfirm={() => { setRecentLogs([]); setShowClearConfirm(false); toast.success('Cleared'); }} onCancel={() => setShowClearConfirm(false)} variant="danger" />
        </div>
    );
};

export default AwardPoints;
