import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import axios from '../../api/axios';

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

    if (loading) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
                <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                <div className="flex items-center justify-center h-96">
                    <div className="text-xl font-bold">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            <PublicNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-vnit-primary via-blue-900 to-vnit-dark py-20 border-b-4 border-vnit-accent">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-white mb-4">🏆 VNIT Inter-Department Games</h1>
                    <p className="text-xl text-vnit-accent font-bold">Celebrating Excellence in Sports & Sportsmanship</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                {/* Description Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border-2 border-vnit-accent p-10 mb-12 shadow-lg">
                        <h2 className="text-3xl font-black text-vnit-primary dark:text-vnit-accent mb-6">About VNIT IG</h2>
                        <p className="text-lg leading-relaxed mb-6 text-light-text-secondary dark:text-dark-text-secondary">
                            {about?.description}
                        </p>
                    </div>

                    {/* Vision and Mission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Mission */}
                        <div className="bg-gradient-to-br from-vnit-secondary/20 to-red-600/20 dark:from-vnit-secondary/30 dark:to-red-600/30 rounded-2xl border-2 border-vnit-secondary p-8 shadow-lg">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-2xl font-black text-vnit-secondary dark:text-red-300 mb-4">Our Mission</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                                {about?.missionStatement}
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-gradient-to-br from-vnit-accent/20 to-yellow-600/20 dark:from-vnit-accent/30 dark:to-yellow-600/30 rounded-2xl border-2 border-vnit-accent p-8 shadow-lg">
                            <div className="text-4xl mb-4">👁️</div>
                            <h3 className="text-2xl font-black text-vnit-accent dark:text-yellow-300 mb-4">Our Vision</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                                {about?.visionStatement}
                            </p>
                        </div>
                    </div>

                    {/* History Section */}
                    {about?.history && (
                        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border-2 border-vnit-primary/50 p-10 mb-12 shadow-lg">
                            <h3 className="text-3xl font-black text-vnit-primary dark:text-vnit-accent mb-6">📚 History</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed text-lg">
                                {about.history}
                            </p>
                        </div>
                    )}

                    {/* Highlights */}
                    {about?.highlights && about.highlights.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-3xl font-black text-vnit-primary dark:text-vnit-accent mb-6">⭐ Event Highlights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {about.highlights.map((highlight, index) => (
                                    <div
                                        key={index}
                                        className="bg-light-surface dark:bg-dark-surface rounded-xl border-2 border-vnit-accent/50 p-6 hover:border-vnit-accent transition-all shadow-lg"
                                    >
                                        <h4 className="text-xl font-black text-vnit-primary dark:text-vnit-accent mb-3">
                                            ✨ {highlight.title}
                                        </h4>
                                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                            {highlight.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    <div className="bg-gradient-to-br from-vnit-primary/10 to-vnit-secondary/10 dark:from-vnit-primary/20 dark:to-vnit-secondary/20 rounded-2xl border-2 border-vnit-accent p-10 mb-12 shadow-lg">
                        <h3 className="text-2xl font-black text-vnit-primary dark:text-vnit-accent mb-6">📞 Get In Touch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {about?.contactEmail && (
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">✉️</div>
                                    <div>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Email</p>
                                        <p className="text-lg font-bold text-vnit-primary dark:text-vnit-accent">{about.contactEmail}</p>
                                    </div>
                                </div>
                            )}
                            {about?.contactPhone && (
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">📱</div>
                                    <div>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Phone</p>
                                        <p className="text-lg font-bold text-vnit-primary dark:text-vnit-accent">{about.contactPhone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/student-council"
                            className="bg-gradient-to-r from-vnit-primary to-blue-700 hover:from-vnit-primary/90 hover:to-blue-700/90 text-white font-black py-4 px-8 rounded-xl border-2 border-vnit-accent transition-all text-lg"
                        >
                            🎓 Meet the Student Council
                        </Link>
                        <Link
                            to="/leaderboard"
                            className="bg-gradient-to-r from-vnit-secondary to-red-700 hover:from-vnit-secondary/90 hover:to-red-700/90 text-white font-black py-4 px-8 rounded-xl border-2 border-vnit-accent transition-all text-lg"
                        >
                            📊 View Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
