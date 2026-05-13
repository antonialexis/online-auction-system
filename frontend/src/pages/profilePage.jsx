import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import { supabase } from '../supabaseClient';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ items_won: 0, active_listings: 0, total_spent: 0 });

  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birthday: '',
    hobbies: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Fetch Profile Info
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      setUser(profile);
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        birthday: profile.birthday || '',
        hobbies: profile.hobbies || '',
        address: profile.address || ''
      });

      // 2. Fetch Stats
      // Active Listings
      const { count: listingsCount } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', authUser.id)
        .eq('status', 'active');

      // Items Won
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          auction_id,
          bid_amount,
          auctions (current_bid, status, end_time)
        `)
        .eq('bidder_id', authUser.id);

      const wonCount = (bidsData || []).filter(bid => {
        const isHighest = bid.bid_amount >= (bid.auctions?.current_bid || 0);
        const isClosed = bid.auctions?.status === 'closed' || new Date(bid.auctions?.end_time) < new Date();
        return isHighest && isClosed;
      }).length;

      setStats({
        items_won: wonCount,
        active_listings: listingsCount || 0,
        total_spent: 0 // Placeholder for total spending logic
      });

    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(editData)
        .eq('id', user.id);

      if (error) throw error;
      
      setUser({ ...user, ...editData });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dark-theme min-vh-100 text-white">
        <Header />
        <div className="container py-5 text-center mt-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="mt-3 opacity-50">Loading your world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-theme min-vh-100 pb-5 text-white">
      <Header />
      
      <div className="container py-5 mt-4">
        <div className="row g-4">
          
          {/* LEFT COLUMN: Profile Card */}
          <div className="col-lg-4">
            <div className="p-4 rounded-4 shadow-lg text-center" style={{ backgroundColor: "#161a2d", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="mx-auto mb-3 rounded-circle bg-dark d-flex align-items-center justify-content-center shadow" 
                   style={{ width: "120px", height: "120px", border: "3px solid #05d9c6" }}>
                <span className="display-4 fw-bold" style={{ color: "#05d9c6" }}>{user?.first_name?.[0] || 'U'}</span>
              </div>
              <h3 className="fw-bold mb-1">{user?.first_name} {user?.last_name}</h3>
              <span className="badge rounded-pill mb-3 px-3 py-2 text-capitalize" style={{ backgroundColor: "rgba(5, 217, 198, 0.2)", color: "#05d9c6" }}>
                {user?.role} Account
              </span>
              
              <div className="row g-2 mt-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-dark">
                    <h5 className="mb-0 fw-bold text-info">{stats.items_won}</h5>
                    <small className="text-white-50">Items Won</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-dark">
                    <h5 className="mb-0 fw-bold text-warning">{stats.active_listings}</h5>
                    <small className="text-white-50">Listings</small>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top border-secondary text-start">
                <small className="text-white-50 d-block mb-1">Account Status</small>
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
                  <span className="small">Verified Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Information Details */}
          <div className="col-lg-8">
            <div className="p-4 p-md-5 rounded-4 shadow-lg h-100" style={{ backgroundColor: "#161a2d", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">{isEditing ? "Update Profile" : "Account Information"}</h4>
                <button 
                  className={`btn btn-sm px-3 fw-bold ${isEditing ? 'btn-outline-secondary text-white' : 'text-dark'}`} 
                  style={isEditing ? {} : { background: "#05d9c6", borderRadius: "8px" }}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Details"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="row g-3 text-start">
                  <div className="col-md-6">
                    <label className="text-white-50 small mb-1">First Name</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" value={editData.first_name} onChange={e => setEditData({...editData, first_name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small mb-1">Last Name</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small mb-1">Phone Number</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small mb-1">Birthday</label>
                    <input type="date" className="form-control bg-dark border-secondary text-white" value={editData.birthday} onChange={e => setEditData({...editData, birthday: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="text-white-50 small mb-1">Hobbies / Interests</label>
                    <input type="text" className="form-control bg-dark border-secondary text-white" value={editData.hobbies} onChange={e => setEditData({...editData, hobbies: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="text-white-50 small mb-1">Shipping Address</label>
                    <textarea className="form-control bg-dark border-secondary text-white" rows="3" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})}></textarea>
                  </div>
                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-info px-5 fw-bold text-dark w-100 py-3" style={{ background: "#05d9c6", border: "none" }} disabled={saving}>
                      {saving ? "Saving Changes..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row g-4 text-start">
                  <div className="col-md-6">
                    <label className="text-white-50 small d-block mb-1">Email Address</label>
                    <p className="fw-bold">{user?.email}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small d-block mb-1">Phone Number</label>
                    <p className="fw-bold">{user?.phone || "Not set"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small d-block mb-1">Birthday</label>
                    <p className="fw-bold">{user?.birthday ? new Date(user.birthday).toLocaleDateString() : "Not set"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-white-50 small d-block mb-1">Primary Interests / Hobbies</label>
                    <p className="fw-bold">{user?.hobbies || "Not set"}</p>
                  </div>
                  <div className="col-12 border-top border-secondary pt-4 mt-2">
                    <label className="text-white-50 small d-block mb-1">Shipping Address</label>
                    <p className="fw-bold mb-0">{user?.address || "No address on file"}</p>
                  </div>

                  <div className="mt-5 p-3 rounded-3 bg-dark d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Member Since</h6>
                      <p className="small text-white-50 mb-0">{new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-secondary">Collector ID: #{user?.id?.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;