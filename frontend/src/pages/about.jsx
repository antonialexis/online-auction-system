import React from 'react';
import Header from '../components/header';

const AboutPage = () => {
  const teamMembers = [
    { name: "Member One", role: "Frontend Lead", bio: "UI/UX enthusiast obsessed with smooth animations and dark themes." },
    { name: "Member Two", role: "Backend Architect", bio: "Database wizard ensuring every bid is secure and real-time." },
    { name: "Member Three", role: "Product Manager", bio: "Strategic thinker connecting the dots between code and collectors." },
  ];

  return (
    <div className="dark-theme min-vh-100 pb-5 text-white">
      <Header />

      {/* MISSION SECTION */}
      <section className="container py-5 mt-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <h6 className="text-uppercase fw-bold mb-3" style={{ color: "#05d9c6", letterSpacing: "2px" }}>Our Story</h6>
            <h1 className="display-4 fw-bold mb-4">Redefining the <br /> <span style={{ color: "var(--accent-pink)" }}>Auction Experience</span></h1>
            <p className="lead opacity-75">
              Collectors.net was born out of a simple passion: making rare collectibles accessible to everyone, everywhere. 
              We've built a high-stakes environment where authenticity meets innovation.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="p-4 rounded-4 shadow-lg" style={{ backgroundColor: "#161a2d", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="row g-4">
                <div className="col-6">
                  <h2 className="fw-bold mb-0">99.9%</h2>
                  <small className="text-white-50">Secure Transactions</small>
                </div>
                <div className="col-6">
                  <h2 className="fw-bold mb-0">24/7</h2>
                  <small className="text-white-50">Live Bidding</small>
                </div>
                <div className="col-6">
                  <h2 className="fw-bold mb-0">150+</h2>
                  <small className="text-white-50">Rare Categories</small>
                </div>
                <div className="col-6">
                  <h2 className="fw-bold mb-0">10k+</h2>
                  <small className="text-white-50">Happy Collectors</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="container py-5 my-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Why Choose Us?</h2>
          <div className="mx-auto mt-2" style={{ width: "60px", height: "4px", backgroundColor: "#05d9c6" }}></div>
        </div>
        <div className="row g-4">
          {['Trust & Transparency', 'Global Reach', 'Authenticity First'].map((value, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="p-4 h-100 rounded-4 text-center" style={{ backgroundColor: "#0e1121", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="mb-3 fs-1" style={{ color: "#05d9c6" }}>
                  <i className={`bi bi-${idx === 0 ? 'shield-check' : idx === 1 ? 'globe' : 'patch-check'}`}></i>
                </div>
                <h5 className="fw-bold mb-3">{value}</h5>
                <p className="small text-white-50 mb-0">Providing the most reliable platform for high-value items and legendary cards.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="container py-5 mb-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">The Minds Behind the Circle</h2>
          <p className="text-white-50">The three-person team dedicated to building the future of auctions.</p>
        </div>
        <div className="row g-4 justify-content-center">
          {teamMembers.map((member, idx) => (
            <div className="col-lg-4 col-md-6" key={idx}>
              <div className="card h-100 border-0 rounded-4 p-4 text-center" style={{ backgroundColor: "#161a2d" }}>
                <div className="mx-auto mb-4 rounded-circle bg-dark d-flex align-items-center justify-content-center shadow" style={{ width: "100px", height: "100px", border: "2px solid #05d9c6" }}>
                  <span className="fs-2 fw-bold" style={{ color: "#05d9c6" }}>{member.name[0]}</span>
                </div>
                <h5 className="fw-bold text-white mb-1">{member.name}</h5>
                <p className="small mb-3" style={{ color: "var(--accent-pink)" }}>{member.role}</p>
                <p className="small text-white-50 px-3">{member.bio}</p>
                <div className="d-flex justify-content-center gap-3 mt-auto pt-3">
                  <i className="bi bi-github opacity-50 hover-opacity-100 pointer"></i>
                  <i className="bi bi-linkedin opacity-50 hover-opacity-100 pointer"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-dark text-white py-4 mt-5" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="container text-center text-white-50">
          <p className="mb-0 small">&copy; 2026 Collectors.net Auction. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;