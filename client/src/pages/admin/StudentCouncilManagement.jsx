import React, { useState, useEffect } from 'react';
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-500" />
                            Student Council
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage council members and positions</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                        {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Member</>}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 md:p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">{editingId ? 'Edit' : 'Add New'} Member</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Position *</label>
                                <select name="position" value={formData.position} onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Department *</label>
                                <select name="department" value={formData.department} onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXXXXXXXX"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Display Order</label>
                                <input type="number" name="order" value={formData.order} onChange={handleInputChange} placeholder="0"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Photo URL</label>
                                <input type="url" name="photo" value={formData.photo} onChange={handleInputChange} placeholder="https://example.com/photo.jpg"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pledge / Motto</label>
                                <textarea name="pledge" value={formData.pledge} onChange={handleInputChange} placeholder="Enter your pledge or motto..." rows="2"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button type="submit" disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors">
                                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                    {editingId ? 'Update' : 'Add'} Member
                                </button>
                                <button type="button" onClick={resetForm}
                                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Members Grid */}
                {loading && members.length === 0 ? (
                    <div className="text-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : members.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 text-lg">No council members yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Add your first member to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member) => (
                            <div key={member._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate">{member.name}</h3>
                                        <p className="text-sm font-medium text-blue-500">{member.position}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{member.department}</p>
                                    </div>
                                </div>
                                {member.pledge && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 italic">"{member.pledge}"</p>}
                                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(member)}
                                        className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(member._id)}
                                        className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCouncilManagement;
