import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import PublicNavbar from '../../components/PublicNavbar';
import { ChevronDown, Trophy, TrendingUp } from 'lucide-react';

// Lazy load 3D background
const ThreeBackground = React.lazy(() => import('../../components/ThreeBackground'));

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
        if (rank === 0) return <span className="text-4xl">🥇</span>;
        if (rank === 1) return <span className="text-4xl">🥈</span>;
        if (rank === 2) return <span className="text-4xl">🥉</span>;
        return <span className="text-2xl font-black text-gray-500">#{rank + 1}</span>;
    };

    const getRankGradient = (index) => {
        if (index === 0) return 'from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/40';
        if (index === 1) return 'from-gray-400/20 via-slate-400/10 to-transparent border-gray-400/40';
        if (index === 2) return 'from-orange-500/20 via-amber-600/10 to-transparent border-orange-500/40';
        return 'from-transparent to-transparent border-white/10';
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://localhost:5000${logoPath}`;
    };

    // Fallback background
    const FallbackBg = () => (
        <div className={`fixed inset-0 -z-10 ${isDarkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
            <div className="absolute inset-0">
                <div className={`absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-200/30'}`} />
                <div className={`absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-3xl ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-200/30'}`} />
            </div>
        </div>
    );

    if (loading) return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex flex-col justify-center items-center h-96">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
                />
                <p className="mt-4 text-gray-500">Loading standings...</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* 3D Background */}
            {isDarkMode ? (
                <Suspense fallback={<FallbackBg />}>
                    <ThreeBackground variant="default" />
                </Suspense>
            ) : (
                <FallbackBg />
            )}

            <div className="relative z-10">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

                {/* Hero Section */}
                <div className="relative py-16 px-4 text-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mb-4"
                        >
                            <Trophy className="w-16 h-16 text-yellow-500" />
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                Championship
                            </span>
                        </h1>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Real-time Department Standings
                        </p>
                    </motion.div>
                </div>

                {/* Leaderboard */}
                <div className="max-w-4xl mx-auto px-4 pb-12">
                    {/* Top 3 Podium */}
                    {standings.length >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-3 gap-4 mb-10"
                        >
                            {/* 2nd Place */}
                            <motion.div
                                whileHover={{ scale: 1.03, y: -5 }}
                                className={`order-1 pt-8 backdrop-blur-xl rounded-3xl p-6 text-center border ${
                                    isDarkMode ? 'bg-white/5 border-gray-500/30' : 'bg-white/80 border-gray-300'
                                }`}
                            >
                                <div className="text-4xl mb-2">🥈</div>
                                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                                    {getLogoUrl(standings[1]?.logo) ? (
                                        <img src={getLogoUrl(standings[1]?.logo)} alt="" className="w-12 h-12 object-contain" />
                                    ) : (
                                        <span className="text-2xl font-black text-white">{standings[1]?.shortCode?.slice(0, 2)}</span>
                                    )}
                                </div>
                                <div className="font-bold text-lg">{standings[1]?.shortCode}</div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{standings[1]?.name}</div>
                                <div className="text-3xl font-black mt-2 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
                                    {standings[1]?.points || 0}
                                </div>
                            </motion.div>

                            {/* 1st Place */}
                            <motion.div
                                whileHover={{ scale: 1.03, y: -5 }}
                                className={`order-2 backdrop-blur-xl rounded-3xl p-6 text-center border-2 relative overflow-hidden ${
                                    isDarkMode ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-yellow-50 border-yellow-400'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none" />
                                <div className="relative">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-5xl mb-2"
                                    >
                                        👑
                                    </motion.div>
                                    <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                        {getLogoUrl(standings[0]?.logo) ? (
                                            <img src={getLogoUrl(standings[0]?.logo)} alt="" className="w-16 h-16 object-contain" />
                                        ) : (
                                            <span className="text-3xl font-black text-white">{standings[0]?.shortCode?.slice(0, 2)}</span>
                                        )}
                                    </div>
                                    <div className="font-black text-xl">{standings[0]?.shortCode}</div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{standings[0]?.name}</div>
                                    <div className="text-4xl font-black mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                        {standings[0]?.points || 0}
                                    </div>
                                </div>
                            </motion.div>

                            {/* 3rd Place */}
                            <motion.div
                                whileHover={{ scale: 1.03, y: -5 }}
                                className={`order-3 pt-12 backdrop-blur-xl rounded-3xl p-6 text-center border ${
                                    isDarkMode ? 'bg-white/5 border-orange-500/30' : 'bg-white/80 border-orange-300'
                                }`}
                            >
                                <div className="text-4xl mb-2">🥉</div>
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                    {getLogoUrl(standings[2]?.logo) ? (
                                        <img src={getLogoUrl(standings[2]?.logo)} alt="" className="w-10 h-10 object-contain" />
                                    ) : (
                                        <span className="text-xl font-black text-white">{standings[2]?.shortCode?.slice(0, 2)}</span>
                                    )}
                                </div>
                                <div className="font-bold">{standings[2]?.shortCode}</div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{standings[2]?.name}</div>
                                <div className="text-2xl font-black mt-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                                    {standings[2]?.points || 0}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Full Rankings List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${
                            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'
                        }`}
                    >
                        {/* Header */}
                        <div className={`grid grid-cols-12 gap-4 p-5 text-xs font-bold uppercase tracking-wider border-b ${
                            isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
                        }`}>
                            <div className="col-span-2 text-center">Rank</div>
                            <div className="col-span-7">Department</div>
                            <div className="col-span-3 text-right">Points</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-white/5">
                            <AnimatePresence>
                                {standings.map((team, index) => {
                                    const isExpanded = expandedRow === team._id;
                                    const deptName = team.name || team.department?.name || 'Unknown';
                                    const deptCode = team.shortCode || team.department?.shortCode || '';
                                    const deptLogo = team.logo || team.department?.logo;
                                    const points = team.points !== undefined ? team.points : team.totalScore || 0;
                                    const history = team.history || [];

                                    return (
                                        <motion.div
                                            key={team._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div
                                                onClick={() => history.length > 0 && toggleRow(team._id)}
                                                className={`grid grid-cols-12 gap-4 p-5 items-center cursor-pointer transition-all hover:bg-white/5 bg-gradient-to-r ${getRankGradient(index)} ${
                                                    index < 3 ? 'border-l-4' : ''
                                                }`}
                                            >
                                                {/* Rank */}
                                                <div className="col-span-2 flex justify-center">
                                                    {getRankIcon(index)}
                                                </div>

                                                {/* Team */}
                                                <div className="col-span-7 flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                        isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                                                    }`}>
                                                        {getLogoUrl(deptLogo) ? (
                                                            <img src={getLogoUrl(deptLogo)} alt="" className="w-10 h-10 object-contain" />
                                                        ) : (
                                                            <span className="text-lg font-black">{deptCode?.slice(0, 2)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">{deptCode}</div>
                                                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{deptName}</div>
                                                    </div>
                                                </div>

                                                {/* Points */}
                                                <div className="col-span-3 flex items-center justify-end gap-2">
                                                    <motion.div
                                                        key={points}
                                                        initial={{ scale: 1.2 }}
                                                        animate={{ scale: 1 }}
                                                        className={`text-3xl font-black ${
                                                            index === 0 ? 'text-yellow-500' :
                                                            index === 1 ? 'text-gray-400' :
                                                            index === 2 ? 'text-orange-500' :
                                                            isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                                                        }`}
                                                    >
                                                        {points}
                                                    </motion.div>
                                                    {history.length > 0 && (
                                                        <motion.div
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            className="text-gray-500"
                                                        >
                                                            <ChevronDown className="w-5 h-5" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded History */}
                                            <AnimatePresence>
                                                {isExpanded && history.length > 0 && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className={`overflow-hidden ${isDarkMode ? 'bg-black/30' : 'bg-gray-50'}`}
                                                    >
                                                        <div className="p-5">
                                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                <TrendingUp className="w-4 h-4" />
                                                                Points History
                                                            </h4>
                                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                                {history
                                                                    .sort((a, b) => new Date(b.createdAt || b.awardedAt) - new Date(a.createdAt || a.awardedAt))
                                                                    .slice(0, 10)
                                                                    .map((log, idx) => (
                                                                        <motion.div
                                                                            key={idx}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: idx * 0.05 }}
                                                                            className={`flex justify-between items-center p-3 rounded-xl ${
                                                                                isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
                                                                            }`}
                                                                        >
                                                                            <div>
                                                                                <div className="font-bold">{log.eventName}</div>
                                                                                <div className="text-xs text-gray-500">{log.category}</div>
                                                                                {log.position && (
                                                                                    <div className="text-xs text-indigo-400 font-medium">📍 {log.position}</div>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-xl font-black text-green-500">+{log.points}</div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    {new Date(log.awardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className={`py-8 text-center border-t backdrop-blur-xl ${
                    isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                    <p className="text-sm">VNIT Inter-Games • Real-time Leaderboard</p>
                </footer>
            </div>
        </div>
    );
};

export default Leaderboard;
