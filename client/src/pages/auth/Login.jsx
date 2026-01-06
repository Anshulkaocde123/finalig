import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load 3D background for performance
const ThreeBackground = React.lazy(() => import('../../components/ThreeBackground'));

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
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
                            theme: 'filled_black',
                            size: 'large',
                            width: '100%',
                            text: 'signin_with',
                            shape: 'pill'
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
            const res = await axios.post('/api/auth/login', formData);

            if (res.data.token) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data));
                toast.success(`Welcome back, ${res.data.username || res.data.name}!`);
                navigate('/admin/dashboard');
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
            const res = await axios.post('/api/auth/register-oauth', {
                googleId: googleData.sub,
                email: googleData.email,
                name: googleData.name,
                picture: googleData.picture
            });

            if (res.data.token) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminUser', JSON.stringify(res.data));
                toast.success(`Welcome, ${res.data.name}!`);
                navigate('/admin/dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    // Floating particles for non-3D fallback
    const FloatingParticles = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.5 + 0.3
                    }}
                    animate={{
                        y: [null, Math.random() * -200 - 100],
                        x: [null, (Math.random() - 0.5) * 100],
                        opacity: [null, 0]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
            {/* 3D Background */}
            <Suspense fallback={
                <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
                    <FloatingParticles />
                </div>
            }>
                <ThreeBackground variant="login" />
            </Suspense>

            {/* Gradient overlays */}
            <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
            
            {/* Main content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Glassmorphism Card */}
                    <div className="relative">
                        {/* Glow effect behind card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
                        
                        <div className="relative backdrop-blur-xl bg-white/10 p-8 md:p-10 rounded-3xl border border-white/20 shadow-2xl">
                            {/* Logo/Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mb-8"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 3 }}
                                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
                                >
                                    <span className="text-3xl">🏆</span>
                                </motion.div>
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    Admin <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Portal</span>
                                </h1>
                                <p className="text-gray-400 mt-2 text-sm">VNIT Inter-Department Games</p>
                            </motion.div>

                            {/* Google Sign-In Button */}
                            {import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                             import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
                                <>
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-6"
                                    >
                                        <div id="google-signin-button" className="w-full flex justify-center"></div>
                                    </motion.div>

                                    {/* Divider */}
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-transparent text-gray-500 text-xs uppercase tracking-wider">or continue with</span>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            {/* Login Form */}
                            <motion.form 
                                onSubmit={handleSubmit} 
                                className="space-y-5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {/* Username Field */}
                                <div className="relative">
                                    <motion.label 
                                        animate={{ 
                                            color: focusedField === 'username' ? '#818cf8' : '#9ca3af',
                                            y: focusedField === 'username' ? -2 : 0
                                        }}
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors"
                                    >
                                        Username
                                    </motion.label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all duration-300"
                                            placeholder="Enter your username"
                                            required
                                        />
                                        <motion.div 
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="relative">
                                    <motion.label 
                                        animate={{ 
                                            color: focusedField === 'password' ? '#818cf8' : '#9ca3af',
                                            y: focusedField === 'password' ? -2 : 0
                                        }}
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors"
                                    >
                                        Password
                                    </motion.label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all duration-300"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <motion.div 
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className={`relative w-full py-4 rounded-xl text-white font-bold text-lg overflow-hidden group transition-all duration-300 ${
                                        loading
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30'
                                    }`}
                                >
                                    {/* Button shine effect */}
                                    {!loading && (
                                        <motion.div 
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                                        />
                                    )}
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <motion.span
                                                    initial={{ x: 0 }}
                                                    whileHover={{ x: 5 }}
                                                >
                                                    →
                                                </motion.span>
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            </motion.form>

                            {/* Security Badge */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Secured with JWT Authentication</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Back to Home Link */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 text-center"
                    >
                        <a 
                            href="/" 
                            className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group"
                        >
                            <motion.span whileHover={{ x: -3 }}>←</motion.span>
                            Back to Home
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
