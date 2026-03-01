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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center h-96">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin" />
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    const executives = members.filter(m => ['President', 'Vice President', 'Secretary', 'Treasurer'].includes(m.position));
    const heads = members.filter(m => ['Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position));
    const others = members.filter(m => !['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <PublicNavbar />

            {/* Header */}
            <div className="py-12 px-4 text-center border-b border-slate-200 dark:border-slate-700">
                <GraduationCap className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Student Council
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Leadership Behind Institute Gathering
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {members.length === 0 ? (
                    <div className="text-center py-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No council members found</p>
                    </div>
                ) : (
                    <>
                        {/* Executives */}
                        {executives.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
                                    Executive Board
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {executives.map((member) => (
                                        <div key={member._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                                            <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                                                {member.photo ? 
                                                    <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : 
                                                    <User className="w-6 h-6 text-blue-500" />
                                                }
                                            </div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{member.name}</h3>
                                            <p className="text-xs text-blue-500 font-medium">{member.position}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{member.department}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Department Heads */}
                        {heads.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
                                    Department Heads
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {heads.map((member) => (
                                        <div key={member._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                    {member.photo ? 
                                                        <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : 
                                                        <User className="w-5 h-5 text-slate-500" />
                                                    }
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">{member.name}</h3>
                                                    <p className="text-xs text-blue-500">{member.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Members */}
                        {others.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
                                    Members
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {others.map((member) => (
                                        <div key={member._id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
                                            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                                                {member.photo ? 
                                                    <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" /> : 
                                                    <User className="w-4 h-4 text-slate-500" />
                                                }
                                            </div>
                                            <h3 className="text-xs font-medium text-slate-900 dark:text-white">{member.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.department}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Back Button */}
                <div className="text-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentCouncilPage;
