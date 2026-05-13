import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      setMessage("Check your email for the password reset link!");
    } catch (err) {
      setError(err.message || "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "#090b14" }}
    >
      <div
        className="p-4 rounded-4 border border-secondary shadow-lg"
        style={{ width: "100%", maxWidth: "400px", backgroundColor: "#0e1121" }}
      >
        <div className="text-center mb-4">
          <h3 className="text-white fw-bold">Reset Access</h3>
          <p className="text-white-50 small">
            We will send a recovery link to your email
          </p>
        </div>

        {message && (
          <div
            className="alert alert-success py-2 small border-0"
            style={{
              backgroundColor: "rgba(5, 217, 198, 0.1)",
              color: "#05d9c6",
            }}
          >
            {message}
          </div>
        )}
        {error && (
          <div
            className="alert alert-danger py-2 small border-0"
            style={{
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleReset}>
          <div className="mb-3 text-start">
            <label className="text-white-50 small mb-1">Email Address</label>
            <input
              type="email"
              className="form-control bg-dark text-white border-secondary py-2 shadow-none"
              placeholder="Enter registered email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-100 fw-bold py-2 mb-3 text-dark"
            style={{
              background: "linear-gradient(45deg, #05d9c6, #00bfaf)",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="text-center">
          <Link
            to="/"
            className="small text-decoration-none fw-bold"
            style={{ color: "#05d9c6" }}
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
