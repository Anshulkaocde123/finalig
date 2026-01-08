import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Timer Controls Component for Timed Sports (Football, Basketball, Hockey, etc.)
 * Admin-only component for managing match timers
 */
const TimerControls = ({ 
    match, 
    onTimerAction, 
    disabled = false 
}) => {
    const [displayTime, setDisplayTime] = useState(0);
    const [addedTime, setAddedTime] = useState(0);
    const [showAddTimeModal, setShowAddTimeModal] = useState(false);
    const [showPresetsModal, setShowPresetsModal] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const lastAlertRef = useRef(null);
    const timerRef = useRef(null);
    const alertRef = useRef(null);
    
    // Auto-calculate stoppage time based on match events
    const calculateStoppageTime = () => {
        const fouls = match?.fouls?.length || 0;
        const substitutions = match?.substitutions?.length || 0;
        const cards = (match?.cardsA?.yellow || 0) + (match?.cardsA?.red || 0) + 
                      (match?.cardsB?.yellow || 0) + (match?.cardsB?.red || 0);
        
        // Formula: 30s per foul card, 45s per substitution, 1min per red card
        const redCards = (match?.cardsA?.red || 0) + (match?.cardsB?.red || 0);
        const stoppageMinutes = Math.ceil((cards * 0.5) + (substitutions * 0.75) + (redCards * 1));
        
        return Math.min(stoppageMinutes, 10); // Max 10 minutes stoppage
    };
    
    // Timer presets for different periods
    const timerPresets = [
        { label: 'Full Half (45 min)', seconds: 45 * 60, sport: 'FOOTBALL' },
        { label: 'Quarter (12 min)', seconds: 12 * 60, sport: 'BASKETBALL' },
        { label: 'Half (20 min)', seconds: 20 * 60, sport: 'HOCKEY' },
        { label: 'Kabaddi Half (20 min)', seconds: 20 * 60, sport: 'KABADDI' },
        { label: 'Custom 30 min', seconds: 30 * 60, sport: 'ALL' },
        { label: 'Custom 15 min', seconds: 15 * 60, sport: 'ALL' },
    ];
    
    // Key moment alerts - only trigger ONCE when crossing exact threshold
    const checkAlerts = (seconds) => {
        const sport = match?.sport;
        const alertTimes = sport === 'FOOTBALL' 
            ? [40 * 60, 45 * 60, 85 * 60, 90 * 60] // 40', 45', 85', 90'
            : sport === 'BASKETBALL'
            ? [10 * 60, 12 * 60, 22 * 60, 24 * 60] // End of quarters
            : [];
        
        alertTimes.forEach(alertTime => {
            // Only trigger if exactly at this second and haven't alerted for this time
            if (seconds === alertTime && lastAlertRef.current !== alertTime) {
                const minute = Math.floor(alertTime / 60);
                lastAlertRef.current = alertTime;
                showAlert(`⏰ ${minute}' - Key Moment!`);
            }
        });
    };
    
    const showAlert = (message) => {
        const newAlert = { id: Date.now(), message };
        setAlerts(prev => [...prev, newAlert]);
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
        }, 3000);
    };

    const timer = match?.timer || {};
    const isRunning = timer.isRunning && !timer.isPaused;

    // Real-time timer display with alerts
    useEffect(() => {
        if (isRunning) {
            // Validate timer data before starting interval
            if (!timer.startTime) {
                console.error('Timer is running but startTime is missing');
                return;
            }
            
            const startTime = new Date(timer.startTime).getTime();
            
            // Check for invalid date
            if (isNaN(startTime)) {
                console.error('Invalid timer startTime:', timer.startTime);
                return;
            }
            
            const baseElapsed = timer.elapsedSeconds || 0;

            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = baseElapsed + Math.floor((now - startTime) / 1000);
                
                // Safety check for extreme values
                if (elapsed < 0 || elapsed > 10800) { // Max 3 hours
                    clearInterval(timerRef.current);
                    showAlert('⚠️ Timer error - please reset');
                    return;
                }
                
                setDisplayTime(elapsed);
                checkAlerts(elapsed);
            }, 1000);
        } else {
            const newElapsed = timer.elapsedSeconds || 0;
            setDisplayTime(newElapsed);
            
            // Reset alert tracking when time is manually changed while stopped
            if (!isRunning && newElapsed !== displayTime && Math.abs(newElapsed - displayTime) > 5) {
                lastAlertRef.current = null;
                setAlerts([]); // Clear all alerts when time jumps
            }
            
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timer.isRunning, timer.isPaused, timer.startTime, timer.elapsedSeconds]);
    
    const handleSetPreset = (seconds) => {
        // Validate seconds
        if (seconds < 0 || seconds > 7200) { // Max 2 hours
            showAlert('⚠️ Invalid time value');
            return;
        }
        
        lastAlertRef.current = null; // Reset alert tracking
        setAlerts([]); // Clear any existing alerts
        onTimerAction?.({
            action: 'setTime',
            elapsedSeconds: seconds,
            timestamp: new Date().toISOString()
        });
        setShowPresetsModal(false);
    };
    
    const handleAutoStoppage = () => {
        const stoppageMinutes = calculateStoppageTime();
        if (stoppageMinutes > 0) {
            onTimerAction?.({
                action: 'addTime',
                additionalSeconds: stoppageMinutes * 60,
                timestamp: new Date().toISOString()
            });
            showAlert(`✅ Added ${stoppageMinutes} min stoppage time`);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        const period = match?.period || 1;
        const sport = match?.sport;
        
        // For football, auto-set correct starting time based on period
        if (sport === 'FOOTBALL') {
            const startTime = period === 1 ? 0 : 45 * 60; // 0 for 1st half, 2700s (45min) for 2nd half
            onTimerAction?.({
                action: 'start',
                elapsedSeconds: startTime,
                timestamp: new Date().toISOString()
            });
        } else {
            onTimerAction?.({
                action: 'start',
                timestamp: new Date().toISOString()
            });
        }
    };

    const handlePause = () => {
        onTimerAction?.({
            action: 'pause',
            elapsedSeconds: displayTime,
            timestamp: new Date().toISOString()
        });
    };

    const handleResume = () => {
        onTimerAction?.({
            action: 'resume',
            timestamp: new Date().toISOString()
        });
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the timer?')) {
            lastAlertRef.current = null; // Reset alert tracking
            setAlerts([]); // Clear all alerts
            setDisplayTime(0);
            onTimerAction?.({
                action: 'reset',
                timestamp: new Date().toISOString()
            });
        }
    };

    const handleAddTime = () => {
        if (addedTime > 0 && addedTime <= 15) {
            onTimerAction?.({
                action: 'addTime',
                additionalSeconds: addedTime * 60,
                timestamp: new Date().toISOString()
            });
            setShowAddTimeModal(false);
            setAddedTime(0);
        } else if (addedTime > 15) {
            showAlert('⚠️ Maximum 15 minutes allowed');
        }
    };

    const handleNextPeriod = () => {
        onTimerAction?.({
            action: 'nextPeriod',
            timestamp: new Date().toISOString()
        });
    };
    
    const handleHalfTime = () => {
        if (window.confirm('Mark as Half-Time? This will move to 2nd half.')) {
            onTimerAction?.({
                action: 'halfTime',
                elapsedSeconds: displayTime,
                timestamp: new Date().toISOString()
            });
        }
    };
    
    const handleStartSecondHalf = () => {
        // Start 2nd half from 45:00
        onTimerAction?.({
            action: 'startSecondHalf',
            elapsedSeconds: 45 * 60,
            timestamp: new Date().toISOString()
        });
    };
    
    const handleFullTime = () => {
        if (window.confirm('Mark as Full-Time? This will end regular time.')) {
            onTimerAction?.({
                action: 'fullTime',
                elapsedSeconds: displayTime,
                timestamp: new Date().toISOString()
            });
        }
    };

    const getPeriodLabel = () => {
        const sport = match?.sport;
        const period = match?.period || 1;

        if (sport === 'FOOTBALL') {
            return period === 1 ? '1st Half' : period === 2 ? '2nd Half' : 'Extra Time';
        }
        if (sport === 'BASKETBALL') {
            return `Quarter ${period}`;
        }
        if (sport === 'HOCKEY') {
            return period === 1 ? '1st Half' : '2nd Half';
        }
        return `Period ${period}`;
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>⏱️</span>
                    Timer Controls
                </h3>
                <span className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                    {getPeriodLabel()}
                </span>
            </div>

            {/* Alert Notifications */}
            <AnimatePresence>
                {alerts.map(alert => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-2 p-2 bg-yellow-500 text-black rounded-lg text-center font-bold text-sm"
                    >
                        {alert.message}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Timer Display */}
            <div className="text-center mb-4">
                <motion.div 
                    animate={isRunning ? { opacity: [1, 0.7, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`text-5xl font-mono font-bold ${
                        isRunning ? 'text-green-400' : 
                        timer.isPaused ? 'text-yellow-400' : 'text-white'
                    }`}
                >
                    {formatTime(displayTime)}
                </motion.div>
                {timer.addedTime > 0 && (
                    <div className="text-yellow-400 text-sm mt-1">
                        +{timer.addedTime} added time
                    </div>
                )}
                <div className="text-gray-300 text-sm mt-1 font-semibold">
                    {isRunning ? '▶️ Running' : timer.isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                    onClick={() => setShowPresetsModal(true)}
                    disabled={disabled || isRunning}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white 
                               px-3 py-2 rounded-lg text-sm font-semibold font-bold transition-colors"
                >
                    ⚡ Presets
                </button>
                <button
                    onClick={handleAutoStoppage}
                    disabled={disabled || !isRunning}
                    className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 text-white 
                               px-3 py-2 rounded-lg text-sm font-semibold font-bold transition-colors"
                >
                    🔢 Auto +Time ({calculateStoppageTime()}')
                </button>
            </div>

            {/* Main Controls */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {!timer.isRunning ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStart}
                        disabled={disabled}
                        className="col-span-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 
                                   text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2
                                   transition-colors"
                    >
                        <span className="text-xl">▶️</span>
                        Start Timer
                    </motion.button>
                ) : (
                    <>
                        {timer.isPaused ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleResume}
                                disabled={disabled}
                                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 
                                           text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <span>▶️</span>
                                Resume
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePause}
                                disabled={disabled}
                                className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 
                                           text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <span>⏸️</span>
                                Pause
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleReset}
                            disabled={disabled}
                            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 
                                       text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <span>🔄</span>
                            Reset
                        </motion.button>
                    </>
                )}
            </div>

            {/* Secondary Controls */}
            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddTimeModal(true)}
                    disabled={disabled || !timer.isRunning}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-800
                               text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                    <span>➕</span>
                    Add Time
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextPeriod}
                    disabled={disabled}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 
                               text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                    <span>⏭️</span>
                    Next Period
                </motion.button>
            </div>
            
            {/* Football-Specific Controls */}
            {match?.sport === 'FOOTBALL' && (
                <div className="space-y-3 mt-3">
                    {match?.status === 'HALF_TIME' ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartSecondHalf}
                            disabled={disabled}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:opacity-50
                                       text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <span>▶️</span>
                            Start 2nd Half
                        </motion.button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleHalfTime}
                                disabled={disabled || match?.period !== 1}
                                className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:opacity-50
                                           text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <span>⏸️</span>
                                Half-Time
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFullTime}
                                disabled={disabled || match?.status === 'FULL_TIME' || match?.status === 'COMPLETED'}
                                className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:opacity-50
                                           text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <span>🏁</span>
                                Full-Time
                            </motion.button>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Time Presets (for quick adjustments) */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-gray-300 text-sm mb-2">⚡ Jump to Time (Testing/Resume):</div>
                <div className="flex gap-2 flex-wrap">
                    {[45, 90, 20, 12, 10, 15].map(mins => (
                        <button
                            key={mins}
                            onClick={() => {
                                lastAlertRef.current = null; // Reset alerts
                                setAlerts([]); // Clear all alerts
                                onTimerAction?.({
                                    action: 'setTime',
                                    elapsedSeconds: mins * 60
                                });
                            }}
                            disabled={disabled || isRunning}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50
                                       text-gray-300 text-sm rounded transition-colors"
                        >
                            {mins}'
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Time Modal */}
            <AnimatePresence>
                {showAddTimeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowAddTimeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 w-80 shadow-2xl"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4">Add Extra Time</h3>
                            <div className="mb-4">
                                <label className="text-gray-700 text-sm block mb-2">Minutes to add:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="15"
                                    value={addedTime}
                                    onChange={e => setAddedTime(parseInt(e.target.value) || 0)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                                               text-white text-lg text-center"
                                />
                            </div>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setAddedTime(n)}
                                        className={`flex-1 py-2 rounded-lg transition-colors ${
                                            addedTime === n 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        +{n}'
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddTimeModal(false)}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTime}
                                    disabled={addedTime <= 0}
                                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 
                                               text-white font-bold rounded-lg"
                                >
                                    Add Time
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Timer Presets Modal */}
            <AnimatePresence>
                {showPresetsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPresetsModal(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">⚡ Timer Presets</h3>
                            <div className="space-y-2">
                                {timerPresets
                                    .filter(p => p.sport === match?.sport || p.sport === 'ALL')
                                    .map((preset, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSetPreset(preset.seconds)}
                                            className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg 
                                                       font-bold transition-colors text-left flex justify-between items-center"
                                        >
                                            <span>{preset.label}</span>
                                            <span className="text-gray-700 text-sm">{formatTime(preset.seconds)}</span>
                                        </button>
                                    ))}
                            </div>
                            <button
                                onClick={() => setShowPresetsModal(false)}
                                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimerControls;
