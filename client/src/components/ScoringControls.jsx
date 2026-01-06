import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimerControls from './TimerControls';
import FoulManagement from './FoulManagement';
import TossDisplay from './TossDisplay';
import ScorePopup, { useScorePopup } from './ScorePopup';
import CricketAdminControls from './CricketAdminControls';

const ScoringControls = ({ match, onUpdate, onTimerAction, onAddFoul, onRemoveFoul, onSetToss }) => {
    const [loading, setLoading] = useState(null);
    const [showExtras, setShowExtras] = useState(false);
    const { popup, showPopup, hidePopup } = useScorePopup();

    if (!match) return <div className="text-red-500 text-center p-4 text-xs">Error: No match data</div>;

    const { sport, scoreA, scoreB, currentSet, toss, status, innings, period, half } = match;
    const isLive = status === 'LIVE';
    const isTimedSport = ['FOOTBALL', 'HOCKEY', 'BASKETBALL', 'KABADDI'].includes(sport);

    const handleUpdate = async (key, payload, popupType = null) => {
        setLoading(key);
        try {
            await onUpdate(payload);
            if (popupType) {
                showPopup(popupType);
            }
        } finally {
            setLoading(null);
        }
    };

    // Period/Half/Innings Controls Component
    const PeriodControls = () => {
        const getPeriodInfo = () => {
            if (sport === 'CRICKET') {
                return { label: 'Innings', current: innings || 1, max: 2, icon: '🏏' };
            }
            if (sport === 'FOOTBALL' || sport === 'HOCKEY') {
                return { label: 'Half', current: half || period || 1, max: 2, icon: '⚽' };
            }
            if (sport === 'BASKETBALL') {
                return { label: 'Quarter', current: period || 1, max: 4, icon: '🏀' };
            }
            if (sport === 'KABADDI') {
                return { label: 'Half', current: half || 1, max: 2, icon: '💪' };
            }
            return null;
        };

        const periodInfo = getPeriodInfo();
        if (!periodInfo) return null;

        const handleNextPeriod = () => {
            const newPeriod = Math.min(periodInfo.current + 1, periodInfo.max);
            const updatePayload = sport === 'CRICKET' 
                ? { matchId: match._id, innings: newPeriod }
                : sport === 'BASKETBALL' 
                    ? { matchId: match._id, period: newPeriod }
                    : { matchId: match._id, half: newPeriod, period: newPeriod };
            handleUpdate('next-period', updatePayload);
        };

        const handlePrevPeriod = () => {
            const newPeriod = Math.max(periodInfo.current - 1, 1);
            const updatePayload = sport === 'CRICKET' 
                ? { matchId: match._id, innings: newPeriod }
                : sport === 'BASKETBALL' 
                    ? { matchId: match._id, period: newPeriod }
                    : { matchId: match._id, half: newPeriod, period: newPeriod };
            handleUpdate('prev-period', updatePayload);
        };

        return (
            <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-4 rounded-xl border border-indigo-500/30 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{periodInfo.icon}</span>
                        <div>
                            <div className="text-xs text-indigo-300 uppercase tracking-wider font-bold">Current {periodInfo.label}</div>
                            <div className="text-2xl font-black text-white font-display">
                                {sport === 'CRICKET' ? (
                                    periodInfo.current === 1 ? '1st Innings' : '2nd Innings'
                                ) : sport === 'BASKETBALL' ? (
                                    `Q${periodInfo.current}`
                                ) : (
                                    periodInfo.current === 1 ? '1st Half' : '2nd Half'
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePrevPeriod}
                            disabled={loading || periodInfo.current <= 1}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            ◀ Prev
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNextPeriod}
                            disabled={loading || periodInfo.current >= periodInfo.max}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-colors"
                        >
                            Next {periodInfo.label} ▶
                        </motion.button>
                    </div>
                </div>
                {/* Period Progress Indicator */}
                <div className="flex gap-2 mt-3">
                    {Array.from({ length: periodInfo.max }, (_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-2 rounded-full transition-all ${
                                i + 1 <= periodInfo.current 
                                    ? 'bg-indigo-500' 
                                    : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const getCricketScore = (s) => ({
        runs: s?.runs || 0,
        wickets: s?.wickets || 0,
        overs: s?.overs || 0
    });

    // Dark button styles for better contrast
    const btnClass = (id, color = 'bg-gray-800', extra = '') => `
        ${color} text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md 
        transition-all duration-100 active:scale-95 disabled:opacity-50 
        hover:brightness-110 flex items-center justify-center gap-1 min-h-[44px]
        ${loading === id ? 'animate-pulse' : ''} ${extra}
    `;

    // --- CRICKET ENGINE ---
    if (sport === 'CRICKET') {
        const teamA = getCricketScore(scoreA);
        const teamB = getCricketScore(scoreB);

        return (
            <div className="space-y-6">
                {/* Score Popup */}
                <ScorePopup 
                    type={popup.type} 
                    message={popup.message} 
                    show={popup.show} 
                    onComplete={hidePopup} 
                />

                {/* Innings Controls */}
                <PeriodControls />

                {/* Toss Display */}
                {onSetToss && (
                    <TossDisplay 
                        match={match} 
                        onSetToss={onSetToss} 
                        isAdmin={true}
                    />
                )}

                {[
                    { id: 'A', name: match.teamA?.shortCode || 'TEAM A', score: teamA },
                    { id: 'B', name: match.teamB?.shortCode || 'TEAM B', score: teamB }
                ].map((t) => (
                    <motion.div 
                        key={t.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-inner"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.name}</span>
                            <motion.span 
                                key={`${t.score.runs}-${t.score.wickets}`}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className="text-2xl font-black text-white"
                            >
                                {t.score.runs}/{t.score.wickets} <span className="text-xs text-gray-500 font-mono">({t.score.overs})</span>
                            </motion.span>
                        </div>

                        {/* Runs Grid */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[0, 1, 2, 3].map(r => (
                                <motion.button
                                    key={r}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdate(`cricket-${t.id}-${r}`, { matchId: match._id, team: t.id, runs: r })}
                                    disabled={loading}
                                    className={btnClass(`cricket-${t.id}-${r}`, 'bg-gray-700')}
                                >
                                    +{r}
                                </motion.button>
                            ))}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate(`cricket-${t.id}-4`, { matchId: match._id, team: t.id, runs: 4 }, 'FOUR')}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-4`, 'bg-green-600')}
                            >
                                🏏 4
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate(`cricket-${t.id}-6`, { matchId: match._id, team: t.id, runs: 6 }, 'SIX')}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-6`, 'bg-yellow-600')}
                            >
                                💥 6
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate(`cricket-${t.id}-wkt`, { matchId: match._id, team: t.id, isWicket: true }, 'WICKET')}
                                disabled={loading || t.score.wickets >= 10}
                                className={btnClass(`cricket-${t.id}-wkt`, 'bg-red-600', 'col-span-2')}
                            >
                                🎯 WICKET
                            </motion.button>
                        </div>

                        {/* Extras & Undo */}
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-wide`, { matchId: match._id, team: t.id, extraType: 'WIDE' })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-wide`, 'bg-amber-600')}
                            >
                                WIDE
                            </button>
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-nb`, { matchId: match._id, team: t.id, extraType: 'NOBALL' })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-nb`, 'bg-amber-600')}
                            >
                                N.B.
                            </button>
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-bye`, { matchId: match._id, team: t.id, extraType: 'BYE' })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-bye`, 'bg-amber-700')}
                            >
                                BYE
                            </button>
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-undo`, { matchId: match._id, team: t.id, isUndo: true })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-undo`, 'bg-rose-900')}
                            >
                                ↩ UNDO
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Advanced Cricket Admin Controls */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">
                        Advanced Controls
                    </h4>
                    <CricketAdminControls match={match} onUpdate={onUpdate} />
                </div>
            </div>
        );
    }

    // --- GOAL/POINT ENGINE ---
    const isGoalSport = ['FOOTBALL', 'HOCKEY'].includes(sport);
    const isPointSport = ['BASKETBALL', 'KABADDI', 'KHOKHO'].includes(sport);

    if (isGoalSport || isPointSport) {
        return (
            <div className="space-y-6">
                {/* Score Popup */}
                <ScorePopup 
                    type={popup.type} 
                    message={popup.message} 
                    show={popup.show} 
                    onComplete={hidePopup} 
                />

                {/* Half/Quarter Controls */}
                <PeriodControls />

                {/* Timer Controls for timed sports */}
                {isTimedSport && onTimerAction && (
                    <TimerControls 
                        match={match}
                        onTimerAction={onTimerAction}
                        disabled={!isLive}
                    />
                )}

                {/* Toss Display */}
                {onSetToss && (
                    <TossDisplay 
                        match={match} 
                        onSetToss={onSetToss} 
                        isAdmin={true}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: 'A', name: match.teamA?.shortCode || 'A', val: scoreA },
                        { id: 'B', name: match.teamB?.shortCode || 'B', val: scoreB }
                    ].map((t) => (
                        <motion.div 
                            key={t.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center"
                        >
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">{t.name}</div>
                            <motion.div 
                                key={t.val}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-black text-white mb-4"
                            >
                                {t.val || 0}
                            </motion.div>

                            <div className="space-y-2">
                                {isGoalSport ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleUpdate(`goal-${t.id}`, { matchId: match._id, [`points${t.id}`]: (t.val || 0) + 1 }, 'GOAL')}
                                        className={btnClass(`goal-${t.id}`, 'bg-emerald-600 w-full')}
                                    >
                                        ⚽ GOAL!
                                    </motion.button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate(`pt-${t.id}-1`, { matchId: match._id, [`points${t.id}`]: (t.val || 0) + 1 }, 'POINT')}
                                            className={btnClass(`pt-${t.id}-1`, 'bg-indigo-600')}
                                        >
                                            +1
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUpdate(`pt-${t.id}-2`, { matchId: match._id, [`points${t.id}`]: (t.val || 0) + 2 })}
                                            className={btnClass(`pt-${t.id}-2`, 'bg-indigo-700')}
                                        >
                                            +2
                                        </motion.button>
                                        {sport === 'BASKETBALL' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleUpdate(`pt-${t.id}-3`, { matchId: match._id, [`points${t.id}`]: (t.val || 0) + 3 }, 'THREE_POINTER')}
                                                className={btnClass(`pt-${t.id}-3`, 'bg-indigo-800 col-span-2')}
                                            >
                                                🏀 +3 POINTS
                                            </motion.button>
                                        )}
                                        {sport === 'KABADDI' && (
                                            <>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleUpdate(`raid-${t.id}`, { matchId: match._id, [`points${t.id}`]: (t.val || 0) + 1 }, 'RAID_POINT')}
                                                    className={btnClass(`raid-${t.id}`, 'bg-green-600')}
                                                >
                                                    💪 RAID
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleUpdate(`tackle-${t.id}`, { matchId: match._id, [`points${t.id}`]: (t.val || 0) + 1 }, 'TACKLE_POINT')}
                                                    className={btnClass(`tackle-${t.id}`, 'bg-blue-600')}
                                                >
                                                    🤼 TACKLE
                                                </motion.button>
                                            </>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={() => handleUpdate(`undo-${t.id}`, { matchId: match._id, [`points${t.id}`]: Math.max(0, (t.val || 0) - 1) })}
                                    className={btnClass(`undo-${t.id}`, 'bg-rose-900 w-full text-xs opacity-80')}
                                >
                                    ↩ UNDO (-1)
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Foul Management for goal/point sports */}
                {isGoalSport && onAddFoul && (
                    <FoulManagement 
                        match={match}
                        onAddFoul={onAddFoul}
                        onRemoveFoul={onRemoveFoul}
                        disabled={!isLive}
                    />
                )}
            </div>
        );
    }

    // --- SET ENGINE ---
    if (['BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL'].includes(sport)) {
        const currSet = currentSet || { pointsA: 0, pointsB: 0 };
        return (
            <div className="space-y-6">
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-around">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{match.teamA?.shortCode}</div>
                        <div className="text-3xl font-black text-white">{scoreA || 0}</div>
                    </div>
                    <div className="text-gray-700 text-2xl font-bold self-center">SETS</div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{match.teamB?.shortCode}</div>
                        <div className="text-3xl font-black text-white">{scoreB || 0}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: 'A', name: match.teamA?.shortCode, pts: currSet.pointsA },
                        { id: 'B', name: match.teamB?.shortCode, pts: currSet.pointsB }
                    ].map(t => (
                        <div key={t.id} className="text-center space-y-3">
                            <div className="text-3xl font-bold text-white">{t.pts || 0}</div>
                            <button
                                onClick={() => handleUpdate(`pt-${t.id}`, {
                                    matchId: match._id,
                                    currentSetScore: {
                                        pointsA: t.id === 'A' ? t.pts + 1 : currSet.pointsA,
                                        pointsB: t.id === 'B' ? t.pts + 1 : currSet.pointsB
                                    }
                                })}
                                className={btnClass(`pt-${t.id}`, 'bg-indigo-600 w-full')}
                            >
                                +1 PT
                            </button>
                            <button
                                onClick={() => handleUpdate(`sw-${t.id}`, {
                                    matchId: match._id,
                                    [`sets${t.id}`]: (match[`score${t.id}`] || 0) + 1,
                                    setResult: true // Signal to save current set
                                })}
                                className={btnClass(`sw-${t.id}`, 'bg-emerald-800 w-full text-xs')}
                            >
                                SET WON
                            </button>
                            <button
                                onClick={() => handleUpdate(`undo-${t.id}`, {
                                    matchId: match._id,
                                    currentSetScore: {
                                        pointsA: t.id === 'A' ? Math.max(0, t.pts - 1) : currSet.pointsA,
                                        pointsB: t.id === 'B' ? Math.max(0, t.pts - 1) : currSet.pointsB
                                    }
                                })}
                                className={btnClass(`undo-${t.id}`, 'bg-rose-900 w-full text-xs opacity-70')}
                            >
                                ↩ UNDO
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return <div className="text-center p-4 text-gray-500">Sport engine not yet implemented for {sport}</div>;
};

export default ScoringControls;
