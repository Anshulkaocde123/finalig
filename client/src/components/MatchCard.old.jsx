import React from 'react';
import { useNavigate } from 'react-router-dom';

const MatchCard = ({ match, formatIST, isDarkMode }) => {
    const navigate = useNavigate();

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://localhost:5001${logoPath}`;
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

    // Status badge config
    const getStatusConfig = () => {
        switch (match.status) {
            case 'LIVE':
                return {
                    bgGradient: 'from-red-600 to-red-700',
                    borderColor: 'border-red-400/60',
                    ringColor: 'ring-red-500/30',
                    textColor: 'text-red-100',
                    badgeText: '🔴 LIVE',
                    badgeBg: 'bg-red-500/30',
                    icon: (
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-red-300 opacity-75"></span>
                            <span className="relative rounded-full h-2.5 w-2.5 bg-red-300"></span>
                        </span>
                    )
                };
            case 'COMPLETED':
                return {
                    bgGradient: 'from-green-600/40 to-green-700/40',
                    borderColor: 'border-green-500/50',
                    ringColor: 'ring-green-500/20',
                    textColor: 'text-green-300',
                    badgeText: '✅ COMPLETED',
                    badgeBg: 'bg-green-500/30',
                    icon: '✓'
                };
            case 'SCHEDULED':
            default:
                return {
                    bgGradient: 'from-blue-600/20 to-indigo-700/20',
                    borderColor: 'border-blue-500/30',
                    ringColor: 'ring-blue-500/20',
                    textColor: 'text-blue-300',
                    badgeText: '📅 UPCOMING',
                    badgeBg: 'bg-blue-500/30',
                    icon: '📅'
                };
        }
    };

    const status = getStatusConfig();

    // Render score based on sport type
    const renderScore = () => {
        if (match.status === 'SCHEDULED') {
            return (
                <div className="text-center py-3">
                    <div className="text-3xl md:text-4xl font-black text-gray-800 mb-2">VS</div>
                    <div className="text-sm font-semibold md:text-sm text-gray-700 font-medium">
                        {formatTime(match.scheduledAt)}
                    </div>
                </div>
            );
        }

        switch (match.sport) {
            case 'CRICKET':
                return (
                    <div className="text-center py-2">
                        <div className="flex items-center justify-center gap-3 md:gap-4">
                            <div className="text-right">
                                <div className="text-2xl md:text-4xl font-black text-white leading-tight">
                                    {match.scoreA?.runs || 0}<span className="text-lg md:text-2xl text-gray-400">/{match.scoreA?.wickets || 0}</span>
                                </div>
                                <div className="text-[11px] md:text-sm font-semibold text-gray-800 font-semibold mt-0.5">
                                    {match.scoreA?.overs || 0} ov
                                </div>
                            </div>
                            <div className="text-gray-900 text-2xl font-bold">-</div>
                            <div className="text-left">
                                <div className="text-2xl md:text-4xl font-black text-white leading-tight">
                                    {match.scoreB?.runs || 0}<span className="text-lg md:text-2xl text-gray-400">/{match.scoreB?.wickets || 0}</span>
                                </div>
                                <div className="text-[11px] md:text-sm font-semibold text-gray-800 font-semibold mt-0.5">
                                    {match.scoreB?.overs || 0} ov
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'BADMINTON':
            case 'TABLE_TENNIS':
            case 'VOLLEYBALL':
                return (
                    <div className="text-center py-2">
                        <div className="text-4xl md:text-5xl font-black text-white mb-1">
                            {match.scoreA || 0} <span className="text-gray-600">-</span> {match.scoreB || 0}
                        </div>
                        <div className="text-[11px] md:text-sm font-semibold text-gray-800 font-bold uppercase tracking-wider">
                            Sets Won
                        </div>
                        {match.currentSet && match.status === 'LIVE' && (
                            <div className="text-sm font-semibold md:text-sm text-indigo-300 mt-2 font-bold bg-indigo-500/20 px-3 py-1 rounded-full inline-block border border-indigo-500/40">
                                Current: {match.currentSet.pointsA || 0} - {match.currentSet.pointsB || 0}
                            </div>
                        )}
                    </div>
                );

            case 'FOOTBALL':
            case 'BASKETBALL':
            case 'KHOKHO':
            case 'KABADDI':
                return (
                    <div className="text-center py-2">
                        <div className="text-5xl md:text-6xl font-black text-white">
                            {match.scoreA || 0} <span className="text-gray-600">-</span> {match.scoreB || 0}
                        </div>
                        {match.period && (
                            <div className="text-sm font-semibold md:text-sm text-gray-700 font-semibold mt-2">
                                {match.sport === 'FOOTBALL' && `Half ${match.period} of ${match.maxPeriods || 2}`}
                                {match.sport === 'BASKETBALL' && `Q${match.period} of ${match.maxPeriods || 4}`}
                                {match.sport === 'KHOKHO' && `Inning ${match.period}`}
                                {match.sport === 'KABADDI' && `Half ${match.period}`}
                            </div>
                        )}
                    </div>
                );

            case 'CHESS':
                return (
                    <div className="text-center py-3">
                        {match.status === 'COMPLETED' && match.winner ? (
                            <div>
                                <div className="text-sm font-bold text-yellow-400 mb-2">
                                    {match.resultType || 'Concluded'}
                                </div>
                                <div className="text-lg text-gray-300 font-semibold">Winner Decided</div>
                            </div>
                        ) : (
                            <div className="text-3xl font-black text-gray-400">In Progress...</div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="text-center py-2">
                        <div className="text-4xl md:text-5xl font-black text-white">
                            {match.scoreA || 0} <span className="text-gray-600">-</span> {match.scoreB || 0}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            onClick={() => navigate(`/match/${match._id}`)}
            className={`bg-gradient-to-br ${status.bgGradient} rounded-2xl overflow-hidden shadow-2xl border-2 ${status.borderColor} ring-2 ${status.ringColor} 
                cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] 
                backdrop-blur-sm relative group`}
        >
            {/* Animated corner accent - Live matches only */}
            {match.status === 'LIVE' && (
                <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 group-hover:animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/5 rounded-full -ml-12 -mb-12"></div>
                </>
            )}

            {/* Header Section */}
            <div className={`bg-gradient-to-r from-gray-900/80 to-gray-800/80 px-4 py-3 flex justify-between items-center border-b border-gray-700/50 backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg text-sm font-semibold font-bold text-gray-200 uppercase tracking-widest border border-gray-600/50">
                        {match.sport.replace('_', ' ')}
                    </span>
                    {match.venue && (
                        <span className="text-sm font-semibold text-gray-700 font-bold hidden sm:inline">📍 {match.venue}</span>
                    )}
                </div>
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status.badgeBg} ${status.textColor} border border-white/20`}>
                    {status.icon}
                    {status.badgeText}
                </span>
            </div>

            {/* Main Content */}
            <div className="p-5 md:p-6">
                {/* Teams and Score */}
                <div className="flex w-full justify-between items-stretch gap-4">
                    {/* Team A */}
                    <div className="flex-1 flex flex-col items-center justify-center py-2">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full flex items-center justify-center mb-2 border border-blue-400/30">
                            {match.teamA?.logo ? (
                                <img
                                    src={getLogoUrl(match.teamA.logo)}
                                    alt={match.teamA.name}
                                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                                />
                            ) : (
                                <span className="text-lg md:text-xl font-bold text-blue-400">
                                    {match.teamA?.shortCode?.slice(0, 1)}
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-sm md:text-base font-bold text-white truncate max-w-20">
                                {match.teamA?.shortCode || 'Team A'}
                            </div>
                            <div className="text-[11px] md:text-sm font-semibold text-gray-800 font-medium">
                                {match.teamA?.name?.split(' ').slice(0, 2).join(' ')}
                            </div>
                        </div>
                    </div>

                    {/* Score Display */}
                    <div className="flex-[1.2] flex flex-col items-center justify-center">
                        {renderScore()}
                    </div>

                    {/* Team B */}
                    <div className="flex-1 flex flex-col items-center justify-center py-2">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full flex items-center justify-center mb-2 border border-pink-400/30">
                            {match.teamB?.logo ? (
                                <img
                                    src={getLogoUrl(match.teamB.logo)}
                                    alt={match.teamB.name}
                                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                                />
                            ) : (
                                <span className="text-lg md:text-xl font-bold text-pink-400">
                                    {match.teamB?.shortCode?.slice(0, 1)}
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-sm md:text-base font-bold text-white truncate max-w-20">
                                {match.teamB?.shortCode || 'Team B'}
                            </div>
                            <div className="text-[11px] md:text-sm font-semibold text-gray-800 font-medium">
                                {match.teamB?.name?.split(' ').slice(0, 2).join(' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Winner Badge */}
                {match.status === 'COMPLETED' && match.winner && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="text-sm font-semibold text-gray-800 text-center font-semibold mb-2">MATCH RESULT</div>
                        <div className="text-center text-sm font-bold text-yellow-400">
                            🏆 {match.winner?.shortCode} Won
                        </div>
                    </div>
                )}

                {/* Time Info */}
                {match.status === 'SCHEDULED' && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="text-sm font-semibold text-center text-gray-800 font-semibold">SCHEDULED</div>
                        <div className="text-sm font-semibold text-center text-gray-700 mt-1 font-medium">
                            {formatTime(match.scheduledAt)}
                        </div>
                    </div>
                )}
            </div>

            {/* Click Hint */}
            <div className="px-5 pb-4 text-center text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors font-medium">
                Click to view details →
            </div>
        </div>
    );
};

export default MatchCard;
