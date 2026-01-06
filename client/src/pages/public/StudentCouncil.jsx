import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNavbar from '../../components/PublicNavbar';
import axios from '../../api/axios';
import { GraduationCap, Mail, Phone, ArrowLeft, User } from 'lucide-react';

const ThreeBackground = React.lazy(() => import('../../components/ThreeBackground'));

const StudentCouncilPage = ({ isDarkMode, setIsDarkMode }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('/student-council');
            const priorityOrder = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head', 'Member'];
            const sortedMembers = (response.data.data || []).sort((a, b) => priorityOrder.indexOf(a.position) - priorityOrder.indexOf(b.position));
            setMembers(sortedMembers);
        } catch (error) { console.error('Error fetching members:', error); }
        finally { setLoading(false); }
    };

    const getPositionColor = (pos) => {
        const colors = { 'President': 'from-yellow-500 to-amber-600', 'Vice President': 'from-blue-500 to-indigo-600', 'Secretary': 'from-purple-500 to-pink-600', 'Treasurer': 'from-green-500 to-emerald-600', 'Sports Head': 'from-red-500 to-orange-600', 'Cultural Head': 'from-pink-500 to-rose-600', 'Academics Head': 'from-cyan-500 to-teal-600' };
        return colors[pos] || 'from-slate-500 to-slate-600';
    };

    const FallbackBg = () => (
        <div className={`fixed inset-0 -z-10 ${isDarkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
            <div className="absolute inset-0">
                <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-200/30'}`} />
                <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-200/30'}`} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="flex flex-col items-center justify-center h-96">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500" />
                    <p className="mt-4 text-gray-500">Loading Student Council...</p>
                </div>
            </div>
        );
    }

    const executives = members.filter(m => ['President', 'Vice President', 'Secretary', 'Treasurer'].includes(m.position));
    const heads = members.filter(m => ['Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position));
    const others = members.filter(m => !['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position));

    return (
        <div className={`min-h-screen relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isDarkMode ? (
                <Suspense fallback={<FallbackBg />}><ThreeBackground variant="default" /></Suspense>
            ) : (<FallbackBg />)}

            <div className="relative z-10">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

                {/* Hero */}
                <div className="relative py-16 px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-6">
                            <GraduationCap className="w-20 h-20 text-purple-500" />
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Student Council</span>
                        </h1>
                        <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Meet the Leadership Behind VNIT IG</p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto px-4 pb-12">
                    {members.length === 0 ? (
                        <div className={`text-center py-16 rounded-3xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No council members found</p>
                        </div>
                    ) : (
                        <>
                            {/* Executives */}
                            {executives.length > 0 && (
                                <div className="mb-12">
                                    <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Executive Board</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {executives.map((member, idx) => (
                                            <motion.div key={member._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                                className={`rounded-2xl p-6 text-center ${isDarkMode ? 'bg-white/5 border border-white/10 backdrop-blur-xl' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${getPositionColor(member.position)} flex items-center justify-center text-white shadow-lg mb-4`}>
                                                    {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-10 h-10" />}
                                                </div>
                                                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{member.name}</h3>
                                                <p className={`text-sm font-semibold bg-gradient-to-r ${getPositionColor(member.position)} bg-clip-text text-transparent`}>{member.position}</p>
                                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{member.department}</p>
                                                {member.pledge && <p className={`text-xs mt-2 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>"{member.pledge}"</p>}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Department Heads */}
                            {heads.length > 0 && (
                                <div className="mb-12">
                                    <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Department Heads</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {heads.map((member, idx) => (
                                            <motion.div key={member._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                                className={`rounded-2xl p-6 ${isDarkMode ? 'bg-white/5 border border-white/10 backdrop-blur-xl' : 'bg-white border border-gray-200 shadow-lg'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${getPositionColor(member.position)} flex items-center justify-center text-white shadow-lg`}>
                                                        {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-7 h-7" />}
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{member.name}</h3>
                                                        <p className={`text-sm font-semibold bg-gradient-to-r ${getPositionColor(member.position)} bg-clip-text text-transparent`}>{member.position}</p>
                                                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{member.department}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Members */}
                            {others.length > 0 && (
                                <div>
                                    <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Members</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {others.map((member, idx) => (
                                            <motion.div key={member._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                                className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-white mb-2">
                                                    {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-6 h-6" />}
                                                </div>
                                                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{member.name}</h3>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{member.department}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Back Button */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 text-center">
                        <Link to="/" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                            <ArrowLeft className="w-5 h-5" /> Back to Home
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StudentCouncilPage;
