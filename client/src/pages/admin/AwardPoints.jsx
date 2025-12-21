import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AwardPoints = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        department: '',
        category: 'Sports',
        eventName: '',
        position: '',
        points: '',
        description: ''
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data.data || res.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast.error('Failed to load departments');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.department || !formData.eventName || !formData.points) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/leaderboard/award', {
                ...formData,
                points: Number(formData.points)
            });

            toast.success('Points Awarded Successfully!');

            // Add to local recent logs
            const deptName = departments.find(d => d._id === formData.department)?.name || 'Unknown';
            setRecentLogs([
                {
                    ...res.data,
                    departmentName: deptName,
                    id: res.data._id || Date.now(),
                    awardedAt: new Date().toISOString()
                },
                ...recentLogs
            ].slice(0, 10));

            // FULL RESET - Clear ALL form fields
            setFormData({
                department: '',
                category: 'Sports',
                eventName: '',
                position: '',
                points: '',
                description: ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to award points');
        } finally {
            setLoading(false);
        }
    };

    const clearLogs = () => {
        setRecentLogs([]);
        setShowClearConfirm(false);
        toast.success('Session history cleared');
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'Just now';
        const diff = (new Date() - new Date(dateStr)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Judge's Console</h1>
                <p className="text-gray-500 mt-2">Award points to departments for events and achievements</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Department Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name} ({dept.shortCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                placeholder="e.g. Cricket Finals, Debate Competition"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                            >
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position / Rank</label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                            >
                                <option value="">Select Position</option>
                                <option value="Winner">🥇 Winner (1st Place)</option>
                                <option value="Runner-up">🥈 Runner-up (2nd Place)</option>
                                <option value="2nd Runner-up">🥉 2nd Runner-up (3rd Place)</option>
                                <option value="Participation">📜 Participation</option>
                                <option value="Special">⭐ Special Award</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Points <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleChange}
                                placeholder="e.g. 10, 25, -5"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Use negative values for deductions</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description / Notes (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Additional notes about this award..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            rows="2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all active:scale-[0.99] ${loading
                                ? 'bg-indigo-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Processing...
                            </span>
                        ) : (
                            '🏆 Award Points'
                        )}
                    </button>

                </form>
            </div>

            {/* Recent Session Activity */}
            {recentLogs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Session Activity ({recentLogs.length})</h3>
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear History
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentLogs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-semibold text-gray-800">{log.departmentName}</span>
                                        <span className="text-gray-400 mx-2">•</span>
                                        <span className="text-gray-600">{log.eventName}</span>
                                        {log.position && (
                                            <span className="text-xs text-gray-400 ml-2">({log.position})</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold text-lg ${log.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.points > 0 ? '+' : ''}{log.points}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatTime(log.awardedAt)}</span>
                                    </div>
                                </div>
                                {log.description && (
                                    <p className="text-sm text-gray-500 mt-1">{log.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clear Confirm Modal */}
            <ConfirmModal
                isOpen={showClearConfirm}
                title="Clear Session History"
                message="Are you sure you want to clear the session activity log? This only clears your local view, awarded points are already saved."
                confirmText="Clear"
                onConfirm={clearLogs}
                onCancel={() => setShowClearConfirm(false)}
                variant="warning"
            />
        </div>
    );
};

export default AwardPoints;
