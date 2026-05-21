import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AdminBar
 * A thin sticky bar that appears at the very top of every user-facing page
 * when the logged-in user has the admin role. Inspired by WordPress/Shopify.
 * It does NOT replace the regular header — it sits above it.
 */
const AdminBar = () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') return null;

    return (
        <div
            className="d-flex align-items-center justify-content-between px-3 py-1"
            style={{
                backgroundColor: '#0f172a',
                borderBottom: '1px solid rgba(96,165,250,0.3)',
                fontSize: '0.75rem',
                zIndex: 2000,
                position: 'sticky',
                top: 0,
            }}
        >
            <span style={{ color: '#60a5fa' }}>
                <i className="bi bi-shield-lock-fill me-2"></i>
                <span className="fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Admin Mode</span>
                <span className="text-white-50 ms-2">— You are viewing the public site as an admin.</span>
            </span>

            <Link
                to="/admin"
                className="btn btn-sm fw-bold px-3 py-0 rounded-pill"
                style={{
                    backgroundColor: 'rgba(96,165,250,0.15)',
                    border: '1px solid rgba(96,165,250,0.5)',
                    color: '#60a5fa',
                    fontSize: '0.72rem',
                    lineHeight: '1.8',
                    textDecoration: 'none',
                }}
            >
                <i className="bi bi-speedometer2 me-1"></i>
                Go to Dashboard
            </Link>
        </div>
    );
};

export default AdminBar;
