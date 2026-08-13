import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Rute Publik */}
                <Route path="/" element={<Login />} />

                {/* Rute yang Dilindungi (Protected Route) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Halaman Not Found untuk URL yang salah */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}