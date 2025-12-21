import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Users, Settings, AlertCircle } from 'lucide-react';

const SPORTS = [
    { label: '🏏 Cricket', value: 'CRICKET', config: { overs: 20 } },
    { label: '⚽ Football', value: 'FOOTBALL', config: { periods: 2 } },
    { label: '🏀 Basketball', value: 'BASKETBALL', config: { periods: 4 } },
    { label: '🏸 Badminton', value: 'BADMINTON', config: { sets: 3 } },
    { label: '🏓 Table Tennis', value: 'TABLE_TENNIS', config: { sets: 3 } },
    { label: '🏐 Volleyball', value: 'VOLLEYBALL', config: { sets: 3 } },
    { label: '♚ Chess', value: 'CHESS', config: { timeControl: null } },
    { label: '🎯 Kho Kho', value: 'KHOKHO', config: { periods: 2 } },
    { label: '🤼 Kabaddi', value: 'KABADDI', config: { periods: 2 } }
];

const ScheduleMatch = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        sport: 'CRICKET',
        teamA: '',
        teamB: '',
        scheduledAt: '',
        venue: '',
        config: { overs: 20 } // Default cricket config
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/departments');
                setDepartments(response.data.data || []);
            } catch (err) {
                console.error('Failed to fetch departments', err);
                toast.error('Failed to load departments');
            }
        };
        fetchDepartments();
    }, []);

    const handleSportChange = (e) => {
        const sport = e.target.value;
        const selectedSport = SPORTS.find(s => s.value === sport);
        setFormData(prev => ({
            ...prev,
            sport,
            config: selectedSport?.config || {}
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                [name]: parseInt(value) || value
            }
        }));
    };

    const validateForm = () => {
        if (!formData.teamA || !formData.teamB) {
            toast.error('Please select both teams');
            return false;
        }
        if (formData.teamA === formData.teamB) {
            toast.error('Teams cannot be the same');
            return false;
        }
        if (!formData.scheduledAt) {
            toast.error('Please select date and time');
            return false;
        }
        const selectedDate = new Date(formData.scheduledAt);
        const now = new Date();
        if (selectedDate <= now) {
            toast.error('Date must be in the future');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const sportParam = formData.sport.toLowerCase();
            const payload = {
                teamA: formData.teamA,
                teamB: formData.teamB,
                sport: formData.sport,
                scheduledAt: formData.scheduledAt,
                venue: formData.venue || 'Main Ground'
            };

            // Add sport-specific config
            if (formData.sport === 'CRICKET') {
                payload.totalOvers = formData.config.overs || 20;
            } else if (['BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL'].includes(formData.sport)) {
                payload.maxSets = formData.config.sets || 3;
            } else if (['FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI'].includes(formData.sport)) {
                payload.maxPeriods = formData.config.periods || 2;
            }

            await api.post(`/matches/${sportParam}/create`, payload);

            toast.success('Match scheduled successfully!');
            setFormData({
                sport: 'CRICKET',
                teamA: '',
                teamB: '',
                scheduledAt: '',
                venue: '',
                config: { overs: 20 }
            });
        } catch (err) {
            console.error('Error scheduling match:', err);
            toast.error(err.response?.data?.message || 'Failed to schedule match');
        } finally {
            setLoading(false);
        }
    };

    const selectedSport = SPORTS.find(s => s.value === formData.sport);

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    Schedule Match
                </h2>
                <p className="text-gray-400">Create a new match with custom settings</p>
            </div>

            {/* Form Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sport Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                            Select Sport
                        </label>
                        <select
                            value={formData.sport}
                            onChange={handleSportChange}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white font-medium"
                        >
                            {SPORTS.map(sport => (
                                <option key={sport.value} value={sport.value}>
                                    {sport.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teams Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Team A</label>
                            <select
                                name="teamA"
                                value={formData.teamA}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-blue-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white font-medium"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.shortCode} - {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Team B</label>
                            <select
                                name="teamB"
                                value={formData.teamB}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-pink-600/50 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-white font-medium"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.shortCode} - {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Venue */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Venue</label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            placeholder="e.g., Main Ground, Court A"
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Schedule Date & Time (IST)</label>
                        <input
                            type="datetime-local"
                            name="scheduledAt"
                            value={formData.scheduledAt}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white"
                        />
                    </div>

                    {/* Sport-Specific Configuration */}
                    {formData.sport === 'CRICKET' && (
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                            <label className="block text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Settings className="w-4 h-4" />
                                Cricket Configuration
                            </label>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Total Overs</label>
                                <input
                                    type="number"
                                    name="overs"
                                    value={formData.config.overs}
                                    onChange={handleConfigChange}
                                    min="5"
                                    max="50"
                                    className="w-full px-4 py-2 bg-gray-900/50 border border-indigo-500/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">Standard: 20 (T20), 50 (ODI)</p>
                            </div>
                        </div>
                    )}

                    {['BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL'].includes(formData.sport) && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <label className="block text-sm font-bold text-purple-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Settings className="w-4 h-4" />
                                Sets Configuration
                            </label>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Best of</label>
                                <select
                                    name="sets"
                                    value={formData.config.sets}
                                    onChange={handleConfigChange}
                                    className="w-full px-4 py-2 bg-gray-900/50 border border-purple-500/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="3">Best of 3</option>
                                    <option value="5">Best of 5</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {['FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI'].includes(formData.sport) && (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <label className="block text-sm font-bold text-green-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Settings className="w-4 h-4" />
                                Match Duration
                            </label>
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">
                                    {formData.sport === 'BASKETBALL' ? 'Quarters' : 'Periods/Halves'}
                                </label>
                                <select
                                    name="periods"
                                    value={formData.config.periods}
                                    onChange={handleConfigChange}
                                    className="w-full px-4 py-2 bg-gray-900/50 border border-green-500/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="2">2 {formData.sport === 'BASKETBALL' ? 'Halves' : 'Periods'}</option>
                                    <option value="4">4 Quarters</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Validation Warning */}
                    {formData.teamA === formData.teamB && formData.teamA && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">Both teams cannot be the same</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB}
                        className={`w-full py-4 px-4 rounded-xl text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB
                                ? 'bg-gray-600/50 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl hover:shadow-indigo-500/50'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Scheduling...
                            </>
                        ) : (
                            <>
                                <Calendar className="w-5 h-5" />
                                Schedule Match
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScheduleMatch;
