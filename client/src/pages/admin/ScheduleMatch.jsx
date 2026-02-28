import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, Plus, AlertCircle, Trophy } from 'lucide-react';

const SPORTS = [
    { label: 'Cricket', value: 'CRICKET', icon: '🏏' },
    { label: 'Football', value: 'FOOTBALL', icon: '⚽' },
    { label: 'Hockey', value: 'HOCKEY', icon: '🏑' },
    { label: 'Basketball', value: 'BASKETBALL', icon: '🏀' },
    { label: 'Badminton', value: 'BADMINTON', icon: '🏸' },
    { label: 'Table Tennis', value: 'TABLE_TENNIS', icon: '🏓' },
    { label: 'Volleyball', value: 'VOLLEYBALL', icon: '🏐' },
    { label: 'Chess', value: 'CHESS', icon: '♟️' },
    { label: 'Kho Kho', value: 'KHOKHO', icon: '🏃' },
    { label: 'Kabaddi', value: 'KABADDI', icon: '💪' }
];

const CATEGORIES = [
    { label: 'Regular', value: 'REGULAR' },
    { label: 'Group Stage', value: 'GROUP_STAGE' },
    { label: 'Quarter Final', value: 'QUARTER_FINAL' },
    { label: 'Semi Final', value: 'SEMIFINAL' },
    { label: 'Final', value: 'FINAL' }
];

const ScheduleMatch = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        sport: 'CRICKET', teamA: '', teamB: '', scheduledAt: '',
        venue: '', matchCategory: 'REGULAR'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/departments');
                setDepartments(response.data.data || []);
            } catch (err) { toast.error('Failed to load departments'); }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.teamA || !formData.teamB) { toast.error('Please select both teams'); return; }
        if (formData.teamA === formData.teamB) { toast.error('Teams cannot be the same'); return; }
        if (!formData.scheduledAt) { toast.error('Please select date and time'); return; }

        setLoading(true);
        try {
            await api.post('/matches', {
                sport: formData.sport,
                teamA: formData.teamA,
                teamB: formData.teamB,
                scheduledAt: formData.scheduledAt,
                venue: formData.venue || 'Main Ground',
                matchCategory: formData.matchCategory
            });
            toast.success('Match scheduled successfully!');
            setFormData({ sport: 'CRICKET', teamA: '', teamB: '', scheduledAt: '', venue: '', matchCategory: 'REGULAR' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to schedule match'); }
        finally { setLoading(false); }
    };

    const teamADept = departments.find(d => d._id === formData.teamA);
    const teamBDept = departments.find(d => d._id === formData.teamB);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-blue-500" />
                        Schedule Match
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Create a new match fixture</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Sport Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sport</label>
                            <select name="sport" value={formData.sport} onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                                {SPORTS.map(sport => (
                                    <option key={sport.value} value={sport.value}>{sport.icon} {sport.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* VS Display */}
                        <div className="flex items-center justify-center gap-3 py-4">
                            <div className="flex-1 text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">{teamADept?.shortCode || '?'}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{teamADept?.name || 'Team A'}</div>
                            </div>
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-slate-600 font-bold text-sm">VS</span>
                            </div>
                            <div className="flex-1 text-center p-3 rounded-lg bg-slate-100 border border-slate-200">
                                <div className="text-2xl font-bold text-slate-700">{teamBDept?.shortCode || '?'}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{teamBDept?.name || 'Team B'}</div>
                            </div>
                        </div>

                        {/* Teams Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Team A</label>
                                <select name="teamA" value={formData.teamA} onChange={handleChange}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                    <option value="">Select</option>
                                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.shortCode} - {dept.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Team B</label>
                                <select name="teamB" value={formData.teamB} onChange={handleChange}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                    <option value="">Select</option>
                                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.shortCode} - {dept.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Category, Venue & Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> Match Category
                            </label>
                            <select name="matchCategory" value={formData.matchCategory} onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</label>
                                <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Main Ground"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Date & Time</label>
                                <input type="datetime-local" name="scheduledAt" value={formData.scheduledAt} onChange={handleChange}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                            </div>
                        </div>

                        {formData.teamA === formData.teamB && formData.teamA && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-center">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-600">Teams cannot be the same</p>
                            </div>
                        )}

                        <button type="submit"
                            disabled={loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB}
                            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                                loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}>
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scheduling...</>
                            ) : (
                                <><Calendar className="w-4 h-4" /> Schedule Match</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMatch;
