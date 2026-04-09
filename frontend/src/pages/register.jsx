import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  // 1. Setup State for form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birthday: "",
    hobbies: "",
    address: "",
    role: "buyer",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Form Submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Welcome to the circle.");
        navigate("/"); // Redirect to Login page
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Is the backend running?");
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0" style={{ backgroundColor: "#090b14" }}>
      <div className="row g-0 min-vh-100">
        
        {/* LEFT SIDE: Branding (Hidden on mobile for better scroll) */}
        <div className="col-lg-5 d-none d-lg-flex align-items-center p-5" style={{ backgroundColor: "#0e1121" }}>
          <div className="p-5 text-start">
            <h1 className="display-4 fw-bold text-white mb-3" style={{ textTransform: "uppercase" }}>
              Join the <span style={{ color: "#05d9c6" }}>Elite</span><br /> Collector Circle
            </h1>
            <p className="lead text-white opacity-75 mb-5">
              Create your account to track rare items, list your own collectibles, and participate in high-stakes bidding.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Expanded Signup Form */}
        <div className="col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div style={{ width: "100%", maxWidth: "650px" }}>
            <div className="text-center mb-4">
              <h2 className="text-white fw-bold mb-1">Create Account</h2>
              <p className="text-white-50 small">Fill in the details to join Collectors.net</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleSignup} className="row">
              
              {/* ROLE TOGGLE */}
              <div className="col-12 mb-4">
                <label className="text-white-50 small d-block mb-2 text-start">I want to be a:</label>
                <div className="btn-group w-100" role="group">
                  <input 
                    type="radio" className="btn-check" name="role" id="buyer" value="buyer" 
                    checked={formData.role === "buyer"} onChange={handleChange} 
                  />
                  <label className="btn btn-outline-info fw-bold py-2" htmlFor="buyer">Buyer</label>

                  <input 
                    type="radio" className="btn-check" name="role" id="seller" value="seller" 
                    checked={formData.role === "seller"} onChange={handleChange} 
                  />
                  <label className="btn btn-outline-info fw-bold py-2" htmlFor="seller">Seller</label>
                </div>
              </div>

              {/* NAME FIELDS */}
              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">First Name</label>
                <input type="text" name="first_name" className="form-control bg-dark border-secondary text-white py-2" placeholder="John" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">Last Name</label>
                <input type="text" name="last_name" className="form-control bg-dark border-secondary text-white py-2" placeholder="Doe" onChange={handleChange} required />
              </div>

              {/* CONTACT & INFO */}
              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">Email Address</label>
                <input type="email" name="email" className="form-control bg-dark border-secondary text-white py-2" placeholder="john@example.com" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">Phone Number</label>
                <input type="tel" name="phone" className="form-control bg-dark border-secondary text-white py-2" placeholder="+1 234..." onChange={handleChange} required />
              </div>

              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">Birthday</label>
                <input type="date" name="birthday" className="form-control bg-dark border-secondary text-white py-2" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">Hobbies</label>
                <input type="text" name="hobbies" className="form-control bg-dark border-secondary text-white py-2" placeholder="Anime, TCG, Art" onChange={handleChange} />
              </div>

              <div className="col-12 mb-3 text-start">
                <label className="text-white-50 small mb-1">Address</label>
                <textarea name="address" rows="2" className="form-control bg-dark border-secondary text-white py-2" placeholder="123 Street, City, Country" onChange={handleChange} required></textarea>
              </div>

              {/* PASSWORD FIELDS */}
              <div className="col-md-6 mb-3 text-start">
                <label className="text-white-50 small mb-1">Password</label>
                <input type="password" name="password" className="form-control bg-dark border-secondary text-white py-2" placeholder="••••••••" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-4 text-start">
                <label className="text-white-50 small mb-1">Confirm Password</label>
                <input type="password" name="confirm_password" className="form-control bg-dark border-secondary text-white py-2" placeholder="••••••••" onChange={handleChange} required />
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold py-3 mb-4 rounded-3 text-dark"
                style={{ background: "linear-gradient(45deg, #05d9c6, #00bfaf)", border: "none" }}
              >
                Register Account Now
              </button>
            </form>

            <div className="text-center text-white-50 small">
              Already have an account? <Link to="/" className="text-decoration-none fw-bold" style={{ color: "#05d9c6" }}>Log In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
