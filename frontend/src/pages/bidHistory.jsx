import React, { useState } from "react";
import Header from "../components/header"; // Fixed casing to match component

const BidHistory = () => {
  const [activeTab, setActiveTab] = useState("bidding");

  return (
    <div
      className="dark-theme min-vh-100 pb-5"
      style={{ backgroundColor: "#0e1121" }}
    >
      <Header />

      <div className="container py-5">
        <div className="row g-4">
          {/* SIDEBAR NAVIGATION */}
          <div className="col-lg-3">
            <div
              className="card border-0 rounded-4 p-3 shadow"
              style={{ backgroundColor: "#161a2d" }}
            >
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{
                    width: "80px",
                    height: "80px",
                    fontSize: "24px",
                    color: "white",
                  }}
                >
                  JD
                </div>
                <h5 className="text-white fw-bold mb-0">John Doe</h5>
                <p className="text-white-50 small">Verified Collector</p>
              </div>

              <div className="d-grid gap-2">
                <button
                  onClick={() => setActiveTab("bidding")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "bidding" ? "btn-primary shadow" : "text-white-50"}`}
                  style={
                    activeTab === "bidding"
                      ? { backgroundColor: "#4f46e5" }
                      : {}
                  }
                >
                  <i className="bi bi-hammer me-2"></i> Active Bids
                </button>
                <button
                  onClick={() => setActiveTab("selling")}
                  className={`btn text-start rounded-3 py-2 border-0 ${activeTab === "selling" ? "btn-primary shadow" : "text-white-50"}`}
                  style={
                    activeTab === "selling"
                      ? { backgroundColor: "#4f46e5" }
                      : {}
                  }
                >
                  <i className="bi bi-tags me-2"></i> My Listings
                </button>
                <button className="btn text-start text-white-50 rounded-3 py-2 border-0">
                  <i className="bi bi-heart me-2"></i> Watchlist
                </button>
                <hr className="text-white-50 opacity-25" />
                <button className="btn text-start text-danger rounded-3 py-2 border-0">
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="col-lg-9 text-white">
            {activeTab === "bidding" ? (
              <div className="animate__animated animate__fadeIn">
                <h3 className="fw-bold mb-4">Active Bids</h3>
                <div
                  className="table-responsive rounded-4 shadow"
                  style={{ backgroundColor: "#161a2d" }}
                >
                  <table className="table table-dark table-hover mb-0">
                    <thead>
                      <tr className="text-white-50">
                        <th className="ps-4 py-3 border-secondary">Item</th>
                        <th className="py-3 border-secondary">Current Bid</th>
                        <th className="py-3 border-secondary">Your Bid</th>
                        <th className="py-3 border-secondary">Status</th>
                        <th className="pe-4 py-3 text-end border-secondary">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="align-middle border-secondary">
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3 py-2">
                            <img
                              src="https://placehold.co/50x50/png?text=Naruto"
                              className="rounded-2 shadow-sm"
                              alt=""
                            />
                            <span className="small fw-bold">
                              Naruto PVC Figurine
                            </span>
                          </div>
                        </td>
                        <td>$3,200</td>
                        <td className="text-success fw-bold">$3,200</td>
                        <td>
                          <span className="badge bg-success rounded-pill px-3">
                            Winning
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button className="btn btn-sm btn-outline-light rounded-pill px-3">
                            View
                          </button>
                        </td>
                      </tr>
                      <tr className="align-middle border-secondary">
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3 py-2">
                            <img
                              src="https://placehold.co/50x50/png?text=Charizard"
                              className="rounded-2 shadow-sm"
                              alt=""
                            />
                            <span className="small fw-bold">
                              Charizard Card PSA 10
                            </span>
                          </div>
                        </td>
                        <td>$125,000</td>
                        <td className="text-danger fw-bold">$120,000</td>
                        <td>
                          <span className="badge bg-danger rounded-pill px-3">
                            Outbid
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button
                            className="btn btn-sm btn-primary rounded-pill px-3"
                            style={{
                              backgroundColor: "#4f46e5",
                              border: "none",
                            }}
                          >
                            Bid Again
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold mb-0">My Listings</h3>
                  <button
                    className="btn btn-primary fw-bold px-4 rounded-3 shadow"
                    style={{ backgroundColor: "#4f46e5", border: "none" }}
                  >
                    + Post New Item
                  </button>
                </div>
                <div
                  className="p-5 text-center rounded-4 shadow"
                  style={{
                    backgroundColor: "#161a2d",
                    border: "2px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  <i className="bi bi-box-seam display-4 text-white-50 mb-3 d-block"></i>
                  <p className="text-white-50">
                    You haven't listed any items for auction yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidHistory;
