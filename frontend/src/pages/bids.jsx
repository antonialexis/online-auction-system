import React, { useState, useEffect } from "react";
import Header from "../components/header"; 
import { supabase } from "../supabaseClient";

const Bids = () => {
  const [activeTab, setActiveTab] = useState("bidding");
  const [activeBids, setActiveBids] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 1. Fetch user's active bids
      // We get the latest bid for each auction the user has participated in
      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          bid_amount,
          bid_time,
          auctions (
            id,
            title,
            current_bid,
            status,
            image_url
          )
        `)
        .eq('bidder_id', user.id)
        .order('bid_time', { ascending: false });

      if (bidsError) console.error("Error fetching bids:", bidsError);
      
      // Filter to keep only the latest bid per auction
      const uniqueBids = [];
      const seenAuctions = new Set();
      if (bids) {
        for (const b of bids) {
          if (!seenAuctions.has(b.auctions.id)) {
            uniqueBids.push(b);
            seenAuctions.add(b.auctions.id);
          }
        }
      }
      setActiveBids(uniqueBids);

      // 2. Fetch user's listings
      const { data: listings, error: listingsError } = await supabase
        .from('auctions')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) console.error("Error fetching listings:", listingsError);
      setMyListings(listings || []);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div
      className="dark-theme min-vh-100 pb-5"
      style={{ backgroundColor: "#0e1121" }}
    >
      <Header />

      <div className="container py-5">
        <div className="row g-4">
          {/* SIDEBAR NAVIGATION */}
          <div className="col-lg-3">
            <div
              className="card border-0 rounded-4 p-3 shadow"
              style={{ backgroundColor: "#161a2d" }}
            >
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{
                    width: "80px",
                    height: "80px",
                    fontSize: "24px",
                    color: "white",
                  }}
                >
                  {user?.email?.substring(0, 2).toUpperCase() || "JD"}
                </div>
                <h5 className="text-white fw-bold mb-0">{localStorage.getItem("userName") || "User"}</h5>
              </div>

              <div className="d-grid gap-2">
                <button
                  onClick={() => setActiveTab("bidding")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "bidding" ? "btn-primary shadow" : "text-white-50"}`}
                  style={
                    activeTab === "bidding"
                      ? { backgroundColor: "#4f46e5" }
                      : {}
                  }
                >
                  <i className="bi bi-hammer me-2"></i> Active Bids
                </button>
                <button
                  onClick={() => setActiveTab("selling")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "selling" ? "btn-primary shadow" : "text-white-50"}`}
                  style={
                    activeTab === "selling"
                      ? { backgroundColor: "#4f46e5" }
                      : {}
                  }
                >
                  <i className="bi bi-tags me-2"></i> My Listings
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="col-lg-9 text-white">
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : activeTab === "bidding" ? (
              <div className="animate__animated animate__fadeIn">
                <h3 className="fw-bold mb-4">Active Bids</h3>
                <div
                  className="table-responsive rounded-4 shadow"
                  style={{ backgroundColor: "#161a2d" }}
                >
                  <table className="table table-dark table-hover mb-0">
                    <thead>
                      <tr className="text-white-50">
                        <th className="ps-4 py-3 border-secondary">Item</th>
                        <th className="py-3 border-secondary">Current Bid</th>
                        <th className="py-3 border-secondary">Your Bid</th>
                        <th className="py-3 border-secondary">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBids.length > 0 ? activeBids.map((bid, idx) => (
                        <tr className="align-middle border-secondary" key={idx}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-3 py-2">
                              <img
                                src={bid.auctions.image_url || "https://placehold.co/50x50/png?text=Item"}
                                className="rounded-2 shadow-sm"
                                alt=""
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                              <span className="small fw-bold">
                                {bid.auctions.title}
                              </span>
                            </div>
                          </td>
                          <td>${bid.auctions.current_bid?.toLocaleString()}</td>
                          <td className={`${bid.bid_amount >= bid.auctions.current_bid ? 'text-success' : 'text-danger'} fw-bold`}>
                            ${bid.bid_amount?.toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${bid.bid_amount >= bid.auctions.current_bid ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                              {bid.bid_amount >= bid.auctions.current_bid ? 'Winning' : 'Outbid'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-white-50">No active bids found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold mb-0">My Listings</h3>
                  <a
                    href="/create-auction"
                    className="btn btn-primary fw-bold px-4 rounded-3 shadow text-decoration-none"
                    style={{ backgroundColor: "#4f46e5", border: "none" }}
                  >
                    + Post New Item
                  </a>
                </div>
                
                {myListings.length > 0 ? (
                  <div className="table-responsive rounded-4 shadow" style={{ backgroundColor: "#161a2d" }}>
                    <table className="table table-dark table-hover mb-0">
                      <thead>
                        <tr className="text-white-50">
                          <th className="ps-4 py-3 border-secondary">Item</th>
                          <th className="py-3 border-secondary">Current Bid</th>
                          <th className="py-3 border-secondary">Status</th>
                          <th className="py-3 border-secondary">End Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myListings.map((item, idx) => (
                          <tr className="align-middle border-secondary" key={idx}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-3 py-2">
                                <img
                                  src={item.image_url || "https://placehold.co/50x50/png?text=Item"}
                                  className="rounded-2 shadow-sm"
                                  alt=""
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <span className="small fw-bold">{item.title}</span>
                              </div>
                            </td>
                            <td>${item.current_bid?.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${item.status === 'active' ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="small text-white-50">
                              {new Date(item.end_time).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    className="p-5 text-center rounded-4 shadow"
                    style={{
                      backgroundColor: "#161a2d",
                      border: "2px dashed rgba(255,255,255,0.1)",
                    }}
                  >
                    <i className="bi bi-box-seam display-4 text-white-50 mb-3 d-block"></i>
                    <p className="text-white-50">
                      You haven't listed any items for auction yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bids;
