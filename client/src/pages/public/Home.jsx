import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import MatchCard from '../../components/MatchCard';

// Lazy load 3D background for performance
const ThreeBackground = React.lazy(() => import('../../components/ThreeBackground'));

// Simple animated fallback background
const FallbackBackground = ({ isDarkMode }) => (
    <div className={`fixed inset-0 -z-10 ${isDarkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse ${
                isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-200/30'
            }`} />
            <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${
                isDarkMode ? 'bg-purple-500/10' : 'bg-purple-200/30'
            }`} style={{ animationDelay: '1s' }} />
            <div className={`absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${
                isDarkMode ? 'bg-pink-500/5' : 'bg-pink-200/20'
            }`} style={{ animationDelay: '2s' }} />
        </div>
    </div>
);

const Home = ({ isDarkMode, setIsDarkMode }) => {
    const [matches, setMatches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const sports = ['CRICKET', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'BADMINTON', 'TABLE_TENNIS', 'KHOKHO', 'KABADDI', 'CHESS'];

    const sportIcons = {
        'CRICKET': '🏏',
        'FOOTBALL': '⚽',
        'BASKETBALL': '🏀',
        'VOLLEYBALL': '🏐',
        'BADMINTON': '🏸',
        'TABLE_TENNIS': '🏓',
        'KHOKHO': '🏃',
        'KABADDI': '💪',
        'CHESS': '♟️'
    };

    const formatIST = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const sortMatches = (matchList) => {
        return [...matchList].sort((a, b) => {
            const priority = { 'LIVE': 0, 'SCHEDULED': 1, 'COMPLETED': 2 };
            if (priority[a.status] !== priority[b.status]) {
                return priority[a.status] - priority[b.status];
            }
            if (a.status === 'SCHEDULED') {
                return new Date(a.scheduledAt) - new Date(b.scheduledAt);
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [matchRes, deptRes] = await Promise.all([
                api.get('/matches'),
                api.get('/departments')
            ]);
            setMatches(sortMatches(matchRes.data.data || []));
            setDepartments(deptRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('matchUpdate', (updatedMatch) => {
            setMatches(prev => sortMatches(prev.map(m => m._id === updatedMatch._id ? updatedMatch : m)));
        });

        socket.on('matchDeleted', (matchId) => {
            setMatches(prev => prev.filter(m => m._id !== matchId));
        });

        socket.on('matchCreated', (newMatch) => {
            setMatches(prev => sortMatches([newMatch, ...prev]));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('matchUpdate');
            socket.off('matchDeleted');
            socket.off('matchCreated');
        };
    }, []);

    const filteredMatches = matches.filter(match => {
        const matchesDept = selectedDept === '' ||
            (match.teamA?._id === selectedDept) ||
            (match.teamB?._id === selectedDept);
        const matchesSport = selectedSport === '' || match.sport === selectedSport;
        const matchesStatus = selectedStatus === '' || match.status === selectedStatus;
        return matchesDept && matchesSport && matchesStatus;
    });

    const liveCount = matches.filter(m => m.status === 'LIVE').length;
    const upcomingCount = matches.filter(m => m.status === 'SCHEDULED').length;
    const completedCount = matches.filter(m => m.status === 'COMPLETED').length;

    const statCards = [
        { 
            key: 'LIVE', 
            label: 'Live Now', 
            count: liveCount, 
            gradient: 'from-red-500 to-rose-600', 
            bgGlow: 'bg-red-500/20',
            icon: (
                <div className="relative">
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative block w-3 h-3 rounded-full bg-red-500"></span>
                </div>
            )
        },
        { 
            key: 'SCHEDULED', 
            label: 'Upcoming', 
            count: upcomingCount, 
            gradient: 'from-blue-500 to-indigo-600', 
            bgGlow: 'bg-blue-500/20',
            icon: <span className="text-xl">📅</span>
        },
        { 
            key: 'COMPLETED', 
            label: 'Completed', 
            count: completedCount, 
            gradient: 'from-emerald-500 to-green-600', 
            bgGlow: 'bg-emerald-500/20',
            icon: <span className="text-xl">✓</span>
        }
    ];

    return (
        <div className={`min-h-screen relative transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
            {/* 3D Background - Only in dark mode for performance */}
            {isDarkMode ? (
                <Suspense fallback={<FallbackBackground isDarkMode={isDarkMode} />}>
                    <ThreeBackground variant="default" />
                </Suspense>
            ) : (
                <FallbackBackground isDarkMode={isDarkMode} />
            )}

            {/* Glass overlay for content readability */}
            <div className="relative z-10">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

                {/* Hero Section */}
                <div className="relative py-20 px-6 text-center overflow-hidden">
                    {/* Animated gradient orb behind title */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 ${
                            isDarkMode ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300'
                        }`}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        {/* Main Title */}
                        <motion.h1 
                            className="text-6xl md:text-8xl font-black tracking-tighter mb-4 font-display"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>VNIT</span>
                            <motion.span 
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent ml-4"
                                animate={{ 
                                    backgroundPosition: ['0%', '100%', '0%']
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                style={{ backgroundSize: '200%' }}
                            >
                                Games
                            </motion.span>
                        </motion.h1>
                        
                        <motion.p 
                            className={`text-lg md:text-xl font-light max-w-lg mx-auto ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Inter-Department Championship • Real-Time Scores
                        </motion.p>

                        {/* Connection Status Badge */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`inline-flex items-center gap-3 mt-8 px-5 py-2.5 rounded-full text-sm font-medium backdrop-blur-xl ${
                                isConnected
                                    ? isDarkMode 
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                        : 'bg-green-100/80 text-green-700 border border-green-200'
                                    : isDarkMode 
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                                        : 'bg-red-100/80 text-red-700 border border-red-200'
                            }`}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                                {isConnected && <span className="absolute w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>}
                            </span>
                            {isConnected ? 'Live Updates Active' : 'Reconnecting...'}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {statCards.map((stat, i) => (
                            <motion.button
                                key={stat.key}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                whileHover={{ scale: 1.03, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedStatus(selectedStatus === stat.key ? '' : stat.key)}
                                className={`relative p-6 md:p-8 rounded-3xl transition-all duration-300 text-center overflow-hidden group ${
                                    selectedStatus === stat.key
                                        ? `bg-gradient-to-br ${stat.gradient} text-white shadow-2xl`
                                        : isDarkMode 
                                            ? 'bg-white/5 backdrop-blur-xl hover:bg-white/10 border border-white/10' 
                                            : 'bg-white/80 backdrop-blur-xl hover:bg-white shadow-lg border border-gray-100'
                                }`}
                            >
                                {/* Glow effect */}
                                {selectedStatus === stat.key && (
                                    <div className={`absolute inset-0 ${stat.bgGlow} blur-2xl opacity-50`} />
                                )}
                                
                                <div className="relative">
                                    <div className="flex justify-center mb-3">
                                        {stat.icon}
                                    </div>
                                    <motion.div 
                                        key={stat.count}
                                        initial={{ scale: 1.3, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-4xl md:text-5xl font-black"
                                    >
                                        {stat.count}
                                    </motion.div>
                                    <div className={`text-xs font-bold uppercase tracking-widest mt-2 ${
                                        selectedStatus === stat.key 
                                            ? 'text-white/80' 
                                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        {stat.label}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-5xl mx-auto px-4 mt-10"
                >
                    <div className={`flex flex-wrap gap-4 p-6 rounded-2xl backdrop-blur-xl ${
                        isDarkMode 
                            ? 'bg-white/5 border border-white/10' 
                            : 'bg-white shadow-xl border-2 border-slate-200'
                    }`}>
                        <div className="relative flex-1 min-w-[140px]">
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                                isDarkMode ? 'text-gray-400' : 'text-slate-700'
                            }`}>Department</label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer font-ui ${
                                    isDarkMode
                                        ? 'bg-slate-800/80 text-white focus:ring-2 focus:ring-indigo-500/50 border border-white/20'
                                        : 'bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/50 border-2 border-slate-300 shadow-sm'
                                }`}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                            <div className={`absolute right-4 bottom-3 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative flex-1 min-w-[140px]">
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                                isDarkMode ? 'text-gray-400' : 'text-slate-700'
                            }`}>Sport</label>
                            <select
                                value={selectedSport}
                                onChange={(e) => setSelectedSport(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer font-ui ${
                                    isDarkMode
                                        ? 'bg-slate-800/80 text-white focus:ring-2 focus:ring-indigo-500/50 border border-white/20'
                                        : 'bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/50 border-2 border-slate-300 shadow-sm'
                                }`}
                            >
                                <option value="">All Sports</option>
                                {sports.map(sport => (
                                    <option key={sport} value={sport}>{sportIcons[sport]} {sport.replace('_', ' ')}</option>
                                ))}
                            </select>
                            <div className={`absolute right-4 bottom-3 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <AnimatePresence>
                            {(selectedDept || selectedSport || selectedStatus) && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                                    className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all"
                                >
                                    Clear All ✕
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Match List */}
                <div className="max-w-5xl mx-auto px-4 py-10 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
                            />
                            <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Loading matches...
                            </p>
                        </div>
                    ) : filteredMatches.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-center py-20 rounded-3xl backdrop-blur-xl ${
                                isDarkMode 
                                    ? 'bg-white/5 border border-white/10' 
                                    : 'bg-white/80 shadow-lg border border-gray-100'
                            }`}
                        >
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-7xl mb-6"
                            >
                                🏟️
                            </motion.div>
                            <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No matches found
                            </p>
                            {(selectedDept || selectedSport || selectedStatus) && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                                    className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                                >
                                    Clear all filters
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredMatches.map((match, idx) => {
                                    const prevMatch = filteredMatches[idx - 1];
                                    const showLiveHeader = idx === 0 && match.status === 'LIVE' && !selectedStatus;
                                    const showUpcomingHeader = match.status === 'SCHEDULED' && prevMatch?.status === 'LIVE' && !selectedStatus;
                                    const showCompletedHeader = match.status === 'COMPLETED' && prevMatch?.status !== 'COMPLETED' && !selectedStatus;

                                    return (
                                        <React.Fragment key={match._id}>
                                            {showLiveHeader && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-3 pt-4 pb-2"
                                                >
                                                    <span className="relative flex h-4 w-4">
                                                        <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                        <span className="relative rounded-full h-4 w-4 bg-red-500"></span>
                                                    </span>
                                                    <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                                        LIVE NOW
                                                    </span>
                                                </motion.div>
                                            )}
                                            {showUpcomingHeader && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-3 pt-8 pb-2"
                                                >
                                                    <span className="text-2xl">📅</span>
                                                    <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        UPCOMING
                                                    </span>
                                                </motion.div>
                                            )}
                                            {showCompletedHeader && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-3 pt-8 pb-2"
                                                >
                                                    <span className="text-2xl">✓</span>
                                                    <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        COMPLETED
                                                    </span>
                                                </motion.div>
                                            )}
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <MatchCard match={match} formatIST={formatIST} isDarkMode={isDarkMode} />
                                            </motion.div>
                                        </React.Fragment>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className={`py-10 text-center border-t backdrop-blur-xl ${
                    isDarkMode 
                        ? 'border-white/10 bg-black/20 text-gray-500' 
                        : 'border-gray-200 bg-white/50 text-gray-400'
                }`}>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium"
                    >
                        VNIT Inter-Games © {new Date().getFullYear()}
                    </motion.p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        Real-time updates powered by Socket.io
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Home;
