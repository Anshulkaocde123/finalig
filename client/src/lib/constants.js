// Shared constants used across the app — single source of truth

export const SPORT_ICONS = {
    CRICKET: '🏏', FOOTBALL: '⚽', HOCKEY: '🏑', BASKETBALL: '🏀',
    BADMINTON: '🏸', TABLE_TENNIS: '🏓', VOLLEYBALL: '🏐', CHESS: '♟️',
    KHOKHO: '🏃', KABADDI: '💪'
};

export const SPORTS = Object.keys(SPORT_ICONS);

export const STATUS_CONFIG = {
    SCHEDULED: { label: 'Upcoming', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' }
};

export const SPORT_COLORS = {
    CRICKET:      { accent: '#22c55e' },
    FOOTBALL:     { accent: '#3b82f6' },
    HOCKEY:       { accent: '#f97316' },
    BASKETBALL:   { accent: '#f59e0b' },
    BADMINTON:    { accent: '#06b6d4' },
    TABLE_TENNIS: { accent: '#ef4444' },
    VOLLEYBALL:   { accent: '#eab308' },
    CHESS:        { accent: '#64748b' },
    KHOKHO:       { accent: '#14b8a6' },
    KABADDI:      { accent: '#a855f7' }
};

export const MATCH_CATEGORIES = [
    { label: 'Regular', value: 'REGULAR' },
    { label: 'Group Stage', value: 'GROUP_STAGE' },
    { label: 'Quarter Final', value: 'QUARTER_FINAL' },
    { label: 'Semi Final', value: 'SEMIFINAL' },
    { label: 'Final', value: 'FINAL' }
];

export const getTeamName = (team) => team?.shortCode || team?.name || 'TBD';
export const getTeamFullName = (team) => team?.name || team?.shortCode || 'TBD';

export const isWinnerTeam = (match, team) => {
    if (!match?.winner || !team) return false;
    const winnerId = match.winner._id || match.winner;
    return winnerId === team._id;
};

export const formatMatchDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const today = now.toDateString();
    const tomorrow = new Date(now.getTime() + 86400000).toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    if (d.toDateString() === today) return 'Today';
    if (d.toDateString() === tomorrow) return 'Tomorrow';
    if (d.toDateString() === yesterday) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatMatchTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || '';
};
