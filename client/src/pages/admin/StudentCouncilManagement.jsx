import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Plus, Edit, Trash2, X, Save, User } from 'lucide-react';

const StudentCouncilManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', position: 'Member', department: 'CSE', photo: '', pledge: '', email: '', phone: '', order: 0 });

    const departments = ['CSE', 'CIVIL', 'CHEM', 'EEE', 'ECE', 'MECH', 'META', 'MINING'];
    const positions = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head', 'Member'];

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/student-council');
            setMembers(response.data.data || []);
        } catch (error) { toast.error('Failed to fetch members'); }
        finally { setLoading(false); }
    };

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.position || !formData.department) { toast.error('Please fill in all required fields'); return; }
        try {
            setLoading(true);
            if (editingId) {
                await axios.put(`/student-council/${editingId}`, formData);
                toast.success('Member updated successfully');
            } else {
                await axios.post('/student-council', formData);
                toast.success('Member added successfully');
            }
            resetForm();
            fetchMembers();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to save member'); }
        finally { setLoading(false); }
    };

    const handleEdit = (member) => { setFormData(member); setEditingId(member._id); setShowForm(true); };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                setLoading(true);
                await axios.delete(`/student-council/${id}`);
                toast.success('Member deleted successfully');
                fetchMembers();
            } catch (error) { toast.error('Failed to delete member'); }
            finally { setLoading(false); }
        }
    };

    const resetForm = () => { setFormData({ name: '', position: 'Member', department: 'CSE', photo: '', pledge: '', email: '', phone: '', order: 0 }); setEditingId(null); setShowForm(false); };

    const getPositionColor = (pos) => {
        const colors = { 'President': 'from-yellow-500 to-amber-600', 'Vice President': 'from-blue-500 to-indigo-600', 'Secretary': 'from-purple-500 to-pink-600', 'Treasurer': 'from-green-500 to-emerald-600', 'Sports Head': 'from-red-500 to-orange-600', 'Cultural Head': 'from-pink-500 to-rose-600', 'Academics Head': 'from-cyan-500 to-teal-600' };
        return colors[pos] || 'from-slate-500 to-slate-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                            <Users className="w-8 h-8 text-indigo-400" />
                            Student Council
                        </h1>
                        <p className="text-gray-400 mt-1">Manage council members and positions</p>
                    </motion.div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white shadow-lg`}>
                        {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Member</>}
                    </motion.button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit' : 'Add New'} Member</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Full Name *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Position *</label>
                                    <select name="position" value={formData.position} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Department *</label>
                                    <select name="department" value={formData.department} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXXXXXXXX"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Display Order</label>
                                    <input type="number" name="order" value={formData.order} onChange={handleInputChange} placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Photo URL</label>
                                    <input type="url" name="photo" value={formData.photo} onChange={handleInputChange} placeholder="https://example.com/photo.jpg"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Pledge / Motto</label>
                                    <textarea name="pledge" value={formData.pledge} onChange={handleInputChange} placeholder="Enter your pledge or motto..." rows="2"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                                </div>
                                <div className="md:col-span-2 flex gap-4">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50">
                                        {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingId ? 'Update' : 'Add'} Member
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={resetForm}
                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold">
                                        Cancel
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Members Grid */}
                {loading && members.length === 0 ? (
                    <div className="text-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : members.length === 0 ? (
                    <div className="text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No council members yet</p>
                        <p className="text-gray-500 text-sm mt-2">Add your first member to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member, idx) => (
                            <motion.div key={member._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${getPositionColor(member.position)} flex items-center justify-center text-white shadow-lg`}>
                                        {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white truncate">{member.name}</h3>
                                        <p className={`text-sm font-semibold bg-gradient-to-r ${getPositionColor(member.position)} bg-clip-text text-transparent`}>{member.position}</p>
                                        <p className="text-xs text-gray-500 mt-1">{member.department}</p>
                                    </div>
                                </div>
                                {member.pledge && <p className="text-sm text-gray-400 mt-3 italic">"{member.pledge}"</p>}
                                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(member)}
                                        className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-lg"><Edit className="w-4 h-4" /></motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(member._id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCouncilManagement;
