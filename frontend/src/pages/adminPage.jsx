import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import ItemModal from '../components/itemModal';
import { supabase } from '../supabaseClient';

const AdminPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [auctions, setAuctions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, totalUsers: 0 });
    const [activeTab, setActiveTab] = useState('listings');
    const [listingFilter, setListingFilter] = useState('pending'); // 'pending' | 'active' | 'rejected'
    const [feedbackModal, setFeedbackModal] = useState(null); // { auctionId, text }
    const [selectedItem, setSelectedItem] = useState(null);
    const [userFilter, setUserFilter] = useState('all'); // 'all' | 'pending_id'
    const [idVerificationModal, setIdVerificationModal] = useState(null); // selected user

    // Sync tab from URL query param
    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab === 'users') setActiveTab('users');
        else if (tab === 'listings') { setActiveTab('listings'); }
        else setActiveTab('listings'); // default
        setSearchQuery('');
    }, [location.search]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: auctionsData, error: aErr } = await supabase
                .from('auctions')
                .select(`*, users!auctions_seller_id_fkey(first_name, last_name, email)`)
                .order('created_at', { ascending: false });
            if (aErr) throw aErr;

            const { data: usersData, error: uErr } = await supabase
                .from('users')
                .select('id, first_name, last_name, email, role, is_banned, created_at, phone, is_verified, verification_status, id_document_url')
                .order('created_at', { ascending: false });
            if (uErr) throw uErr;

            setAuctions(auctionsData || []);
            setUsers(usersData || []);

            const active = (auctionsData || []).filter(a => a.status === 'active').length;
            const pending = (auctionsData || []).filter(a => a.status === 'pending').length;
            setStats({ total: (auctionsData || []).length, active, pending, totalUsers: (usersData || []).length });
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── LISTING ACTIONS ───────────────────────────────────────────────────────

    const handleApprove = async (id) => {
        const { error } = await supabase
            .from('auctions')
            .update({ status: 'active', admin_feedback: null })
            .eq('id', id);
        if (error) return alert('Error: ' + error.message);
        fetchData();
    };

    const handleReject = async (id) => {
        const feedback = feedbackModal?.auctionId === id ? feedbackModal.text : '';
        const { error } = await supabase
            .from('auctions')
            .update({ status: 'rejected', admin_feedback: feedback || 'This listing was rejected by an admin.' })
            .eq('id', id);
        if (error) return alert('Error: ' + error.message);
        setFeedbackModal(null);
        fetchData();
    };

    const handleToggleLimited = async (id, currentLimited) => {
        const { error } = await supabase
            .from('auctions')
            .update({ is_limited: !currentLimited })
            .eq('id', id);
        if (error) return alert('Error toggling limited: ' + error.message);
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this listing?')) return;
        const { error } = await supabase.from('auctions').delete().eq('id', id);
        if (error) return alert('Error: ' + error.message);
        fetchData();
    };

    // ─── USER ACTIONS ──────────────────────────────────────────────────────────

    const handleToggleBan = async (userId, currentBanned) => {
        const action = currentBanned ? 'Unban' : 'Ban';
        if (!window.confirm(`${action} this user?`)) return;
        const { error } = await supabase
            .from('users')
            .update({ is_banned: !currentBanned })
            .eq('id', userId);
        if (error) return alert('Error: ' + error.message);
        fetchData();
    };

    const handleApproveId = async (userId) => {
        const { error } = await supabase.from('users').update({ is_verified: true, verification_status: 'approved' }).eq('id', userId);
        if (error) return alert('Error: ' + error.message);
        setIdVerificationModal(null);
        fetchData();
    };

    const handleRejectId = async (userId) => {
        const { error } = await supabase.from('users').update({ is_verified: false, verification_status: 'rejected' }).eq('id', userId);
        if (error) return alert('Error: ' + error.message);
        setIdVerificationModal(null);
        fetchData();
    };

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    const getStatusBadge = (status) => {
        const map = {
            active: ['bg-success', 'Active'],
            pending: ['bg-warning text-dark', 'Pending'],
            rejected: ['bg-danger', 'Rejected'],
            completed: ['bg-primary', 'Completed'],
            sold: ['bg-info text-dark', 'Sold'],
        };
        const [cls, label] = map[status] || ['bg-secondary', status];
        return <span className={`badge ${cls}`}>{label}</span>;
    };

    const getRoleBadge = (role, isBanned) => {
        if (isBanned) return <span className="badge bg-danger">Banned</span>;
        if (role === 'admin') return <span className="badge" style={{ backgroundColor: 'rgba(96,165,250,0.2)', color: '#60a5fa', border: '1px solid #60a5fa' }}>Admin</span>;
        if (role === 'seller') return <span className="badge bg-warning text-dark">Seller</span>;
        return <span className="badge bg-secondary">Buyer</span>;
    };

    const filteredAuctions = auctions
        .filter(a => a.status === listingFilter)
        .filter(a =>
            (a.item_name || a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.users?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

    const filteredUsers = users.filter(u =>
        (`${u.first_name} ${u.last_name}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).filter(u => userFilter === 'all' || (userFilter === 'pending_id' && u.verification_status === 'pending'));

    const pendingCount = auctions.filter(a => a.status === 'pending').length;
    const pendingUserCount = users.filter(u => u.verification_status === 'pending').length;

    return (
        <div className="min-vh-100 text-white pb-5" style={{ backgroundColor: '#080d1a' }}>
            <AdminHeader />

            <div className="container-fluid px-4 py-4">

                {/* PAGE TITLE */}
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <p className="mb-1 fw-semibold text-uppercase" style={{ color: '#60a5fa', fontSize: '0.75rem', letterSpacing: '2px' }}>Control Panel</p>
                        <h2 className="fw-bold mb-0 text-white">Marketplace Dashboard</h2>
                    </div>
                    <button
                        className="btn btn-sm px-4 py-2 fw-bold rounded-3"
                        style={{ backgroundColor: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}
                        onClick={fetchData}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                    </button>
                </div>

                {/* STATS */}
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Listings', value: stats.total, icon: 'bi-grid', color: '#60a5fa' },
                        { label: 'Active Listings', value: stats.active, icon: 'bi-lightning-charge', color: '#34d399' },
                        { label: 'Pending Approval', value: stats.pending, icon: 'bi-hourglass-split', color: '#fbbf24', alert: stats.pending > 0 },
                        { label: 'Registered Users', value: stats.totalUsers, icon: 'bi-people', color: '#a78bfa' },
                    ].map(({ label, value, icon, color, alert }) => (
                        <div className="col-md-3 col-sm-6" key={label}>
                            <div className="p-4 rounded-4 h-100 d-flex align-items-center gap-3"
                                style={{
                                    backgroundColor: '#0f172a',
                                    border: alert ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.05)'
                                }}>
                                <div className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', backgroundColor: `${color}20`, color, flexShrink: 0, fontSize: '1.4rem' }}>
                                    <i className={`bi ${icon}`}></i>
                                </div>
                                <div>
                                    <p className="text-white-50 small mb-0">{label}</p>
                                    <h3 className="fw-bold mb-0 text-white">{loading ? '—' : value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MAIN TABS */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="d-flex gap-2">
                        <button
                            onClick={() => { navigate('/admin?tab=listings'); setSearchQuery(''); }}
                            className="btn btn-sm fw-bold px-4 py-2 rounded-pill"
                            style={activeTab === 'listings'
                                ? { backgroundColor: '#60a5fa', color: '#000', border: 'none' }
                                : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
                            }
                        >
                            <i className="bi bi-tag me-2"></i>Listings
                            {pendingCount > 0 && (
                                <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>{pendingCount}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { navigate('/admin?tab=users'); setSearchQuery(''); }}
                            className="btn btn-sm fw-bold px-4 py-2 rounded-pill"
                            style={activeTab === 'users'
                                ? { backgroundColor: '#60a5fa', color: '#000', border: 'none' }
                                : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
                            }
                        >
                            <i className="bi bi-people me-2"></i>User Management
                            {pendingUserCount > 0 && (
                                <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>{pendingUserCount}</span>
                            )}
                        </button>
                    </div>
                    <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
                        <span className="input-group-text border-secondary text-white-50" style={{ backgroundColor: '#0f172a' }}>
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-secondary text-white"
                            style={{ backgroundColor: '#0f172a' }}
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── LISTINGS TAB ─────────────────────────────────────────────── */}
                {activeTab === 'listings' && (
                    <>
                        {/* Listing status filter pills */}
                        <div className="d-flex gap-2 mb-3">
                            {[
                                { key: 'pending', label: 'Pending Review', color: '#fbbf24' },
                                { key: 'active', label: 'Active', color: '#34d399' },
                                { key: 'rejected', label: 'Rejected', color: '#f87171' },
                            ].map(({ key, label, color }) => (
                                <button
                                    key={key}
                                    onClick={() => { setListingFilter(key); setSearchQuery(''); }}
                                    className="btn btn-sm px-3 py-1 rounded-pill fw-semibold"
                                    style={listingFilter === key
                                        ? { backgroundColor: color, color: '#000', border: 'none' }
                                        : { backgroundColor: 'transparent', border: `1px solid ${color}50`, color }
                                    }
                                >
                                    {label}
                                    <span className="ms-2 opacity-75" style={{ fontSize: '0.7rem' }}>
                                        ({auctions.filter(a => a.status === key).length})
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="rounded-4 overflow-hidden" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle"
                                    style={{ '--bs-table-bg': 'transparent', '--bs-table-hover-bg': 'rgba(96,165,250,0.04)', color: '#e2e8f0' }}>
                                    <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <tr>
                                            <th className="px-4 py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Item</th>
                                            <th className="py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Seller</th>
                                            <th className="py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Price</th>
                                            <th className="py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Date</th>
                                            <th className="px-4 py-3 text-white-50 small fw-semibold text-uppercase text-end" style={{ letterSpacing: '1px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderTop: 'none' }}>
                                        {loading ? (
                                            <tr><td colSpan="5" className="text-center py-5 text-white-50">
                                                <div className="spinner-border spinner-border-sm me-2 text-info"></div>Loading...
                                            </td></tr>
                                        ) : filteredAuctions.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-5">
                                                <div style={{ fontSize: '2rem' }}>
                                                    {listingFilter === 'pending' ? '✅' : '📭'}
                                                </div>
                                                <p className="text-white-50 mt-2 mb-0">
                                                    {listingFilter === 'pending' ? 'No pending listings — all caught up!' : `No ${listingFilter} listings.`}
                                                </p>
                                            </td></tr>
                                        ) : filteredAuctions.map(auction => (
                                            <tr key={auction.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-3 overflow-hidden" style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                                                            <img
                                                                src={auction.image_url || 'https://placehold.co/80x80/0f172a/60a5fa?text=?'}
                                                                alt="" className="w-100 h-100 object-fit-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 fw-semibold text-white">{auction.item_name || auction.title || '—'}</p>
                                                            <small className="text-white-50">{auction.category || 'Uncategorized'}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <p className="mb-0 text-white small">{auction.users?.first_name} {auction.users?.last_name}</p>
                                                    <small className="text-white-50">{auction.users?.email}</small>
                                                </td>
                                                <td className="py-3 fw-bold" style={{ color: '#60a5fa' }}>
                                                    ${auction.starting_price ?? auction.starting_bid}
                                                </td>
                                                <td className="py-3 text-white-50 small">
                                                    {new Date(auction.created_at).toLocaleDateString()}
                                                    {auction.admin_feedback && (
                                                        <div className="mt-1">
                                                            <small className="text-danger">
                                                                <i className="bi bi-chat-left-text me-1"></i>
                                                                {auction.admin_feedback}
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                                                        <button
                                                            onClick={() => handleToggleLimited(auction.id, auction.is_limited)}
                                                            className={`btn btn-sm me-2 rounded-circle`}
                                                            style={{
                                                                width: '32px', height: '32px', padding: 0,
                                                                color: auction.is_limited ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                                                                backgroundColor: auction.is_limited ? 'rgba(251,191,36,0.1)' : 'transparent',
                                                                border: auction.is_limited ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)'
                                                            }}
                                                            title={auction.is_limited ? 'Remove from Limited' : 'Mark as Limited'}
                                                        >
                                                            <i className={`bi bi-star${auction.is_limited ? '-fill' : ''}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedItem(auction)}
                                                            className="btn btn-sm btn-outline-info me-2 rounded-3 px-3 fw-bold"
                                                        >
                                                            View
                                                        </button>
                                                        {listingFilter === 'pending' && (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm fw-bold px-3 rounded-3"
                                                                    style={{ backgroundColor: '#34d399', color: '#000', border: 'none' }}
                                                                    onClick={() => handleApprove(auction.id)}
                                                                >
                                                                    <i className="bi bi-check-lg me-1"></i>Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger fw-bold px-3 rounded-3"
                                                                    onClick={() => setFeedbackModal({ auctionId: auction.id, text: '' })}
                                                                >
                                                                    <i className="bi bi-x-lg me-1"></i>Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {listingFilter === 'rejected' && (
                                                            <button
                                                                className="btn btn-sm fw-bold px-3 rounded-3"
                                                                style={{ backgroundColor: '#34d399', color: '#000', border: 'none' }}
                                                                onClick={() => handleApprove(auction.id)}
                                                            >
                                                                <i className="bi bi-arrow-counterclockwise me-1"></i>Re-Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary border-0 rounded-3"
                                                            title="Delete permanently"
                                                            onClick={() => handleDelete(auction.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── USERS TAB ─────────────────────────────────────────────────── */}
                {activeTab === 'users' && (
                    <>
                        <div className="d-flex gap-2 mb-3">
                            {[
                                { key: 'all', label: 'All Users', color: '#60a5fa' },
                                { key: 'pending_id', label: 'Pending ID Verification', color: '#fbbf24' },
                            ].map(({ key, label, color }) => (
                                <button
                                    key={key}
                                    onClick={() => { setUserFilter(key); setSearchQuery(''); }}
                                    className="btn btn-sm px-3 py-1 rounded-pill fw-semibold"
                                    style={userFilter === key
                                        ? { backgroundColor: color, color: '#000', border: 'none' }
                                        : { backgroundColor: 'transparent', border: `1px solid ${color}50`, color }
                                    }
                                >
                                    {label}
                                    <span className="ms-2 opacity-75" style={{ fontSize: '0.7rem' }}>
                                        ({key === 'all' ? users.length : pendingUserCount})
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="rounded-4 overflow-hidden" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle"
                                    style={{ '--bs-table-bg': 'transparent', '--bs-table-hover-bg': 'rgba(96,165,250,0.04)', color: '#e2e8f0' }}>
                                    <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <tr>
                                            <th className="px-4 py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>User</th>
                                            <th className="py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Email</th>
                                            <th className="py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Status</th>
                                            <th className="py-3 text-white-50 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Joined</th>
                                            <th className="px-4 py-3 text-white-50 small fw-semibold text-uppercase text-end" style={{ letterSpacing: '1px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderTop: 'none' }}>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-white-50">
                                                    <div className="spinner-border spinner-border-sm me-2 text-info"></div>Loading...
                                                </td>
                                            </tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-white-50">No users found.</td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <tr key={user.id} style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                    opacity: user.is_banned ? 0.6 : 1
                                                }}>
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                                style={{ width: '38px', height: '38px', backgroundColor: 'rgba(96,165,250,0.15)', color: '#60a5fa', flexShrink: 0 }}>
                                                                {user.first_name?.[0]?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="fw-semibold text-white d-block">{user.first_name} {user.last_name}</span>
                                                                {getRoleBadge(user.role, user.is_banned)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-white-50 small">{user.email}</td>
                                                    <td className="py-3">
                                                        {user.is_verified ? (
                                                            <span className="badge bg-success"><i className="bi bi-shield-check me-1"></i>Verified</span>
                                                        ) : user.verification_status === 'pending' ? (
                                                            <span className="badge bg-warning text-dark">Pending ID</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Unverified</span>
                                                        )}
                                                        {user.is_banned && <span className="badge bg-danger ms-2">Banned</span>}
                                                    </td>
                                                    <td className="py-3 text-white-50 small">{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-end">
                                                        <div className="d-flex gap-2 justify-content-end flex-wrap">
                                                            {user.verification_status === 'pending' && user.id_document_url && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-info fw-bold px-3 rounded-3"
                                                                    onClick={() => setIdVerificationModal(user)}
                                                                >
                                                                    <i className="bi bi-person-vcard me-1"></i>Review ID
                                                                </button>
                                                            )}
                                                            {user.role !== 'admin' && (
                                                                <button
                                                                    className={`btn btn-sm fw-bold px-3 rounded-3 ${user.is_banned ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                                                    onClick={() => handleToggleBan(user.id, user.is_banned)}
                                                                >
                                                                    {user.is_banned
                                                                        ? <><i className="bi bi-unlock me-1"></i>Unban</>
                                                                        : <><i className="bi bi-ban me-1"></i>Ban</>
                                                                    }
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── REJECT FEEDBACK MODAL ────────────────────────────────────────── */}
                {feedbackModal && (
                    <div className="modal d-flex align-items-center justify-content-center"
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
                        <div className="rounded-4 p-4 shadow-lg" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(96,165,250,0.2)', maxWidth: '450px', width: '90%' }}>
                            <h5 className="text-white fw-bold mb-1">Reject Listing</h5>
                            <p className="text-white-50 small mb-3">Optionally provide feedback so the seller can improve and resubmit.</p>
                            <textarea
                                className="form-control bg-dark border-secondary text-white mb-3"
                                rows="4"
                                placeholder="e.g. Image quality is too low, please upload a clearer photo..."
                                value={feedbackModal.text || ''}
                                onChange={e => setFeedbackModal({ ...feedbackModal, text: e.target.value })}
                            ></textarea>
                            <div className="d-flex gap-2 justify-content-end">
                                <button className="btn btn-outline-secondary" onClick={() => setFeedbackModal(null)}>Cancel</button>
                                <button
                                    className="btn btn-danger fw-bold px-4"
                                    onClick={() => {
                                        handleReject(feedbackModal.auctionId);
                                        setFeedbackModal(null);
                                    }}
                                >
                                    <i className="bi bi-x-lg me-1"></i>Reject Listing
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── ID VERIFICATION MODAL ────────────────────────────────────────── */}
                {idVerificationModal && (
                    <div className="modal d-flex align-items-center justify-content-center"
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
                        <div className="rounded-4 p-4 shadow-lg" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(96,165,250,0.2)', maxWidth: '600px', width: '90%' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="text-white fw-bold mb-0">Verify User ID</h5>
                                <button className="btn-close btn-close-white shadow-none" onClick={() => setIdVerificationModal(null)}></button>
                            </div>
                            <p className="text-white-50 small mb-3">
                                Review the ID document submitted by <span className="text-info fw-bold">{idVerificationModal.first_name} {idVerificationModal.last_name}</span>.
                            </p>

                            <div className="bg-dark rounded-3 overflow-hidden mb-4 d-flex align-items-center justify-content-center" style={{ minHeight: '300px', maxHeight: '500px' }}>
                                <img src={idVerificationModal.id_document_url} alt="ID Document" className="img-fluid object-fit-contain" style={{ maxHeight: '500px' }} />
                            </div>

                            <div className="d-flex gap-2 justify-content-end">
                                <button className="btn btn-outline-secondary" onClick={() => setIdVerificationModal(null)}>Cancel</button>
                                <button
                                    className="btn btn-danger fw-bold px-4"
                                    onClick={() => {
                                        handleRejectId(idVerificationModal.id);
                                        setIdVerificationModal(null);
                                    }}
                                >
                                    <i className="bi bi-x-lg me-1"></i>Reject
                                </button>
                                <button
                                    className="btn btn-success fw-bold px-4"
                                    onClick={() => {
                                        handleApproveId(idVerificationModal.id);
                                        setIdVerificationModal(null);
                                    }}
                                >
                                    <i className="bi bi-check-lg me-1"></i>Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedItem && (
                    <ItemModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onBidSuccess={fetchData}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminPage;