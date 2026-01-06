import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Animated Score Popup Component
 * Shows animated overlays for score updates (GOAL!, SIX!, WICKET!, etc.)
 */
const ScorePopup = ({ 
    type, 
    message, 
    show, 
    onComplete,
    duration = 2000 
}) => {
    React.useEffect(() => {
        if (show && onComplete) {
            const timer = setTimeout(onComplete, duration);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete, duration]);

    const getPopupConfig = () => {
        switch (type) {
            // Cricket Events
            case 'FOUR':
                return {
                    bg: 'from-green-500 to-emerald-600',
                    icon: '4️⃣',
                    text: 'FOUR!',
                    subtext: 'Boundary',
                    particles: ['🏏', '💚', '⭐']
                };
            case 'SIX':
                return {
                    bg: 'from-yellow-500 to-orange-600',
                    icon: '6️⃣',
                    text: 'SIX!',
                    subtext: 'Maximum!',
                    particles: ['🏏', '🔥', '💛', '⭐']
                };
            case 'WICKET':
                return {
                    bg: 'from-red-500 to-rose-600',
                    icon: '🎯',
                    text: 'WICKET!',
                    subtext: message || 'Out!',
                    particles: ['❌', '💀', '🔴']
                };
            case 'CENTURY':
                return {
                    bg: 'from-purple-500 to-pink-600',
                    icon: '💯',
                    text: 'CENTURY!',
                    subtext: message || 'What a knock!',
                    particles: ['🏆', '⭐', '💜', '🎉']
                };
            case 'FIFTY':
                return {
                    bg: 'from-blue-500 to-cyan-600',
                    icon: '5️⃣0️⃣',
                    text: 'FIFTY!',
                    subtext: message || 'Half Century!',
                    particles: ['👏', '💙', '⭐']
                };
            
            // Football Events
            case 'GOAL':
                return {
                    bg: 'from-green-500 to-emerald-600',
                    icon: '⚽',
                    text: 'GOAL!',
                    subtext: message || 'What a strike!',
                    particles: ['⚽', '🎉', '💚', '🔥']
                };
            case 'PENALTY_GOAL':
                return {
                    bg: 'from-green-500 to-teal-600',
                    icon: '⚽',
                    text: 'PENALTY SCORED!',
                    subtext: message,
                    particles: ['⚽', '🎯', '✅']
                };
            case 'PENALTY_MISS':
                return {
                    bg: 'from-red-500 to-rose-600',
                    icon: '❌',
                    text: 'PENALTY MISSED!',
                    subtext: message,
                    particles: ['😱', '❌', '🔴']
                };
            case 'YELLOW_CARD':
                return {
                    bg: 'from-yellow-500 to-amber-600',
                    icon: '🟨',
                    text: 'YELLOW CARD',
                    subtext: message,
                    particles: ['⚠️', '🟨']
                };
            case 'RED_CARD':
                return {
                    bg: 'from-red-600 to-red-800',
                    icon: '🟥',
                    text: 'RED CARD!',
                    subtext: message || 'Player sent off!',
                    particles: ['🟥', '💀', '❌']
                };

            // Basketball Events
            case 'THREE_POINTER':
                return {
                    bg: 'from-orange-500 to-red-600',
                    icon: '🏀',
                    text: 'THREE POINTER!',
                    subtext: message || 'Nothing but net!',
                    particles: ['🏀', '🔥', '3️⃣']
                };
            case 'DUNK':
                return {
                    bg: 'from-purple-500 to-indigo-600',
                    icon: '💪',
                    text: 'SLAM DUNK!',
                    subtext: message,
                    particles: ['🏀', '💥', '🔥']
                };
            case 'BLOCK':
                return {
                    bg: 'from-blue-600 to-indigo-700',
                    icon: '🛡️',
                    text: 'BLOCKED!',
                    subtext: message,
                    particles: ['🛡️', '💪', '❌']
                };

            // Kabaddi Events
            case 'RAID_POINT':
                return {
                    bg: 'from-green-500 to-emerald-600',
                    icon: '💪',
                    text: 'RAID POINT!',
                    subtext: message,
                    particles: ['💪', '⭐', '✅']
                };
            case 'TACKLE_POINT':
                return {
                    bg: 'from-blue-500 to-cyan-600',
                    icon: '🤼',
                    text: 'TACKLE POINT!',
                    subtext: message,
                    particles: ['🤼', '💪', '🛡️']
                };
            case 'ALL_OUT':
                return {
                    bg: 'from-red-500 to-rose-600',
                    icon: '💀',
                    text: 'ALL OUT!',
                    subtext: message || '+2 Bonus Points!',
                    particles: ['💀', '🔴', '💥']
                };
            case 'SUPER_RAID':
                return {
                    bg: 'from-yellow-500 to-orange-600',
                    icon: '⭐',
                    text: 'SUPER RAID!',
                    subtext: message || '3+ points!',
                    particles: ['⭐', '🔥', '💪']
                };

            // Generic Events
            case 'POINT':
                return {
                    bg: 'from-blue-500 to-indigo-600',
                    icon: '🎯',
                    text: '+1 POINT',
                    subtext: message,
                    particles: ['⭐', '✅']
                };
            case 'WIN':
                return {
                    bg: 'from-yellow-400 to-amber-500',
                    icon: '🏆',
                    text: 'WINNER!',
                    subtext: message,
                    particles: ['🏆', '🎉', '⭐', '🎊']
                };
            case 'MATCH_POINT':
                return {
                    bg: 'from-purple-500 to-pink-600',
                    icon: '🎯',
                    text: 'MATCH POINT!',
                    subtext: message,
                    particles: ['🎯', '⚡', '💜']
                };

            default:
                return {
                    bg: 'from-blue-500 to-purple-600',
                    icon: '⭐',
                    text: message || 'SCORE!',
                    subtext: '',
                    particles: ['⭐', '✨']
                };
        }
    };

    const config = getPopupConfig();

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
                >
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black"
                    />

                    {/* Particles */}
                    {config.particles.map((particle, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ 
                                opacity: 0, 
                                scale: 0,
                                x: 0,
                                y: 0
                            }}
                            animate={{ 
                                opacity: [0, 1, 1, 0], 
                                scale: [0.5, 1.5, 1.5, 0.5],
                                x: (idx % 2 ? 1 : -1) * (100 + idx * 50),
                                y: -150 - idx * 30
                            }}
                            transition={{
                                duration: 1.5,
                                delay: idx * 0.1
                            }}
                            className="absolute text-4xl z-10"
                        >
                            {particle}
                        </motion.div>
                    ))}

                    {/* Main Popup */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ 
                            scale: [0, 1.2, 1],
                            rotate: 0
                        }}
                        exit={{ 
                            scale: 0, 
                            rotate: 180,
                            opacity: 0
                        }}
                        transition={{ 
                            type: 'spring', 
                            stiffness: 200,
                            damping: 15
                        }}
                        className={`relative bg-gradient-to-r ${config.bg} px-16 py-10 rounded-3xl shadow-2xl`}
                    >
                        {/* Glowing Effect */}
                        <motion.div
                            animate={{ 
                                boxShadow: [
                                    '0 0 20px rgba(255,255,255,0.3)',
                                    '0 0 60px rgba(255,255,255,0.5)',
                                    '0 0 20px rgba(255,255,255,0.3)'
                                ]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-3xl"
                        />

                        {/* Icon */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-6xl text-center mb-2"
                        >
                            {config.icon}
                        </motion.div>

                        {/* Main Text */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-black text-white text-center drop-shadow-lg"
                        >
                            {config.text}
                        </motion.div>

                        {/* Subtext */}
                        {config.subtext && (
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl text-white/90 text-center mt-2"
                            >
                                {config.subtext}
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * Hook to manage score popup state
 */
export const useScorePopup = () => {
    const [popup, setPopup] = React.useState({ show: false, type: '', message: '' });

    const showPopup = (type, message = '') => {
        setPopup({ show: true, type, message });
    };

    const hidePopup = () => {
        setPopup(prev => ({ ...prev, show: false }));
    };

    return { popup, showPopup, hidePopup };
};

export default ScorePopup;
