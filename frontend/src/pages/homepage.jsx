import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import ItemCard from "../components/itemcards";
import ItemModal from "../components/itemModal";
import { supabase } from "../supabaseClient";

const HomePage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [limitedItems, setLimitedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const limitedItemsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLimitedItems();
  }, []);

  const fetchLimitedItems = async () => {
    setLoading(true);
    try {
      await supabase.rpc('settle_expired_auctions');
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          users!auctions_seller_id_fkey (
            first_name,
            rating,
            is_verified,
            verification_status
          )
        `)
        .eq('status', 'active')
        .eq('is_limited', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const formattedData = data.map((auction) => ({
        ...auction,
        seller_name: auction.users ? auction.users.first_name : "Unknown",
        seller_rating: auction.users ? auction.users.rating : 4.5,
        seller_verified: auction.users?.is_verified === true && auction.users?.verification_status === 'approved',
        image_url: auction.image_url || 'https://placehold.co/600x600/png?text=No+Image',
        starting_price: auction.starting_price ?? auction.starting_bid ?? 0,
      }));

      setLimitedItems(formattedData);
    } catch (err) {
      console.error("Error fetching limited items:", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToItems = () => {
    limitedItemsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const featuredItem = limitedItems[0] || null;

  return (
    <div className="dark-theme">
      <Header />

      {/* HERO SECTION */}
      <section className="container py-5 my-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-start">
            <h1 className="display-3 fw-bold text-white mb-4 lh-sm">
              Explore the{" "}
              <span style={{ color: "#05d9c6" }}>Top Tier</span> best
              collectible items right here
            </h1>
            <p className="lead text-white opacity-75 mb-5">
              Buy rare digital and physical collectibles in here to add
              to your collection. Join high-stakes auctions with vetted sellers.
            </p>

           <div className="d-flex gap-3 justify-content-start">
              <button
                onClick={scrollToItems}
                className="btn btn-primary text-dark fw-bold px-4 py-3"
                style={{ backgroundColor: "#05d9c6", borderRadius: "8px", border: "none" }}
              >
                Explore limited products
              </button>

              <button onClick={() => navigate('/create-auction')} className="btn btn-outline-light fw-bold px-4 py-3" style={{ borderRadius: "8px" }}>
                  Start Selling
              </button>
            </div>

            {/* NUMBERS DISPLAY */}
            <div className="d-flex gap-5 justify-content-start text-start text-white pt-5 mt-4">
              <div>
                <h2 className="mb-0 fw-bold">10K+</h2>
                <small className="opacity-75">Bids Placed</small>
              </div>
              <div>
                <h2 className="mb-0 fw-bold">5K+</h2>
                <small className="opacity-75">Active Users</small>
              </div>
              <div>
                <h2 className="mb-0 fw-bold">2K+</h2>
                <small className="opacity-75">Live Auctions</small>
              </div>
            </div>
          </div>

          <div className="col-lg-6 d-none d-lg-block">
            {/* FEATURED ITEM DISPLAY */}
            {featuredItem ? (
              <div
                className="p-3 position-relative"
                style={{
                  border: "2px solid rgba(5, 217, 198, 0.4)",
                  borderRadius: "24px",
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedItem(featuredItem)}
              >
                <img
                  src={featuredItem.image_url}
                  className="img-fluid rounded-4 shadow-lg w-100 object-fit-cover"
                  style={{ height: '450px' }}
                  alt="featured collectible"
                />
                <div className="position-absolute bottom-0 start-0 m-4 p-3 rounded-4 bg-dark border border-secondary shadow-lg">
                  <span className="badge bg-info text-dark mb-1">FEATURED LOT</span>
                  <h5 className="text-white fw-bold mb-0 text-truncate" style={{ maxWidth: '250px' }}>{featuredItem.item_name || featuredItem.title}</h5>
                  <p className="text-info fw-bold mb-0">${featuredItem.current_bid?.toLocaleString() || featuredItem.starting_price?.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-4 bg-dark text-center py-5 border border-secondary opacity-50">
                <i className="bi bi-star display-1 d-block mb-3"></i>
                <p>No featured items yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ITEM CATEGORIES  */}
      <section className="container mb-5 py-4">
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2 border-secondary">
          <h3 className="h5 fw-bold text-white mb-0">Browse Categories:</h3>
        </div>

        {/* CATEGORY BUTTONS */}
        <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
          {['Anime Figurines', 'Trading Cards', 'Rare Manga', 'Vintage Gaming'].map((cat, idx) => (
            <div className="col" key={idx}>
              <button
                className="btn btn-light w-100 text-start py-3 fw-bold rounded-4 shadow-sm"
                style={{ backgroundColor: "#161a2d", color: "#fff", borderColor: "rgba(255,255,255,0.05)" }}
                onClick={() => navigate(`/market?category=${cat}`)}
              >
                <i className={`bi bi-${idx === 0 ? 'robot' : idx === 1 ? 'ticket' : idx === 2 ? 'book' : 'controller'} me-2 text-info`}></i> {cat}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* LIMITED ITEMS */}
     <section ref={limitedItemsRef} className="container mb-5 pb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h4 fw-bold text-white mb-0">
              Limited Auctions <span className="text-warning small ms-2"><i className="bi bi-lightning-fill"></i> Hot Bids</span>
            </h2>

            <button 
              onClick={() => navigate('/market')} 
              className="btn btn-outline-info btn-sm rounded-pill fw-bold px-3"
            >
              Explore More <i className="bi bi-arrow-right"></i>
            </button>
        </div>

        {loading ? (
          <div className="text-center py-5 opacity-50">Loading hot bids...</div>
        ) : limitedItems.length === 0 ? (
          <div className="text-center py-5 rounded-4 bg-dark border border-secondary opacity-50">
            <p>No limited auctions currently active.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 g-4">
              {limitedItems.map((item) => (
                <div 
                  className="col" 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)} 
                  style={{ cursor: "pointer" }}
                >
                  <ItemCard item={item} />
                </div>
              ))}
          </div>
        )}
      </section>

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onBidSuccess={fetchLimitedItems}
        />
      )}

      <footer className="bg-dark text-white py-4 mt-auto" style={{ borderTop: "2px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="container text-center">
          <p className="mb-1 fw-bold">Collectors.net Auction</p>
          <small className="text-white-50">© 2026 The Elite Collector Circle. All Rights Reserved.</small>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
