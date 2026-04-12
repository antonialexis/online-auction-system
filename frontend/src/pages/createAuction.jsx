import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';

const CreateAuction = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Anime Figurines',
    startingBid: '',
    duration: '3',
    description: '',
    image: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dark-theme min-vh-100 pb-5">
      <Header />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="p-4 p-md-5 rounded-4 shadow-lg" style={{ backgroundColor: "#161a2d", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-white fw-bold mb-4">List Your Collectible</h2>
              
              <form className="row g-4 text-start">
                <div className="col-12">
                  <label className="text-white-50 small mb-2">Item Name</label>
                  <input type="text" name="itemName" className="form-control bg-dark border-secondary text-white py-3" placeholder="e.g. Mint Condition Luffy Gear 5 Statue" onChange={handleChange} />
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
                  <input type="number" name="startingBid" className="form-control bg-dark border-secondary text-white py-3" placeholder="0.00" onChange={handleChange} />
                </div>

                <div className="col-12">
                  <label className="text-white-50 small mb-2">Item Description</label>
                  <textarea name="description" rows="4" className="form-control bg-dark border-secondary text-white" placeholder="Tell bidders why this item is special..." onChange={handleChange}></textarea>
                </div>

                <div className="col-12">
                  <label className="text-white-50 small mb-2">Upload Photos</label>
                  <div className="border border-secondary border-dashed rounded-4 p-5 text-center" style={{ borderStyle: 'dashed' }}>
                    <i className="bi bi-cloud-arrow-up fs-1 text-white-50"></i>
                    <p className="text-white-50 mt-2">Drag and drop or <span className="text-info pointer">browse</span></p>
                  </div>
                </div>

                <div className="col-12 mt-5">
                    <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-lg" style={{ backgroundColor: "#4f46e5", border: 'none' }}>
                        Launch Auction
                    </button>

                    <button onClick={() => navigate('/home')} className="btn btn-primary w-100 py-3 mt-2 fw-bold shadow-lg" style={{ backgroundColor: "#d62828", border: 'none' }}>
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