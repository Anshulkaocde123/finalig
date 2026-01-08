import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('adminToken');

    console.log('🔒 ProtectedRoute check:', token ? '✅ Token exists' : '❌ No token');

    if (!token) {
        console.log('🚫 Redirecting to /auth/login - no token found');
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
