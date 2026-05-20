import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AdminBar from "./AdminBar";

const Header = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get previously read notification IDs from localStorage
        const readIds = JSON.parse(localStorage.getItem('readNotifIds') || '[]');

        const dynamicNotifications = [];
        let notifId = 1;

        dynamicNotifications.push({ id: 'welcome', message: "Welcome to the Elite Collector Circle!", time: "System", read: true });

        // Check for outbid status
        const { data: bids } = await supabase
          .from('bids')
          .select('auction_id, bid_amount, auctions (title, item_name, current_bid, status, end_time)')
          .eq('bidder_id', user.id)
          .order('bid_time', { ascending: false });
        
        const seenAuctions = new Set();
        (bids || []).forEach(bid => {
          if (!seenAuctions.has(bid.auction_id) && bid.auctions) {
            seenAuctions.add(bid.auction_id);
            const itemName = bid.auctions.item_name || bid.auctions.title;
            const isEnded = new Date(bid.auctions.end_time) < new Date() || bid.auctions.status === 'closed';
            const nid = `bid-${bid.auction_id}`;
            if (isEnded && bid.bid_amount >= bid.auctions.current_bid) {
              dynamicNotifications.push({ id: nid + '-won', message: `🏆 You WON the auction for '${itemName}'!`, time: "Ended", read: readIds.includes(nid + '-won') });
            } else if (!isEnded && bid.bid_amount < bid.auctions.current_bid) {
              dynamicNotifications.push({ id: nid + '-outbid', message: `You have been outbid on '${itemName}'!`, time: "Recent", read: readIds.includes(nid + '-outbid') });
            }
          }
        });

        // Check for approved/ended listings
        const { data: listings } = await supabase
          .from('auctions')
          .select('id, title, item_name, status')
          .eq('seller_id', user.id);
        
        (listings || []).forEach(listing => {
          const itemName = listing.item_name || listing.title;
          const nid = `listing-${listing.id}`;
          if (listing.status === 'active') {
            dynamicNotifications.push({ id: nid + '-approved', message: `✅ Listing approved: '${itemName}'`, time: "Recent", read: readIds.includes(nid + '-approved') });
          } else if (listing.status === 'closed') {
            dynamicNotifications.push({ id: nid + '-ended', message: `Your auction ended: '${itemName}'`, time: "Ended", read: readIds.includes(nid + '-ended') });
          } else if (listing.status === 'rejected') {
            dynamicNotifications.push({ id: nid + '-rejected', message: `❌ Listing rejected: '${itemName}'`, time: "Recent", read: readIds.includes(nid + '-rejected') });
          }
        });

        setNotifications(dynamicNotifications);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const existing = JSON.parse(localStorage.getItem('readNotifIds') || '[]');
    localStorage.setItem('readNotifIds', JSON.stringify([...new Set([...existing, ...allIds])]));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const userName = localStorage.getItem("userName") || "Guest";

  const handleLogout = async (e) => {
    e.stopPropagation(); 
    await supabase.auth.signOut();
    localStorage.removeItem("userName");
    navigate("/");
  };

  // Style for the active link
  const activeStyle = {
    color: "#4f46e5",
    opacity: "1",
    borderBottom: "2px solid #4f46e5",
  };

  return (
    <>
      <AdminBar />
      <header
      className="py-3 sticky-top"
      style={{
        backgroundColor: "rgba(14, 17, 33, 0.8)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="text-decoration-none">
          <h3 className="mb-0 text-white fw-bold">Collectors.net</h3>
        </Link>

        {/* NAVIGATION */}
        <nav className="d-none d-md-flex gap-4 mx-auto">
          <NavLink
            to="/home"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/market"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            Market
          </NavLink>
          <NavLink
            to="/bids"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            My Bids
          </NavLink>
          <NavLink
            to="/about"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            About
          </NavLink>
          <NavLink
            to="/history"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            History
          </NavLink>
        </nav>

        {/* NOTIFICATIONS & PROFILE */}
        <div className="d-flex align-items-center gap-3">
          
          {/* NOTIFICATION BELL */}
          <div className="position-relative">
            <button 
              className="btn btn-dark rounded-circle position-relative border-secondary d-flex align-items-center justify-content-center"
              style={{ width: '45px', height: '45px' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="bi bi-bell-fill text-white opacity-75"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (
              <div 
                className="position-absolute end-0 mt-2 bg-dark rounded-4 shadow-lg border border-secondary overflow-hidden"
                style={{ width: '320px', zIndex: 1050 }}
              >
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary" style={{ backgroundColor: '#161a2d' }}>
                  <h6 className="mb-0 text-white fw-bold">Notifications</h6>
                  {unreadCount > 0 && (
                    <button className="btn btn-link btn-sm text-info text-decoration-none p-0" onClick={handleMarkAllRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-white-50 small">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 border-bottom border-secondary ${!n.read ? 'bg-secondary bg-opacity-10' : ''}`} style={{ cursor: 'pointer' }}>
                        <div className="d-flex gap-2">
                          <div className={`mt-1 rounded-circle flex-shrink-0 ${!n.read ? 'bg-info' : 'bg-secondary'}`} style={{ width: '8px', height: '8px' }}></div>
                          <div>
                            <p className={`mb-1 small ${!n.read ? 'text-white fw-bold' : 'text-white-50'}`}>{n.message}</p>
                            <small className="text-white-50" style={{ fontSize: '0.7rem' }}>{n.time}</small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center" style={{ backgroundColor: '#161a2d' }}>
                  <button className="btn btn-link btn-sm text-white-50 text-decoration-none p-0">View All Settings</button>
                </div>
              </div>
            )}
          </div>

        {/* PROFILE SECTION */}
        <div
          className="d-flex align-items-center gap-3 p-2 rounded-4"
          style={{
            cursor: "pointer",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(5, 217, 198, 0.2)",
            transition: "0.3s ease",
            minWidth: "180px"
          }}
          onClick={() => navigate("/profile")}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(5, 217, 198, 0.1)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
          }
        >
          <div
            className="rounded-circle overflow-hidden shadow"
            style={{
              width: "45px",
              height: "45px",
              border: "2px solid #05d9c6",
              flexShrink: 0
            }}
          >
            <img
              src="https://placehold.co/400x400/05d9c6/000?text=U"
              alt="Profile"
              className="w-100 h-100 object-fit-cover"
            />
          </div>

          <div className="d-flex flex-column align-items-start justify-content-center overflow-hidden">
            <span
              className="text-white fw-bold text-uppercase text-truncate w-100"
              style={{ letterSpacing: "1px", fontSize: "0.85rem" }}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-link text-danger p-0 m-0 text-decoration-none fw-bold"
              style={{ fontSize: "0.75rem", transition: "0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#ff4d4d")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#dc3545")}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
