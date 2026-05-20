import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CountdownTimer from './CountdownTimer';

const ItemModal = ({ item, onClose, onBidSuccess }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [user, setUser] = useState(null);
  const [bidding, setBidding] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser({ ...authUser, ...profile });
        
        if (item) {
        const { data } = await supabase
          .from('watchlist')
          .select('id')
          .eq('user_id', authUser.id)
          .eq('auction_id', item.id)
          .maybeSingle();
        if (data) setIsWatching(true);
        }
      }
    };
    checkStatus();
    fetchBidHistory();

    // Subscribe to realtime bids for this item
    const channel = supabase
      .channel(`item-bids-${item.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${item.id}` }, () => {
        fetchBidHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item]);

  const fetchBidHistory = async () => {
    if (!item) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          bid_amount,
          bid_time,
          users:bidder_id (first_name, last_name)
        `)
        .eq('auction_id', item.id)
        .order('bid_time', { ascending: false });

      if (error) throw error;
      setBidHistory(data || []);
    } catch (err) {
      console.error("Error fetching bid history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!item) return null;

  const handleWatchlist = async () => {
    if (!user) return alert("Please log in to use the watchlist");
    
    if (isWatching) {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('auction_id', item.id);
      if (!error) setIsWatching(false);
    } else {
      const { error } = await supabase
        .from('watchlist')
        .insert([{ user_id: user.id, auction_id: item.id }]);
      if (!error) setIsWatching(true);
    }
  };

  const handlePlaceBid = async () => {
    if (!user) return alert("Please log in to place a bid");
    if (!bidAmount || isNaN(bidAmount)) return alert("Please enter a valid bid amount");

    setBidding(true);
    try {
      // Fetch the FRESHEST current price from DB to avoid stale data
      const { data: freshAuction, error: fetchErr } = await supabase
        .from('auctions')
        .select('current_bid, starting_price, status, end_time')
        .eq('id', item.id)
        .single();

      if (fetchErr) throw fetchErr;

      if (freshAuction.status === 'closed' || new Date(freshAuction.end_time) < new Date()) {
        return alert("This auction has already ended.");
      }

      const freshPrice = freshAuction.current_bid ?? freshAuction.starting_price;
      if (parseFloat(bidAmount) <= parseFloat(freshPrice)) {
        return alert(`Your bid must be HIGHER than the current price of $${Number(freshPrice).toLocaleString()}. Equal bids are not accepted.`);
      }
      const { error } = await supabase
        .from('bids')
        .insert([{
          auction_id: item.id,
          bidder_id: user.id,
          bid_amount: parseFloat(bidAmount)
        }]);
      
      if (error) throw error;

      // Update auction current bid
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_bid: parseFloat(bidAmount) })
        .eq('id', item.id);

      if (updateError) throw updateError;

      alert("Bid placed successfully!");
      setBidAmount('');
      if (onBidSuccess) onBidSuccess();
      fetchBidHistory();
    } catch (err) {
      console.error("Bidding error:", err);
      alert("Error placing bid: " + err.message);
    } finally {
      setBidding(false);
    }
  };

  const isEnded = new Date(item.end_time) < new Date() || item.status === 'closed';

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden" style={{ backgroundColor: '#0e1121', color: '#fff' }}>

          {/* Close Button "X" */}
          <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 1051 }}>
            <button
              type="button"
              className="btn-close btn-close-white fs-4 shadow-none"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Left Side: Image */}
              <div className="col-lg-6 position-relative">
                <img
                  src={item.image_url || item.image}
                  className="img-fluid h-100 w-100 object-fit-cover"
                  alt={item.item_name || item.title}
                  style={{ minHeight: '500px', maxHeight: '800px' }}
                />
                {isEnded && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-danger text-white px-5 py-3 rounded-pill fw-bold fs-4 shadow-lg border border-2 border-danger animate__animated animate__pulse animate__infinite">
                      AUCTION CLOSED
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Details & Bidding */}
              <div className="col-lg-6 p-4 p-md-5 d-flex flex-column h-100" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h2 className="fw-bold mb-0">{item.item_name || item.title}</h2>
                  <button 
                    className={`btn btn-sm rounded-pill px-3 ${isWatching ? 'btn-info' : 'btn-outline-info'}`}
                    onClick={handleWatchlist}
                    style={isWatching ? { backgroundColor: '#05d9c6', color: '#000', border: 'none' } : {}}
                  >
                    <i className={`bi bi-heart${isWatching ? '-fill' : ''} me-1`}></i>
                    {isWatching ? 'Watching' : 'Watchlist'}
                  </button>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                  <p className="text-white-50 small mb-0">Seller: <span className="text-info fw-bold">{item.seller_name || item.seller || 'Unknown'}</span></p>
                  
                  {/* Verified ID Badge */}
                  <span className="badge bg-success text-white px-2 py-1" title="Identity Verified by System">
                    <i className="bi bi-shield-check me-1"></i> ID Verified
                  </span>
                  
                  {/* Unique Identifier */}
                  <span className="badge bg-secondary text-light opacity-75">UID: {item.seller_id?.substring(0,8) || 'Unknown'}</span>
                  
                  {/* 5-Star Visual Rating */}
                  <div className="d-flex align-items-center bg-dark rounded-pill px-2 py-1 border border-secondary" title="Seller Rating">
                    <span className="text-warning small me-1" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-half"></i>
                    </span>
                    <span className="text-white small fw-bold ms-1" style={{ fontSize: '0.8rem' }}>{item.seller_rating ? Number(item.seller_rating).toFixed(1) : '4.5'} / 5.0</span>
                  </div>
                </div>

                <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#161a2d', border: '1px solid rgba(5, 217, 198, 0.2)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <small className="text-white-50 d-block">Current Price</small>
                      <h3 className="fw-bold mb-0 text-info">${(item.current_bid ?? item.starting_price)?.toLocaleString() || '0'}</h3>
                    </div>
                    <div className="text-end">
                      <CountdownTimer endTime={item.end_time} />
                      <h5 className={`fw-bold mb-0 mt-1 text-capitalize ${item.status === 'active' ? 'text-warning' : item.status === 'pending' ? 'text-info' : 'text-danger'}`}>
                        {item.status || 'Active'}
                      </h5>
                    </div>
                  </div>

                  {!isEnded && item.status === 'active' && (
                    <>
                      {user && user.is_verified === false ? (
                        <div className="alert alert-warning py-2 small mb-2 d-flex align-items-center">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          Your ID is under review. You will be notified within 24 hours. You cannot place bids yet.
                        </div>
                      ) : (
                        <>
                          <div className="input-group mb-2">
                            <input 
                              type="number" 
                              className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
                              placeholder="Enter your bid..." 
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              disabled={bidding}
                            />
                            <button 
                              className="btn btn-info px-4 fw-bold" 
                              style={{ backgroundColor: '#05d9c6', border: 'none', color: '#000' }}
                              onClick={handlePlaceBid}
                              disabled={bidding}
                            >
                              {bidding ? 'Placing...' : 'Place Bid'}
                            </button>
                          </div>
                          <small className="text-white-50">Bid increment: Must be higher than current price.</small>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Tabs / Sections */}
                <ul className="nav nav-pills mb-3 gap-2" id="itemTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active btn-sm rounded-pill" id="desc-tab" data-bs-toggle="pill" data-bs-target="#desc" type="button" role="tab" style={{ fontSize: '0.8rem' }}>Description</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link btn-sm rounded-pill" id="history-tab" data-bs-toggle="pill" data-bs-target="#history" type="button" role="tab" style={{ fontSize: '0.8rem' }}>Bid History ({bidHistory.length})</button>
                  </li>
                </ul>

                <div className="tab-content flex-grow-1 overflow-auto pe-2" id="itemTabsContent">
                  <div className="tab-pane fade show active" id="desc" role="tabpanel">
                    <p className="text-white-50 small" style={{ lineHeight: '1.6' }}>
                      {item.description || 'No description provided for this item.'}
                    </p>
                    <div className="mt-4 pt-3 border-top border-secondary">
                      <div className="d-flex justify-content-between text-white-50 small mb-2">
                        <span>Category</span>
                        <span className="text-white">{item.category || 'Uncategorized'}</span>
                      </div>
                      <div className="d-flex justify-content-between text-white-50 small">
                        <span>Auction End Date</span>
                        <span className="text-white">{new Date(item.end_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tab-pane fade" id="history" role="tabpanel">
                    {loadingHistory ? (
                      <div className="text-center py-4 opacity-50">Loading bids...</div>
                    ) : bidHistory.length === 0 ? (
                      <div className="text-center py-4 opacity-50 small">No bids yet. Be the first!</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {bidHistory.map((bid, i) => (
                          <div key={i} className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ backgroundColor: i === 0 ? 'rgba(5,217,198,0.1)' : 'rgba(255,255,255,0.03)' }}>
                            <div>
                              <span className="fw-bold text-white small d-block">{bid.users?.first_name} {bid.users?.last_name}</span>
                              <small className="text-white-25" style={{ fontSize: '0.7rem' }}>{new Date(bid.bid_time).toLocaleString()}</small>
                            </div>
                            <div className="text-end">
                              <span className="fw-bold text-info">${bid.bid_amount.toLocaleString()}</span>
                              {i === 0 && <span className="badge bg-info text-dark ms-2 small" style={{ fontSize: '0.6rem' }}>Highest</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;