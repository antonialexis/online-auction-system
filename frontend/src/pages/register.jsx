import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { notify } from "../utils/notifications";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    gender: "Male",
    role: "buyer",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleIdChange = (e) => {
    setIdFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(formData.password)) {
      setError("Password must contain at least one special character.");
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (!idFile) {
      setError("Please upload a valid ID document for admin verification.");
      return;
    }

    const profile = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      contact_number: formData.phone.trim(),
      bio: formData.bio.trim(),
      gender: formData.gender,
      role: formData.role,
      is_banned: false,
    };

    setLoading(true);
    try {
      let idUrl = null;
      let filePath = null;
      const isVerified = false;
      const verificationStatus = 'pending';

      if (idFile) {
        const fileExt = idFile.name.split('.').pop();
        const fileName = `${Date.now()}_${profile.email.replace(/[^a-z0-9]/gi, '_')}_id.${fileExt}`;
        filePath = `id-documents/${fileName}`;

        const { data: urlData } = supabase.storage
          .from('auction-images')
          .getPublicUrl(filePath);
        idUrl = urlData.publicUrl;
      }

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profile.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            contact_number: formData.phone,
            phone: formData.phone,
            bio: formData.bio,
            gender: formData.gender,
            role: formData.role,
            is_banned: false,
            is_verified: isVerified,
            verification_status: verificationStatus,
            id_document_url: idUrl
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        if (idFile && filePath) {
          const { error: uploadError } = await supabase.storage
            .from('auction-images')
            .upload(filePath, idFile, { upsert: true });
          if (uploadError) throw uploadError;
        }

        const { error: profileUpdateError } = await supabase
          .from('users')
          .update({
            ...profile,
            is_verified: false,
            verification_status: 'pending',
            id_document_url: idUrl,
          })
          .eq('id', authData.user.id);

        if (profileUpdateError) {
          console.warn("Profile verification data was stored in signup metadata, but the direct profile update failed:", profileUpdateError.message);
        }

        const message = "Pending admin Verification, Please wait for 24 hours.";
        setSuccessMessage(message);
        notify(message, "warning");
        window.setTimeout(() => navigate("/"), 2500);
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
            {successMessage && <div className="alert alert-warning py-2 small text-center">{successMessage}</div>}

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

              <div className="row">
                <div className="col-md-6 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Short Bio</label>
                  <input type="text" name="bio" className="form-control bg-dark border-secondary text-white py-2" placeholder="e.g. Anime collector" onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Verify ID Document (Required)</label>
                  <input type="file" className="form-control bg-dark border-secondary text-white py-2" accept="image/*,.pdf" onChange={handleIdChange} required />
                </div>
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

              {/* Existing User Link */}
              <div className="text-end mt-2">
                <span className="text-white-50 small">Existing User? </span>
                <Link
                  to="/"
                  className="text-decoration-none fw-bold"
                  style={{ color: "#05d9c6" }}
                >
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
