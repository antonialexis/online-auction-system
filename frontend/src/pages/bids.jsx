import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header"; 
import { supabase } from "../supabaseClient";

const Bids = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bidding");
  const [bids, setBids] = useState([]);
  const [listings, setListings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);
      setLoading(true);

      try {
        // Fetch User Bids
        const { data: bidsData } = await supabase
          .from('bids')
          .select(`
            *,
            auctions (*)
          `)
          .eq('bidder_id', user.id)
          .order('bid_time', { ascending: false });
        
        // Group by auction to show unique items in active bids
        const uniqueBids = [];
        const seenAuctions = new Set();
        (bidsData || []).forEach(bid => {
          if (!seenAuctions.has(bid.auction_id)) {
            uniqueBids.push(bid);
            seenAuctions.add(bid.auction_id);
          }
        });
        setBids(uniqueBids);

        // Fetch User Listings
        const { data: listingsData } = await supabase
          .from('auctions')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        setListings(listingsData || []);

        // Fetch Watchlist
        const { data: watchlistData } = await supabase
          .from('watchlist')
          .select(`
            *,
            auctions (*)
          `)
          .eq('user_id', user.id);
        setWatchlist(watchlistData || []);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAction = (auctionId) => {
    navigate(`/market?id=${auctionId}`);
  };

  return (
    <div className="dark-theme min-vh-100 pb-5" style={{ backgroundColor: "#0e1121" }}>
      <Header />

      <div className="container py-5">
        <div className="row g-4">
          {/* SIDEBAR NAVIGATION */}
          <div className="col-lg-3">
            <div className="card border-0 rounded-4 p-3 shadow" style={{ backgroundColor: "#161a2d" }}>
              <div className="text-center mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{
                    width: "80px",
                    height: "80px",
                    fontSize: "24px",
                    color: "white",
                    backgroundColor: "#4f46e5"
                  }}
                >
                  {user?.user_metadata?.first_name?.[0] || localStorage.getItem('userName')?.[0] || 'U'}
                </div>
                <h5 className="text-white fw-bold mb-0">
                  {user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : (localStorage.getItem('userName') || 'User')}
                </h5>
                <p className="text-white-50 small">Verified Collector</p>
              </div>

              <div className="d-grid gap-2">
                <button
                  onClick={() => setActiveTab("bidding")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "bidding" ? "btn-primary shadow" : "text-white-50"}`}
                  style={activeTab === "bidding" ? { backgroundColor: "#4f46e5" } : {}}
                >
                  <i className="bi bi-hammer me-2"></i> Active Bids
                </button>
                <button
                  onClick={() => setActiveTab("selling")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "selling" ? "btn-primary shadow" : "text-white-50"}`}
                  style={activeTab === "selling" ? { backgroundColor: "#4f46e5" } : {}}
                >
                  <i className="bi bi-tags me-2"></i> My Listings
                </button>
                <button 
                  onClick={() => setActiveTab("watchlist")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "watchlist" ? "btn-primary shadow" : "text-white-50"}`}
                  style={activeTab === "watchlist" ? { backgroundColor: "#4f46e5" } : {}}
                >
                  <i className="bi bi-heart me-2"></i> Watchlist
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="col-lg-9 text-white">
            {loading ? (
              <div className="text-center py-5 text-white-50">Loading your data...</div>
            ) : (
              <>
                {activeTab === "bidding" && (
                  <div className="animate__animated animate__fadeIn">
                    <h3 className="fw-bold mb-4">Active Bids</h3>
                    {bids.length === 0 ? (
                      <div className="p-5 text-center rounded-4 shadow" style={{ backgroundColor: "#161a2d", border: "2px dashed rgba(255,255,255,0.1)" }}>
                        <i className="bi bi-hammer display-4 text-white-25 mb-3 d-block"></i>
                        <p className="text-white-50">You haven't placed any bids yet.</p>
                        <button className="btn btn-outline-info rounded-pill px-4 mt-2" onClick={() => navigate('/market')}>Go to Market</button>
                      </div>
                    ) : (
                      <div className="table-responsive rounded-4 shadow" style={{ backgroundColor: "#161a2d" }}>
                        <table className="table table-dark table-hover mb-0">
                          <thead>
                            <tr className="text-white-50">
                              <th className="ps-4 py-3 border-secondary small text-uppercase">Item</th>
                              <th className="py-3 border-secondary small text-uppercase">Current Bid</th>
                              <th className="py-3 border-secondary small text-uppercase">Your Bid</th>
                              <th className="py-3 border-secondary small text-uppercase">Status</th>
                              <th className="pe-4 py-3 text-end border-secondary small text-uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bids.map((bid) => (
                              <tr key={bid.id} className="align-middle border-secondary">
                                <td className="ps-4">
                                  <div className="d-flex align-items-center gap-3 py-2">
                                    <img 
                                      src={bid.auctions?.image_url || 'https://placehold.co/50x50/png?text=Item'} 
                                      className="rounded-2 shadow-sm object-fit-cover" 
                                      style={{ width: '45px', height: '45px' }}
                                      alt="" 
                                    />
                                    <span className="small fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                                      {bid.auctions?.item_name || bid.auctions?.title}
                                    </span>
                                  </div>
                                </td>
                                <td>${bid.auctions?.current_bid?.toLocaleString()}</td>
                                <td className={`${bid.bid_amount >= bid.auctions?.current_bid ? 'text-success' : 'text-danger'} fw-bold`}>
                                  ${bid.bid_amount.toLocaleString()}
                                </td>
                                <td>
                                  {(() => {
                                    const auction = bid.auctions;
                                    const isEnded = !auction || new Date(auction.end_time) < new Date() || auction.status === 'closed';
                                    const isHighestBidder = bid.bid_amount >= (auction?.current_bid ?? 0);
                                    if (isEnded) {
                                      return isHighestBidder
                                        ? <span className="badge rounded-pill px-3" style={{ backgroundColor: '#fbbf24', color: '#000' }}>🏆 Item Won</span>
                                        : <span className="badge bg-secondary rounded-pill px-3">Auction Ended</span>;
                                    }
                                    return isHighestBidder
                                      ? <span className="badge bg-success rounded-pill px-3">Winning</span>
                                      : <span className="badge bg-danger rounded-pill px-3">Outbid</span>;
                                  })()}
                                </td>
                                <td className="pe-4 text-end">
                                  {(() => {
                                    const auction = bid.auctions;
                                    const isEnded = !auction || new Date(auction.end_time) < new Date() || auction.status === 'closed';
                                    const isHighestBidder = bid.bid_amount >= (auction?.current_bid ?? 0);
                                    if (isEnded) {
                                      return isHighestBidder
                                        ? <span className="text-warning small fw-bold"><i className="bi bi-trophy-fill me-1"></i>Congratulations!</span>
                                        : <span className="text-white-50 small">Auction closed</span>;
                                    }
                                    return (
                                      <button 
                                        className="btn btn-sm btn-outline-info rounded-pill px-3"
                                        onClick={() => handleAction(bid.auction_id)}
                                      >
                                        {isHighestBidder ? 'View' : 'Bid Again'}
                                      </button>
                                    );
                                  })()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "selling" && (
                  <div className="animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="fw-bold mb-0">My Listings</h3>
                      <button
                        className="btn btn-primary fw-bold px-4 rounded-3 shadow"
                        style={{ backgroundColor: "#4f46e5", border: "none" }}
                        onClick={() => navigate('/create-auction')}
                      >
                        + Post New Item
                      </button>
                    </div>
                    {listings.length === 0 ? (
                      <div className="p-5 text-center rounded-4 shadow" style={{ backgroundColor: "#161a2d", border: "2px dashed rgba(255,255,255,0.1)" }}>
                        <i className="bi bi-box-seam display-4 text-white-50 mb-3 d-block"></i>
                        <p className="text-white-50">You haven't listed any items for auction yet.</p>
                      </div>
                    ) : (
                      <div className="row row-cols-1 row-cols-md-2 g-3">
                        {listings.map(item => (
                          <div className="col" key={item.id}>
                            <div className="card h-100 border-0 rounded-4 shadow-sm" style={{ backgroundColor: '#161a2d' }}>
                              <div className="row g-0">
                                <div className="col-4">
                                  <img src={item.image_url} className="img-fluid h-100 w-100 object-fit-cover rounded-start-4" alt="..." />
                                </div>
                                <div className="col-8">
                                  <div className="card-body p-3">
                                    <h6 className="card-title text-white fw-bold mb-1 text-truncate">{item.item_name}</h6>
                                    <p className="text-white-50 small mb-2">Price: <span className="text-info fw-bold">${item.current_bid || item.starting_price}</span></p>
                                    <span className={`badge rounded-pill ${item.status === 'active' ? 'bg-success' : item.status === 'pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                      {item.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "watchlist" && (
                  <div className="animate__animated animate__fadeIn">
                    <h3 className="fw-bold mb-4">My Watchlist</h3>
                    {watchlist.length === 0 ? (
                      <div className="p-5 text-center rounded-4 shadow" style={{ backgroundColor: "#161a2d", border: "2px dashed rgba(255,255,255,0.1)" }}>
                        <i className="bi bi-heart display-4 text-white-25 mb-3 d-block"></i>
                        <p className="text-white-50">Your watchlist is empty.</p>
                        <button className="btn btn-outline-info rounded-pill px-4 mt-2" onClick={() => navigate('/market')}>Find Items</button>
                      </div>
                    ) : (
                      <div className="row row-cols-1 row-cols-md-2 g-3">
                        {watchlist.map(entry => (
                          <div className="col" key={entry.id}>
                            <div 
                              className="card h-100 border-0 rounded-4 shadow-sm" 
                              style={{ backgroundColor: '#161a2d', cursor: 'pointer' }}
                              onClick={() => handleAction(entry.auction_id)}
                            >
                              <div className="row g-0">
                                <div className="col-4">
                                  <img src={entry.auctions?.image_url} className="img-fluid h-100 w-100 object-fit-cover rounded-start-4" alt="..." />
                                </div>
                                <div className="col-8">
                                  <div className="card-body p-3">
                                    <h6 className="card-title text-white fw-bold mb-1 text-truncate">{entry.auctions?.item_name}</h6>
                                    <p className="text-white-50 small mb-2">Current Bid: <span className="text-info fw-bold">${entry.auctions?.current_bid || entry.auctions?.starting_price}</span></p>
                                    <button className="btn btn-sm btn-link p-0 text-decoration-none text-info fw-bold">View Item →</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bids;
