import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const StudentCouncilManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        position: 'Member',
        department: 'CSE',
        photo: '',
        pledge: '',
        email: '',
        phone: '',
        order: 0
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/student-council');
            setMembers(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch members');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.position || !formData.department) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            if (editingId) {
                await axios.put(`/student-council/${editingId}`, formData);
                toast.success('Member updated successfully');
            } else {
                await axios.post('/student-council', formData);
                toast.success('Member added successfully');
            }
            
            resetForm();
            fetchMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save member');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member) => {
        setFormData(member);
        setEditingId(member._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                setLoading(true);
                await axios.delete(`/student-council/${id}`);
                toast.success('Member deleted successfully');
                fetchMembers();
            } catch (error) {
                toast.error('Failed to delete member');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            position: 'Member',
            department: 'CSE',
            photo: '',
            pledge: '',
            email: '',
            phone: '',
            order: 0
        });
        setEditingId(null);
        setShowForm(false);
    };

    const departments = ['CSE', 'CIVIL', 'CHEM', 'EEE', 'ECE', 'MECH', 'META', 'MINING'];
    const positions = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Sports Head', 'Cultural Head', 'Academics Head', 'Member'];

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black text-vnit-primary dark:text-vnit-accent">
                        🎓 Student Council Management
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-vnit-primary to-blue-700 hover:from-vnit-primary/90 hover:to-blue-700/90 text-white font-black py-3 px-6 rounded-lg border-2 border-vnit-accent transition"
                    >
                        {showForm ? '✕ Cancel' : '+ Add Member'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border-2 border-vnit-accent p-8 mb-8 shadow-lg">
                        <h2 className="text-2xl font-black text-vnit-primary dark:text-vnit-accent mb-6">
                            {editingId ? 'Edit Member' : 'Add New Member'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter name"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Position *
                                </label>
                                <select
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                >
                                    {positions.map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Department *
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+91 XXXXXXXXXX"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Photo URL
                                </label>
                                <input
                                    type="url"
                                    name="photo"
                                    value={formData.photo}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/photo.jpg"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-light-text dark:text-dark-text mb-2">
                                    Pledge / Motto
                                </label>
                                <textarea
                                    name="pledge"
                                    value={formData.pledge}
                                    onChange={handleInputChange}
                                    placeholder="Enter your pledge or motto..."
                                    rows="3"
                                    className="w-full px-4 py-2 border-2 border-vnit-accent rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-vnit-secondary"
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-vnit-primary to-blue-700 hover:from-vnit-primary/90 hover:to-blue-700/90 text-white font-black py-3 rounded-lg border-2 border-vnit-accent transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-black py-3 rounded-lg transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Members List */}
                <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border-2 border-vnit-accent p-8 shadow-lg">
                    <h2 className="text-2xl font-black text-vnit-primary dark:text-vnit-accent mb-6">
                        👥 Council Members ({members.length})
                    </h2>

                    {loading && !showForm ? (
                        <div className="text-center py-8">Loading members...</div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                            No members yet. Add your first member!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-vnit-accent">
                                        <th className="text-left py-3 px-4 font-black text-vnit-primary dark:text-vnit-accent">Name</th>
                                        <th className="text-left py-3 px-4 font-black text-vnit-primary dark:text-vnit-accent">Position</th>
                                        <th className="text-left py-3 px-4 font-black text-vnit-primary dark:text-vnit-accent">Department</th>
                                        <th className="text-left py-3 px-4 font-black text-vnit-primary dark:text-vnit-accent">Email</th>
                                        <th className="text-left py-3 px-4 font-black text-vnit-primary dark:text-vnit-accent">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(member => (
                                        <tr key={member._id} className="border-b border-vnit-accent/30 hover:bg-vnit-primary/10 dark:hover:bg-vnit-primary/20 transition">
                                            <td className="py-3 px-4 font-bold">{member.name}</td>
                                            <td className="py-3 px-4">{member.position}</td>
                                            <td className="py-3 px-4">{member.department}</td>
                                            <td className="py-3 px-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                {member.email || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="bg-vnit-accent hover:bg-vnit-secondary text-white font-bold py-1 px-3 rounded transition"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member._id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentCouncilManagement;
