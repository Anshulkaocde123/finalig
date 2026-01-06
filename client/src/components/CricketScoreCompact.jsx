import React from 'react';
import { motion } from 'framer-motion';

/**
 * Compact Cricket Score Display for Match Cards
 * Shows key info in a condensed format
 */
const CricketScoreCompact = ({ match, isDarkMode = true }) => {
    if (!match) return null;

    const {
        teamA, teamB, scoreA, scoreB,
        currentInnings = 1, battingTeam = 'A',
        status, target, toss, innings = []
    } = match;

    // Calculate run rate
    const calcRunRate = (score) => {
        if (!score?.overs || score.overs === 0) return '0.00';
        const totalOvers = score.overs + (score.balls || 0) / 6;
        return (score.runs / totalOvers).toFixed(2);
    };

    // Format overs
    const formatOvers = (score) => {
        if (!score) return '0.0';
        return `${score.overs || 0}.${score.balls || 0}`;
    };

    // Get which team is batting
    const isBattingA = battingTeam === 'A';

    return (
        <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'} rounded-xl p-4 border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            {/* Teams Row */}
            <div className="space-y-3">
                {/* Team A */}
                <div className={`flex justify-between items-center ${isBattingA && status === 'LIVE' ? 'font-bold' : ''}`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {teamA?.shortCode || 'A'}
                        </span>
                        {isBattingA && status === 'LIVE' && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {scoreA?.runs || 0}/{scoreA?.wickets || 0}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({formatOvers(scoreA)})
                        </span>
                    </div>
                </div>

                {/* Team B */}
                <div className={`flex justify-between items-center ${!isBattingA && status === 'LIVE' ? 'font-bold' : ''}`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {teamB?.shortCode || 'B'}
                        </span>
                        {!isBattingA && status === 'LIVE' && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {scoreB?.runs || 0}/{scoreB?.wickets || 0}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            ({formatOvers(scoreB)})
                        </span>
                    </div>
                </div>
            </div>

            {/* Status/Target Info */}
            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                {status === 'LIVE' && currentInnings === 2 && target && (
                    <div className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        {(() => {
                            const battingScore = battingTeam === 'A' ? scoreA : scoreB;
                            const needed = target - (battingScore?.runs || 0);
                            if (needed <= 0) return `${battingTeam === 'A' ? teamA?.shortCode : teamB?.shortCode} won!`;
                            const wicketsLeft = 10 - (battingScore?.wickets || 0);
                            return `Need ${needed} runs from ${wicketsLeft} wickets`;
                        })()}
                    </div>
                )}
                {status === 'LIVE' && currentInnings === 1 && (
                    <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        1st Innings • CRR: {calcRunRate(battingTeam === 'A' ? scoreA : scoreB)}
                    </div>
                )}
                {status === 'COMPLETED' && match.winner && (
                    <div className={`text-xs font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        🏆 {match.winner.shortCode || match.winner.name} won
                    </div>
                )}
            </div>
        </div>
    );
};

export default CricketScoreCompact;
