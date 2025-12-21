import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleEditClick = (dept) => {
        setEditingId(dept._id);
        setSelectedFile(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSaveLogo = async (id) => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('logo', selectedFile);

        try {
            const res = await api.put(`/departments/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local state with new logo path from server
            const updatedDept = res.data.data;
            setDepartments(departments.map(d =>
                d._id === id ? { ...d, logo: updatedDept.logo } : d
            ));
            setEditingId(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Failed to update logo', error);
            alert('Failed to update logo');
        }
    };

    // Helper to resolve image URL
    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return logoPath;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
                <button
                    onClick={fetchDepartments}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-gray-500">Loading departments...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                        <div
                            key={dept._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    {dept.logo ? (
                                        <img
                                            src={getLogoUrl(dept.logo)}
                                            alt={dept.shortCode}
                                            className="h-12 w-12 object-contain"
                                            onError={(e) => { e.target.onerror = null; e.target.src = ''; }} // Simple fallback
                                        />
                                    ) : (
                                        <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:scale-110 transition-transform">
                                            {dept.shortCode[0]}
                                        </div>
                                    )}
                                    <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-semibold tracking-wide">
                                        {dept.shortCode}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">
                                    {dept.name}
                                </h3>

                                {/* Logo Edit Section */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {editingId === dept._id ? (
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="text-xs w-full"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveLogo(dept._id)}
                                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded flex-1"
                                                    disabled={!selectedFile}
                                                >
                                                    Upload
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-xs bg-gray-300 px-2 py-1 rounded flex-1">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEditClick(dept)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
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
