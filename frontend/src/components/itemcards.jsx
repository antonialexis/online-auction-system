import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

const ItemCard = ({ item }) => {
  return (
      <div className="card h-100 border-0 rounded-4 shadow" style={{ backgroundColor: '#161a2d', overflow: 'hidden' }}>
        <div className="position-relative">
          <img src={item.image} className="card-img-top rounded-0" alt={item.title} style={{ height: '300px', objectFit: 'cover' }} />
          <span className="position-absolute top-0 end-0 m-3 badge rounded-pill text-white small fw-normal" style={{ backgroundColor: 'rgba(22, 26, 45, 0.7)' }}>
            07:20:30
          </span>
        </div>
        <div className="card-body p-4 text-start">
          <h6 className="card-title text-white fw-bold mb-1 text-truncate">{item.title}</h6>
          
          <div className="d-flex align-items-center gap-2 mb-3">
            <img src={`https://placehold.co/24x24/333/fff?text=${item.sellerShort}`} className="rounded-circle border border-secondary" alt="avatar" />
            <p className="card-text text-white small opacity-75 mb-0">By {item.seller}</p>
          </div>
          
          <div className="d-flex justify-content-between align-items-end mb-3">
              <p className="card-text text-white opacity-75 small mb-0">Current Bid:</p>
              <p className="card-text text-white fw-bold fs-5 mb-0">${item.currentBid.toLocaleString()}</p>
          </div>
          
          <button className="btn btn-primary w-100 fw-bold rounded-3 py-2" style={{ backgroundColor: '#4f46e5', borderColor: 'transparent' }}>
              View Details
          </button>
        </div>
      </div>
  );
};

export default ItemCard;