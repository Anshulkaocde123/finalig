import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

const ProtectedRoute = () => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid'

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setStatus('invalid');
            return;
        }

        // Validate token against the server
        api.get('/auth/me')
            .then(() => setStatus('valid'))
            .catch(() => {
                // Token expired or invalid — clear and redirect
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                setStatus('invalid');
            });
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'invalid') {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
