import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Professional Cricket Scorecard - ESPNcricinfo/Cricbuzz Style
 * Complete granular details for every player
 */
const ProfessionalCricketScorecard = ({ match, isAdmin = false, onUpdate }) => {
    const [activeTab, setActiveTab] = useState(1); // 1 or 2 for innings
    const [showAnimation, setShowAnimation] = useState(null);

    if (!match) return null;

    const {
        teamA, teamB, scoreA, scoreB,
        currentInnings = 1, battingTeam = 'A',
        toss, squadA = [], squadB = [],
        innings = [], target, totalOvers = 20,
        venue, scheduledAt, status, matchCategory,
        currentBatsmen, currentBowler, currentOverBalls = []
    } = match;

    // Get innings data
    const getInningsData = (inningsNum) => {
        const inning = innings.find(i => i.inningsNumber === inningsNum);
        if (inning) return inning;
        
        // Fallback to current state for live match
        if (inningsNum === currentInnings) {
            const battingTeamId = battingTeam;
            const bowlingTeamId = battingTeam === 'A' ? 'B' : 'A';
            return {
                team: battingTeamId,
                inningsNumber: inningsNum,
                score: battingTeamId === 'A' ? scoreA : scoreB,
                batting: battingTeamId === 'A' ? squadA : squadB,
                bowling: bowlingTeamId === 'A' ? squadA : squadB,
                fallOfWickets: [],
                isCompleted: false
            };
        }
        return null;
    };

    const innings1 = getInningsData(1);
    const innings2 = getInningsData(2);
    const activeInnings = activeTab === 1 ? innings1 : innings2;

    // Calculate strike rate
    const calcStrikeRate = (runs, balls) => {
        if (!balls || balls === 0) return '0.00';
        return ((runs / balls) * 100).toFixed(2);
    };

    // Calculate economy rate
    const calcEconomy = (runs, overs, balls = 0) => {
        const totalOvers = overs + (balls / 6);
        if (totalOvers === 0) return '0.00';
        return (runs / totalOvers).toFixed(2);
    };

    // Format overs (e.g., 3.4)
    const formatOvers = (overs, balls = 0) => {
        if (balls !== undefined && balls > 0) {
            return `${overs}.${balls}`;
        }
        return overs?.toString() || '0';
    };

    // Get dismissal text
    const getDismissalText = (player) => {
        if (!player.isOut) {
            if (player.isCurrentBatsman) return 'Batting *';
            if (player.ballsFaced > 0) return 'not out';
            return '-';
        }
        
        const outBy = player.outBy || '';
        switch (player.outType) {
            case 'BOWLED': return `b ${outBy}`;
            case 'CAUGHT': 
                const [catcher, bowler] = outBy.split('|');
                return `c ${catcher || '?'} b ${bowler || '?'}`;
            case 'LBW': return `lbw b ${outBy}`;
            case 'RUN_OUT': return `run out (${outBy || '?'})`;
            case 'STUMPED': 
                const [keeper, stBowler] = outBy.split('|');
                return `st ${keeper || '?'} b ${stBowler || '?'}`;
            case 'HIT_WICKET': return `hit wicket b ${outBy}`;
            case 'RETIRED': return 'retired hurt';
            default: return 'out';
        }
    };

    // Get batting team info
    const getBattingTeamInfo = (inning) => {
        if (!inning) return { team: null, score: null };
        const team = inning.team === 'A' ? teamA : teamB;
        const score = inning.score || (inning.team === 'A' ? scoreA : scoreB);
        return { team, score };
    };

    // Get bowling team info
    const getBowlingTeamInfo = (inning) => {
        if (!inning) return { team: null };
        const team = inning.team === 'A' ? teamB : teamA;
        return { team };
    };

    const { team: battingTeamData, score: battingScore } = getBattingTeamInfo(activeInnings);
    const { team: bowlingTeamData } = getBowlingTeamInfo(activeInnings);

    // Get batters who have batted
    const getBatters = (inning) => {
        if (!inning?.batting) return [];
        return inning.batting
            .filter(p => p.ballsFaced > 0 || p.isCurrentBatsman || p.isOut)
            .sort((a, b) => (a.battingOrder || 99) - (b.battingOrder || 99));
    };

    // Get yet to bat players
    const getYetToBat = (inning) => {
        if (!inning?.batting) return [];
        return inning.batting
            .filter(p => !p.isOut && p.ballsFaced === 0 && !p.isCurrentBatsman)
            .sort((a, b) => (a.battingOrder || 99) - (b.battingOrder || 99));
    };

    // Get bowlers
    const getBowlers = (inning) => {
        if (!inning?.bowling) return [];
        return inning.bowling
            .filter(p => p.oversBowled > 0 || p.ballsBowled > 0 || p.isCurrentBowler)
            .sort((a, b) => (a.bowlingOrder || 99) - (b.bowlingOrder || 99));
    };

    // Calculate total extras
    const getExtrasTotal = (score) => {
        if (!score?.extras) return 0;
        const { wides = 0, noBalls = 0, byes = 0, legByes = 0, penalty = 0 } = score.extras;
        return wides + noBalls + byes + legByes + penalty;
    };

    // Calculate current run rate
    const getCurrentRunRate = (score) => {
        const runs = score?.runs || 0;
        const overs = score?.overs || 0;
        const balls = score?.balls || 0;
        const totalOvers = overs + (balls / 6);
        if (totalOvers === 0) return '0.00';
        return (runs / totalOvers).toFixed(2);
    };

    // Calculate current partnership
    const getCurrentPartnership = () => {
        if (!currentBatsmen?.striker || !currentBatsmen?.nonStriker) return null;
        const runs = (currentBatsmen.striker.runsScored || 0) + (currentBatsmen.nonStriker.runsScored || 0);
        const balls = (currentBatsmen.striker.ballsFaced || 0) + (currentBatsmen.nonStriker.ballsFaced || 0);
        return { runs, balls };
    };

    const partnership = getCurrentPartnership();

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl font-ui">
            {/* Match Header - ESPNCricinfo Style */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-white font-bold text-lg">
                            {teamA?.shortCode || 'Team A'} vs {teamB?.shortCode || 'Team B'}
                        </h2>
                        <div className="text-blue-200 text-sm mt-1 space-x-2">
                            <span>{matchCategory || 'Match'}</span>
                            <span>•</span>
                            <span>{totalOvers} Overs</span>
                            {venue && <><span>•</span><span>{venue}</span></>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {status === 'LIVE' && (
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded-full"
                            >
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="text-white text-xs font-bold">LIVE</span>
                            </motion.div>
                        )}
                        {status === 'COMPLETED' && (
                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                COMPLETED
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Toss Info */}
                {toss?.winner && (
                    <div className="mt-3 text-yellow-300 text-sm">
                        🪙 {toss.winner?.name || toss.winner?.shortCode} won the toss and elected to {toss.decision?.toLowerCase()} first
                    </div>
                )}
            </div>

            {/* Innings Tabs */}
            <div className="flex border-b border-slate-700">
                {[1, 2].map(num => {
                    const ing = getInningsData(num);
                    const teamInfo = ing ? getBattingTeamInfo(ing) : null;
                    const hasData = ing && (ing.score?.runs > 0 || ing.batting?.some(p => p.ballsFaced > 0));
                    
                    return (
                        <button
                            key={num}
                            onClick={() => hasData && setActiveTab(num)}
                            disabled={!hasData && num !== currentInnings}
                            className={`flex-1 px-6 py-4 text-sm font-bold transition-all relative ${
                                activeTab === num 
                                    ? 'text-white bg-slate-700/50' 
                                    : hasData 
                                        ? 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                                        : 'text-slate-600 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <span>{teamInfo?.team?.shortCode || `Team ${num === 1 ? 'A' : 'B'}`}</span>
                                {teamInfo?.score && (
                                    <span className="font-display text-lg">
                                        {teamInfo.score.runs || 0}/{teamInfo.score.wickets || 0}
                                        <span className="text-xs text-slate-400 ml-1">
                                            ({formatOvers(teamInfo.score.overs, teamInfo.score.balls)})
                                        </span>
                                    </span>
                                )}
                                {num === currentInnings && status === 'LIVE' && (
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            {activeTab === num && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Scorecard Content */}
            {activeInnings ? (
                <div className="p-4 md:p-6 space-y-6">
                    {/* Current Partnership (Live only) */}
                    {partnership && status === 'LIVE' && activeTab === currentInnings && (
                        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-green-400 text-xs uppercase tracking-wider font-bold">Current Partnership</div>
                                    <div className="text-white text-2xl font-display mt-1">
                                        {partnership.runs} <span className="text-sm text-slate-400">({partnership.balls} balls)</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-400 text-xs">Run Rate</div>
                                    <div className="text-green-400 font-bold">
                                        {partnership.balls > 0 ? ((partnership.runs / partnership.balls) * 6).toFixed(2) : '0.00'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current Over Display */}
                    {status === 'LIVE' && activeTab === currentInnings && currentOverBalls.length > 0 && (
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">This Over</div>
                            <div className="flex gap-2 flex-wrap">
                                {currentOverBalls.map((ball, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                            ${ball === 'W' ? 'bg-red-500 text-white' :
                                              ball === '4' ? 'bg-green-500 text-white' :
                                              ball === '6' ? 'bg-yellow-500 text-black' :
                                              ball.includes('Wd') || ball.includes('Nb') ? 'bg-orange-500 text-white' :
                                              'bg-slate-700 text-white'}`}
                                    >
                                        {ball}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========== BATTING TABLE ========== */}
                    <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                        <div className="bg-slate-700/50 px-4 py-3 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="text-xl">🏏</span>
                                {battingTeamData?.name || 'Batting'} - Batting
                            </h3>
                        </div>
                        
                        {/* Batting Header */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                                        <th className="text-left px-4 py-3 font-semibold">Batter</th>
                                        <th className="text-left px-4 py-3 font-semibold"></th>
                                        <th className="text-center px-3 py-3 font-semibold">R</th>
                                        <th className="text-center px-3 py-3 font-semibold">B</th>
                                        <th className="text-center px-3 py-3 font-semibold">4s</th>
                                        <th className="text-center px-3 py-3 font-semibold">6s</th>
                                        <th className="text-center px-3 py-3 font-semibold">SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getBatters(activeInnings).map((batter, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`border-b border-slate-700/50 ${
                                                batter.isCurrentBatsman 
                                                    ? 'bg-green-500/10' 
                                                    : batter.isOut 
                                                        ? '' 
                                                        : 'bg-blue-500/5'
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${batter.isCurrentBatsman ? 'text-green-400' : 'text-white'}`}>
                                                        {batter.playerName || 'Unknown'}
                                                    </span>
                                                    {batter.isOnStrike && (
                                                        <span className="text-yellow-400 text-xs">*</span>
                                                    )}
                                                    {batter.isCurrentBatsman && !batter.isOnStrike && (
                                                        <span className="text-slate-400 text-xs">^</span>
                                                    )}
                                                    {batter.role === 'WICKET_KEEPER' && (
                                                        <span className="text-xs text-slate-500">(wk)</span>
                                                    )}
                                                    {batter.role === 'ALL_ROUNDER' && (
                                                        <span className="text-xs text-slate-500">(c)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs ${batter.isOut ? 'text-red-400' : 'text-green-400'}`}>
                                                    {getDismissalText(batter)}
                                                </span>
                                            </td>
                                            <td className="text-center px-3 py-3">
                                                <span className="text-white font-bold text-lg">{batter.runsScored || 0}</span>
                                            </td>
                                            <td className="text-center px-3 py-3 text-slate-300">{batter.ballsFaced || 0}</td>
                                            <td className="text-center px-3 py-3 text-green-400">{batter.fours || 0}</td>
                                            <td className="text-center px-3 py-3 text-yellow-400">{batter.sixes || 0}</td>
                                            <td className="text-center px-3 py-3 text-slate-300">
                                                {calcStrikeRate(batter.runsScored, batter.ballsFaced)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Extras Row */}
                        <div className="px-4 py-3 border-t border-slate-700 flex justify-between items-center bg-slate-800/30">
                            <span className="text-slate-400 text-sm font-semibold">Extras</span>
                            <div className="flex items-center gap-4">
                                <span className="text-slate-500 text-xs">
                                    (b {battingScore?.extras?.byes || 0}, 
                                    lb {battingScore?.extras?.legByes || 0}, 
                                    w {battingScore?.extras?.wides || 0}, 
                                    nb {battingScore?.extras?.noBalls || 0}, 
                                    p {battingScore?.extras?.penalty || 0})
                                </span>
                                <span className="text-white font-bold">{getExtrasTotal(battingScore)}</span>
                            </div>
                        </div>

                        {/* Total Row */}
                        <div className="px-4 py-4 border-t border-slate-600 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                            <div className="flex justify-between items-center">
                                <div className="text-white">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="text-slate-400 ml-2">
                                        ({battingScore?.wickets || 0} wickets, {formatOvers(battingScore?.overs, battingScore?.balls)} overs)
                                    </span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-white font-display text-2xl">{battingScore?.runs || 0}</span>
                                    <div className="text-right">
                                        <div className="text-slate-400 text-xs">CRR</div>
                                        <div className="text-green-400 font-bold">{getCurrentRunRate(battingScore)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Yet to Bat */}
                        {getYetToBat(activeInnings).length > 0 && (
                            <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/20">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Yet to Bat</div>
                                <div className="flex flex-wrap gap-2">
                                    {getYetToBat(activeInnings).map((player, idx) => (
                                        <span key={idx} className="text-slate-300 text-sm">
                                            {player.playerName}
                                            {idx < getYetToBat(activeInnings).length - 1 && <span className="text-slate-600">, </span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========== FALL OF WICKETS ========== */}
                    {activeInnings?.fallOfWickets?.length > 0 && (
                        <div className="bg-slate-800/30 rounded-xl p-4">
                            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">Fall of Wickets</h4>
                            <div className="flex flex-wrap gap-3">
                                {activeInnings.fallOfWickets.map((fow, idx) => (
                                    <div key={idx} className="bg-slate-700/50 px-3 py-2 rounded-lg text-sm">
                                        <span className="text-red-400 font-bold">{fow.wicketNumber}-{fow.score}</span>
                                        <span className="text-slate-400 ml-1">
                                            ({fow.batsmanName}, {fow.overs} ov)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========== BOWLING TABLE ========== */}
                    <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                        <div className="bg-slate-700/50 px-4 py-3">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="text-xl">🎯</span>
                                {bowlingTeamData?.name || 'Bowling'} - Bowling
                            </h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                                        <th className="text-left px-4 py-3 font-semibold">Bowler</th>
                                        <th className="text-center px-3 py-3 font-semibold">O</th>
                                        <th className="text-center px-3 py-3 font-semibold">M</th>
                                        <th className="text-center px-3 py-3 font-semibold">R</th>
                                        <th className="text-center px-3 py-3 font-semibold">W</th>
                                        <th className="text-center px-3 py-3 font-semibold">NB</th>
                                        <th className="text-center px-3 py-3 font-semibold">WD</th>
                                        <th className="text-center px-3 py-3 font-semibold">ECO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getBowlers(activeInnings).map((bowler, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`border-b border-slate-700/50 ${
                                                bowler.isCurrentBowler ? 'bg-blue-500/10' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${bowler.isCurrentBowler ? 'text-blue-400' : 'text-white'}`}>
                                                        {bowler.playerName || 'Unknown'}
                                                    </span>
                                                    {bowler.isCurrentBowler && (
                                                        <span className="text-blue-400 text-xs">*</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-center px-3 py-3 text-slate-300">
                                                {formatOvers(bowler.oversBowled, bowler.ballsBowled % 6)}
                                            </td>
                                            <td className="text-center px-3 py-3 text-slate-300">{bowler.maidens || 0}</td>
                                            <td className="text-center px-3 py-3 text-slate-300">{bowler.runsConceded || 0}</td>
                                            <td className="text-center px-3 py-3">
                                                <span className="text-green-400 font-bold text-lg">{bowler.wicketsTaken || 0}</span>
                                            </td>
                                            <td className="text-center px-3 py-3 text-orange-400">{bowler.noBalls || 0}</td>
                                            <td className="text-center px-3 py-3 text-orange-400">{bowler.wides || 0}</td>
                                            <td className="text-center px-3 py-3">
                                                <span className={`font-semibold ${
                                                    parseFloat(calcEconomy(bowler.runsConceded, bowler.oversBowled, bowler.ballsBowled % 6)) < 6 
                                                        ? 'text-green-400' 
                                                        : parseFloat(calcEconomy(bowler.runsConceded, bowler.oversBowled, bowler.ballsBowled % 6)) > 10 
                                                            ? 'text-red-400' 
                                                            : 'text-yellow-400'
                                                }`}>
                                                    {calcEconomy(bowler.runsConceded, bowler.oversBowled, bowler.ballsBowled % 6)}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Target Info (2nd Innings) */}
                    {activeTab === 2 && target && (
                        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-xl p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-amber-400 text-xs uppercase tracking-wider">Target</div>
                                    <div className="text-white text-2xl font-display">{target}</div>
                                </div>
                                <div>
                                    <div className="text-amber-400 text-xs uppercase tracking-wider">Need</div>
                                    <div className="text-white text-2xl font-display">
                                        {Math.max(0, target - (battingScore?.runs || 0))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-amber-400 text-xs uppercase tracking-wider">RRR</div>
                                    <div className="text-white text-2xl font-display">
                                        {(() => {
                                            const needed = target - (battingScore?.runs || 0);
                                            const ballsLeft = (totalOvers * 6) - ((battingScore?.overs || 0) * 6 + (battingScore?.balls || 0));
                                            if (ballsLeft <= 0) return '0.00';
                                            return ((needed / ballsLeft) * 6).toFixed(2);
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-8 text-center text-slate-500">
                    <p>No innings data available</p>
                </div>
            )}

            {/* Match Result (if completed) */}
            {status === 'COMPLETED' && match.winner && (
                <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-t border-green-500/30 px-6 py-4 text-center">
                    <span className="text-green-400 font-bold text-lg">
                        🏆 {match.winner?.name || match.winner?.shortCode} won
                        {match.notes && ` - ${match.notes}`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProfessionalCricketScorecard;
