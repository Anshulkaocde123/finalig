import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AboutManagement = () => {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        missionStatement: '',
        visionStatement: '',
        history: '',
        highlights: [],
        logoUrl: '',
        bannerUrl: '',
        contactEmail: '',
        contactPhone: ''
    });
    const [newHighlight, setNewHighlight] = useState({ title: '', description: '' });

    useEffect(() => {
        fetchAbout();
    }, []);

    const fetchAbout = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/about');
            setAbout(response.data.data);
            setFormData(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch about page');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddHighlight = () => {
        if (newHighlight.title && newHighlight.description) {
            setFormData(prev => ({
                ...prev,
                highlights: [...(prev.highlights || []), newHighlight]
            }));
            setNewHighlight({ title: '', description: '' });
        } else {
            toast.error('Please fill in both highlight fields');
        }
    };

    const handleRemoveHighlight = (index) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            toast.error('Please fill in title and description');
            return;
        }

        try {
            setLoading(true);
            await axios.put('/about', formData);
            toast.success('About page updated successfully');
            fetchAbout();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update about page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <h1 className="text-4xl font-black text-vnit-primary dark:text-vnit-accent mb-8">
                    📖 About VNIT IG Management
                </h1>

                {loading && !formData.title ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border-2 border-vnit-accent p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Page Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="About VNIT Inter-Department Games"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter a detailed description of VNIT IG..."
                                    rows="6"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            {/* Mission Statement */}
                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Mission Statement
                                </label>
                                <textarea
                                    name="missionStatement"
                                    value={formData.missionStatement}
                                    onChange={handleInputChange}
                                    placeholder="Enter our mission..."
                                    rows="3"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            {/* Vision Statement */}
                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Vision Statement
                                </label>
                                <textarea
                                    name="visionStatement"
                                    value={formData.visionStatement}
                                    onChange={handleInputChange}
                                    placeholder="Enter our vision..."
                                    rows="3"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            {/* History */}
                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    History
                                </label>
                                <textarea
                                    name="history"
                                    value={formData.history}
                                    onChange={handleInputChange}
                                    placeholder="Enter the history of VNIT IG..."
                                    rows="5"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            {/* Highlights Section */}
                            <div className="bg-vnit-primary/10 dark:bg-vnit-primary/20 rounded-xl p-6 border-2 border-vnit-primary/50">
                                <h3 className="text-xl font-black text-vnit-primary dark:text-vnit-accent mb-4">Event Highlights</h3>
                                
                                {/* Add Highlight Form */}
                                <div className="mb-6 flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={newHighlight.title}
                                            onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Highlight title"
                                            className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={newHighlight.description}
                                            onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Highlight description"
                                            className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddHighlight}
                                        className="bg-vnit-accent hover:bg-vnit-secondary text-white font-black py-2 px-6 rounded-lg transition"
                                    >
                                        + Add
                                    </button>
                                </div>

                                {/* List of Highlights */}
                                {formData.highlights && formData.highlights.length > 0 && (
                                    <div className="space-y-3">
                                        {formData.highlights.map((highlight, index) => (
                                            <div
                                                key={index}
                                                className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg border-l-4 border-vnit-accent flex justify-between items-start"
                                            >
                                                <div>
                                                    <p className="font-bold text-light-text dark:text-dark-text">
                                                        {highlight.title}
                                                    </p>
                                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                        {highlight.description}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveHighlight(index)}
                                                    className="text-red-600 hover:text-red-700 font-bold ml-4"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        placeholder="contact@vnit.ac.in"
                                        className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                        placeholder="+91 XXXXXXXXXX"
                                        className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                    />
                                </div>
                            </div>

                            {/* Media URLs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                        Logo URL
                                    </label>
                                    <input
                                        type="url"
                                        name="logoUrl"
                                        value={formData.logoUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                        Banner URL
                                    </label>
                                    <input
                                        type="url"
                                        name="bannerUrl"
                                        value={formData.bannerUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/banner.png"
                                        className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-vnit-primary to-blue-700 hover:from-vnit-primary/90 hover:to-blue-700/90 text-white font-black py-3 rounded-lg border-2 border-vnit-accent transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : '💾 Save About Page'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutManagement;
