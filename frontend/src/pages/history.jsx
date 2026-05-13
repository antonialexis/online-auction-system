import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { supabase } from "../supabaseClient";

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch closed auctions where user participated
        const { data: bids, error } = await supabase
          .from('bids')
          .select(`
            bid_amount,
            bid_time,
            auctions (
              id,
              title,
              current_bid,
              status,
              end_time,
              users (
                first_name
              )
            )
          `)
          .eq('bidder_id', user.id)
          .eq('auctions.status', 'closed')
          .order('bid_time', { ascending: false });

        if (error) throw error;

        // Filter to latest bid per auction and format
        const uniqueHistory = [];
        const seenAuctions = new Set();
        if (bids) {
          for (const b of bids) {
            if (b.auctions && !seenAuctions.has(b.auctions.id)) {
              uniqueHistory.push({
                id: b.auctions.id,
                item: b.auctions.title,
                date: new Date(b.auctions.end_time).toLocaleDateString(),
                finalBid: b.auctions.current_bid,
                status: b.bid_amount >= b.auctions.current_bid ? "Won" : "Outbid",
                seller: b.auctions.users ? b.auctions.users.first_name : "Unknown"
              });
              seenAuctions.add(b.auctions.id);
            }
          }
        }
        setHistoryData(uniqueHistory);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="dark-theme min-vh-100 pb-5 text-white">
      <Header />

      <div className="container py-5 mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold mb-1">Activity History</h2>
            <p className="text-white-50">
              Review your past bids and auction outcomes.
            </p>
          </div>
        </div>

        <div
          className="card border-0 rounded-4 overflow-hidden shadow-lg"
          style={{ backgroundColor: "#161a2d" }}
        >
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead style={{ backgroundColor: "#0e1121" }}>
                <tr>
                  <th className="ps-4 py-3 border-0 text-white-50 small text-uppercase">
                    Item Details
                  </th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase">
                    Date
                  </th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase">
                    Seller
                  </th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase">
                    Final Bid
                  </th>
                  <th className="py-3 border-0 text-white-50 small text-uppercase text-center">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5">Loading history...</td></tr>
                ) : historyData.length > 0 ? (
                  historyData.map((record) => (
                    <tr
                      key={record.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <td className="ps-4 py-4">
                        <span className="fw-bold text-white">{record.item}</span>
                      </td>
                      <td className="text-white-50">{record.date}</td>
                      <td className="text-info">{record.seller}</td>
                      <td className="fw-bold">
                        ${record.finalBid?.toLocaleString()}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge px-3 py-2 rounded-pill ${
                            record.status === "Won"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-white-50">
                      No past activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
