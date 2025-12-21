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
            const [matchRes, deptRes] = await Promise.all([
                api.get('/matches'),
                api.get('/departments')
            ]);

            setMatches(sortMatches(matchRes.data.data));
            setDepartments(deptRes.data.data);
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
            console.log('🔄 Match updated:', updatedMatch._id);
            setMatches(prevMatches => sortMatches(prevMatches.map(m => m._id === updatedMatch._id ? updatedMatch : m)));
        });

        socket.on('matchDeleted', (matchId) => {
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

    const navigate = (path) => window.location.href = path;

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

            {/* Filters Section */}
            <div className={`max-w-5xl mx-auto px-4 mt-8 mb-8 p-6 rounded-lg border transition-all duration-300 ${
                isDarkMode
                    ? 'bg-dark-surface border-dark-border'
                    : 'bg-light-surface border-light-border'
            }`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Connection Indicator */}
                    <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition-all ${
                        isConnected
                            ? isDarkMode
                                ? 'bg-green-600/20 text-green-300 border-green-500/40'
                                : 'bg-green-100 text-green-700 border-green-400'
                            : isDarkMode
                                ? 'bg-red-600/20 text-red-300 border-red-500/40'
                                : 'bg-red-100 text-red-700 border-red-400'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        {isConnected ? '⚡ Live' : '⚠️ Offline'}
                    </div>

                    {/* Department Filter */}
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className={`px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                            isDarkMode
                                ? 'bg-dark-bg text-dark-text border-dark-border focus:ring-vnit-accent'
                                : 'bg-light-bg text-light-text border-light-border focus:ring-vnit-primary'
                        }`}
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>

                    {/* Sport Filter */}
                    <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className={`px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                            isDarkMode
                                ? 'bg-dark-bg text-dark-text border-dark-border focus:ring-vnit-accent'
                                : 'bg-light-bg text-light-text border-light-border focus:ring-vnit-primary'
                        }`}
                    >
                        <option value="">All Sports</option>
                        {sports.map(sport => (
                            <option key={sport} value={sport}>{sport}</option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    {(selectedDept || selectedSport || selectedStatus) && (
                        <button
                            onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                isDarkMode
                                    ? 'bg-vnit-accent text-white hover:bg-yellow-500'
                                    : 'bg-vnit-primary text-white hover:bg-blue-700'
                            }`}
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Matches Section */}
            <div className="max-w-5xl mx-auto px-4 pb-12">
                {loading ? (
                    <div className={`text-center py-12 rounded-lg border ${
                        isDarkMode
                            ? 'bg-dark-surface border-dark-border'
                            : 'bg-light-surface border-light-border'
                    }`}>
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-dark-text' : 'text-light-text'}`}>Loading matches...</div>
                    </div>
                ) : (
                    <>
                        {filteredMatches.length === 0 ? (
                            <div className={`text-center py-24 rounded-lg border ${
                                isDarkMode
                                    ? 'bg-dark-surface border-dark-border'
                                    : 'bg-light-surface border-light-border'
                            }`}>
                                <div className="text-7xl mb-4">🏟️</div>
                                <p className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>No matches found</p>
                                {(selectedDept || selectedSport || selectedStatus) && (
                                    <button
                                        onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                                        className={`mt-6 px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-lg ${
                                            isDarkMode
                                                ? 'bg-vnit-secondary text-white hover:bg-red-700'
                                                : 'bg-vnit-primary text-white hover:bg-blue-700'
                                        }`}
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
                                        <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>🔴 LIVE NOW</h2>
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
                                                    <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>UPCOMING</h2>
                                                </div>
                                            )}
                                            {showCompletedHeader && (
                                                <div className="flex items-center gap-3 pt-8 pb-2">
                                                    <span className="text-xl">✅</span>
                                                    <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>COMPLETED</h2>
                                                </div>
                                            )}
                                            <MatchCard match={match} formatIST={formatIST} isDarkMode={isDarkMode} />
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className={`border-t transition-colors duration-300 ${
                isDarkMode
                    ? 'border-dark-border bg-dark-bg/50 text-dark-text-secondary'
                    : 'border-light-border bg-light-bg/50 text-light-text-secondary'
            } text-center py-6 text-sm`}>
                <p className="font-medium">VNIT Inter-Games • Live Updates with Socket.io</p>
            </div>
        </div>
    );
};

export default Home;
