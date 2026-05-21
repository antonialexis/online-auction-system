import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AdminBar from "./AdminBar";

const Header = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationStorageKey, setNotificationStorageKey] = useState("readNotifIds");

  useEffect(() => {
    let active = true;
    let userChannel;
    let auctionChannel;
    let bidChannel;

    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        if (!user) {
          setNotifications([]);
          return;
        }

        const readKey = `readNotifIds:${user.id}`;
        setNotificationStorageKey(readKey);
        const readIds = JSON.parse(localStorage.getItem(readKey) || "[]");
        const dynamicNotifications = [];

        const { data: profile } = await supabase
          .from("users")
          .select("is_verified, verification_status")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.verification_status === "pending") {
          dynamicNotifications.push({
            id: "id-verification-pending",
            message: "Pending admin Verification, Please wait for 24 hours.",
            time: "ID review",
            read: readIds.includes("id-verification-pending"),
          });
        } else if (profile?.is_verified && profile?.verification_status === "approved") {
          dynamicNotifications.push({
            id: "id-verification-approved",
            message: "Your ID has been approved. Bidding and selling are now enabled.",
            time: "ID review",
            read: readIds.includes("id-verification-approved"),
          });
        } else if (profile?.verification_status === "rejected") {
          dynamicNotifications.push({
            id: "id-verification-rejected",
            message: "Your ID verification was rejected. Please contact admin support.",
            time: "ID review",
            read: readIds.includes("id-verification-rejected"),
          });
        }

        const { data: bids } = await supabase
          .from("bids")
          .select("auction_id, bid_amount, auctions (title, item_name, current_bid, status, end_time)")
          .eq("bidder_id", user.id)
          .order("bid_time", { ascending: false });

        const seenAuctions = new Set();
        (bids || []).forEach((bid) => {
          if (seenAuctions.has(bid.auction_id) || !bid.auctions) return;
          seenAuctions.add(bid.auction_id);

          const itemName = bid.auctions.item_name || bid.auctions.title || "auction";
          const isEnded = new Date(bid.auctions.end_time) < new Date() || bid.auctions.status === "closed";
          const idBase = `bid-${bid.auction_id}`;

          if (isEnded && Number(bid.bid_amount) >= Number(bid.auctions.current_bid)) {
            const id = `${idBase}-won`;
            dynamicNotifications.push({
              id,
              message: `You won the auction for "${itemName}".`,
              time: "Ended",
              read: readIds.includes(id),
            });
          } else if (!isEnded && Number(bid.bid_amount) < Number(bid.auctions.current_bid)) {
            const id = `${idBase}-outbid`;
            dynamicNotifications.push({
              id,
              message: `You have been outbid on "${itemName}".`,
              time: "Recent",
              read: readIds.includes(id),
            });
          }
        });

        const { data: listings } = await supabase
          .from("auctions")
          .select("id, title, item_name, status")
          .eq("seller_id", user.id);

        (listings || []).forEach((listing) => {
          const itemName = listing.item_name || listing.title || "listing";
          const idBase = `listing-${listing.id}`;
          const messages = {
            active: [`${idBase}-approved`, `Listing approved: "${itemName}".`, "Recent"],
            closed: [`${idBase}-ended`, `Your auction ended: "${itemName}".`, "Ended"],
            rejected: [`${idBase}-rejected`, `Listing rejected: "${itemName}".`, "Recent"],
          };

          const next = messages[listing.status];
          if (!next) return;

          dynamicNotifications.push({
            id: next[0],
            message: next[1],
            time: next[2],
            read: readIds.includes(next[0]),
          });
        });

        if (active) setNotifications(dynamicNotifications);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) return;

      userChannel = supabase
        .channel(`header-user-${user.id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${user.id}` }, fetchNotifications)
        .subscribe();

      auctionChannel = supabase
        .channel(`header-auctions-${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, fetchNotifications)
        .subscribe();

      bidChannel = supabase
        .channel(`header-bids-${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "bids", filter: `bidder_id=eq.${user.id}` }, fetchNotifications)
        .subscribe();
    };

    fetchNotifications();
    setupRealtime();

    return () => {
      active = false;
      if (userChannel) supabase.removeChannel(userChannel);
      if (auctionChannel) supabase.removeChannel(auctionChannel);
      if (bidChannel) supabase.removeChannel(bidChannel);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map((notification) => notification.id);
    const existing = JSON.parse(localStorage.getItem(notificationStorageKey) || "[]");
    localStorage.setItem(notificationStorageKey, JSON.stringify([...new Set([...existing, ...allIds])]));
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })));
  };

  const userName = localStorage.getItem("userName") || "Guest";

  const handleLogout = async (e) => {
    e.stopPropagation();
    await supabase.auth.signOut();
    localStorage.removeItem("userName");
    navigate("/");
  };

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

          <nav className="d-none d-md-flex gap-4 mx-auto">
            {[
              ["Home", "/home"],
              ["Market", "/market"],
              ["My Bids", "/bids"],
              ["About", "/about"],
              ["History", "/history"],
            ].map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className="text-white text-decoration-none fw-bold"
                style={({ isActive }) => (isActive ? activeStyle : { opacity: "0.7" })}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <button
                className="btn btn-dark rounded-circle position-relative border-secondary d-flex align-items-center justify-content-center"
                style={{ width: "45px", height: "45px" }}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <i className="bi bi-bell-fill text-white opacity-75"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="position-absolute end-0 mt-2 bg-dark rounded-4 shadow-lg border border-secondary overflow-hidden"
                  style={{ width: "320px", zIndex: 1050 }}
                >
                  <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary" style={{ backgroundColor: "#161a2d" }}>
                    <h6 className="mb-0 text-white fw-bold">Notifications</h6>
                    {unreadCount > 0 && (
                      <button className="btn btn-link btn-sm text-info text-decoration-none p-0" onClick={handleMarkAllRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: "300px" }}>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-white-50 small">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className={`p-3 border-bottom border-secondary ${!notification.read ? "bg-secondary bg-opacity-10" : ""}`}>
                          <div className="d-flex gap-2">
                            <div className={`mt-1 rounded-circle flex-shrink-0 ${!notification.read ? "bg-info" : "bg-secondary"}`} style={{ width: "8px", height: "8px" }}></div>
                            <div>
                              <p className={`mb-1 small ${!notification.read ? "text-white fw-bold" : "text-white-50"}`}>{notification.message}</p>
                              <small className="text-white-50" style={{ fontSize: "0.7rem" }}>{notification.time}</small>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className="d-flex align-items-center gap-3 p-2 rounded-4"
              style={{
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(5, 217, 198, 0.2)",
                transition: "0.3s ease",
                minWidth: "180px",
              }}
              onClick={() => navigate("/profile")}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(5, 217, 198, 0.1)")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
            >
              <div
                className="rounded-circle overflow-hidden shadow"
                style={{
                  width: "45px",
                  height: "45px",
                  border: "2px solid #05d9c6",
                  flexShrink: 0,
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
