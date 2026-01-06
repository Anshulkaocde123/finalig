import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated Card Component with hover effects and entrance animations
 * Used throughout the app for consistent styling
 */
const AnimatedCard = ({ 
    children, 
    className = "", 
    delay = 0,
    hover = true,
    glowColor = "rgba(139, 92, 246, 0.2)",
    onClick,
    ...props 
}) => {
    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const hoverVariants = hover ? {
        y: -5,
        scale: 1.02,
        boxShadow: `0 20px 40px -10px ${glowColor}`,
        transition: { duration: 0.2 }
    } : {};

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={hoverVariants}
            whileTap={hover ? { scale: 0.98 } : {}}
            onClick={onClick}
            className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 
                        transition-colors ${hover ? 'cursor-pointer' : ''} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

/**
 * Glass Card - Glassmorphism style card
 */
export const GlassCard = ({ 
    children, 
    className = "", 
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl ${className}`}
            {...props}
        >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl" />
            
            {/* Border gradient */}
            <div className="absolute inset-0 rounded-2xl border border-white/10" />
            
            {/* Content */}
            <div className="relative z-10 p-6">
                {children}
            </div>
        </motion.div>
    );
};

/**
 * Gradient Card with animated border
 */
export const GradientCard = ({ 
    children, 
    className = "",
    gradientFrom = "from-purple-500",
    gradientTo = "to-cyan-500",
    delay = 0,
    ...props 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3 }}
            className={`relative group ${className}`}
            {...props}
        >
            {/* Animated gradient border */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientFrom} ${gradientTo} 
                            rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500`} />
            
            {/* Card content */}
            <div className="relative bg-gray-900 rounded-xl p-6">
                {children}
            </div>
        </motion.div>
    );
};

/**
 * Stats Card with animated counter
 */
export const StatsCard = ({ 
    value, 
    label, 
    icon, 
    trend,
    trendValue,
    delay = 0,
    color = "purple"
}) => {
    const colorClasses = {
        purple: "from-purple-500 to-indigo-500 text-purple-400",
        cyan: "from-cyan-500 to-blue-500 text-cyan-400",
        green: "from-green-500 to-emerald-500 text-green-400",
        yellow: "from-yellow-500 to-orange-500 text-yellow-400",
        red: "from-red-500 to-pink-500 text-red-400"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 
                       rounded-xl p-6"
        >
            {/* Background gradient glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} 
                            opacity-20 blur-3xl`} />
            
            <div className="relative z-10">
                {/* Icon */}
                {icon && (
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} 
                                    flex items-center justify-center mb-4`}>
                        <span className="text-2xl">{icon}</span>
                    </div>
                )}

                {/* Value */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.2 }}
                    className="text-3xl font-black text-white mb-1"
                >
                    {value}
                </motion.div>

                {/* Label */}
                <div className="text-gray-400 text-sm">{label}</div>

                {/* Trend */}
                {trend && (
                    <div className={`mt-2 flex items-center gap-1 text-sm ${
                        trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                        <span>{trend === 'up' ? '↑' : '↓'}</span>
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Feature Card with icon and description
 */
export const FeatureCard = ({ 
    icon, 
    title, 
    description, 
    delay = 0,
    color = "purple"
}) => {
    const colorClasses = {
        purple: "from-purple-500 to-indigo-500",
        cyan: "from-cyan-500 to-blue-500",
        green: "from-green-500 to-emerald-500",
        yellow: "from-yellow-500 to-orange-500",
        red: "from-red-500 to-pink-500"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 
                       rounded-xl p-6 overflow-hidden"
        >
            {/* Hover gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 
                            group-hover:opacity-10 transition-opacity duration-300`} />

            <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} 
                                flex items-center justify-center mb-4 
                                group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{icon}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
};

export default AnimatedCard;
