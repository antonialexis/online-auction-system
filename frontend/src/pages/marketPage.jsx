import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import ItemCard from '../components/itemcards'; 
import ItemModal from '../components/itemModal';
import { supabase } from '../supabaseClient';

const MarketPage = () => {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(null); 
    const [allItems, setAllItems] = useState([]);

    React.useEffect(() => {
        const fetchAuctions = async () => {
            try {
<<<<<<< HEAD
                const response = await fetch("http://localhost:5000/api/auctions");
                const data = await response.json();
                
                // Map database fields to match what your ItemCard expects
                const formattedData = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    seller: item.seller_name || 'Collector',
                    sellerShort: (item.seller_name || 'C').substring(0, 2).toUpperCase(),
                    currentBid: parseFloat(item.current_bid) || 0, // Ensure it's a number
                    image: item.image_url || 'https://placehold.co/600x600/png?text=No+Image',
                    description: item.description
=======
                const { data, error } = await supabase
                    .from("auctions")
                    .select(`
                        *,
                        users!auctions_seller_id_fkey (
                            first_name
                        )
                    `)
                    .eq("status", "active")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                const normalized = data.map((auction) => ({
                  ...auction,
                  id: auction.id,
                  seller_name: auction.users ? auction.users.first_name : "Unknown"
>>>>>>> 87ee87f (Made the database, Supabase.)
                }));

                setAllItems(formattedData);
            } catch (err) {
                console.error("Failed to load auctions:", err);
            }
        };
        fetchAuctions();
    }, []);
  return (
    <div className="dark-theme min-vh-100">
      <Header />
      
      <div className="container py-5">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 mb-4">
            <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#161a2d' }}>
              <h5 className="text-white fw-bold mb-4">Filters</h5>
              <div className="mb-4">
                <label className="text-white-50 small d-block mb-2">CATEGORY</label>
                <div className="d-flex flex-column gap-2">
                  {['All', 'Anime Figurines', 'Trading Cards', 'Manga', 'Video Games'].map(cat => (
                    <button key={cat} className="btn btn-sm text-start text-white border-0 p-0 opacity-75">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white-50 small d-block mb-2">PRICE RANGE</label>
                <input type="range" className="form-range" />
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 fw-bold text-white mb-0">Marketplace</h2>
              <select className="form-select form-select-sm bg-dark text-white border-secondary w-auto rounded-3">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
              {allItems.map((item) => (
                // 3. Added onClick here to set the selected item
                <div className="col" key={item.id} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

    <button 
        onClick={() => navigate('/create-auction')}
        className="btn btn-primary position-fixed bottom-0 end-0 m-4 shadow-lg d-flex align-items-center justify-content-center"
        style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#05d9c6', color: '#000', border: 'none', zIndex: 1000 }}
        title="Sell an Item"
      >
        <i className="bi bi-plus-lg fs-3"></i>
      </button>

    </div>
  );
};

export default MarketPage;