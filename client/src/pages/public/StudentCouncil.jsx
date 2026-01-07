import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import axios from '../../api/axios';
import { GraduationCap, ArrowLeft, User } from 'lucide-react';

const StudentCouncilPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('/student-council');
            const priorityOrder = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head', 'Member'];
            const sortedMembers = (response.data.data || []).sort((a, b) => priorityOrder.indexOf(a.position) - priorityOrder.indexOf(b.position));
            setMembers(sortedMembers);
        } catch (error) { 
            console.error('Error fetching members:', error); 
        } finally { 
            setLoading(false); 
        }
    };

    const getPositionColor = (pos) => {
        const colors = { 
            'President': 'from-yellow-500 to-amber-600', 
            'Vice President': 'from-blue-500 to-indigo-600', 
            'Secretary': 'from-purple-500 to-pink-600', 
            'Treasurer': 'from-green-500 to-emerald-600', 
            'Sports Head': 'from-red-500 to-orange-600', 
            'Cultural Head': 'from-pink-500 to-rose-600', 
            'Academics Head': 'from-cyan-500 to-teal-600' 
        };
        return colors[pos] || 'from-slate-500 to-slate-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                    <p className="mt-4 text-gray-500">Loading Student Council...</p>
                </div>
            </div>
        );
    }

    const executives = members.filter(m => ['President', 'Vice President', 'Secretary', 'Treasurer'].includes(m.position));
    const heads = members.filter(m => ['Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position));
    const others = members.filter(m => !['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position));

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <PublicNavbar />

            {/* Hero */}
            <div className="relative py-16 px-4 text-center bg-white border-b-2 border-gray-200 shadow-md">
                <div className="inline-block mb-6">
                    <GraduationCap className="w-20 h-20 text-purple-600" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">Student Council</span>
                </h1>
                <p className="text-xl max-w-2xl mx-auto text-gray-600">Meet the Leadership Behind VNIT IG</p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {members.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white border-2 border-gray-200 shadow-lg">
                        <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No council members found</p>
                    </div>
                ) : (
                    <>
                        {/* Executives */}
                        {executives.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Executive Board</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {executives.map((member) => (
                                        <div key={member._id} className="rounded-2xl p-6 text-center bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl">
                                            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${getPositionColor(member.position)} flex items-center justify-center text-white shadow-md mb-4`}>
                                                {member.photo ? 
                                                    <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : 
                                                    <User className="w-10 h-10" />
                                                }
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                            <p className={`text-sm font-semibold bg-gradient-to-r ${getPositionColor(member.position)} bg-clip-text text-transparent`}>
                                                {member.position}
                                            </p>
                                            <p className="text-xs mt-1 text-gray-600">{member.department}</p>
                                            {member.pledge && (
                                                <p className="text-xs mt-2 italic text-gray-500">"{member.pledge}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Department Heads */}
                        {heads.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Department Heads</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {heads.map((member) => (
                                        <div key={member._id} className="rounded-2xl p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${getPositionColor(member.position)} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                                                    {member.photo ? 
                                                        <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : 
                                                        <User className="w-7 h-7" />
                                                    }
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                                                    <p className={`text-sm font-semibold bg-gradient-to-r ${getPositionColor(member.position)} bg-clip-text text-transparent`}>
                                                        {member.position}
                                                    </p>
                                                    <p className="text-xs text-gray-600">{member.department}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Members */}
                        {others.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Members</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {others.map((member) => (
                                        <div key={member._id} className="rounded-xl p-4 text-center bg-white border-2 border-gray-200 shadow-md hover:shadow-lg">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-white mb-2">
                                                {member.photo ? 
                                                    <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : 
                                                    <User className="w-6 h-6" />
                                                }
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                                            <p className="text-xs text-gray-600">{member.department}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Back Button */}
                <div className="mt-12 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-200 shadow-md hover:shadow-lg">
                        <ArrowLeft className="w-5 h-5" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentCouncilPage;
