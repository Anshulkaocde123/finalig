import React, { useState, useEffect } from 'react';
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
            const res = await api.put(`/departments/${id}`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            setDepartments(departments.map(d => 
                d._id === id ? { ...d, logo: res.data.data.logo } : d
            ));
            setEditingId(null);
            setSelectedFile(null);
            toast.success('Logo updated!');
        } catch (error) {
            toast.error('Failed to update logo');
        }
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        return `${baseUrl}${logoPath}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building className="w-6 h-6 text-blue-500" />
                        Departments
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage department logos</p>
                </div>
                <button
                    onClick={fetchDepartments}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16">
                    <div className="w-10 h-10 mx-auto rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">Loading...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <div
                            key={dept._id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                        >
                            {/* Header */}
                            <div className="h-20 bg-blue-500 flex items-center justify-center">
                                {getLogoUrl(dept.logo) ? (
                                    <img 
                                        src={getLogoUrl(dept.logo)} 
                                        alt={dept.shortCode} 
                                        className="h-12 w-12 object-contain" 
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">
                                        {dept.shortCode?.slice(0, 2)}
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h3>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{dept.shortCode}</span>

                                {/* Logo Edit */}
                                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                                    {editingId === dept._id ? (
                                        <div className="space-y-2">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileChange} 
                                                className="text-xs text-slate-600 dark:text-slate-400 w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-900" 
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleSaveLogo(dept._id)} 
                                                    disabled={!selectedFile}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                                                >
                                                    <Upload className="w-3 h-3" /> Upload
                                                </button>
                                                <button 
                                                    onClick={() => { setEditingId(null); setSelectedFile(null); }}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
                                                >
                                                    <X className="w-3 h-3" /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setEditingId(dept._id)}
                                            className="w-full text-xs text-blue-500 hover:text-blue-600 font-medium"
                                        >
                                            {dept.logo ? 'Change Logo' : 'Add Logo'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Departments;
