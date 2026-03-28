import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // State for inputs and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to homepage on success
        navigate("/home");
      } else {
        // Show specific error from backend
        setError(data.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("Cannot connect to server. Please check your backend.");
    }
  };

  return (
    <div
      className="container-fluid vh-100 p-0"
      style={{ backgroundColor: "#090b14" }}
    >
      <div className="row g-0 h-100">
        {/* LEFT SIDE: Branding */}
        <div
          className="col-lg-6 d-none d-lg-flex align-items-center p-5 position-relative"
          style={{ backgroundColor: "#0e1121" }}
        >
          <div className="p-5 z-1">
            <h1
              className="display-4 fw-bold text-white mb-3 lh-sm text-start"
              style={{ textTransform: "uppercase" }}
            >
              Secure Your
              <br /> Next <span style={{ color: "#05d9c6" }}>Masterpiece</span>
              <br /> Collection
            </h1>
            <p className="lead text-white opacity-75 mb-5 text-start w-75">
              The ultimate destination for elite collectors. Bid on rare anime
              figurines, trading cards, and timeless artifacts.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-5">
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <div className="text-center mb-5">
              <h2 className="text-white fw-bold mb-1">Welcome Back</h2>
              <p className="text-white-50 small">
                Login to access the collector's vault
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger py-2 small border-0 mb-4"
                style={{
                  backgroundColor: "rgba(220,53,69,0.1)",
                  color: "#ff6b6b",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3 text-start">
                <label className="text-white-50 small mb-1">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white-50">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark border-secondary text-white py-3 shadow-none"
                    placeholder="Enter your email here"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4 text-start position-relative">
                <label className="text-white-50 small mb-1">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white-50">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-white py-3 shadow-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="text-end mt-1">
                  <Link
                    to="/forgotPassword"
                    icon="forgotPassword"
                    className="text-decoration-none small"
                    style={{ color: "#05d9c6" }}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold py-3 mb-4 rounded-3 text-dark transition-all"
                style={{
                  background: "linear-gradient(45deg, #05d9c6, #00bfaf)",
                  border: "none",
                  boxShadow: "0 0 15px rgba(5, 217, 198, 0.3)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Enter the Auction
              </button>
            </form>

            <div className="text-center text-white-50 small">
              Don't have access yet?{" "}
              <Link
                to="/signup"
                className="text-decoration-none fw-bold"
                style={{ color: "#05d9c6" }}
              >
                Create Account
              </Link>
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

export default Login;
