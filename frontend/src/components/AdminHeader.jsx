import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

    const handleLogout = async (e) => {
        e.stopPropagation();
        await supabase.auth.signOut();
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const adminName = localStorage.getItem('userName') || 'Admin';

    const navLinkStyle = (tab) => ({
        cursor: 'pointer',
        letterSpacing: '0.5px',
        color: currentTab === tab ? '#ffffff' : 'rgba(255,255,255,0.5)',
        borderBottom: currentTab === tab ? '2px solid #60a5fa' : '2px solid transparent',
        paddingBottom: '2px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        transition: '0.2s',
    });

    return (
        <header
            className="py-3 sticky-top"
            style={{
                backgroundColor: '#0f172a',
                borderBottom: '1px solid rgba(96, 165, 250, 0.25)',
                backdropFilter: 'blur(6px)',
                zIndex: 1030,
            }}
        >
            <div className="container d-flex align-items-center justify-content-between">

                {/* BRAND + BADGE */}
                <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-white fs-5" style={{ letterSpacing: '0.5px' }}>
                        Collectors.net
                    </span>
                    <span
                        className="badge fw-semibold px-3 py-1 rounded-pill"
                        style={{
                            backgroundColor: 'rgba(96, 165, 250, 0.15)',
                            border: '1px solid rgba(96, 165, 250, 0.5)',
                            color: '#60a5fa',
                            fontSize: '0.7rem',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                        }}
                    >
                        ⚙ System Admin
                    </span>
                </div>

                {/* ADMIN NAVIGATION */}
                <nav className="d-none d-md-flex gap-4">
                    <Link
                        to="/admin"
                        style={navLinkStyle('dashboard')}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin?tab=listings"
                        style={navLinkStyle('listings')}
                    >
                        Listings
                    </Link>
                    <Link
                        to="/admin?tab=users"
                        style={navLinkStyle('users')}
                    >
                        Users
                    </Link>
                    <Link
                        to="/home"
                        className="text-white-50 text-decoration-none fw-bold small text-uppercase"
                        style={{ letterSpacing: '0.5px' }}
                    >
                        ← User View
                    </Link>
                </nav>

                {/* ADMIN PROFILE */}
                <div
                    className="d-flex align-items-center gap-3 px-3 py-2 rounded-3"
                    style={{
                        backgroundColor: 'rgba(96, 165, 250, 0.08)',
                        border: '1px solid rgba(96, 165, 250, 0.2)',
                    }}
                >
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: 'rgba(96, 165, 250, 0.2)',
                            border: '2px solid #60a5fa',
                            color: '#60a5fa',
                            fontSize: '0.85rem',
                            flexShrink: 0,
                        }}
                    >
                        {adminName[0]?.toUpperCase()}
                    </div>
                    <div className="d-flex flex-column">
                        <span className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>
                            {adminName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-link p-0 m-0 text-decoration-none text-danger fw-bold text-start"
                            style={{ fontSize: '0.7rem' }}
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default AdminHeader;
