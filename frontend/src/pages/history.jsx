import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import { supabase } from '../supabaseClient';
import { notify } from '../utils/notifications';

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      try {
        await supabase.rpc('settle_expired_auctions');

        // 1. Fetch auctions the user bid on
        const bidsPromise = supabase
          .from('bids')
          .select(`
            auction_id,
            bid_amount,
            bid_time,
            auctions (
              item_name,
              title,
              current_bid,
              status,
              end_time,
              winner_id,
              users!auctions_seller_id_fkey (
                first_name
              )
            )
          `)
          .eq('bidder_id', user.id)
          .order('bid_time', { ascending: false });

        // 2. Fetch auctions the user created (their listings)
        const listingsPromise = supabase
          .from('auctions')
          .select(`
            id,
            item_name,
            title,
            current_bid,
            starting_price,
            status,
            end_time,
            created_at,
            winner_id
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        const [bidsResult, listingsResult] = await Promise.all([bidsPromise, listingsPromise]);

        if (bidsResult.error) throw bidsResult.error;
        if (listingsResult.error) throw listingsResult.error;

        const combinedHistory = [];

        // Process Bids
        const seenBids = new Set();
        (bidsResult.data || []).forEach(record => {
          if (!seenBids.has(record.auction_id)) {
            const auction = record.auctions;
            const isEnded = new Date(auction.end_time) < new Date() || auction.status === 'closed';
            
            combinedHistory.push({
              id: `bid-${record.auction_id}`,
              type: 'Bid',
              item: auction.item_name || auction.title,
              date: new Date(record.bid_time).toLocaleDateString(),
              amount: record.bid_amount,
              status: isEnded ? (auction.winner_id === user.id ? "Won" : "Outbid") : "Active",
              partner: auction.users?.first_name || "Unknown Seller",
              timestamp: new Date(record.bid_time).getTime()
            });
            seenBids.add(record.auction_id);
          }
        });

        // Process Listings
        (listingsResult.data || []).forEach(item => {
          combinedHistory.push({
            id: `listing-${item.id}`,
            type: 'Listing',
            item: item.item_name || item.title,
            date: new Date(item.created_at).toLocaleDateString(),
            amount: item.current_bid || item.starting_price,
            status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            partner: "You (Seller)",
            timestamp: new Date(item.created_at).getTime()
          });
        });

        // Sort by most recent first
        combinedHistory.sort((a, b) => b.timestamp - a.timestamp);

        setHistoryData(combinedHistory);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDownloadReport = () => {
    if (historyData.length === 0) return notify("No history to download.", "info");
    
    const headers = ["Type", "Item", "Date", "Amount", "Status", "Partner"];
    const rows = historyData.map(r => [r.type, r.item, r.date, r.amount, r.status, r.partner]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `activity_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dark-theme min-vh-100 pb-5 text-white">
      <Header />

      <div className="container py-5 mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold mb-1">Account Activity History</h2>
            <p className="text-white-50">Review all your bids and listings in one place.</p>
          </div>
          <button 
            className="btn btn-outline-info btn-sm rounded-pill px-4"
            onClick={handleDownloadReport}
            disabled={loading || historyData.length === 0}
          >
            <i className="bi bi-download me-2"></i>
            Download Full Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-white-50">Fetching your activity...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="text-center py-5 rounded-4" style={{ backgroundColor: "#161a2d", border: "2px dashed rgba(255,255,255,0.05)" }}>
            <i className="bi bi-clock-history display-1 text-white-25 mb-3 d-block"></i>
            <h4 className="text-white">No history found</h4>
            <p className="text-white-50">Bids you've placed and items you've listed will appear here.</p>
          </div>
        ) : (
          <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: "#161a2d" }}>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead style={{ backgroundColor: "#0e1121" }}>
                  <tr>
                    <th className="ps-4 py-3 border-0 text-white-50 small text-uppercase">Type</th>
                    <th className="py-3 border-0 text-white-50 small text-uppercase">Item Details</th>
                    <th className="py-3 border-0 text-white-50 small text-uppercase">Date</th>
                    <th className="py-3 border-0 text-white-50 small text-uppercase text-end">Amount</th>
                    <th className="py-3 border-0 text-white-50 small text-uppercase text-center">Outcome / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((record) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td className="ps-4 py-4">
                        <span className={`badge px-2 py-1 ${record.type === 'Bid' ? 'bg-info text-dark' : 'bg-primary'}`}>
                          {record.type}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-white d-block">{record.item}</span>
                        <small className="text-white-50">{record.partner}</small>
                      </td>
                      <td className="text-white-50 small">{record.date}</td>
                      <td className="fw-bold text-end text-info px-3">
                        ${Number(record.amount).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill ${
                          record.status === 'Won' || record.status === 'Active' ? 'bg-success text-white' : 
                          record.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger-subtle text-danger'
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
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
