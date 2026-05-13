import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AdminBar from "./AdminBar";

const Header = () => {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "Guest";

  const handleLogout = async (e) => {
    e.stopPropagation(); 
    await supabase.auth.signOut();
    localStorage.removeItem("userName");
    navigate("/");
  };

  // Style for the active link
  const activeStyle = {
    color: "#4f46e5",
    opacity: "1",
    borderBottom: "2px solid #4f46e5",
  };

  return (
    <>
      <AdminBar />
      <header
      className="py-3 sticky-top"
      style={{
        backgroundColor: "rgba(14, 17, 33, 0.8)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="text-decoration-none">
          <h3 className="mb-0 text-white fw-bold">Collectors.net</h3>
        </Link>

        {/* NAVIGATION */}
        <nav className="d-none d-md-flex gap-4 mx-auto">
          <NavLink
            to="/home"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/market"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            Market
          </NavLink>
          <NavLink
            to="/bids"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            My Bids
          </NavLink>
          <NavLink
            to="/about"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            About
          </NavLink>
          <NavLink
            to="/history"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) =>
              isActive ? activeStyle : { opacity: "0.7" }
            }
          >
            History
          </NavLink>
        </nav>

        {/* PROFILE SECTION */}
        <div
          className="d-flex align-items-center gap-3 p-2 rounded-4"
          style={{
            cursor: "pointer",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(5, 217, 198, 0.2)",
            transition: "0.3s ease",
            minWidth: "180px"
          }}
          onClick={() => navigate("/profile")}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(5, 217, 198, 0.1)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")
          }
        >
          <div
            className="rounded-circle overflow-hidden shadow"
            style={{
              width: "45px",
              height: "45px",
              border: "2px solid #05d9c6",
              flexShrink: 0
            }}
          >
            <img
              src="https://placehold.co/400x400/05d9c6/000?text=U"
              alt="Profile"
              className="w-100 h-100 object-fit-cover"
            />
          </div>

          <div className="d-flex flex-column align-items-start justify-content-center overflow-hidden">
            <span
              className="text-white fw-bold text-uppercase text-truncate w-100"
              style={{ letterSpacing: "1px", fontSize: "0.85rem" }}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-link text-danger p-0 m-0 text-decoration-none fw-bold"
              style={{ fontSize: "0.75rem", transition: "0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#ff4d4d")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#dc3545")}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
