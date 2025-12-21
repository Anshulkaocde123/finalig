import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import MatchCard from '../../components/MatchCard';
import { Activity, CheckCircle2, Clock } from 'lucide-react';

const Home = ({ isDarkMode, setIsDarkMode }) => {
    const [matches, setMatches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // Filter States
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const sports = ['CRICKET', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'BADMINTON', 'TABLE_TENNIS', 'KHOKHO', 'KABADDI', 'CHESS'];

    // Format IST time
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

    // Sort matches helper
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
            const [matchesRes, deptsRes] = await Promise.all([
                api.get('/matches'),
                api.get('/departments')
            ]);

            const allMatches = matchesRes.data.data || [];
            setMatches(sortMatches(allMatches));
            setDepartments(deptsRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket.io event listeners
        socket.on('connect', () => {
            console.log('🔌 Connected to server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            setIsConnected(false);
        });

        socket.on('matchUpdate', (updatedMatch) => {
            console.log('📝 Match updated:', updatedMatch._id);
            setMatches(prevMatches => {
                // Check if match exists
                const exists = prevMatches.some(m => m._id === updatedMatch._id);
                let updatedList;
                if (exists) {
                    updatedList = prevMatches.map(m =>
                        m._id === updatedMatch._id ? updatedMatch : m
                    );
                } else {
                    // New match - add to list
                    updatedList = [updatedMatch, ...prevMatches];
                }
                return sortMatches(updatedList);
            });
        });

        socket.on('matchDeleted', ({ matchId }) => {
            console.log('🗑️ Match deleted:', matchId);
            setMatches(prevMatches => prevMatches.filter(m => m._id !== matchId));
        });

        socket.on('matchCreated', (newMatch) => {
            console.log('🆕 New match created:', newMatch._id);
            setMatches(prevMatches => sortMatches([newMatch, ...prevMatches]));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('matchUpdate');
            socket.off('matchDeleted');
            socket.off('matchCreated');
        };
    }, []);

    // Filter Logic
    const filteredMatches = matches.filter(match => {
        const matchesDept = selectedDept === '' ||
            (match.teamA && match.teamA._id === selectedDept) ||
            (match.teamB && match.teamB._id === selectedDept);

        const matchesSport = selectedSport === '' || match.sport === selectedSport;
        const matchesStatus = selectedStatus === '' || match.status === selectedStatus;

        return matchesDept && matchesSport && matchesStatus;
    });

    // Count by status
    const liveCount = matches.filter(m => m.status === 'LIVE').length;
    const upcomingCount = matches.filter(m => m.status === 'SCHEDULED').length;
    const completedCount = matches.filter(m => m.status === 'COMPLETED').length;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode 
                ? 'bg-gradient-to-b from-dark-bg via-dark-surface to-dark-bg text-dark-text' 
                : 'bg-gradient-to-b from-light-bg via-light-surface to-light-bg text-light-text'
        } font-['Inter']`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            {/* Hero Section */}
            <div className={`py-10 px-4 shadow-2xl transition-all duration-300 ${
                isDarkMode
                    ? 'bg-gradient-to-r from-vnit-primary via-vnit-secondary to-purple-600'
                    : 'bg-gradient-to-r from-blue-600 via-red-500 to-purple-600'
            }`}>
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white">VNIT Inter-Department Games</h1>
                    <p className="text-white/90 text-base md:text-lg font-light">Live scores, standings & instant updates</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="max-w-5xl mx-auto px-4 -mt-7 relative z-10">
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setSelectedStatus(selectedStatus === 'LIVE' ? '' : 'LIVE')}
                        className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                            selectedStatus === 'LIVE'
                                ? isDarkMode
                                    ? 'bg-red-600/30 border-red-500 shadow-lg shadow-red-500/30'
                                    : 'bg-red-100 border-red-500 shadow-lg shadow-red-300/30'
                                : isDarkMode
                                    ? 'bg-dark-surface border-dark-border hover:border-red-500/50'
                                    : 'bg-light-surface border-light-border hover:border-red-500/50'
                        }`}
                    >
                        <Activity className={`w-5 h-5 mx-auto mb-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <div className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            🔴 LIVE
                        </div>
                        <div className={`text-lg font-black ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                            {liveCount}
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedStatus(selectedStatus === 'SCHEDULED' ? '' : 'SCHEDULED')}
                        className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                            selectedStatus === 'SCHEDULED'
                                ? isDarkMode
                                    ? 'bg-blue-600/30 border-blue-500 shadow-lg shadow-blue-500/30'
                                    : 'bg-blue-100 border-blue-500 shadow-lg shadow-blue-300/30'
                                : isDarkMode
                                    ? 'bg-dark-surface border-dark-border hover:border-blue-500/50'
                                    : 'bg-light-surface border-light-border hover:border-blue-500/50'
                        }`}
                    >
                        <Clock className={`w-5 h-5 mx-auto mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            📅 UPCOMING
                        </div>
                        <div className={`text-lg font-black ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            {upcomingCount}
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? '' : 'COMPLETED')}
                        className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                            selectedStatus === 'COMPLETED'
                                ? isDarkMode
                                    ? 'bg-green-600/30 border-green-500 shadow-lg shadow-green-500/30'
                                    : 'bg-green-100 border-green-500 shadow-lg shadow-green-300/30'
                                : isDarkMode
                                    ? 'bg-dark-surface border-dark-border hover:border-green-500/50'
                                    : 'bg-light-surface border-light-border hover:border-green-500/50'
                        }`}
                    >
                        <CheckCircle2 className={`w-5 h-5 mx-auto mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <div className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            ✅ COMPLETED
                        </div>
                        <div className={`text-lg font-black ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                            {completedCount}
                        </div>
                    </button>
                </div>
            </div>
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${selectedStatus === 'SCHEDULED'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-2xl shadow-blue-500/40 scale-105'
                            : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/20'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-xl">📅</span>
                            <span className="font-black text-2xl">{upcomingCount}</span>
                        </div>
                        <div className="text-xs text-white/80 uppercase tracking-widest font-bold">Upcoming</div>
                    </button>

                    <button
                        onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? '' : 'COMPLETED')}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${selectedStatus === 'COMPLETED'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-2xl shadow-green-500/40 scale-105'
                            : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/60 hover:shadow-xl hover:shadow-green-500/20'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-xl">✅</span>
                            <span className="font-black text-2xl">{completedCount}</span>
                        </div>
                        <div className="text-xs text-white/80 uppercase tracking-widest font-bold">Completed</div>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl mt-8">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3 overflow-x-auto pb-2">
                    {/* Connection Indicator */}
                    <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full whitespace-nowrap transition-all ${isConnected ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        {isConnected ? '⚡ Live' : '⚠️ Offline'}
                    </div>

                    <div className="h-6 border-l border-gray-700/50"></div>

                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="bg-gray-800/60 text-sm text-white px-4 py-2 rounded-lg border border-gray-700/50 outline-none focus:border-indigo-500 focus:bg-gray-800 transition-all min-w-[150px] font-medium"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.shortCode}</option>
                        ))}
                    </select>

                    <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="bg-gray-800/60 text-sm text-white px-4 py-2 rounded-lg border border-gray-700/50 outline-none focus:border-indigo-500 focus:bg-gray-800 transition-all min-w-[140px] font-medium"
                    >
                        <option value="">All Sports</option>
                        {sports.map(sport => (
                            <option key={sport} value={sport}>{sport.replace('_', ' ')}</option>
                        ))}
                    </select>

                    {(selectedDept || selectedSport || selectedStatus) && (
                        <button
                            onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold whitespace-nowrap bg-indigo-500/10 px-3 py-2 rounded-lg hover:bg-indigo-500/20 transition-all"
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Match List */}
            <div className="max-w-5xl mx-auto p-4 md:p-8 pb-12">
                {loading && matches.length === 0 ? (
                    <div className="flex justify-center items-center h-80">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4"></div>
                            <p className="text-gray-400 font-medium">Loading matches...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {filteredMatches.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="text-7xl mb-4">🏟️</div>
                                <p className="text-xl text-gray-400 mb-2 font-medium">No matches found</p>
                                {(selectedDept || selectedSport || selectedStatus) && (
                                    <button
                                        onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                                        className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-sm font-bold transition-all shadow-lg"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedStatus === '' && liveCount > 0 && (
                                    <div className="flex items-center gap-3 pt-2 pb-2">
                                        <span className="relative flex h-4 w-4">
                                            <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative rounded-full h-4 w-4 bg-red-500"></span>
                                        </span>
                                        <h2 className="text-xl font-black text-red-400 tracking-tight">🔴 LIVE NOW</h2>
                                    </div>
                                )}

                                {filteredMatches.map((match, index) => {
                                    const prevMatch = filteredMatches[index - 1];
                                    const showUpcomingHeader = selectedStatus === '' &&
                                        match.status === 'SCHEDULED' &&
                                        prevMatch?.status !== 'SCHEDULED' &&
                                        liveCount > 0;
                                    const showCompletedHeader = selectedStatus === '' &&
                                        match.status === 'COMPLETED' &&
                                        prevMatch?.status !== 'COMPLETED';

                                    return (
                                        <React.Fragment key={match._id}>
                                            {showUpcomingHeader && (
                                                <div className="flex items-center gap-3 pt-8 pb-2">
                                                    <span className="text-xl">📅</span>
                                                    <h2 className="text-xl font-black text-blue-400 tracking-tight">UPCOMING</h2>
                                                </div>
                                            )}
                                            {showCompletedHeader && (
                                                <div className="flex items-center gap-3 pt-8 pb-2">
                                                    <span className="text-xl">✅</span>
                                                    <h2 className="text-xl font-black text-green-400 tracking-tight">COMPLETED</h2>
                                                </div>
                                            )}
                                            <MatchCard match={match} formatIST={formatIST} />
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800/50 bg-slate-900/50 text-center py-6 text-gray-500 text-sm">
                <p className="font-medium">VNIT Inter-Games • Live Updates with Socket.io</p>
            </div>
        </div>
    );
};

export default Home;
