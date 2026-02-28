import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Crown } from 'lucide-react';
import { SPORT_ICONS, SPORT_COLORS, STATUS_CONFIG, formatMatchDate } from '../lib/constants';

const MatchCard = ({ match }) => {
    const navigate = useNavigate();
    const isCompleted = match.status === 'COMPLETED';
    const sportColor = SPORT_COLORS[match.sport] || { accent: '#3b82f6' };
    const statusConfig = STATUS_CONFIG[match.status] || {};

    const getTeamName = (team) => team?.shortCode || team?.name || 'TBD';

    const isWinner = (team) => {
        if (!match.winner || !team) return false;
        const winnerId = match.winner._id || match.winner;
        return winnerId === team._id;
    };

    return (
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/matches/${match._id}`)}
            className="relative bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer transition-all overflow-hidden group active:bg-slate-50">

            {/* Sport accent line at top */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                 style={{ background: sportColor.accent }} />

            {/* Header: Sport + Status */}
            <div className="flex items-center justify-between mb-3 pt-1">
                <div className="flex items-center gap-2">
                    <span className="text-base">{SPORT_ICONS[match.sport] || '🏅'}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {match.sport?.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {match.matchCategory && match.matchCategory !== 'REGULAR' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wide">
                            {match.matchCategory.replace('_', ' ')}
                        </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {statusConfig.label || match.status}
                    </span>
                </div>
            </div>

            {/* Teams & Scores — the main content */}
            <div className="flex items-center py-3">
                {/* Team A */}
                <div className="flex-1 text-center min-w-0">
                    <div className={`text-lg sm:text-xl font-bold truncate transition-colors ${
                        isWinner(match.teamA) ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                        {getTeamName(match.teamA)}
                    </div>
                    {isCompleted && match.scoreA && (
                        <div className="text-base font-bold text-blue-600 mt-0.5">{match.scoreA}</div>
                    )}
                    {isWinner(match.teamA) && (
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Winner</span>
                        </div>
                    )}
                </div>

                {/* VS divider */}
                <div className="px-3 flex-shrink-0">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400">VS</span>
                    </div>
                </div>

                {/* Team B */}
                <div className="flex-1 text-center min-w-0">
                    <div className={`text-lg sm:text-xl font-bold truncate transition-colors ${
                        isWinner(match.teamB) ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                        {getTeamName(match.teamB)}
                    </div>
                    {isCompleted && match.scoreB && (
                        <div className="text-base font-bold text-blue-600 mt-0.5">{match.scoreB}</div>
                    )}
                    {isWinner(match.teamB) && (
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Winner</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            {match.summary && (
                <div className="text-xs text-slate-500 text-center mt-1 italic line-clamp-1">{match.summary}</div>
            )}

            {/* Footer: Venue + Date */}
            <div className="flex items-center justify-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                {match.venue && (
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />{match.venue}
                    </span>
                )}
                {match.scheduledAt && (
                    <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatMatchDate(match.scheduledAt)}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default MatchCard;
