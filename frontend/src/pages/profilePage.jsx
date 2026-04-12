import React from 'react';
import Header from '../components/header';

const ProfilePage = () => {
  // Dummy Data for now
  const user = {
    first_name: "Luffy",
    last_name: "Monkey D.",
    email: "kingofpirates@grandline.com",
    role: "Seller",
    phone: "+63 912 345 6789",
    birthday: "May 05, 1999",
    hobbies: "Meat, Adventure, Treasure Hunting",
    address: "Foosha Village, East Blue",
    stats: {
      items_won: 12,
      active_listings: 5,
      total_spent: 450000
    }
  };

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
                <span className="display-4 fw-bold" style={{ color: "#05d9c6" }}>{user.first_name[0]}</span>
              </div>
              <h3 className="fw-bold mb-1">{user.first_name} {user.last_name}</h3>
              <span className="badge rounded-pill mb-3 px-3 py-2" style={{ backgroundColor: "rgba(5, 217, 198, 0.2)", color: "#05d9c6" }}>
                {user.role} Account
              </span>
              
              <div className="row g-2 mt-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-dark">
                    <h5 className="mb-0 fw-bold text-info">{user.stats.items_won}</h5>
                    <small className="text-white-50">Items Won</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-dark">
                    <h5 className="mb-0 fw-bold text-warning">{user.stats.active_listings}</h5>
                    <small className="text-white-50">Listings</small>
                  </div>
                </div>
              </div>

              <button className="btn btn-outline-light w-100 mt-4 rounded-3 fw-bold py-2">
                Edit Profile Image
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Information Details */}
          <div className="col-lg-8">
            <div className="p-4 p-md-5 rounded-4 shadow-lg h-100" style={{ backgroundColor: "#161a2d", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Account Information</h4>
                <button className="btn btn-sm px-3 text-dark fw-bold" style={{ background: "#05d9c6", borderRadius: "8px" }}>
                  Edit Details
                </button>
              </div>

              <div className="row g-4 text-start">
                <div className="col-md-6">
                  <label className="text-white-50 small d-block mb-1">Email Address</label>
                  <p className="fw-bold">{user.email}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-white-50 small d-block mb-1">Phone Number</label>
                  <p className="fw-bold">{user.phone}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-white-50 small d-block mb-1">Birthday</label>
                  <p className="fw-bold">{user.birthday}</p>
                </div>
                <div className="col-md-6">
                  <label className="text-white-50 small d-block mb-1">Primary Interests / Hobbies</label>
                  <p className="fw-bold">{user.hobbies}</p>
                </div>
                <div className="col-12 border-top border-secondary pt-4 mt-2">
                  <label className="text-white-50 small d-block mb-1">Shipping Address</label>
                  <p className="fw-bold mb-0">{user.address}</p>
                </div>
              </div>

              {/* Security Shortcut */}
              <div className="mt-5 p-3 rounded-3 bg-dark d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Password & Security</h6>
                  <p className="small text-white-50 mb-0">Last updated 2 weeks ago</p>
                </div>
                <button className="btn btn-outline-secondary btn-sm">Change</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;