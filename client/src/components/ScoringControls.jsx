import React, { useState } from 'react';

const ScoringControls = ({ match, onUpdate }) => {
    const [loading, setLoading] = useState(null);

    if (!match) return <div className="text-red-500 text-center p-4 text-xs">Error: No match data</div>;

    const { sport, scoreA, scoreB, currentSet } = match;

    const handleUpdate = async (key, payload) => {
        setLoading(key);
        try {
            await onUpdate(payload);
        } finally {
            setLoading(null);
        }
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
                {[
                    { id: 'A', name: match.teamA?.shortCode || 'TEAM A', score: teamA },
                    { id: 'B', name: match.teamB?.shortCode || 'TEAM B', score: teamB }
                ].map((t) => (
                    <div key={t.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.name}</span>
                            <span className="text-2xl font-black text-white">
                                {t.score.runs}/{t.score.wickets} <span className="text-xs text-gray-500 font-mono">({t.score.overs})</span>
                            </span>
                        </div>

                        {/* Runs Grid */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[0, 1, 2, 3, 4, 6].map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleUpdate(`cricket-${t.id}-${r}`, { team: t.id, runs: r })}
                                    disabled={loading}
                                    className={btnClass(`cricket-${t.id}-${r}`, r >= 4 ? 'bg-indigo-600' : 'bg-gray-700')}
                                >
                                    +{r}
                                </button>
                            ))}
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-wkt`, { team: t.id, isWicket: true })}
                                disabled={loading || t.score.wickets >= 10}
                                className={btnClass(`cricket-${t.id}-wkt`, 'bg-red-600', 'col-span-2')}
                            >
                                🏏 WICKET
                            </button>
                        </div>

                        {/* Extras & Undo */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-wide`, { team: t.id, extraType: 'WIDE' })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-wide`, 'bg-amber-600')}
                            >
                                WIDE
                            </button>
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-nb`, { team: t.id, extraType: 'NOBALL' })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-nb`, 'bg-amber-600')}
                            >
                                N.B.
                            </button>
                            <button
                                onClick={() => handleUpdate(`cricket-${t.id}-undo`, { team: t.id, isUndo: true })}
                                disabled={loading}
                                className={btnClass(`cricket-${t.id}-undo`, 'bg-rose-900')}
                            >
                                ↩ UNDO
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- GOAL/POINT ENGINE ---
    const isGoalSport = ['FOOTBALL', 'HOCKEY'].includes(sport);
    const isPointSport = ['BASKETBALL', 'KABADDI', 'KHOKHO'].includes(sport);

    if (isGoalSport || isPointSport) {
        return (
            <div className="grid grid-cols-2 gap-4">
                {[
                    { id: 'A', name: match.teamA?.shortCode || 'A', val: scoreA },
                    { id: 'B', name: match.teamB?.shortCode || 'B', val: scoreB }
                ].map((t) => (
                    <div key={t.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">{t.name}</div>
                        <div className="text-4xl font-black text-white mb-4">{t.val || 0}</div>

                        <div className="space-y-2">
                            {isGoalSport ? (
                                <button
                                    onClick={() => handleUpdate(`goal-${t.id}`, { [`points${t.id}`]: (t.val || 0) + 1 })}
                                    className={btnClass(`goal-${t.id}`, 'bg-emerald-600 w-full')}
                                >
                                    ⚽ GOAL!
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleUpdate(`pt-${t.id}-1`, { [`points${t.id}`]: (t.val || 0) + 1 })}
                                        className={btnClass(`pt-${t.id}-1`, 'bg-indigo-600')}
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleUpdate(`pt-${t.id}-2`, { [`points${t.id}`]: (t.val || 0) + 2 })}
                                        className={btnClass(`pt-${t.id}-2`, 'bg-indigo-700')}
                                    >
                                        +2
                                    </button>
                                    {sport === 'BASKETBALL' && (
                                        <button
                                            onClick={() => handleUpdate(`pt-${t.id}-3`, { [`points${t.id}`]: (t.val || 0) + 3 })}
                                            className={btnClass(`pt-${t.id}-3`, 'bg-indigo-800 col-span-2')}
                                        >
                                            +3 POINTS
                                        </button>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={() => handleUpdate(`undo-${t.id}`, { [`points${t.id}`]: Math.max(0, (t.val || 0) - 1) })}
                                className={btnClass(`undo-${t.id}`, 'bg-rose-900 w-full text-xs opacity-80')}
                            >
                                ↩ UNDO (-1)
                            </button>
                        </div>
                    </div>
                ))}
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
                                    [`sets${t.id}`]: (match[`score${t.id}`] || 0) + 1,
                                    setResult: `${currSet.pointsA}-${currSet.pointsB}`
                                })}
                                className={btnClass(`sw-${t.id}`, 'bg-emerald-800 w-full text-xs')}
                            >
                                SET WON
                            </button>
                            <button
                                onClick={() => handleUpdate(`undo-${t.id}`, {
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
