import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Film, Camera, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const InstagramEmbed = ({ url, type }) => {
    const [embedHtml, setEmbedHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url) { setLoading(false); return; }

        setLoading(true);
        setError(false);

        // Use Instagram oEmbed API
        const encodedUrl = encodeURIComponent(url);
        fetch(`https://api.instagram.com/oembed?url=${encodedUrl}&omitscript=true`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch embed');
                return res.json();
            })
            .then(data => {
                setEmbedHtml(data.html);
                setLoading(false);
                // Load Instagram embed script
                setTimeout(() => {
                    if (window.instgrm) {
                        window.instgrm.Embeds.process();
                    } else {
                        const script = document.createElement('script');
                        script.src = 'https://www.instagram.com/embed.js';
                        script.async = true;
                        document.body.appendChild(script);
                    }
                }, 100);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [url]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !url) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                <p>No {type === 'reel' ? 'Reel' : 'Pic'} of the Day for this date</p>
            </div>
        );
    }

    return (
        <div
            className="instagram-embed-container overflow-hidden rounded-lg flex justify-center"
            dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
    );
};

const Highlights = () => {
    const [highlights, setHighlights] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { socket } = useSocket() || {};

    const fetchHighlights = useCallback(async (date) => {
        try {
            const { data } = await axios.get(`/api/highlights?date=${date}`);
            setHighlights(data);
        } catch (err) {
            console.error('Failed to fetch highlights:', err);
            setHighlights([]);
        }
    }, []);

    const fetchDates = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/highlights/dates');
            setAvailableDates(data);
        } catch (err) {
            console.error('Failed to fetch highlight dates:', err);
        }
    }, []);

    useEffect(() => {
        fetchHighlights(selectedDate);
        fetchDates();
    }, [selectedDate, fetchHighlights, fetchDates]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handler = (payload) => {
            if (payload?.date === selectedDate) {
                fetchHighlights(selectedDate);
            }
            fetchDates();
        };

        socket.on('highlightUpdated', handler);
        return () => socket.off('highlightUpdated', handler);
    }, [socket, selectedDate, fetchHighlights, fetchDates]);

    const reel = highlights.find(h => h.type === 'reel');
    const pic = highlights.find(h => h.type === 'pic');

    const goToPrevDate = () => {
        const idx = availableDates.indexOf(selectedDate);
        if (idx < availableDates.length - 1) {
            setSelectedDate(availableDates[idx + 1]);
        }
    };

    const goToNextDate = () => {
        const idx = availableDates.indexOf(selectedDate);
        if (idx > 0) {
            setSelectedDate(availableDates[idx - 1]);
        }
    };

    const formatDisplayDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <section className="space-y-6">
            {/* Header with date selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    ✨ Daily Highlights
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevDate}
                        disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium"
                        >
                            <Calendar className="w-4 h-4" />
                            {formatDisplayDate(selectedDate)}
                        </button>
                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 max-h-60 overflow-y-auto min-w-[200px]">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); setShowDatePicker(false); }}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm mb-2"
                                />
                                {availableDates.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => { setSelectedDate(d); setShowDatePicker(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                                            d === selectedDate
                                                ? 'bg-blue-500 text-white'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {formatDisplayDate(d)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={goToNextDate}
                        disabled={availableDates.indexOf(selectedDate) <= 0}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reel of the Day */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <Film className="w-5 h-5 text-pink-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Reel of the Day</h3>
                    </div>
                    <div className="p-4">
                        <InstagramEmbed url={reel?.instagramUrl} type="reel" />
                        {reel?.caption && (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{reel.caption}</p>
                        )}
                    </div>
                </motion.div>

                {/* Pic of the Day */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Pic of the Day</h3>
                    </div>
                    <div className="p-4">
                        <InstagramEmbed url={pic?.instagramUrl} type="pic" />
                        {pic?.caption && (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{pic.caption}</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Highlights;
