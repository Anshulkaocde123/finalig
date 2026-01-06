import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNavbar from '../../components/PublicNavbar';
import axios from '../../api/axios';
import { Mail, Phone, Trophy, Target, Eye, History, Sparkles, Users, ArrowRight } from 'lucide-react';

// Lazy load 3D background
const ThreeBackground = React.lazy(() => import('../../components/ThreeBackground'));

const AboutPage = ({ isDarkMode, setIsDarkMode }) => {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAbout();
    }, []);

    const fetchAbout = async () => {
        try {
            const response = await axios.get('/about');
            setAbout(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching about:', error);
            setLoading(false);
        }
    };

    // Fallback background
    const FallbackBg = () => (
        <div className={`fixed inset-0 -z-10 ${isDarkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
            <div className="absolute inset-0">
                <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-200/30'}`} />
                <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-200/30'}`} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="flex flex-col items-center justify-center h-96">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
                    />
                    <p className="mt-4 text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {/* 3D Background */}
            {isDarkMode ? (
                <Suspense fallback={<FallbackBg />}>
                    <ThreeBackground variant="default" />
                </Suspense>
            ) : (
                <FallbackBg />
            )}

            <div className="relative z-10">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

                {/* Hero Section */}
                <div className="relative py-20 px-4 text-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mb-6"
                        >
                            <Trophy className="w-20 h-20 text-yellow-500" />
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                VNIT Inter-Games
                            </span>
                        </h1>
                        <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Celebrating Excellence in Sports & Sportsmanship
                        </p>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-4 pb-12">
                    {/* Description Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`backdrop-blur-xl rounded-3xl p-8 mb-8 border ${
                            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'
                        }`}
                    >
                        <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                            About VNIT IG
                        </h2>
                        <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {about?.description || "VNIT Inter-Games is the annual inter-department sports championship that brings together students from all departments to compete in various sports and foster a spirit of healthy competition and camaraderie."}
                        </p>
                    </motion.div>

                    {/* Vision and Mission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className={`backdrop-blur-xl rounded-3xl p-8 border relative overflow-hidden group ${
                                isDarkMode ? 'bg-gradient-to-br from-pink-500/10 to-red-500/10 border-pink-500/30' : 'bg-gradient-to-br from-pink-50 to-red-50 border-pink-200'
                            }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <Target className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                                <h3 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>Our Mission</h3>
                                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {about?.missionStatement || "To promote sports culture and physical fitness among students while building team spirit and leadership qualities."}
                                </p>
                            </div>
                        </motion.div>

                        {/* Vision */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className={`backdrop-blur-xl rounded-3xl p-8 border relative overflow-hidden group ${
                                isDarkMode ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                            }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <Eye className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                                <h3 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>Our Vision</h3>
                                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {about?.visionStatement || "To become the premier inter-departmental sports event that inspires excellence and unity."}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* History Section */}
                    {about?.history && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`backdrop-blur-xl rounded-3xl p-8 mb-8 border ${
                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <History className={`w-8 h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                                    History
                                </h3>
                            </div>
                            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {about.history}
                            </p>
                        </motion.div>
                    )}

                    {/* Highlights */}
                    {about?.highlights && about.highlights.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                                <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                    Event Highlights
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {about.highlights.map((highlight, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.02, y: -3 }}
                                        className={`backdrop-blur-xl rounded-2xl p-6 border group ${
                                            isDarkMode ? 'bg-white/5 border-white/10 hover:border-yellow-500/30' : 'bg-white/80 border-gray-200 hover:border-yellow-400'
                                        }`}
                                    >
                                        <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                            ✨ {highlight.title}
                                        </h4>
                                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {highlight.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className={`backdrop-blur-xl rounded-3xl p-8 mb-8 border ${
                            isDarkMode ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                        }`}
                    >
                        <h3 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            Get In Touch
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {about?.contactEmail && (
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
                                    }`}>
                                        <Mail className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                                        <p className={`text-lg font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{about.contactEmail}</p>
                                    </div>
                                </div>
                            )}
                            {about?.contactPhone && (
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                                    }`}>
                                        <Phone className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                                        <p className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>{about.contactPhone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Navigation Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-wrap gap-4 justify-center"
                    >
                        <Link to="/student-council">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
                            >
                                <Users className="w-5 h-5" />
                                Meet the Student Council
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>
                        <Link to="/leaderboard">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-500/25"
                            >
                                <Trophy className="w-5 h-5" />
                                View Leaderboard
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className={`py-8 text-center border-t backdrop-blur-xl ${
                    isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                    <p className="text-sm">VNIT Inter-Games • Excellence in Sports</p>
                </footer>
            </div>
        </div>
    );
};

export default AboutPage;
