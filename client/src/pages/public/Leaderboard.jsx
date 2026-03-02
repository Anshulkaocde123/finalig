import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PublicNavbar from '../../components/PublicNavbar';
import { Trophy } from 'lucide-react';
import socket from '../../socket';

const Leaderboard = () => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStandings();

        // Real-time: refresh leaderboard when admin awards points or resets
        socket.on('pointsAwarded', fetchStandings);
        socket.on('leaderboardReset', fetchStandings);
        socket.on('matchUpdate', fetchStandings);

        return () => {
            socket.off('pointsAwarded', fetchStandings);
            socket.off('leaderboardReset', fetchStandings);
            socket.off('matchUpdate', fetchStandings);
        };
    }, []);

    const fetchStandings = async () => {
        try {
            const res = await api.get('/leaderboard');
            const data = res.data.data || res.data;
            setStandings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching standings:', error);
            setStandings([]);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 0) return '🥇';
        if (rank === 1) return '🥈';
        if (rank === 2) return '🥉';
        return `#${rank + 1}`;
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        return `${baseUrl}${logoPath}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <PublicNavbar />
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading standings...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <PublicNavbar />

            {/* Header */}
            <div className="py-12 px-4 text-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Institute Gathering
                    </h1>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Department Standings • Inter-Department events
                </p>
            </div>

            {/* Leaderboard */}
            <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Header Row — hidden on very small screens, visible sm+ */}
                    <div className="hidden sm:flex items-center px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <div className="w-16 text-center flex-shrink-0">Rank</div>
                        <div className="flex-1 ml-3">Department</div>
                        <div className="w-24 text-right pr-1 flex-shrink-0">Points</div>
                    </div>

                    {/* Standings */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {standings.map((team, index) => {
                            const isTop3 = index < 3;
                            const deptName = team.name || team.department?.name || 'Unknown';
                            const deptCode = team.shortCode || team.department?.shortCode || '';
                            const deptLogo = team.logo || team.department?.logo;
                            const points = team.points !== undefined ? team.points : team.totalScore || 0;

                            return (
                                <div
                                    key={team._id}
                                    className={`flex items-center px-3 sm:px-4 py-3 sm:py-4 gap-3 transition-colors ${
                                        isTop3 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                    }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-10 sm:w-16 flex items-center justify-center flex-shrink-0 ${
                                        isTop3 ? 'text-xl sm:text-2xl' : 'text-sm font-bold text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {getRankIcon(index)}
                                    </div>

                                    {/* Logo */}
                                    <div className="flex-shrink-0">
                                        {getLogoUrl(deptLogo) ? (
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden">
                                                <img
                                                    src={getLogoUrl(deptLogo)}
                                                    alt={deptName}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span class="text-xs font-bold text-blue-600">${deptCode?.slice(0, 2)}</span>`; }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                                <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {deptCode?.slice(0, 2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Department */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {deptName}
                                        </div>
                                        {deptCode && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {deptCode}
                                            </div>
                                        )}
                                    </div>

                                    {/* Points */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className={`text-lg sm:text-xl font-bold tabular-nums ${isTop3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                            {points}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-slate-400">pts</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend — flat, non-interactive (not buttons) */}
                <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1"><span className="text-base">🥇</span> 1st</span>
                    <span className="flex items-center gap-1"><span className="text-base">🥈</span> 2nd</span>
                    <span className="flex items-center gap-1"><span className="text-base">🥉</span> 3rd</span>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Institute Gathering Inter-Games • Real-time Leaderboard
                </p>
            </footer>
        </div>
    );
};

export default Leaderboard;
