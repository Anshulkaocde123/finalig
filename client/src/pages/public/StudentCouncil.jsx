import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import axios from '../../api/axios';

const StudentCouncilPage = ({ isDarkMode, setIsDarkMode }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('/student-council');
            // Sort by position priority
            const priorityOrder = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head', 'Member'];
            const sortedMembers = response.data.data.sort((a, b) => {
                return priorityOrder.indexOf(a.position) - priorityOrder.indexOf(b.position);
            });
            setMembers(sortedMembers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching members:', error);
            setLoading(false);
        }
    };

    const getPositionEmoji = (position) => {
        const emojiMap = {
            'President': '👑',
            'Vice President': '💎',
            'Secretary': '📋',
            'Treasurer': '💰',
            'Sports Head': '⚽',
            'Cultural Head': '🎭',
            'Academics Head': '📚',
            'Member': '👤'
        };
        return emojiMap[position] || '👤';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="flex items-center justify-center h-96">
                    <div className="text-xl font-bold">Loading Student Council...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-vnit-primary via-purple-900 to-vnit-dark py-20 border-b-4 border-vnit-accent">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-white mb-4">🎓 Student Council</h1>
                    <p className="text-xl text-vnit-accent font-bold">Meet the Leadership Behind VNIT IG</p>
                </div>
            </div>

            {/* Members Grid */}
            <div className="container mx-auto px-4 py-16">
                {members.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-2xl font-bold text-light-text-secondary dark:text-dark-text-secondary">
                            Student Council members coming soon!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Group by position */}
                        {['President', 'Vice President', 'Secretary', 'Treasurer'].some(p => members.some(m => m.position === p)) && (
                            <div className="mb-16">
                                <h2 className="text-3xl font-black text-vnit-primary dark:text-vnit-accent mb-8 text-center">
                                    🏆 Executive Board
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {members
                                        .filter(m => ['President', 'Vice President', 'Secretary', 'Treasurer'].includes(m.position))
                                        .map(member => (
                                            <MemberCard key={member._id} member={member} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Department Heads */}
                        {members.some(m => ['Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position)) && (
                            <div className="mb-16">
                                <h2 className="text-3xl font-black text-vnit-primary dark:text-vnit-accent mb-8 text-center">
                                    ⭐ Department Heads
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {members
                                        .filter(m => ['Sports Head', 'Cultural Head', 'Academics Head'].includes(m.position))
                                        .map(member => (
                                            <MemberCard key={member._id} member={member} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* General Members */}
                        {members.some(m => m.position === 'Member') && (
                            <div>
                                <h2 className="text-3xl font-black text-vnit-primary dark:text-vnit-accent mb-8 text-center">
                                    👥 Members
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {members
                                        .filter(m => m.position === 'Member')
                                        .map(member => (
                                            <MemberCard key={member._id} member={member} />
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Back to About */}
                <div className="flex justify-center mt-16">
                    <Link
                        to="/about"
                        className="bg-gradient-to-r from-vnit-primary to-blue-700 hover:from-vnit-primary/90 hover:to-blue-700/90 text-white font-black py-4 px-8 rounded-xl border-2 border-vnit-accent transition-all text-lg"
                    >
                        ← Back to About VNIT IG
                    </Link>
                </div>
            </div>
        </div>
    );
};

const MemberCard = ({ member }) => {
    const getPositionEmoji = (position) => {
        const emojiMap = {
            'President': '👑',
            'Vice President': '💎',
            'Secretary': '📋',
            'Treasurer': '💰',
            'Sports Head': '⚽',
            'Cultural Head': '🎭',
            'Academics Head': '📚',
            'Member': '👤'
        };
        return emojiMap[position] || '👤';
    };

    const getDepartmentColor = (dept) => {
        const colors = {
            'CSE': 'from-blue-500 to-blue-700',
            'CIVIL': 'from-yellow-500 to-yellow-700',
            'CHEM': 'from-green-500 to-green-700',
            'EEE': 'from-orange-500 to-orange-700',
            'ECE': 'from-purple-500 to-purple-700',
            'MECH': 'from-red-500 to-red-700',
            'META': 'from-pink-500 to-pink-700',
            'MINING': 'from-gray-500 to-gray-700'
        };
        return colors[dept] || 'from-gray-500 to-gray-700';
    };

    return (
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border-2 border-vnit-accent overflow-hidden shadow-lg hover:shadow-2xl transition-all">
            {/* Photo or Avatar */}
            <div className={`bg-gradient-to-br ${getDepartmentColor(member.department)} h-48 flex items-center justify-center`}>
                {member.photo ? (
                    <img 
                        src={member.photo} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-6xl">{getPositionEmoji(member.position)}</div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getPositionEmoji(member.position)}</span>
                    <h3 className="text-xl font-black text-vnit-primary dark:text-vnit-accent">
                        {member.position}
                    </h3>
                </div>

                <h4 className="text-2xl font-black text-light-text dark:text-dark-text mb-1">
                    {member.name}
                </h4>

                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 font-bold">
                    {member.department}
                </p>

                {/* Pledge */}
                {member.pledge && (
                    <div className="bg-vnit-accent/10 dark:bg-vnit-accent/20 rounded-lg p-4 mb-4 border-l-4 border-vnit-accent">
                        <p className="text-sm italic text-light-text-secondary dark:text-dark-text-secondary">
                            "{member.pledge}"
                        </p>
                    </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                    {member.email && (
                        <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                            <span>✉️</span>
                            <a href={`mailto:${member.email}`} className="hover:text-vnit-accent transition">
                                {member.email}
                            </a>
                        </div>
                    )}
                    {member.phone && (
                        <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                            <span>📱</span>
                            <a href={`tel:${member.phone}`} className="hover:text-vnit-accent transition">
                                {member.phone}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentCouncilPage;
