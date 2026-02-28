import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, Edit3, Trash2, Search, Filter, Save, X, AlertCircle } from 'lucide-react';
import { SPORT_ICONS, STATUS_CONFIG } from '../../lib/constants';

const STATUS_COLORS = {
    SCHEDULED: STATUS_CONFIG.SCHEDULED.color,
    COMPLETED: STATUS_CONFIG.COMPLETED.color,
    CANCELLED: STATUS_CONFIG.CANCELLED.color
};

const LiveConsole = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMatch, setEditingMatch] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [filterSport, setFilterSport] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const res = await api.get('/matches');
            setMatches(res.data.data || []);
        } catch (err) { toast.error('Failed to load matches'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMatches(); }, []);

    const startEdit = (match) => {
        setEditingMatch(match._id);
        setEditForm({
            scoreA: match.scoreA || '',
            scoreB: match.scoreB || '',
            winner: match.winner?._id || match.winner || '',
            status: match.status || 'SCHEDULED',
            summary: match.summary || ''
        });
    };

    const cancelEdit = () => { setEditingMatch(null); setEditForm({}); };

    const saveResult = async (matchId) => {
        setSaving(true);
        try {
            const payload = { ...editForm };
            if (!payload.winner) delete payload.winner;
            await api.put(`/matches/${matchId}`, payload);
            toast.success('Match updated!');
            setEditingMatch(null);
            setEditForm({});
            fetchMatches();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
        finally { setSaving(false); }
    };

    const deleteMatch = async (matchId) => {
        if (!window.confirm('Delete this match?')) return;
        try {
            await api.delete(`/matches/${matchId}`);
            toast.success('Match deleted');
            fetchMatches();
        } catch (err) { toast.error('Failed to delete match'); }
    };

    const filteredMatches = matches.filter(m => {
        if (filterSport !== 'ALL' && m.sport !== filterSport) return false;
        if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const teamAName = m.teamA?.name?.toLowerCase() || m.teamA?.shortCode?.toLowerCase() || '';
            const teamBName = m.teamB?.name?.toLowerCase() || m.teamB?.shortCode?.toLowerCase() || '';
            if (!teamAName.includes(q) && !teamBName.includes(q) && !m.sport?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const getTeamName = (team) => team?.shortCode || team?.name || 'TBD';

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-amber-500" />
                        Match Manager
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Update scores and results for completed matches</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-2 flex-1 min-w-48 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search teams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 outline-none text-sm text-slate-900 placeholder-slate-400 bg-transparent" />
                    </div>
                    <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none">
                        <option value="ALL">All Sports</option>
                        {Object.entries(SPORT_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none">
                        <option value="ALL">All Status</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'Total', count: matches.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        { label: 'Scheduled', count: matches.filter(m => m.status === 'SCHEDULED').length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { label: 'Completed', count: matches.filter(m => m.status === 'COMPLETED').length, color: 'bg-green-50 text-green-700 border-green-200' }
                    ].map(stat => (
                        <div key={stat.label} className={`p-3 rounded-lg border text-center ${stat.color}`}>
                            <div className="text-2xl font-bold">{stat.count}</div>
                            <div className="text-xs font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Match List */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading matches...</div>
                ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No matches found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredMatches.map((match) => (
                                <motion.div key={match._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                                    {/* Match Header */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{SPORT_ICONS[match.sport] || '🏅'}</span>
                                                <span className="text-sm font-medium text-slate-700">{match.sport}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[match.status] || ''}`}>
                                                    {match.status}
                                                </span>
                                                {match.matchCategory && match.matchCategory !== 'REGULAR' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200">
                                                        {match.matchCategory.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => editingMatch === match._id ? cancelEdit() : startEdit(match)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                                                    {editingMatch === match._id ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => deleteMatch(match._id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Teams Display */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 text-center">
                                                <div className={`text-xl font-bold ${match.winner && (match.winner._id || match.winner) === (match.teamA?._id) ? 'text-green-600' : 'text-slate-800'}`}>
                                                    {getTeamName(match.teamA)}
                                                </div>
                                                {match.scoreA && <div className="text-lg font-semibold text-blue-600 mt-0.5">{match.scoreA}</div>}
                                            </div>
                                            <div className="px-4 text-slate-400 font-bold text-sm">VS</div>
                                            <div className="flex-1 text-center">
                                                <div className={`text-xl font-bold ${match.winner && (match.winner._id || match.winner) === (match.teamB?._id) ? 'text-green-600' : 'text-slate-800'}`}>
                                                    {getTeamName(match.teamB)}
                                                </div>
                                                {match.scoreB && <div className="text-lg font-semibold text-blue-600 mt-0.5">{match.scoreB}</div>}
                                            </div>
                                        </div>

                                        {match.summary && (
                                            <div className="mt-2 text-xs text-slate-500 text-center italic">{match.summary}</div>
                                        )}

                                        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-400">
                                            {match.venue && <span>📍 {match.venue}</span>}
                                            {match.scheduledAt && <span>📅 {new Date(match.scheduledAt).toLocaleDateString()}</span>}
                                        </div>
                                    </div>

                                    {/* Edit Form */}
                                    <AnimatePresence>
                                        {editingMatch === match._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-200 overflow-hidden">
                                                <div className="p-4 bg-slate-50 space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                {getTeamName(match.teamA)} Score
                                                            </label>
                                                            <input type="text" value={editForm.scoreA} placeholder="e.g. 156/4, 3-1"
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, scoreA: e.target.value }))}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                {getTeamName(match.teamB)} Score
                                                            </label>
                                                            <input type="text" value={editForm.scoreB} placeholder="e.g. 142/8, 2-1"
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, scoreB: e.target.value }))}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Winner</label>
                                                            <select value={editForm.winner}
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, winner: e.target.value }))}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                                                <option value="">No winner yet</option>
                                                                <option value={match.teamA?._id}>{getTeamName(match.teamA)}</option>
                                                                <option value={match.teamB?._id}>{getTeamName(match.teamB)}</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                                                            <select value={editForm.status}
                                                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                                                <option value="SCHEDULED">Scheduled</option>
                                                                <option value="COMPLETED">Completed</option>
                                                                <option value="CANCELLED">Cancelled</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Summary (optional)</label>
                                                        <input type="text" value={editForm.summary}
                                                            placeholder="e.g. CSE won by 14 runs"
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                                    </div>

                                                    <div className="flex gap-2 pt-1">
                                                        <button onClick={() => saveResult(match._id)} disabled={saving}
                                                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                                                            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Result'}
                                                        </button>
                                                        <button onClick={cancelEdit}
                                                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveConsole;
