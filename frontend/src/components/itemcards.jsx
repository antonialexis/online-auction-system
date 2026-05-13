import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const ItemCard = ({ item }) => {
  return (
    <div className="card h-100 border-0 rounded-4 shadow" style={{ backgroundColor: '#161a2d', overflow: 'hidden' }}>
      <div className="position-relative">
        <img src={item.image_url || item.image} className="card-img-top rounded-0" alt={item.item_name || item.title} style={{ height: '300px', objectFit: 'cover' }} />
        {item.status !== 'active' && (
          <span className={`position-absolute top-0 end-0 m-3 badge rounded-pill text-white small fw-normal text-capitalize`} style={{ backgroundColor: 'rgba(22, 26, 45, 0.7)', zIndex: 2 }}>
            {item.status}
          </span>
        )}
      </div>
      <div className="card-body p-4 text-start">
        <h6 className="card-title text-white fw-bold mb-1 text-truncate">{item.item_name || item.title}</h6>

        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle border border-secondary d-flex align-items-center justify-content-center bg-dark text-white-50 small" style={{ width: '24px', height: '24px' }}>
            {item.seller_name?.[0] || 'U'}
          </div>
          <p className="card-text text-white small opacity-75 mb-0">By {item.seller_name || item.seller || 'Unknown'}</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="card-text text-white opacity-75 small mb-0">Current Bid</p>
            <p className="card-text text-info fw-bold fs-5 mb-0">${(item.current_bid ?? item.starting_price)?.toLocaleString() || '0'}</p>
          </div>
          <div className="text-end">
            <CountdownTimer endTime={item.end_time} />
          </div>
        </div>

        <button className="btn btn-primary w-100 fw-bold rounded-3 py-2" style={{ backgroundColor: '#4f46e5', borderColor: 'transparent' }}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default ItemCard;