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
        return logoPath.startsWith('http') ? logoPath : `http://localhost:5000${logoPath}`;
    };

    const getDeptColor = (code) => {
        const colors = {
            'CSE': 'from-blue-600 to-cyan-600',
            'ECE': 'from-purple-600 to-pink-600',
            'EEE': 'from-orange-600 to-red-600',
            'MECH': 'from-red-600 to-rose-600',
            'CIVIL': 'from-yellow-600 to-amber-600',
            'CHEM': 'from-green-600 to-emerald-600',
            'META': 'from-pink-600 to-fuchsia-600',
            'MINING': 'from-gray-600 to-slate-600'
        };
        return colors[code] || 'from-indigo-600 to-purple-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Building className="w-8 h-8 text-indigo-600" />
                        Departments
                    </h1>
                    <p className="text-gray-600 mt-1">Manage department logos and information</p>
                </div>
                <button
                    onClick={fetchDepartments}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl border-2 border-transparent disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                    <p className="text-gray-600 mt-4">Loading departments...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border-2 border-red-300 rounded-2xl text-red-700 shadow-md">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                        <div
                            key={dept._id}
                            className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-xl shadow-lg"
                        >
                            {/* Header with gradient */}
                            <div className={`h-24 bg-gradient-to-br ${getDeptColor(dept.shortCode)} flex items-center justify-center relative shadow-md`}>
                                {getLogoUrl(dept.logo) ? (
                                    <img 
                                        src={getLogoUrl(dept.logo)} 
                                        alt={dept.shortCode} 
                                        className="h-16 w-16 object-contain relative z-10 drop-shadow-lg" 
                                    />
                                ) : (
                                    <span className="text-4xl font-black text-white relative z-10 drop-shadow-lg">
                                        {dept.shortCode?.slice(0, 2)}
                                    </span>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{dept.name}</h3>
                                        <span className="text-sm text-gray-600 font-medium">{dept.shortCode}</span>
                                    </div>
                                </div>

                                {/* Logo Edit */}
                                <div className="pt-4 border-t-2 border-gray-100">
                                    {editingId === dept._id ? (
                                        <div className="space-y-3">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileChange} 
                                                className="text-xs text-gray-600 w-full border-2 border-gray-200 rounded-lg p-2" 
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleSaveLogo(dept._id)} 
                                                    disabled={!selectedFile}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50"
                                                >
                                                    <Upload className="w-4 h-4" /> Upload
                                                </button>
                                                <button 
                                                    onClick={() => { setEditingId(null); setSelectedFile(null); }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm border-2 border-gray-200 hover:bg-gray-200"
                                                >
                                                    <X className="w-4 h-4" /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setEditingId(dept._id)}
                                            className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            {dept.logo ? '🖼️ Change Logo' : '➕ Add Logo'}
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
