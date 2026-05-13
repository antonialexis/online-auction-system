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
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [filters, setFilters] = useState({
        category: 'All',
        minPrice: '',
        maxPrice: ''
    });
    const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);

    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            try {
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

                const formattedData = data.map((auction) => ({
                  ...auction,
                  id: auction.id,
                  seller_name: auction.users ? auction.users.first_name : "Unknown",
                  image_url: auction.image_url || 'https://placehold.co/600x600/png?text=No+Image',
                }));

                setAllItems(formattedData);
                setFilteredItems(formattedData);
            } catch (err) {
                console.error("Failed to load auctions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    const handleApplyFilters = () => {
        let results = [...allItems];

        if (filters.category !== 'All') {
            results = results.filter(item => item.category === filters.category);
        }

        if (filters.minPrice) {
            results = results.filter(item => item.starting_price >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            results = results.filter(item => item.starting_price <= parseFloat(filters.maxPrice));
        }

        setFilteredItems(results);
    };

    const handlePriceSuggestion = (price) => {
        setFilters({ ...filters, maxPrice: price.toString() });
        setShowPriceSuggestions(false);
    };

  return (
    <div className="dark-theme min-vh-100">
      <Header />
      
      <div className="container py-5">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 mb-4">
            <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#161a2d', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-filter-left me-2 text-info"></i>
                Filters
              </h5>
              
              {/* Category Dropdown */}
              <div className="mb-4">
                <label className="text-white-50 small d-block mb-2 fw-bold" style={{ letterSpacing: '1px' }}>CATEGORY</label>
                <select 
                  className="form-select form-select-sm bg-dark text-white border-secondary rounded-3 py-2"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  {['All', 'Anime Figurines', 'Trading Cards', 'Manga', 'Video Games', 'Collectibles'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range with Suggestions */}
              <div className="mb-4 position-relative">
                <label className="text-white-50 small d-block mb-2 fw-bold" style={{ letterSpacing: '1px' }}>PRICE RANGE</label>
                <div className="d-flex gap-2 mb-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="form-control form-control-sm bg-dark text-white border-secondary rounded-3 py-2" 
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="form-control form-control-sm bg-dark text-white border-secondary rounded-3 py-2" 
                    value={filters.maxPrice}
                    onFocus={() => setShowPriceSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPriceSuggestions(false), 200)}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>

                {/* Price Suggestions Dropdown */}
                {showPriceSuggestions && (
                    <div className="position-absolute w-100 bg-dark border border-secondary rounded-3 shadow-lg p-2 z-3 mt-1" style={{ top: '100%' }}>
                        <small className="text-white-50 d-block mb-2 px-2">Suggested Max Price</small>
                        <div className="d-flex flex-wrap gap-2 px-2">
                            {[10, 50, 100, 500, 1000].map(price => (
                                <button 
                                    key={price} 
                                    className="btn btn-sm btn-outline-info py-1 px-3 rounded-pill"
                                    style={{ fontSize: '11px' }}
                                    onClick={() => handlePriceSuggestion(price)}
                                >
                                    ${price}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
              </div>

              {/* Apply Filter Button */}
              <button 
                className="btn btn-info w-100 fw-bold py-2 rounded-3 mt-2 shadow-sm text-dark"
                onClick={handleApplyFilters}
                style={{ backgroundColor: '#05d9c6', border: 'none' }}
              >
                Apply Filters
              </button>
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
              {loading ? (
                  <div className="col-12 text-center py-5 text-white-50">Loading items...</div>
              ) : filteredItems.length === 0 ? (
                  <div className="col-12 text-center py-5 text-white-50">No items match your filters.</div>
              ) : (
                  filteredItems.map((item) => (
                    <div className="col" key={item.id} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                      <ItemCard item={item} />
                    </div>
                  ))
              )}
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
        className="btn btn-primary position-fixed bottom-0 end-0 m-4 shadow-lg d-flex align-items-center gap-2 px-4 py-3 rounded-pill fw-bold"
        style={{ backgroundColor: '#05d9c6', color: '#000', border: 'none', zIndex: 1000 }}
      >
        <i className="bi bi-plus-lg fs-5"></i>
        <span>Create Listing</span>
      </button>

    </div>
  );
};

export default MarketPage;