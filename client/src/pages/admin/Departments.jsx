import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { RefreshCw, Upload, X, Building } from 'lucide-react';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/departments');
            setDepartments(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch departments');
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
    };

    const handleSaveLogo = async (id) => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('logo', selectedFile);
        try {
            const res = await api.put(`/departments/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setDepartments(departments.map(d => d._id === id ? { ...d, logo: res.data.data.logo } : d));
            setEditingId(null);
            setSelectedFile(null);
            toast.success('Logo updated!');
        } catch (error) {
            toast.error('Failed to update logo');
        }
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        return logoPath.startsWith('http') ? logoPath : `http://localhost:5000${logoPath}`;
    };

    const getDeptColor = (code) => {
        const colors = {
            'CSE': 'from-blue-500 to-cyan-500',
            'ECE': 'from-purple-500 to-pink-500',
            'EEE': 'from-orange-500 to-red-500',
            'MECH': 'from-red-500 to-rose-500',
            'CIVIL': 'from-yellow-500 to-amber-500',
            'CHEM': 'from-green-500 to-emerald-500',
            'META': 'from-pink-500 to-fuchsia-500',
            'MINING': 'from-gray-500 to-slate-500'
        };
        return colors[code] || 'from-indigo-500 to-purple-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                        <Building className="w-8 h-8 text-indigo-400" />
                        Departments
                    </h1>
                    <p className="text-gray-400 mt-1">Manage department logos and information</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={fetchDepartments}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </motion.button>
            </motion.div>

            {loading ? (
                <div className="text-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
                    <p className="text-gray-400 mt-4">Loading departments...</p>
                </div>
            ) : error ? (
                <div className="p-6 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept, idx) => (
                        <motion.div
                            key={dept._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all"
                        >
                            {/* Header with gradient */}
                            <div className={`h-24 bg-gradient-to-br ${getDeptColor(dept.shortCode)} flex items-center justify-center relative`}>
                                <div className="absolute inset-0 bg-black/20" />
                                {getLogoUrl(dept.logo) ? (
                                    <img src={getLogoUrl(dept.logo)} alt={dept.shortCode} className="h-16 w-16 object-contain relative z-10" />
                                ) : (
                                    <span className="text-4xl font-black text-white relative z-10">{dept.shortCode?.slice(0, 2)}</span>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-black text-white">{dept.name}</h3>
                                        <span className="text-sm text-gray-500">{dept.shortCode}</span>
                                    </div>
                                </div>

                                {/* Logo Edit */}
                                <div className="pt-4 border-t border-white/10">
                                    {editingId === dept._id ? (
                                        <div className="space-y-3">
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-gray-400 w-full" />
                                            <div className="flex gap-2">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSaveLogo(dept._id)} disabled={!selectedFile}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                                                >
                                                    <Upload className="w-4 h-4" /> Upload
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingId(null); setSelectedFile(null); }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-gray-400 rounded-xl font-medium text-sm"
                                                >
                                                    <X className="w-4 h-4" /> Cancel
                                                </motion.button>
                                            </div>
                                        </div>
                                    ) : (
                                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setEditingId(dept._id)}
                                            className="w-full text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                        >
                                            {dept.logo ? '🖼️ Change Logo' : '➕ Add Logo'}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Departments;
