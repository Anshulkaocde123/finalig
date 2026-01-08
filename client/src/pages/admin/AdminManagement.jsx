import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { Shield, Plus, Edit, Trash2, UserCheck, UserX, Activity, X, Save } from 'lucide-react';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [liveActivity, setLiveActivity] = useState([]);
    const [formData, setFormData] = useState({ studentId: '', username: '', email: '', password: '', role: 'score_manager', isTrusted: false });

    const roles = [
        { value: 'viewer', label: 'Viewer', description: 'Can only view', color: 'gray' },
        { value: 'moderator', label: 'Moderator', description: 'Basic moderation', color: 'yellow' },
        { value: 'score_manager', label: 'Score Manager', description: 'Can update scores', color: 'green' },
        { value: 'admin', label: 'Admin', description: 'Full admin access', color: 'blue' },
        { value: 'super_admin', label: 'Super Admin', description: 'Complete control', color: 'purple' }
    ];

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admins');
            setAdmins(response.data.data || []);
        } catch (err) { if (err.response?.status !== 403) toast.error('Failed to load admins'); }
        finally { setLoading(false); }
    };

    const fetchLiveActivity = async () => {
        try {
            const response = await api.get('/admins/activity/live');
            setLiveActivity(response.data.data || []);
        } catch (err) { console.log('Activity not available'); }
    };

    useEffect(() => {
        fetchAdmins();
        fetchLiveActivity();
        const interval = setInterval(fetchLiveActivity, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admins', formData);
            toast.success('Admin created successfully');
            setShowCreateModal(false);
            setFormData({ studentId: '', username: '', email: '', password: '', role: 'score_manager', isTrusted: false });
            fetchAdmins();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create admin'); }
    };

    const handleVerifyAdmin = async (adminId) => {
        const admin = admins.find(a => a._id === adminId);
        const displayName = admin?.name || admin?.username || 'Admin';
        
        if (!window.confirm(`Verify and trust ${displayName}?\n\nThis will grant them ${admin?.role} access to the system.`)) return;
        
        try {
            await api.put(`/admins/${adminId}/verify`, { isTrusted: true, verified: true });
            toast.success(`${displayName} verified and trusted successfully!`);
            fetchAdmins();
        } catch (err) { 
            console.error('❌ Verify error:', err);
            toast.error(err.response?.data?.message || 'Failed to verify admin'); 
        }
    };

    const handleSuspendAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to suspend this admin?')) return;
        try {
            await api.put(`/admins/${adminId}/suspend`);
            toast.success('Admin suspended');
            fetchAdmins();
        } catch (err) { toast.error('Failed to suspend admin'); }
    };

    const handleUpdateRole = async (adminId, newRole) => {
        try {
            await api.put(`/admins/${adminId}`, { role: newRole });
            toast.success('Role updated');
            fetchAdmins();
        } catch (err) { toast.error('Failed to update role'); }
    };

    const getRoleColor = (role) => {
        const colors = { super_admin: 'purple', admin: 'blue', score_manager: 'green', moderator: 'yellow', viewer: 'gray' };
        return colors[role] || 'gray';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                            <Shield className="w-8 h-8 text-indigo-400" />
                            Admin Management
                        </h1>
                        <p className="text-gray-300 mt-1">Manage admin users, verify Google OAuth accounts, and control permissions</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
                        <Plus className="w-5 h-5" /> Add Admin
                    </button>
                </div>

                {/* Live Activity */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <Activity className="w-5 h-5 text-green-400" /> Live Activity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {liveActivity.length > 0 ? liveActivity.map((activity, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center"><span className="text-indigo-400">👤</span></div>
                                    <div>
                                        <div className="text-white font-medium">{activity.adminName}</div>
                                        <div className="text-gray-800 text-xs">{activity.role}</div>
                                    </div>
                                </div>
                                <div className="text-gray-300 text-sm">{activity.action}</div>
                                <div className="text-gray-800 text-sm font-semibold mt-1">{activity.match}</div>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center text-gray-800 py-4">No active sessions</div>
                        )}
                    </div>
                </div>

                {/* Admin List */}
                {loading ? (
                    <div className="text-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : (
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold font-bold text-gray-700 uppercase">Admin</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold font-bold text-gray-700 uppercase">Role</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold font-bold text-gray-700 uppercase">Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold font-bold text-gray-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {admins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {admin.profilePicture ? (
                                                        <img src={admin.profilePicture} alt={admin.username} 
                                                            className="w-10 h-10 rounded-full border-2 border-white/20" />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-${getRoleColor(admin.role)}-500 to-${getRoleColor(admin.role)}-600 flex items-center justify-center text-white font-bold`}>
                                                            {admin.username?.charAt(0).toUpperCase() || admin.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-white font-medium flex items-center gap-2">
                                                            {admin.name || admin.username}
                                                            {admin.provider === 'google' && (
                                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-semibold">Google</span>
                                                            )}
                                                        </div>
                                                        <div className="text-gray-400 text-xs">{admin.email}</div>
                                                        {admin.username && admin.name && admin.username !== admin.name && (
                                                            <div className="text-gray-500 text-xs">@{admin.username}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select value={admin.role} onChange={(e) => handleUpdateRole(admin._id, e.target.value)}
                                                    className={`px-3 py-1 bg-${getRoleColor(admin.role)}-500/20 text-${getRoleColor(admin.role)}-400 border border-${getRoleColor(admin.role)}-500/30 rounded-lg text-sm font-medium focus:outline-none`}>
                                                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                {admin.isTrusted ? (
                                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-semibold font-bold">✓ Verified</span>
                                                ) : admin.isSuspended ? (
                                                    <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-semibold font-bold">Suspended</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm font-semibold font-bold">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {!admin.isTrusted && !admin.isSuspended && (
                                                        <button onClick={() => handleVerifyAdmin(admin._id)}
                                                            className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg" title="Verify">
                                                            <UserCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {!admin.isSuspended && (
                                                        <button onClick={() => handleSuspendAdmin(admin._id)}
                                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg" title="Suspend">
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {admins.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No admins found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Add New Admin</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-700 hover:text-white"><X className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={handleCreateAdmin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Username *</label>
                                        <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Email *</label>
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Password *</label>
                                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Role</label>
                                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2">
                                        <Save className="w-5 h-5" /> Create Admin
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                
            </div>
        </div>
    );
};

export default AdminManagement;
