import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MatchCard = ({ match, formatIST, isDarkMode }) => {
    const navigate = useNavigate();

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://localhost:5000${logoPath}`;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        if (formatIST) return formatIST(dateStr);
        return new Date(dateStr).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusConfig = () => {
        switch (match.status) {
            case 'LIVE':
                return {
                    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
                    border: 'border-red-500/30',
                    badge: 'bg-gradient-to-r from-red-500 to-rose-600',
                    badgeText: 'LIVE',
                    glow: 'shadow-lg shadow-red-500/20',
                    accent: 'text-red-500'
                };
            case 'COMPLETED':
                return {
                    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
                    border: 'border-emerald-500/20',
                    badge: 'bg-gradient-to-r from-emerald-500 to-green-600',
                    badgeText: 'FINAL',
                    accent: 'text-emerald-500'
                };
            default:
                return {
                    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
                    border: 'border-blue-500/20',
                    badge: 'bg-gradient-to-r from-blue-500 to-indigo-600',
                    badgeText: formatTime(match.scheduledAt),
                    accent: 'text-blue-500'
                };
        }
    };

    const config = getStatusConfig();

    const getScore = () => {
        if (match.sport === 'CRICKET') {
            const scoreA = match.scoreA || {};
            const scoreB = match.scoreB || {};
            return {
                teamA: `${scoreA.runs || 0}/${scoreA.wickets || 0}`,
                teamAExtra: `(${scoreA.overs || 0} ov)`,
                teamB: `${scoreB.runs || 0}/${scoreB.wickets || 0}`,
                teamBExtra: `(${scoreB.overs || 0} ov)`
            };
        }
        return {
            teamA: match.scoreA || 0,
            teamB: match.scoreB || 0
        };
    };

    const score = getScore();
    const teamA = match.teamA || {};
    const teamB = match.teamB || {};

    const getSportIcon = (sport) => {
        const icons = {
            CRICKET: '🏏',
            FOOTBALL: '⚽',
            BASKETBALL: '🏀',
            VOLLEYBALL: '🏐',
            BADMINTON: '🏸',
            TABLE_TENNIS: '🏓',
            KHOKHO: '🏃',
            KABADDI: '🤼',
            CHESS: '♟️'
        };
        return icons[sport] || '🏆';
    };

    // Team Logo/Avatar Component
    const TeamAvatar = ({ team, isReversed = false }) => (
        <div className={`flex items-center gap-4 ${isReversed ? 'flex-row-reverse' : ''}`}>
            <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
            >
                {team.logo ? (
                    <img 
                        src={getLogoUrl(team.logo)} 
                        alt={team.shortCode}
                        className={`w-14 h-14 object-contain rounded-2xl p-1.5 ${
                            isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                        }`}
                    />
                ) : (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                        isDarkMode 
                            ? 'bg-gradient-to-br from-white/10 to-white/5 text-white' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600'
                    }`}>
                        {team.shortCode?.charAt(0) || '?'}
                    </div>
                )}
                {/* Winner indicator */}
                {match.status === 'COMPLETED' && match.winner?._id === team._id && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-xs shadow-lg"
                    >
                        👑
                    </motion.div>
                )}
            </motion.div>
            <div className={isReversed ? 'text-right' : 'text-left'}>
                <div className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {team.shortCode || 'TBD'}
                </div>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {team.name || ''}
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            onClick={() => navigate(`/match/${match._id}`)}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                match.status === 'LIVE' ? config.glow : ''
            }`}
        >
            {/* Glassmorphism Card */}
            <div className={`relative p-6 rounded-3xl backdrop-blur-xl border ${config.border} ${
                isDarkMode 
                    ? 'bg-white/5 hover:bg-white/[0.08]' 
                    : 'bg-white/80 hover:bg-white shadow-lg'
            }`}>
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-3xl pointer-events-none`} />
                
                {/* Live pulse effect */}
                {match.status === 'LIVE' && (
                    <motion.div
                        animate={{ opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 rounded-3xl pointer-events-none"
                    />
                )}

                <div className="relative">
                    {/* Header Row - Sport & Status */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <motion.span 
                                whileHover={{ rotate: 20 }}
                                className="text-2xl"
                            >
                                {getSportIcon(match.sport)}
                            </motion.span>
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    {match.sport?.replace('_', ' ')}
                                </span>
                                {match.venue && (
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                        📍 {match.venue}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Status Badge */}
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold text-white ${config.badge} ${
                                match.status === 'LIVE' ? 'animate-pulse' : ''
                            }`}
                        >
                            {match.status === 'LIVE' && (
                                <span className="mr-2 inline-flex">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                </span>
                            )}
                            {config.badgeText}
                        </motion.div>
                    </div>

                    {/* Main Content - Teams & Score */}
                    <div className="flex items-center">
                        {/* Team A */}
                        <div className="flex-1">
                            <TeamAvatar team={teamA} />
                        </div>

                        {/* Score Section */}
                        <div className="px-8">
                            {match.status === 'SCHEDULED' ? (
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`text-2xl font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}
                                >
                                    VS
                                </motion.div>
                            ) : match.sport === 'CRICKET' ? (
                                <div className="text-center space-y-2">
                                    <div className="flex items-baseline gap-4 justify-center">
                                        <div>
                                            <motion.div 
                                                key={score.teamA}
                                                initial={{ scale: 1.2, color: '#22c55e' }}
                                                animate={{ scale: 1, color: isDarkMode ? '#fff' : '#111' }}
                                                className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                            >
                                                {score.teamA}
                                            </motion.div>
                                            <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {score.teamAExtra}
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>—</span>
                                        <div>
                                            <motion.div 
                                                key={score.teamB}
                                                initial={{ scale: 1.2, color: '#22c55e' }}
                                                animate={{ scale: 1, color: isDarkMode ? '#fff' : '#111' }}
                                                className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                            >
                                                {score.teamB}
                                            </motion.div>
                                            <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {score.teamBExtra}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <motion.span 
                                        key={score.teamA}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                    >
                                        {score.teamA}
                                    </motion.span>
                                    <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>—</span>
                                    <motion.span 
                                        key={score.teamB}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                    >
                                        {score.teamB}
                                    </motion.span>
                                </div>
                            )}
                        </div>

                        {/* Team B */}
                        <div className="flex-1 flex justify-end">
                            <TeamAvatar team={teamB} isReversed={true} />
                        </div>
                    </div>

                    {/* Footer Row - Additional Info */}
                    <AnimatePresence>
                        {(match.toss?.winner || match.status === 'COMPLETED' || 
                          match.cardsA?.yellow > 0 || match.cardsA?.red > 0 || 
                          match.cardsB?.yellow > 0 || match.cardsB?.red > 0) && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mt-5 pt-4 border-t flex items-center justify-center gap-6 flex-wrap ${
                                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                                }`}
                            >
                                {/* Toss Info */}
                                {match.toss?.winner && (
                                    <div className={`text-xs font-medium ${isDarkMode ? 'text-yellow-500/80' : 'text-yellow-600'}`}>
                                        🪙 {(() => {
                                            const tossWinnerId = match.toss.winner?._id?.toString() || match.toss.winner?.toString();
                                            const teamAId = teamA?._id?.toString();
                                            return tossWinnerId === teamAId ? teamA.shortCode : teamB.shortCode;
                                        })()} won toss • {match.toss.decision}
                                    </div>
                                )}

                                {/* Cards/Fouls */}
                                {(match.cardsA?.yellow > 0 || match.cardsA?.red > 0 || match.cardsB?.yellow > 0 || match.cardsB?.red > 0) && (
                                    <div className="flex gap-4 text-xs">
                                        {(match.cardsA?.yellow > 0 || match.cardsA?.red > 0) && (
                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                                {teamA.shortCode}: {match.cardsA?.yellow > 0 && `🟨${match.cardsA.yellow}`} {match.cardsA?.red > 0 && `🟥${match.cardsA.red}`}
                                            </span>
                                        )}
                                        {(match.cardsB?.yellow > 0 || match.cardsB?.red > 0) && (
                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                                {teamB.shortCode}: {match.cardsB?.yellow > 0 && `🟨${match.cardsB.yellow}`} {match.cardsB?.red > 0 && `🟥${match.cardsB.red}`}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Winner announcement */}
                                {match.status === 'COMPLETED' && match.winner && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                                    >
                                        🏆 {match.winner.shortCode || match.winner.name} wins!
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hover shine effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full pointer-events-none"
                    whileHover={{ translateX: '200%' }}
                    transition={{ duration: 0.6 }}
                />
            </div>
        </motion.div>
    );
};

export default MatchCard;
