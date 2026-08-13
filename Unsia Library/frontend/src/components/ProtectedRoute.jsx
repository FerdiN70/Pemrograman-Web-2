import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    
    // Jika tidak ada token (belum login), lempar kembali ke halaman login
    if (!token) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}