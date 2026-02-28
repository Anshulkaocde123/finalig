import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import axios from '../../api/axios';
import { Trophy, Users, BookOpen, Mail, Phone } from 'lucide-react';

const AboutPage = () => {
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <PublicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <PublicNavbar />

            {/* Header */}
            <div className="py-12 px-4 text-center border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    About VNIT Inter-Games
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Celebrating Excellence in Sports
                </p>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Description */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {about?.description}
                    </p>
                </div>

                {/* Vision and Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-lg">🎯</span>
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Mission</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {about?.missionStatement}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-lg">👁️</span>
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Vision</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {about?.visionStatement}
                        </p>
                    </div>
                </div>

                {/* History */}
                {about?.history && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">History</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {about.history}
                        </p>
                    </div>
                )}

                {/* Highlights */}
                {about?.highlights && about.highlights.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Event Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {about.highlights.map((highlight, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                                >
                                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                                        {highlight.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {highlight.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact</h3>
                    <div className="space-y-3">
                        {about?.contactEmail && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">{about.contactEmail}</span>
                            </div>
                        )}
                        {about?.contactPhone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-300">{about.contactPhone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 justify-center">
                    <Link
                        to="/student-council"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                    >
                        <Users className="w-4 h-4" />
                        Student Council
                    </Link>
                    <Link
                        to="/leaderboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
