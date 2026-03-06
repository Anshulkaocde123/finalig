import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import MatchCard from '../../components/MatchCard';
import { MatchCardSkeleton, HighlightSkeleton } from '../../components/SkeletonLoader';
import { SPORT_ICONS, SPORTS } from '../../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, FileText, Trophy, Sparkles, RefreshCw, ExternalLink, ChevronLeft, ChevronRight, Award } from 'lucide-react';

// Timezone-safe local date helper (avoids UTC offset issues with toISOString)
const getLocalDateStr = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const Home = () => {
    const [matches, setMatches] = useState([]);
    const [highlights, setHighlights] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSport, setSelectedSport] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [highlightDate, setHighlightDate] = useState(getLocalDateStr());
    const [availableDates, setAvailableDates] = useState([]);
    const debounceRef = useRef(null);

    const todayStr = getLocalDateStr();

    const fetchHighlightsForDate = useCallback(async (date) => {
        try {
            const res = await api.get(`/highlights?date=${date}`);
            const data = res.data.data || res.data || [];
            const reel = data.find(h => h.type === 'reel') || null;
            const pic = data.find(h => h.type === 'pic') || null;
            const article = data.find(h => h.type === 'article') || null;
            setHighlights({ reelOfTheDay: reel, picOfTheDay: pic, articleOfTheDay: article });
        } catch {
            setHighlights({});
        }
    }, []);

    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const [matchRes] = await Promise.all([
                api.get('/matches'),
                fetchHighlightsForDate(highlightDate)
            ]);

            // Fetch available highlight dates
            api.get('/highlights/dates').then(res => {
                setAvailableDates(res.data || []);
            }).catch(() => {});

            const matchData = matchRes.data.data || [];
            matchData.sort((a, b) => {
                const priority = { SCHEDULED: 0, COMPLETED: 1, CANCELLED: 2 };
                if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
                return new Date(b.scheduledAt || 0) - new Date(a.scheduledAt || 0);
            });

            setMatches(matchData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [highlightDate, fetchHighlightsForDate]);

    // ── Sort helper (keeps UI stable) ──
    const sortMatches = useCallback((list) => {
        const priority = { SCHEDULED: 0, COMPLETED: 1, CANCELLED: 2 };
        return [...list].sort((a, b) => {
            if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
            return new Date(b.scheduledAt || 0) - new Date(a.scheduledAt || 0);
        });
    }, []);

    useEffect(() => {
        fetchData();

        // ── LOCAL state updates from socket payloads (NO refetch) ──
        const handleMatchCreated = (match) => {
            if (!match?._id) return;
            setMatches(prev => {
                // Prevent duplicate
                if (prev.some(m => m._id === match._id)) return prev;
                return sortMatches([match, ...prev]);
            });
            setLastUpdated(new Date());
        };

        const handleMatchUpdate = (match) => {
            if (!match?._id) return;
            setMatches(prev => {
                const idx = prev.findIndex(m => m._id === match._id);
                if (idx === -1) return sortMatches([match, ...prev]); // New match we hadn't seen
                const updated = [...prev];
                updated[idx] = { ...updated[idx], ...match };
                return sortMatches(updated);
            });
            setLastUpdated(new Date());
        };

        const handleMatchDeleted = (data) => {
            const matchId = data?.matchId || data?._id;
            if (!matchId) return;
            setMatches(prev => prev.filter(m => m._id !== matchId));
            setLastUpdated(new Date());
        };

        // Highlight events still refetch (rare events, lightweight)
        const debouncedHighlightFetch = () => {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => fetchHighlightsForDate(highlightDate), 600);
        };

        socket.on('matchCreated', handleMatchCreated);
        socket.on('matchUpdate', handleMatchUpdate);
        socket.on('matchDeleted', handleMatchDeleted);
        socket.on('highlightCreated', debouncedHighlightFetch);
        socket.on('highlightUpdated', debouncedHighlightFetch);
        socket.on('highlightDeleted', debouncedHighlightFetch);

        // ── Handle reconnection: refetch to catch missed events ──
        const handleReconnect = () => {
            console.log('🔄 Socket reconnected — syncing missed events');
            fetchData(true);
        };
        socket.on('reconnect', handleReconnect);

        return () => {
            clearTimeout(debounceRef.current);
            socket.off('matchCreated', handleMatchCreated);
            socket.off('matchUpdate', handleMatchUpdate);
            socket.off('matchDeleted', handleMatchDeleted);
            socket.off('highlightCreated', debouncedHighlightFetch);
            socket.off('highlightUpdated', debouncedHighlightFetch);
            socket.off('highlightDeleted', debouncedHighlightFetch);
            socket.off('reconnect', handleReconnect);
        };
    }, [fetchData, sortMatches, highlightDate, fetchHighlightsForDate]);

    // Re-fetch highlights when date changes (without reloading matches)
    useEffect(() => {
        fetchHighlightsForDate(highlightDate);
    }, [highlightDate, fetchHighlightsForDate]);

    const shiftDate = (days) => {
        const d = new Date(highlightDate + 'T12:00:00'); // noon to avoid DST edge cases
        d.setDate(d.getDate() + days);
        const newDate = getLocalDateStr(d);
        if (newDate <= todayStr) {
            setHighlightDate(newDate);
        }
    };

    const formatDisplayDate = (dateStr) => {
        {/*if (dateStr === todayStr) return 'Today';
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateStr === getLocalDateStr(yesterday)) return 'Yesterday';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });*/}
        return null;
    };

    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            if (selectedSport !== 'ALL' && m.sport !== selectedSport) return false;
            if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
            return true;
        });
    }, [matches, selectedSport, selectedStatus]);

    const stats = useMemo(() => ({
        total: matches.length,
        scheduled: matches.filter(m => m.status === 'SCHEDULED').length,
        completed: matches.filter(m => m.status === 'COMPLETED').length,
        sports: [...new Set(matches.map(m => m.sport))].length
    }), [matches]);

    const reelOfDay = highlights.reelOfTheDay || null;
    const picOfDay = highlights.picOfTheDay || null;
    const articleOfDay = highlights.articleOfTheDay || null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <PublicNavbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium mb-3">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Season 2025-26
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Institute Gathering
                        <br className="sm:hidden" />
                        {' '}
                    </h1>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        Follow all the action from the inter-department championship
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
                    {[
                        { label: 'Matches', value: stats.total, icon: '🏅', color: 'from-blue-500 to-blue-600' },
                        { label: 'Upcoming', value: stats.scheduled, icon: '📅', color: 'from-amber-500 to-amber-600' },
                        { label: 'Results', value: stats.completed, icon: '✅', color: 'from-emerald-500 to-emerald-600' },
                        { label: 'Sports', value: stats.sports, icon: '🎯', color: 'from-purple-500 to-purple-600' }
                    ].map((stat, i) => (
                        <motion.div key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative overflow-hidden bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center">
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />
                            <div className="text-lg sm:text-xl mb-0.5">{stat.icon}</div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">{loading ? '-' : stat.value}</div>
                            <div className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ========== TODAY'S HIGHLIGHTS — ALWAYS VISIBLE ========== */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 rounded-lg">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                            </div>
                            Highlights
                        </h2>
                        {lastUpdated && (
                            <button onClick={() => fetchData(true)}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50">
                                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Updating...' : 'Refresh'}
                            </button>
                        )}
                    </div>

                    {/* Date Selector — responsive, never overflows */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5">
                        <button
                            onClick={() => shiftDate(-1)}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500 transition-colors flex-shrink-0"
                            aria-label="Previous day"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 min-w-0">
                            <input
                                type="date"
                                value={highlightDate}
                                max={todayStr}
                                onChange={(e) => setHighlightDate(e.target.value)}
                                className="px-2 sm:px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[150px] sm:max-w-none"
                            />
                            <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                                {formatDisplayDate(highlightDate)}
                            </span>
                        </div>
                        <button
                            onClick={() => shiftDate(1)}
                            disabled={highlightDate >= todayStr}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                            aria-label="Next day"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        {highlightDate !== todayStr && (
                            <button
                                onClick={() => setHighlightDate(todayStr)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                            >
                                Today
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* --- REEL OF THE DAY --- */}
                        {loading ? <HighlightSkeleton /> : reelOfDay ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 border border-purple-200 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-purple-100 rounded-lg">
                                        <Film className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-bold text-purple-700">Reel of the Day</span>
                                    {reelOfDay.department && (
                                        <span className="ml-auto text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Award className="w-2.5 h-2.5" />
                                            {typeof reelOfDay.department === 'object' ? (reelOfDay.department.shortCode || reelOfDay.department.name) : reelOfDay.department}
                                        </span>
                                    )}
                                </div>
                                {reelOfDay.caption && (
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{reelOfDay.caption}</p>
                                )}
                                {reelOfDay.instagramUrl && (
                                    <a href={reelOfDay.instagramUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all shadow-sm hover:shadow-md active:scale-95">
                                        <Film className="w-3.5 h-3.5" /> Watch on Instagram
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </a>
                                )}
                            </motion.div>
                        ) : (
                            <div className="border-2 border-dashed border-purple-200 rounded-2xl p-6 sm:p-8 text-center bg-purple-50/30">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Film className="w-7 h-7 text-purple-300" />
                                </div>
                                <h3 className="font-semibold text-slate-600 mb-1">Reel of the Day</h3>
                                <p className="text-sm text-slate-400">No reel posted today yet</p>
                                <p className="text-xs text-slate-300 mt-1.5">Check back for match highlights! 🎬</p>
                            </div>
                        )}

                        {/* --- PIC OF THE DAY --- */}
                        {loading ? <HighlightSkeleton /> : picOfDay ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow overflow-hidden">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-amber-100 rounded-lg">
                                        <Camera className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span className="text-sm font-bold text-amber-700">Pic of the Day</span>
                                    {picOfDay.department && (
                                        <span className="ml-auto text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Award className="w-2.5 h-2.5" />
                                            {typeof picOfDay.department === 'object' ? (picOfDay.department.shortCode || picOfDay.department.name) : picOfDay.department}
                                        </span>
                                    )}
                                </div>
                                {picOfDay.caption && (
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{picOfDay.caption}</p>
                                )}
                                {picOfDay.instagramUrl && (
                                    <a href={picOfDay.instagramUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-all shadow-sm hover:shadow-md active:scale-95">
                                        <Camera className="w-3.5 h-3.5" /> View on Instagram
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </a>
                                )}
                            </motion.div>
                        ) : (
                            <div className="border-2 border-dashed border-amber-200 rounded-2xl p-6 sm:p-8 text-center bg-amber-50/30">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Camera className="w-7 h-7 text-amber-300" />
                                </div>
                                <h3 className="font-semibold text-slate-600 mb-1">Pic of the Day</h3>
                                <p className="text-sm text-slate-400">No photo posted today yet</p>
                                <p className="text-xs text-slate-300 mt-1.5">Check back for stunning captures! 📸</p>
                            </div>
                        )}

                        {/* --- ARTICLE OF THE DAY --- */}
                        {loading ? <HighlightSkeleton /> : articleOfDay ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-bold text-emerald-700">Article of the Day</span>
                                    {articleOfDay.department && (
                                        <span className="ml-auto text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Award className="w-2.5 h-2.5" />
                                            {typeof articleOfDay.department === 'object' ? (articleOfDay.department.shortCode || articleOfDay.department.name) : articleOfDay.department}
                                        </span>
                                    )}
                                </div>
                                {articleOfDay.caption && (
                                    <p className="text-xs font-medium text-emerald-600 mb-2">{articleOfDay.caption}</p>
                                )}
                                {articleOfDay.content ? (
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-6">{articleOfDay.content}</p>
                                ) : articleOfDay.instagramUrl ? (
                                    <a href={articleOfDay.instagramUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95">
                                        <FileText className="w-3.5 h-3.5" /> Read on Instagram
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </a>
                                ) : null}
                            </motion.div>
                        ) : (
                            <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 sm:p-8 text-center bg-emerald-50/30">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-7 h-7 text-emerald-300" />
                                </div>
                                <h3 className="font-semibold text-slate-600 mb-1">Article of the Day</h3>
                                <p className="text-sm text-slate-400">No article posted today yet</p>
                                <p className="text-xs text-slate-300 mt-1.5">Check back for event coverage! 📝</p>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* ========== MATCHES SECTION ========== */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                <Trophy className="w-4 h-4 text-blue-600" />
                            </div>
                            Matches
                        </h2>
                        <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                            {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
                        </span>
                    </div>

                    {/* Sport Filter Pills — horizontally scrollable on mobile */}
                    <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                        <button onClick={() => setSelectedSport('ALL')}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                selectedSport === 'ALL'
                                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}>
                            All Sports
                        </button>
                        {SPORTS.map(sport => (
                            <button key={sport} onClick={() => setSelectedSport(sport)}
                                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                                    selectedSport === sport
                                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}>
                                {SPORT_ICONS[sport]} {sport.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
                        {[
                            { key: 'ALL', label: 'All' },
                            { key: 'SCHEDULED', label: 'Upcoming' },
                            { key: 'COMPLETED', label: 'Completed' },
                            { key: 'CANCELLED', label: 'Cancelled' }
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setSelectedStatus(tab.key)}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    selectedStatus === tab.key
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Match Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <MatchCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredMatches.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 sm:py-20">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🏟️</span>
                            </div>
                            <h3 className="font-semibold text-slate-700 mb-1">No matches found</h3>
                            <p className="text-sm text-slate-400 mb-4">Try adjusting your filters</p>
                            {(selectedSport !== 'ALL' || selectedStatus !== 'ALL') && (
                                <button onClick={() => { setSelectedSport('ALL'); setSelectedStatus('ALL'); }}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors active:scale-95">
                                    Clear Filters
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredMatches.map((match, i) => (
                                    <motion.div key={match._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                                        <MatchCard match={match} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

                {/* Footer */}
                {lastUpdated && !loading && (
                    <div className="text-center mt-10 text-xs text-slate-300">
                        Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {' · '}Real-time updates enabled
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
