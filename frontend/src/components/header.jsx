import React from "react";

const Header = () => {
  return (
    <header
      className="py-3 sticky-top"
      style={{
        backgroundColor: "rgba(14, 17, 33, 0.8)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div className="container d-flex align-items-center justify-content-between">
        <h3 className="mb-0 text-white fw-bold">Collectors.net</h3>

        {/* Modern text navigation */}
        <nav className="d-none d-md-flex gap-4">
          <a
            href="#"
            className="text-white opacity-75 text-decoration-none small fw-bold"
          >
            Home
          </a>
          <a
            href="#"
            className="text-white opacity-75 text-decoration-none small fw-bold"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="text-white opacity-75 text-decoration-none small fw-bold"
          >
            Stats
          </a>
          <a
            href="#"
            className="text-white opacity-75 text-decoration-none small fw-bold"
          >
            About
          </a>
        </nav>

        {/* Accent Button */}
        <button
          className="btn text-white small px-4 py-2 fw-bold"
          style={{
            backgroundColor: "#4f46e5" /* Metaz.net blue */,
            borderRadius: "8px",
          }}
        >
          {/* Change this later when user system is ready: */}
          Connect Wallet
        </button>
      </div>
    </header>
  );
};

export default Header;
