import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { supabase } from '../supabaseClient';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Anime Figurines',
    startingBid: '',
    duration: '3', // Days
    description: '',
    image: null
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + parseInt(formData.duration));

      const { error } = await supabase.from('auctions').insert([
        {
          seller_id: user.id,
          title: formData.itemName,
          description: formData.description,
          starting_bid: parseFloat(formData.startingBid),
          current_bid: parseFloat(formData.startingBid),
          end_time: endTime.toISOString(),
          status: 'active'
        }
      ]);

      if (error) throw error;

      alert("Auction created successfully!");
      navigate('/market');
    } catch (err) {
      console.error("Error creating auction:", err);
      alert("Failed to create auction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-theme min-vh-100 pb-5">
      <Header />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="p-4 p-md-5 rounded-4 shadow-lg" style={{ backgroundColor: "#161a2d", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-white fw-bold mb-4">List Your Collectible</h2>
              
              <form className="row g-4 text-start" onSubmit={handleSubmit}>
                <div className="col-12">
                  <label className="text-white-50 small mb-2">Item Name</label>
                  <input type="text" name="itemName" className="form-control bg-dark border-secondary text-white py-3" placeholder="e.g. Mint Condition Luffy Gear 5 Statue" onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="text-white-50 small mb-2">Category</label>
                  <select name="category" className="form-select bg-dark border-secondary text-white py-3" onChange={handleChange}>
                    <option>Anime Figurines</option>
                    <option>Trading Cards</option>
                    <option>Manga</option>
                    <option>Video Games</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-white-50 small mb-2">Starting Bid ($)</label>
                  <input type="number" name="startingBid" className="form-control bg-dark border-secondary text-white py-3" placeholder="0.00" step="0.01" onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="text-white-50 small mb-2">Duration (Days)</label>
                  <select name="duration" className="form-select bg-dark border-secondary text-white py-3" onChange={handleChange}>
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="text-white-50 small mb-2">Item Description</label>
                  <textarea name="description" rows="4" className="form-control bg-dark border-secondary text-white" placeholder="Tell bidders why this item is special..." onChange={handleChange} required></textarea>
                </div>

                <div className="col-12 mt-5">
                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-lg" style={{ backgroundColor: "#4f46e5", border: 'none' }} disabled={loading}>
                        {loading ? "Launching..." : "Launch Auction"}
                    </button>

                    <button type="button" onClick={() => navigate('/market')} className="btn btn-primary w-100 py-3 mt-2 fw-bold shadow-lg" style={{ backgroundColor: "#d62828", border: 'none' }}>
                         Cancel Auction
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;