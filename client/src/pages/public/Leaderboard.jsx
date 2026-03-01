import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import PublicNavbar from '../../components/PublicNavbar';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStandings();
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
            <div className="max-w-4xl mx-auto p-4 md:p-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 p-4 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-1 text-center">Logo</div>
                        <div className="col-span-6">Department</div>
                        <div className="col-span-3 text-right pr-4">Points</div>
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
                                    className={`grid grid-cols-12 p-4 gap-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                        isTop3 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                    }`}
                                >
                                    {/* Rank */}
                                    <div className={`col-span-2 flex items-center justify-center ${
                                        isTop3 ? 'text-xl' : 'text-base text-slate-500 dark:text-slate-400'
                                    }`}>
                                        {getRankIcon(index)}
                                    </div>

                                    {/* Logo */}
                                    <div className="col-span-1 flex items-center justify-center">
                                        {getLogoUrl(deptLogo) ? (
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                                <img
                                                    src={getLogoUrl(deptLogo)}
                                                    alt={deptName}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {deptCode?.slice(0, 2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Department */}
                                    <div className="col-span-6 flex flex-col justify-center">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {deptName}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {deptCode}
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div className="col-span-3 flex items-center justify-end">
                                        <div className="text-right">
                                            <div className={`text-xl font-bold ${isTop3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                {points}
                                            </div>
                                            <div className="text-xs text-slate-400">pts</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="text-xl mb-1">🥇</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">1st Place</div>
                    </div>
                    <div className="p-3 rounded-lg text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="text-xl mb-1">🥈</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">2nd Place</div>
                    </div>
                    <div className="p-3 rounded-lg text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="text-xl mb-1">🥉</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">3rd Place</div>
                    </div>
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
