import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // In a real app, you would validate that passwords match here
    alert("Account created successfully! Welcome to the circle.");
    navigate('/'); 
  };

  return (
    <div className="container-fluid vh-100 p-0" style={{ backgroundColor: '#090b14' }}>
      <div className="row g-0 h-100">
        
        {/* LEFT SIDE: Branding Section */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center p-5 position-relative" style={{ backgroundColor: '#0e1121' }}>
          <div className="p-5 z-1">
            <h1 className="display-4 fw-bold text-white mb-3 lh-sm text-start" style={{ textTransform: 'uppercase' }}>
              Join the <span style={{ color: 'var(--accent-teal)' }}>Elite</span><br /> Collector<br /> Circle
            </h1>
            <p className="lead text-white opacity-75 mb-5 text-start w-75">
              Create your account to track rare items, list your own collectibles, 
              and participate in live high-stakes bidding.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Signup Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-5">
          <div style={{ width: '100%', maxWidth: '480px' }}>
            
            <div className="text-center mb-4">
              <h2 className="text-white fw-bold mb-1">Get Started Now</h2>
              <p className="text-white-50 small">Join the Collectors.net ecosystem</p>
            </div>

            <form onSubmit={handleSignup}>
              {/* First and Last Name Row */}
              <div className="row g-3 mb-3">
                <div className="col-md-6 text-start">
                  <label className="text-white-50 small mb-1">First Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-white-50"><i className="bi bi-person"></i></span>
                    <input type="text" className="form-control bg-dark border-secondary text-white py-3 shadow-none" placeholder="John" required />
                  </div>
                </div>
                <div className="col-md-6 text-start">
                  <label className="text-white-50 small mb-1">Last Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-white-50"><i className="bi bi-person"></i></span>
                    <input type="text" className="form-control bg-dark border-secondary text-white py-3 shadow-none" placeholder="Doe" required />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-3 text-start">
                <label className="text-white-50 small mb-1">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white-50"><i className="bi bi-envelope"></i></span>
                  <input type="email" className="form-control bg-dark border-secondary text-white py-3 shadow-none" placeholder="enter your email here" required />
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div className="row g-3 mb-4">
                <div className="col-md-6 text-start">
                  <label className="text-white-50 small mb-1">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-white-50"><i className="bi bi-lock"></i></span>
                    <input type="password" className="form-control bg-dark border-secondary text-white py-3 shadow-none" placeholder="••••••••" required />
                  </div>
                </div>
                <div className="col-md-6 text-start">
                  <label className="text-white-50 small mb-1">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-white-50"><i className="bi bi-shield-lock"></i></span>
                    <input type="password" className="form-control bg-dark border-secondary text-white py-3 shadow-none" placeholder="••••••••" required />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn w-100 fw-bold py-3 mb-4 rounded-3 text-dark transition-all" 
                style={{ 
                    background: 'linear-gradient(45deg, #05d9c6, #00bfaf)', 
                    border: 'none',
                    boxShadow: '0 0 15px rgba(5, 217, 198, 0.3)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}
              >
                Register Account Now
              </button>
            </form>

            <div className="text-center text-white-50 small">
              Already have an account? <Link to="/" className="text-decoration-none fw-bold" style={{ color: 'var(--accent-teal)' }}>Log In</Link>
            </div>
            
            <div className="text-center text-white-50 small mt-5 pt-3 border-top border-secondary">
                Copyright © 2026 Collectors.net. All Rights Reserved.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;