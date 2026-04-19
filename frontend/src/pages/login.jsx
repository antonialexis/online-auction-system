import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // State for inputs and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- ADDED: Store token and name ---
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        // -----------------------------------

        navigate("/home");
      } else {
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
          <div className="p-5 z-1 text-start">
            <h1
              className="display-4 fw-bold text-white mb-3 lh-sm"
              style={{ textTransform: "uppercase" }}
            >
              Welcome Back to <br />
              <span style={{ color: "#05d9c6" }}>Collectors.net</span>
            </h1>
            <p className="lead text-white opacity-75 mb-5 w-75">
              The premier destination for high-stakes collectible auctions. Log
              in to manage your bids and explore new listings.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-5">
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div className="text-center mb-4">
              <h2 className="text-white fw-bold mb-1">Account Login</h2>
              <p className="text-white-50 small">
                Enter your credentials to enter the circle
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} autoComplete="off">
              <div className="mb-3 text-start">
                <label className="text-white-50 small mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control bg-dark border-secondary text-white py-2 shadow-none"
                  placeholder="john@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="mb-2 text-start">
                <label className="text-white-50 small mb-1">Password</label>

                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control bg-dark border-secondary text-white py-2 pe-5 shadow-none"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  {/* SKY BLUE EYE TOGGLE */}
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`}
                    style={{
                      cursor: "pointer",
                      color: "#05d9c6",
                      fontSize: "1.2rem",
                      zIndex: 10,
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>

                <div className="mt-3 text-end">
                  <Link
                    to="/forgotPassword"
                    className="text-decoration-none small"
                    style={{ color: "#05d9c6", fontSize: "13px" }}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold py-3 mt-4 mb-4 rounded-3 text-dark transition-all"
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
