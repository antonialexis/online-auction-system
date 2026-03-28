import React from "react";
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  // Style for the active link
  const activeStyle = {
    color: "#4f46e5", // Metaz blue/indigo
    opacity: "1",
    borderBottom: "2px solid #4f46e5"
  };

  return (
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
            style={({ isActive }) => (isActive ? activeStyle : { opacity: "0.7" })}
          >
            Home
          </NavLink>

          <NavLink
            to="/marketplace"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) => (isActive ? activeStyle : { opacity: "0.7" })}
          >
            Marketplace
          </NavLink>

          <NavLink
            to="/about"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) => (isActive ? activeStyle : { opacity: "0.7" })}
          >
            About
          </NavLink>

          <NavLink
            to="/dashboard"
            className="text-white text-decoration-none fw-bold"
            style={({ isActive }) => (isActive ? activeStyle : { opacity: "0.7" })}
          >
            Dashboard
          </NavLink>
        </nav>
        
        {/* Placeholder for spacing to keep nav centered */}
        <div style={{width: '120px'}} className="d-none d-md-block"></div>
      </div>
    </header>
  );
};

export default Header;