import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import MatchCard from '../../components/MatchCard';

const Home = () => {
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
            console.log('📡 Match update received (Home):', {
                matchId: updatedMatch._id,
                sport: updatedMatch.sport,
                scoreA: updatedMatch.scoreA?.runs,
                scoreB: updatedMatch.scoreB?.runs,
                balls: updatedMatch.scoreA?.balls
            });
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
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="relative">
                <PublicNavbar />

                {/* Hero Section */}
                <div className="relative py-20 px-6 text-center bg-white border-b-2 border-gray-600 shadow-md">
                    <div className="relative">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
                            <span className="text-gray-900">VNIT</span>
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ml-4">
                                Games
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl font-light max-w-lg mx-auto text-gray-600">
                            Inter-Department Championship • Real-Time Scores
                        </p>

                        {/* Connection Status Badge */}
                        <div className={`inline-flex items-center gap-3 mt-8 px-5 py-2.5 rounded-full text-sm font-medium border-2 shadow-sm ${
                                isConnected
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : 'bg-red-50 text-red-700 border-red-300'
                            }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {isConnected ? 'Live Updates Active' : 'Reconnecting...'}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-5xl mx-auto px-4 -mt-10">
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {statCards.map((stat) => (
                            <button
                                key={stat.key}
                                onClick={() => setSelectedStatus(selectedStatus === stat.key ? '' : stat.key)}
                                className={`relative p-6 md:p-8 rounded-2xl transition-all duration-200 text-center border-2 shadow-lg hover:shadow-xl ${
                                    selectedStatus === stat.key
                                        ? `bg-gradient-to-br ${stat.gradient} text-white border-transparent shadow-xl`
                                        : 'bg-white hover:bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="relative">
                                    <div className="flex justify-center mb-3">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl md:text-5xl font-black">
                                        {stat.count}
                                    </div>
                                    <div className={`text-xs font-bold uppercase tracking-widest mt-2 ${
                                        selectedStatus === stat.key 
                                            ? 'text-white/90' 
                                            : 'text-gray-500'
                                    }`}>
                                        {stat.label}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="max-w-5xl mx-auto px-4 mt-10">
                    <div className="flex flex-wrap gap-4 p-6 rounded-2xl bg-white shadow-lg border-2 border-gray-200">
                        <div className="relative flex-1 min-w-[140px]">
                            <label className="block text-sm font-semibold font-bold uppercase tracking-wider mb-1.5 text-gray-700">Department</label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 border-2 border-gray-700 shadow-sm"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 bottom-3 pointer-events-none text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative flex-1 min-w-[140px]">
                            <label className="block text-sm font-semibold font-bold uppercase tracking-wider mb-1.5 text-gray-700">Sport</label>
                            <select
                                value={selectedSport}
                                onChange={(e) => setSelectedSport(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none appearance-none cursor-pointer bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 border-2 border-gray-700 shadow-sm"
                            >
                                <option value="">All Sports</option>
                                {sports.map(sport => (
                                    <option key={sport} value={sport}>{sportIcons[sport]} {sport.replace('_', ' ')}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 bottom-3 pointer-events-none text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {(selectedDept || selectedSport || selectedStatus) && (
                            <button
                                onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                                className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg transition-all border-2 border-transparent shadow-md"
                            >
                                Clear All ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Match List */}
                <div className="max-w-5xl mx-auto px-4 py-10 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                            <p className="mt-4 text-sm text-gray-500">
                                Loading matches...
                            </p>
                        </div>
                    ) : filteredMatches.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl bg-white shadow-lg border-2 border-gray-200">
                            <div className="text-7xl mb-6">
                                🏟️
                            </div>
                            <p className="text-xl font-bold text-gray-500">
                                No matches found
                            </p>
                            {(selectedDept || selectedSport || selectedStatus) && (
                                <button
                                    onClick={() => { setSelectedDept(''); setSelectedSport(''); setSelectedStatus(''); }}
                                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredMatches.map((match, idx) => {
                                const prevMatch = filteredMatches[idx - 1];
                                const showLiveHeader = idx === 0 && match.status === 'LIVE' && !selectedStatus;
                                const showUpcomingHeader = match.status === 'SCHEDULED' && prevMatch?.status === 'LIVE' && !selectedStatus;
                                const showCompletedHeader = match.status === 'COMPLETED' && prevMatch?.status !== 'COMPLETED' && !selectedStatus;

                                return (
                                    <React.Fragment key={match._id}>
                                        {showLiveHeader && (
                                            <div className="flex items-center gap-3 pt-4 pb-2">
                                                <span className="relative flex h-4 w-4">
                                                    <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                                    <span className="relative rounded-full h-4 w-4 bg-red-500"></span>
                                                </span>
                                                <span className="text-xl font-black tracking-tight text-red-600">
                                                    LIVE NOW
                                                </span>
                                            </div>
                                        )}
                                        {showUpcomingHeader && (
                                            <div className="flex items-center gap-3 pt-8 pb-2">
                                                <span className="text-2xl">📅</span>
                                                <span className="text-xl font-black tracking-tight text-blue-600">
                                                    UPCOMING
                                                </span>
                                            </div>
                                        )}
                                        {showCompletedHeader && (
                                            <div className="flex items-center gap-3 pt-8 pb-2">
                                                <span className="text-2xl">✓</span>
                                                <span className="text-xl font-black tracking-tight text-green-600">
                                                    COMPLETED
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <MatchCard match={match} formatIST={formatIST} />
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="py-10 text-center border-t-2 border-gray-600 bg-white shadow-inner text-gray-500">
                    <p className="text-sm font-medium">
                        VNIT Inter-Games © {new Date().getFullYear()}
                    </p>
                    <p className="text-sm font-semibold mt-2 text-gray-400">
                        Real-time updates powered by Socket.io
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Home;
