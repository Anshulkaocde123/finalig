import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

const AdvancedMatchFilter = ({ onFilter }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        sport: '',
        status: '',
        season: '',
        department: '',
        matchType: '',
        venue: '',
        dateFrom: '',
        dateTo: ''
    });
    const [seasons, setSeasons] = useState([]);
    const [departments, setDepartments] = useState([]);

    const SPORTS = ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS'];
    const STATUSES = ['LIVE', 'SCHEDULED', 'COMPLETED'];
    const MATCH_TYPES = ['REGULAR', 'SEMIFINAL', 'FINAL'];

    useEffect(() => {
        fetchSeasons();
        fetchDepartments();
    }, []);

    const fetchSeasons = async () => {
        try {
            const res = await fetch('/api/seasons');
            const data = await res.json();
            setSeasons(data.data || []);
        } catch (error) {
            console.error('Error fetching seasons:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            const data = await res.json();
            setDepartments(data.data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleApplyFilters = () => {
        const activeFilters = Object.entries(filters)
            .filter(([_, value]) => value !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        onFilter(activeFilters);
        setShowAdvanced(false);
    };

    const handleClearFilters = () => {
        setFilters({
            sport: '',
            status: '',
            season: '',
            department: '',
            matchType: '',
            venue: '',
            dateFrom: '',
            dateTo: ''
        });
        onFilter({});
    };

    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
            {/* Quick Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search venue or tags..."
                        onChange={(e) => handleFilterChange('venue', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 outline-none"
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                >
                    <option value="">All Status</option>
                    {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select
                    value={filters.sport}
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-indigo-500 outline-none"
                >
                    <option value="">All Sports</option>
                    {SPORTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showAdvanced
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                >
                    <Filter className="w-4 h-4" /> Advanced
                </button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="bg-slate-700 rounded-lg p-4 space-y-4 border border-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Season</label>
                            <select
                                value={filters.season}
                                onChange={(e) => handleFilterChange('season', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-400 outline-none"
                            >
                                <option value="">All Seasons</option>
                                {seasons.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.year})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-400 outline-none"
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Match Type</label>
                            <select
                                value={filters.matchType}
                                onChange={(e) => handleFilterChange('matchType', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-400 outline-none"
                            >
                                <option value="">All Types</option>
                                {MATCH_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-400 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedMatchFilter;
