import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Initialize Google Sign-In
    useEffect(() => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        // Skip if Client ID not configured
        if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            console.warn('⚠️ Google OAuth Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env.local');
            return;
        }

        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: googleClientId,
                        callback: handleGoogleSignIn
                    });
                    const buttonElement = document.getElementById('google-signin-button');
                    if (buttonElement) {
                        window.google.accounts.id.renderButton(buttonElement, {
                            theme: 'outline',
                            size: 'large',
                            width: '100%',
                            text: 'signin_with'
                        });
                    }
                } catch (error) {
                    console.error('Error initializing Google Sign-In:', error);
                }
            }
        };

        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        script.onerror = () => {
            console.error('Failed to load Google Identity Services script');
        };
        document.body.appendChild(script);

        return () => {
            try {
                document.body.removeChild(script);
            } catch (e) {
                // Script already removed
            }
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);

            if (res.data.token) {
                console.log('✅ Login successful:', { role: res.data.role, username: res.data.username });
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data));
                
                // Check role and redirect accordingly
                if (res.data.role === 'viewer' && !res.data.isTrusted) {
                    console.log('🚫 Viewer account without admin access');
                    toast.error('Access denied. You need admin privileges. Please contact an administrator.');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    return;
                }
                
                toast.success(`Welcome back, ${res.data.username || res.data.name}!`);
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async (response) => {
        setLoading(true);
        try {
            // Decode JWT token from Google
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const googleData = JSON.parse(jsonPayload);

            // Send to backend
            const res = await api.post('/auth/register-oauth', {
                googleId: googleData.sub,
                email: googleData.email,
                name: googleData.name,
                picture: googleData.picture
            });

            if (res.data.token) {
                console.log('✅ Google OAuth successful:', { role: res.data.role, isTrusted: res.data.isTrusted });
                
                // Check if user has admin privileges
                if (res.data.role === 'viewer' && !res.data.isTrusted) {
                    console.log('🚫 Google OAuth: Viewer account needs approval');
                    toast.error('Access pending. Your Google account needs admin approval. Please contact an administrator.');
                    return;
                }
                
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data));
                toast.success(`Welcome, ${res.data.name}!`);
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-indigo-900">Admin Login</h1>
                    <p className="text-gray-500 mt-2">Secure access for VNIT Sports officials</p>
                </div>

                {/* Google Sign-In Button */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                 import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
                    <>
                        <div className="mb-6 flex justify-center">
                            <div id="google-signin-button" className="w-full"></div>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with username</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">
                            ⚠️ <strong>Google OAuth not configured yet.</strong><br />
                            Set your Google Client ID in <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> to enable Google Sign-In.
                        </p>
                    </div>
                )}

                {/* Traditional Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-bold text-lg transition-all ${
                            loading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>🔒 Protected System • Authorized Personnel Only</p>
                </div>

                {/* Security Features */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-700">
                    <p className="font-semibold mb-2">Security Features:</p>
                    <ul className="space-y-1">
                        <li>✓ End-to-end encryption</li>
                        <li>✓ JWT token-based sessions</li>
                        <li>✓ Google OAuth 2.0</li>
                        <li>✓ Secure password hashing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;
