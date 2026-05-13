import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ItemModal = ({ item, onClose }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handlePlaceBid = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please login to place a bid.");
      return;
    }

    // Basic validation: must be higher than current bid
    if (!bidAmount || parseFloat(bidAmount) <= item.current_bid) {
      alert(`Your bid must be higher than $${item.current_bid?.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const auctionId = item.id;
      
      const { error } = await supabase.rpc("place_bid", {
        p_auction_id: auctionId,
        p_bidder_id: user.id,
        p_bid_amount: parseFloat(bidAmount)
      });

      if (error) throw error;

      alert("Bid placed successfully!");
      window.location.reload(); 
    } catch (err) {
      console.error("Bidding error:", err);
      alert(err.message || "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg" style={{ backgroundColor: '#0e1121', color: '#fff' }}>
          
          <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 1050 }}>
            <button type="button" className="btn-close btn-close-white fs-4" onClick={onClose}></button>
          </div>

          <div className="modal-body p-0">
            <div className="row g-0">
              <div className="col-lg-6">
                <img src={item.image_url || 'https://placehold.co/600x600/png?text=No+Image'} className="img-fluid h-100 w-100 object-fit-cover rounded-start-4" alt={item.title} />
              </div>

              <div className="col-lg-6 p-4 p-md-5">
                <div className="mb-4">
                  <span className="badge bg-primary mb-2">Active Auction</span>
                  <h2 className="fw-bold text-white mb-1">{item.title}</h2>
                  <p className="text-white-50">Listed by <span className="text-info">@{item.seller_name || 'Anonymous'}</span></p>
                </div>

                <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#161a2d', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <small className="text-white-50 d-block">Current Bid</small>
                      <h3 className="fw-bold mb-0">${item.current_bid?.toLocaleString() || '0'}</h3>
                    </div>
                    <div className="text-end">
                      <small className="text-white-50 d-block">End Time</small>
                      <h4 className="text-warning fw-bold mb-0" style={{ fontSize: '1rem' }}>
                        {new Date(item.end_time).toLocaleDateString()}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control bg-dark border-secondary text-white" 
                      placeholder="Enter amount..." 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                    <button 
                      className="btn btn-primary px-4" 
                      style={{ backgroundColor: '#4f46e5' }}
                      onClick={handlePlaceBid}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Place Bid"}
                    </button>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Description</h6>
                <p className="text-white-50 small mb-4">{item.description}</p>

                <h6 className="fw-bold mb-3">Recent Activity</h6>
                <div className="small opacity-75">
                   <div className="d-flex justify-content-between border-bottom border-secondary py-2 text-info">
                     <span>Current Highest Bid</span>
                     <span className="fw-bold text-white">${item.current_bid?.toLocaleString() || '0'}</span>
                   </div>
                   <p className="mt-2 x-small text-white-50 italic text-center">Login as another user to outbid!</p>
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