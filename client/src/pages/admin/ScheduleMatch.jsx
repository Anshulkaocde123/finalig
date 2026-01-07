import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Settings, AlertCircle, Sparkles, MapPin, Clock } from 'lucide-react';

const SPORTS = [
    { label: '🏏 Cricket', value: 'CRICKET', config: { overs: 20 }, color: 'from-green-500 to-emerald-600' },
    { label: '⚽ Football', value: 'FOOTBALL', config: { periods: 2 }, color: 'from-blue-500 to-cyan-600' },
    { label: '� Hockey', value: 'HOCKEY', config: { periods: 2 }, color: 'from-cyan-500 to-blue-600' },
    { label: '�🏀 Basketball', value: 'BASKETBALL', config: { periods: 4 }, color: 'from-orange-500 to-red-600' },
    { label: '🏸 Badminton', value: 'BADMINTON', config: { sets: 3 }, color: 'from-purple-500 to-pink-600' },
    { label: '🏓 Table Tennis', value: 'TABLE_TENNIS', config: { sets: 3 }, color: 'from-yellow-500 to-orange-600' },
    { label: '🏐 Volleyball', value: 'VOLLEYBALL', config: { sets: 3 }, color: 'from-indigo-500 to-purple-600' },
    { label: '♚ Chess', value: 'CHESS', config: { timeControl: null }, color: 'from-gray-500 to-slate-600' },
    { label: '🎯 Kho Kho', value: 'KHOKHO', config: { periods: 2 }, color: 'from-teal-500 to-green-600' },
    { label: '🤼 Kabaddi', value: 'KABADDI', config: { periods: 2 }, color: 'from-rose-500 to-pink-600' }
];

const ScheduleMatch = () => {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({ sport: 'CRICKET', teamA: '', teamB: '', scheduledAt: '', venue: '', config: { overs: 20 } });
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

    const handleSportChange = (e) => {
        const sport = e.target.value;
        const selectedSport = SPORTS.find(s => s.value === sport);
        setFormData(prev => ({ ...prev, sport, config: selectedSport?.config || {} }));
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, config: { ...prev.config, [name]: parseInt(value) || value } }));
    };

    const validateForm = () => {
        if (!formData.teamA || !formData.teamB) { toast.error('Please select both teams'); return false; }
        if (formData.teamA === formData.teamB) { toast.error('Teams cannot be the same'); return false; }
        if (!formData.scheduledAt) { toast.error('Please select date and time'); return false; }
        if (new Date(formData.scheduledAt) <= new Date()) { toast.error('Date must be in the future'); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const payload = { teamA: formData.teamA, teamB: formData.teamB, sport: formData.sport, scheduledAt: formData.scheduledAt, venue: formData.venue || 'Main Ground' };
            if (formData.sport === 'CRICKET') payload.totalOvers = formData.config.overs || 20;
            else if (['BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL'].includes(formData.sport)) payload.maxSets = formData.config.sets || 3;
            else if (['FOOTBALL', 'HOCKEY', 'BASKETBALL', 'KHOKHO', 'KABADDI'].includes(formData.sport)) payload.maxPeriods = formData.config.periods || 2;
            await api.post(`/matches/${formData.sport.toLowerCase()}/create`, payload);
            toast.success('Match scheduled successfully!');
            setFormData({ sport: 'CRICKET', teamA: '', teamB: '', scheduledAt: '', venue: '', config: { overs: 20 } });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to schedule match'); }
        finally { setLoading(false); }
    };

    const selectedSport = SPORTS.find(s => s.value === formData.sport);
    const teamADept = departments.find(d => d._id === formData.teamA);
    const teamBDept = departments.find(d => d._id === formData.teamB);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                        Schedule Match
                    </h1>
                    <p className="text-gray-700 mt-1">Create a new match with custom settings</p>
                </div>

                {/* Form Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sport Selection - Grid of Cards */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Select Sport</label>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {SPORTS.map(sport => (
                                    <button key={sport.value} type="button" onClick={() => handleSportChange({ target: { value: sport.value } })}
                                        className={`p-3 rounded-xl border transition-all ${formData.sport === sport.value 
                                            ? `bg-gradient-to-r ${sport.color} border-white/30 shadow-lg` 
                                            : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                        <div className="text-2xl mb-1">{sport.label.split(' ')[0]}</div>
                                        <div className="text-sm font-semibold text-white/80">{sport.label.split(' ')[1]}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* VS Display */}
                        <div className="relative py-6">
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex-1 text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                    <div className="text-3xl font-black text-blue-400">{teamADept?.shortCode || '???'}</div>
                                    <div className="text-sm text-gray-700 mt-1">{teamADept?.name || 'Select Team A'}</div>
                                </div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                        <span className="text-white font-black text-lg">VS</span>
                                    </div>
                                </div>
                                <div className="flex-1 text-center p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                                    <div className="text-3xl font-black text-pink-400">{teamBDept?.shortCode || '???'}</div>
                                    <div className="text-sm text-gray-700 mt-1">{teamBDept?.name || 'Select Team B'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Teams Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Team A</label>
                                <select name="teamA" value={formData.teamA} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.shortCode} - {dept.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Team B</label>
                                <select name="teamB" value={formData.teamB} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-500 outline-none">
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.shortCode} - {dept.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Venue & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4" /> Venue</label>
                                <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g., Main Ground, Court A"
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2"><Clock className="w-4 h-4" /> Date & Time</label>
                                <input type="datetime-local" name="scheduledAt" value={formData.scheduledAt} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        {/* Sport Config */}
                        {formData.sport === 'CRICKET' && (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <label className="block text-sm font-bold text-green-300 mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> Cricket Config</label>
                                <input type="number" name="overs" value={formData.config.overs} onChange={handleConfigChange} min="5" max="50"
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none" />
                                <p className="text-sm font-semibold text-gray-800 mt-2">Overs: 20 (T20) / 50 (ODI)</p>
                            </div>
                        )}

                        {['BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL'].includes(formData.sport) && (
                            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                <label className="block text-sm font-bold text-purple-300 mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> Sets Config</label>
                                <select name="sets" value={formData.config.sets} onChange={handleConfigChange}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option value="3">Best of 3</option>
                                    <option value="5">Best of 5</option>
                                </select>
                            </div>
                        )}

                        {['FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI'].includes(formData.sport) && (
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                <label className="block text-sm font-bold text-orange-300 mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> Match Duration</label>
                                <select name="periods" value={formData.config.periods} onChange={handleConfigChange}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-orange-500/30 rounded-lg text-white focus:ring-2 focus:ring-orange-500 outline-none">
                                    <option value="2">2 {formData.sport === 'BASKETBALL' ? 'Halves' : 'Periods'}</option>
                                    <option value="4">4 Quarters</option>
                                </select>
                            </div>
                        )}

                        {/* Validation Warning */}
                        {formData.teamA === formData.teamB && formData.teamA && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300">Both teams cannot be the same</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit"
                            disabled={loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB}
                            className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                loading || !formData.teamA || !formData.teamB || formData.teamA === formData.teamB
                                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                            }`}>
                            {loading ? (
                                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scheduling...</>
                            ) : (
                                <><Calendar className="w-5 h-5" /> Schedule Match</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMatch;
