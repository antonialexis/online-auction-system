import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    hobbies: "",
    gender: "",
    password: "",
    confirm_password: "",
<<<<<<< HEAD
=======
    role: "", 
>>>>>>> 87ee87f (Made the database, Supabase.)
  });

  const [hobbiesList, setHobbiesList] = useState([]);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const { data, error } = await supabase.from("hobbies").select("*");
        if (error) throw error;
        setHobbiesList(data);
      } catch (err) {
        console.error("Could not load hobbies:", err);
      }
    };
    fetchHobbies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

<<<<<<< HEAD
    // 1. Validation Logic
=======
    if (!formData.role) {
      setError("Please select a role (Buyer or Seller).");
      return;
    }
>>>>>>> 87ee87f (Made the database, Supabase.)
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            contact_number: formData.contact_number,
            hobbies: formData.hobbies,
            gender: formData.gender,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      alert("Registration successful! Please check your email for verification.");
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div
      className="container-fluid vh-100 p-0"
      style={{ backgroundColor: "#090b14" }}
    >
      <div className="row g-0 h-100">
        <div
          className="col-lg-6 d-none d-lg-flex align-items-center p-5"
          style={{ backgroundColor: "#0e1121" }}
        >
          <div className="p-5 text-start">
            <h1
              className="display-4 fw-bold text-white mb-3 lh-sm"
              style={{ textTransform: "uppercase" }}
            >
              Join the <span style={{ color: "#05d9c6" }}>Elite</span> <br />{" "}
              Collector Circle
            </h1>
            <p className="lead text-white opacity-75 mb-5 w-75">
              Track rare items, list collectibles, and participate in live
              high-stakes bidding.
            </p>
          </div>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center p-5">
          <div style={{ width: "100%", maxWidth: "550px" }}>
            <div className="text-center mb-4">
              <h2 className="text-white fw-bold mb-1">Create Account</h2>
              <p className="text-white-50 small">
                Join the collectors' network today
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup}>
              {/* Name Row */}
              <div className="row">
                <div className="col-md-12 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control bg-dark border-secondary text-white py-2"
                    placeholder="John"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email and Contact Row */}
              <div className="row">
                <div className="col-md-7 mb-3 text-start">
                  <label className="text-white-50 small mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-dark border-secondary text-white py-2"
                    placeholder="john@example.com"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-5 mb-3 text-start">
                  <label className="text-white-50 small mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact_number"
                    className="form-control bg-dark border-secondary text-white py-2"
                    placeholder="09123456789"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Hobbies and Gender Row */}
              <div className="row">
                <div className="col-md-7 mb-3 text-start">
                  <label className="text-white-50 small mb-1">
                    Hobby / Interest
                  </label>
                  <input
                    type="text"
                    name="hobbies"
                    list="hobby-options"
                    className="form-control bg-dark border-secondary text-white py-2"
                    placeholder="Search or type..."
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <datalist id="hobby-options">
                    {hobbiesList.map((hobby, idx) => (
                      <option key={idx} value={hobby.hobby_name} />
                    ))}
                  </datalist>
                </div>
                <div className="col-md-5 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Gender</label>
                  <select
                    name="gender"
                    className="form-select bg-dark border-secondary text-white py-2"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Password Row */}
              <div className="row">
                <div className="col-md-6 mb-3 text-start">
                  <label className="text-white-50 small mb-1">Password</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control bg-dark border-secondary text-white py-2 pe-5"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`}
                      style={{
                        cursor: "pointer",
                        color: "#05d9c6",
                        fontSize: "1.1rem",
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>
                <div className="col-md-6 mb-4 text-start">
                  <label className="text-white-50 small mb-1">
                    Confirm Password
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      className="form-control bg-dark border-secondary text-white py-2 pe-5"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                    <i
                      className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`}
                      style={{
                        cursor: "pointer",
                        color: "#05d9c6",
                        fontSize: "1.1rem",
                      }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    ></i>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold py-3 mb-2 rounded-3 text-dark"
                style={{
                  background: "linear-gradient(45deg, #05d9c6, #00bfaf)",
                  border: "none",
                }}
              >
                Register Account Now
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
