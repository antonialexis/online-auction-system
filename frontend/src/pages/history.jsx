import React from 'react';
import Header from '../components/header';

const HistoryPage = () => {
  // Dummy data representing past auction activity
  const historyData = [
    {
      id: 1,
      item: "Limited Edition Naruto Figurine",
      date: "2026-03-15",
      finalBid: 3200,
      status: "Won",
      seller: "AAnime_Vault"
    },
    {
      id: 2,
      item: "First Edition Charizard PSA 10",
      date: "2026-03-10",
      finalBid: 125000,
      status: "Outbid",
      seller: "Pika_Pros"
    },
    {
      id: 3,
      item: "Vintage Gameboy Color - Teal",
      date: "2026-02-28",
      finalBid: 450,
      status: "Won",
      seller: "Retro_Resale"
    }
  ];

  return (
    <div className="dark-theme min-vh-100 pb-5 text-white">
      <Header />
      
      <div className="container py-5 mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold mb-1">Activity History</h2>
            <p className="text-white-50">Review your past bids and auction outcomes.</p>
          </div>
          <button className="btn btn-outline-info btn-sm rounded-pill px-4">
            Download Report
          </button>
        </div>

        <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: "#161a2d" }}>
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead style={{ backgroundColor: "#0e1121" }}>
                <tr>
                  <th className="ps-4 py-3 border-0 text-white-50 small text-uppercase">Item Details</th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase">Date</th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase">Seller</th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase">Final Bid</th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase text-center">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((record) => (
                  <tr key={record.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="ps-4 py-4">
                      <span className="fw-bold text-white">{record.item}</span>
                    </td>
                    <td className="text-white-50">{record.date}</td>
                    <td className="text-info">{record.seller}</td>
                    <td className="fw-bold">${record.finalBid.toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`badge px-3 py-2 rounded-pill ${
                        record.status === 'Won' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State Suggestion (Commented out for now) */}
        {/* historyData.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-clock-history display-1 text-white-25"></i>
            <p className="mt-3 text-white-50">No history found. Start bidding to see records here!</p>
          </div>
        )*/}
      </div>
    </div>
  );
};

export default HistoryPage;