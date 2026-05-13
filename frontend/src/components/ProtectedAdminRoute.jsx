import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * ProtectedAdminRoute
 * 
 * Wraps any admin-only page. On mount it queries Supabase (server side)
 * to confirm the currently authenticated user has role = 'admin'.
 * 
 * - Not logged in      → redirect to /  (login page)
 * - Logged in, not admin → show 403 Forbidden screen
 * - Logged in, admin   → render children
 */
const ProtectedAdminRoute = ({ children }) => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'admin' | 'forbidden' | 'unauthenticated'

    useEffect(() => {
        const verify = async () => {
            // 1. Check if a session exists
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setStatus('unauthenticated'); return; }

            // 2. Query the DB for role — never trust localStorage alone
            const { data: profile, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error || !profile) { setStatus('forbidden'); return; }

            if (profile.role === 'admin') {
                setStatus('admin');
            } else {
                setStatus('forbidden');
            }
        };
        verify();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#090b14' }}>
                <div className="text-center">
                    <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="text-white-50">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') return <Navigate to="/" replace />;

    if (status === 'forbidden') {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#090b14' }}>
                <div className="text-center px-4">
                    <div style={{ fontSize: '5rem' }}>🚫</div>
                    <h1 className="display-4 fw-bold text-danger mt-3">403</h1>
                    <h4 className="text-white mb-2">Access Forbidden</h4>
                    <p className="text-white-50 mb-4">
                        You do not have permission to view this page.<br />
                        This area is restricted to system administrators only.
                    </p>
                    <a href="/home"
                        className="btn px-4 py-2 fw-bold rounded-pill"
                        style={{ backgroundColor: '#05d9c6', color: '#000', border: 'none' }}>
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedAdminRoute;
