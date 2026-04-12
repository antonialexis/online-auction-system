import React from 'react';

const ItemModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg" style={{ backgroundColor: '#0e1121', color: '#fff' }}>
          
          {/* Close Button "X" */}
          <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 1050 }}>
            <button 
              type="button" 
              className="btn-close btn-close-white fs-4" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Left Side: Image */}
              <div className="col-lg-6">
                <img 
                  src={item.image} 
                  className="img-fluid h-100 w-100 object-fit-cover rounded-start-4" 
                  alt={item.title} 
                />
              </div>

              {/* Right Side: Details & Bidding */}
              <div className="col-lg-6 p-4 p-md-5">
                <h2 className="fw-bold mb-2">{item.title}</h2>
                <p className="text-white-50 small mb-4">Seller: <span className="text-white fw-bold">{item.seller}</span></p>
                
                <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: '#161a2d', border: '1px solid rgba(217, 70, 239, 0.3)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <small className="text-white-50 d-block">Current Bid</small>
                      <h3 className="fw-bold mb-0">${item.currentBid.toLocaleString()}</h3>
                    </div>
                    <div className="text-end">
                      <small className="text-white-50 d-block">Time Left</small>
                      <h4 className="text-warning fw-bold mb-0">07:20:30</h4>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <input type="number" className="form-control bg-dark border-secondary text-white" placeholder="Amount" />
                    <button className="btn btn-primary px-4" style={{ backgroundColor: '#4f46e5' }}>Bid</button>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Bid History</h6>
                <div className="small opacity-75">
                   <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                     <span>Collector_99</span>
                     <span className="fw-bold text-white">${item.currentBid.toLocaleString()}</span>
                   </div>
                   <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                     <span>PokeMaster</span>
                     <span>$124,500</span>
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