import React, { useEffect, useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/header';
import ItemCard from '../components/itemcards'; 
import ItemModal from '../components/itemModal';
import { supabase } from '../supabaseClient';

const MarketPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedItem, setSelectedItem] = useState(null); 
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        category: 'All',
        minPrice: '',
        maxPrice: '',
        search: ''
    });

    // Sync modal with URL ?id= param
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('id');
        if (id && allItems.length > 0) {
            const item = allItems.find(i => i.id.toString() === id);
            if (item) setSelectedItem(item);
        }
    }, [location.search, allItems]);
    
    const fetchAuctions = async () => {
        setLoading(true);
        try {
            // Settle any expired auctions first
            await supabase.rpc('settle_expired_auctions');

            const { data: { user } } = await supabase.auth.getUser();
            
            let query = supabase
                .from("auctions")
                .select(`
                    *,
                    users!auctions_seller_id_fkey (
                        first_name,
                        rating,
                        is_verified,
                        verification_status
                    )
                `);

            // Filter logic: (status is active) OR (status is pending AND seller is current user)
            if (user) {
                query = query.or(`status.eq.active,and(status.eq.pending,seller_id.eq.${user.id})`);
            } else {
                query = query.eq("status", "active");
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;

            const formattedData = data.map((auction) => ({
              ...auction,
              id: auction.id,
              seller_name: auction.users ? auction.users.first_name : "Unknown",
              seller_rating: auction.users ? auction.users.rating : 4.5,
              seller_verified: auction.users?.is_verified === true && auction.users?.verification_status === 'approved',
              image_url: auction.image_url || 'https://placehold.co/600x600/png?text=No+Image',
              starting_price: auction.starting_price ?? auction.starting_bid ?? 0,
            }));

            setAllItems(formattedData);
            setFilteredItems(formattedData);
        } catch (err) {
            console.error("Failed to load auctions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();

        // Subscribe to real-time changes in auctions
        const channel = supabase
            .channel('public:auctions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
                fetchAuctions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        handleApplyFilters();
    }, [filters.search, allItems]);

    const handleApplyFilters = () => {
        let results = [...allItems];

        if (filters.category !== 'All') {
            results = results.filter(item => item.category === filters.category);
        }

        if (filters.minPrice) {
            results = results.filter(item => (item.current_bid ?? item.starting_price) >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            results = results.filter(item => (item.current_bid ?? item.starting_price) <= parseFloat(filters.maxPrice));
        }

        if (filters.search) {
            const query = filters.search.toLowerCase();
            results = results.filter(item => 
                (item.item_name || item.title || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query)
            );
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
                                Market Search
                            </h5>

                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-dark border-secondary text-white-50"><i className="bi bi-search"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-dark border-secondary text-white shadow-none"
                                        placeholder="Search collectibles..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <label className="text-white-50 small d-block mb-2 fw-bold" style={{ letterSpacing: '1px' }}>CATEGORIES</label>
                            <select 
                                className="form-select form-select-sm bg-dark text-white border-secondary rounded-3 py-2 mb-4"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                {['All', 'Anime Figurines', 'Trading Cards', 'Manga', 'Video Games', 'Collectibles'].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Price Range with Suggestions */}
                            <div className="mb-4 position-relative">
                                <label className="text-white-50 small d-block mb-2 fw-bold" style={{ letterSpacing: '1px' }}>PRICE RANGE</label>
                                <div className="d-flex gap-2 mb-2">
                                    <input 
                                        type="number" 
                                        placeholder="Min price" 
                                        className="form-control form-control-sm bg-dark text-white border-secondary rounded-3 py-2" 
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Max price" 
                                        className="form-control form-control-sm bg-dark text-white border-secondary rounded-3 py-2" 
                                        value={filters.maxPrice}
                                        onFocus={() => setShowPriceSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowPriceSuggestions(false), 200)}
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                    />
                                </div>

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
                                    <div className="col" key={item.id}>
                                        <div onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer', height: '100%' }}>
                                            <ItemCard item={item} />
                                        </div>
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
                    onBidSuccess={() => {
                        fetchAuctions();
                        setSelectedItem(null);
                    }}
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
