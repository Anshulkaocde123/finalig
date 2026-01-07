import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PublicNavbar from '../../components/PublicNavbar';
import { ChevronDown, Trophy } from 'lucide-react';

const Leaderboard = ({ isDarkMode, setIsDarkMode }) => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        try {
            const res = await api.get('/leaderboard');
            // Handle both old format (direct array) and new format (with success and data)
            const data = res.data.data || res.data;
            setStandings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching standings:', error);
            setStandings([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getRankIcon = (rank) => {
        if (rank === 0) return '🥇';
        if (rank === 1) return '🥈';
        if (rank === 2) return '🥉';
        return `#${rank + 1}`;
    };

    const getRankColor = (index) => {
        if (index === 0) return 'from-yellow-600 to-yellow-700 border-yellow-400/60';
        if (index === 1) return 'from-gray-500 to-gray-600 border-gray-400/60';
        if (index === 2) return 'from-orange-600 to-orange-700 border-orange-400/60';
        return 'from-gray-700 to-gray-800 border-gray-600/40';
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://localhost:5000${logoPath}`;
    };

    if (loading) return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-vnit-primary/30 border-t-vnit-accent mx-auto mb-4"></div>
                    <p className={`font-medium ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>Loading standings...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'} font-['Inter']`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            {/* Hero Section */}
            <div className={`py-12 px-4 shadow-2xl transition-all duration-300 ${
                isDarkMode
                    ? 'bg-gradient-to-r from-vnit-primary via-yellow-600 to-vnit-secondary'
                    : 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600'
            }`}>
                <div className="max-w-5xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-200" />
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">General Championship</h1>
                        <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-200" />
                    </div>
                    <p className="text-white/90 text-base md:text-lg font-light">Real-time Department Standings - VNIT Inter-Games 2025</p>
                </div>
            </div>

            {/* Leaderboard Container */}
            <div className="max-w-5xl mx-auto p-4 md:p-8 pb-12">
                <div className={`rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-sm transition-all duration-300 ${
                    isDarkMode
                        ? 'bg-dark-surface border-dark-border'
                        : 'bg-light-surface border-light-border'
                }`}>
                    {/* Header */}
                    <div className={`sticky top-0 z-10 grid grid-cols-12 p-4 md:p-6 font-black text-xs md:text-sm uppercase tracking-wider border-b transition-colors ${
                        isDarkMode
                            ? 'bg-dark-bg/90 border-dark-border text-dark-text-secondary'
                            : 'bg-light-bg/90 border-light-border text-light-text-secondary'
                    }`}>
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-1 text-center">Logo</div>
                        <div className="col-span-6">Department</div>
                        <div className="col-span-3 text-right pr-4">Points</div>
                    </div>

                    {/* Standings List */}
                    <div className={`divide-y ${isDarkMode ? 'divide-dark-border/30' : 'divide-light-border/30'}`}>
                        {standings.map((team, index) => {
                            const isExpanded = expandedRow === team._id;
                            const rankColor = getRankColor(index);
                            
                            // Handle both old and new API response formats
                            const deptName = team.name || team.department?.name || 'Unknown';
                            const deptCode = team.shortCode || team.department?.shortCode || '';
                            const deptLogo = team.logo || team.department?.logo;
                            const points = team.points !== undefined ? team.points : team.totalScore || 0;
                            const history = team.history || [];

                            return (
                                <React.Fragment key={team._id}>
                                    {/* Main Row */}
                                    <div
                                        onClick={() => toggleRow(team._id)}
                                        className={`grid grid-cols-12 p-4 md:p-6 gap-3 cursor-pointer transition-all duration-200 hover:bg-gray-700/20 ${
                                            index < 3 ? 'bg-gradient-to-r ' + rankColor + ' border-l-4' : ''
                                        }`}
                                    >
                                        {/* Rank */}
                                        <div className={`col-span-2 flex items-center justify-center ${
                                            index < 3 ? 'text-2xl md:text-3xl font-black' : 'text-lg md:text-xl font-bold text-gray-400'
                                        }`}>
                                            {getRankIcon(index)}
                                        </div>

                                        {/* Logo */}
                                        <div className="col-span-1 flex items-center justify-center">
                                            {getLogoUrl(deptLogo) ? (
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700/50 rounded-lg flex items-center justify-center border border-gray-600/50">
                                                    <img
                                                        src={getLogoUrl(deptLogo)}
                                                        alt={deptName}
                                                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center border border-purple-400/30">
                                                    <span className="text-lg md:text-xl font-black text-white">
                                                        {deptCode?.slice(0, 2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Department Name */}
                                        <div className="col-span-6 flex flex-col justify-center">
                                            <div className="text-sm md:text-lg font-bold text-white">
                                                {deptName}
                                            </div>
                                            <div className="text-xs md:text-sm text-gray-400 font-medium">
                                                {deptCode}
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="col-span-3 flex items-center justify-end">
                                            <div className={`text-right ${index < 3 ? 'text-white' : 'text-indigo-400'}`}>
                                                <div className="text-xl md:text-3xl font-black">{points}</div>
                                                <div className="text-[10px] md:text-xs text-gray-400 font-medium">pts</div>
                                            </div>
                                            {history?.length > 0 && (
                                                <div className={`ml-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded History */}
                                    {isExpanded && history?.length > 0 && (
                                        <div className="bg-gray-900/30 p-4 md:p-6 border-t border-gray-700/30">
                                            <div className="mb-3">
                                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Points History</h4>
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {history
                                                        ?.sort((a, b) => new Date(b.createdAt || b.awardedAt) - new Date(a.createdAt || a.awardedAt))
                                                        .slice(0, 10)
                                                        .map((log, idx) => (
                                                            <div key={idx} className="flex justify-between items-start p-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
                                                                <div className="flex-1">
                                                                    <div className="text-xs md:text-sm font-bold text-white">{log.eventName}</div>
                                                                    <div className="text-[10px] md:text-xs text-gray-400">{log.category}</div>
                                                                    {log.position && (
                                                                        <div className="text-[10px] text-indigo-300 font-semibold">📍 {log.position}</div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-lg font-black text-yellow-400">+{log.points}</div>
                                                                    <div className="text-[10px] text-gray-500 font-medium">
                                                                        {new Date(log.awardedAt).toLocaleDateString('en-IN', {
                                                                            day: 'numeric',
                                                                            month: 'short'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
                    <div className={`p-4 rounded-xl border text-center transition-colors ${
                        isDarkMode
                            ? 'bg-yellow-600/20 border-yellow-500/30'
                            : 'bg-yellow-100 border-yellow-400'
                    }`}>
                        <div className="text-2xl mb-1">🥇</div>
                        <div className={`text-xs md:text-sm font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>1st Place</div>
                    </div>
                    <div className={`p-4 rounded-xl border text-center transition-colors ${
                        isDarkMode
                            ? 'bg-gray-500/20 border-gray-400/30'
                            : 'bg-gray-200 border-gray-400'
                    }`}>
                        <div className="text-2xl mb-1">🥈</div>
                        <div className={`text-xs md:text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>2nd Place</div>
                    </div>
                    <div className={`p-4 rounded-xl border text-center transition-colors ${
                        isDarkMode
                            ? 'bg-orange-600/20 border-orange-500/30'
                            : 'bg-orange-100 border-orange-400'
                    }`}>
                        <div className="text-2xl mb-1">🥉</div>
                        <div className={`text-xs md:text-sm font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>3rd Place</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={`border-t transition-colors duration-300 ${
                isDarkMode
                    ? 'border-dark-border bg-dark-bg/50 text-dark-text-secondary'
                    : 'border-light-border bg-light-bg/50 text-light-text-secondary'
            } text-center py-6 text-sm`}>
                <p className="font-medium">VNIT Inter-Games • Real-time Leaderboard</p>
            </div>
        </div>
    );
};

export default Leaderboard;
