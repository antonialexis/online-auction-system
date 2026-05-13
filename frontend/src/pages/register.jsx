import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    hobbies: "",
    gender: "Male",
    role: "buyer",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create user profile in public.users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            role: formData.role,
            phone: formData.phone,
            hobbies: formData.hobbies,
            is_banned: false
          }]);

        if (profileError) throw profileError;

        alert("Account created successfully! Please log in.");
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 p-0" style={{ backgroundColor: "#090b14" }}>
      <div className="row g-0 h-100">
        <div className="col-lg-6 d-none d-lg-flex align-items-center p-5" style={{ backgroundColor: "#0e1121" }}>
          <div className="p-5 text-start">
            <h1 className="display-4 fw-bold text-white mb-3 lh-sm" style={{ textTransform: "uppercase" }}>
              Join the <span style={{ color: "#05d9c6" }}>Elite</span><br /> Collector Circle
            </h1>
            <p className="lead text-white opacity-75 mb-5 w-75">
              Track rare items, list collectibles, and participate in live high-stakes bidding.
            </p>
          </div>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center p-5">
          <div style={{ width: "100%", maxWidth: "550px" }}>
            <div className="text-center mb-4">
              <h2 className="text-white fw-bold mb-1">Create Account</h2>
              <p className="text-white-50 small">Join the collectors' network today</p>
            </div>

            {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}

            <form onSubmit={handleSignup}>
              <div className="row">
                <div className="col-md-6 mb-3 text-start">
                  <label className="text-white-50 small mb-1">First Name</label>
                  <input type="text" name="first_name" className="form-control bg-dark border-secondary text-white py-2" placeholder="John" onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Last Name</label>
                  <input type="text" name="last_name" className="form-control bg-dark border-secondary text-white py-2" placeholder="Doe" onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3 text-start">
                <label className="text-white-50 small mb-2 d-block">I want to:</label>
                <div className="d-flex gap-3">
                  <input type="radio" className="btn-check" name="role" id="buyer" value="buyer" checked={formData.role === "buyer"} onChange={handleChange} />
                  <label className="btn btn-outline-info fw-bold py-2 flex-grow-1" htmlFor="buyer">Buy Items</label>
                  
                  <input type="radio" className="btn-check" name="role" id="seller" value="seller" checked={formData.role === "seller"} onChange={handleChange} />
                  <label className="btn btn-outline-info fw-bold py-2 flex-grow-1" htmlFor="seller">Sell Items</label>
                </div>
              </div>

              <div className="row">
                <div className="col-md-7 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Email Address</label>
                  <input type="email" name="email" className="form-control bg-dark border-secondary text-white py-2" placeholder="john@example.com" onChange={handleChange} required />
                </div>
                <div className="col-md-5 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Phone Number</label>
                  <input type="text" name="phone" className="form-control bg-dark border-secondary text-white py-2" placeholder="09123456789" onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3 text-start">
                <label className="text-white-50 small mb-1">Hobby / Interest</label>
                <input type="text" name="hobbies" className="form-control bg-dark border-secondary text-white py-2" placeholder="e.g. Anime, Cards, Cars" onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Password</label>
                  <div className="position-relative">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control bg-dark border-secondary text-white py-2 pe-5" placeholder="••••••••" onChange={handleChange} required />
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`} style={{ cursor: "pointer", color: "#05d9c6" }} onClick={() => setShowPassword(!showPassword)}></i>
                  </div>
                </div>
                <div className="col-md-6 mb-4 text-start">
                  <label className="text-white-50 small mb-1">Confirm Password</label>
                  <div className="position-relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" className="form-control bg-dark border-secondary text-white py-2 pe-5" placeholder="••••••••" onChange={handleChange} required />
                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`} style={{ cursor: "pointer", color: "#05d9c6" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}></i>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn w-100 fw-bold py-3 mb-4 rounded-3 text-dark" style={{ background: "linear-gradient(45deg, #05d9c6, #00bfaf)", border: "none" }} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Register Account Now"}
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
