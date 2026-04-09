import React, { useState } from 'react'; 
import Header from '../components/header';
import ItemCard from '../components/itemcards'; 
import ItemModal from '../components/itemModal';

const MarketPage = () => {
    const [selectedItem, setSelectedItem] = useState(null); 

    const allItems = [
        { 
          id: 1, 
          title: 'Naruto Figurine', 
          seller: 'AAnime_Vault', 
          currentBid: 3200, 
          image: 'https://placehold.co/600x600/png?text=Naruto' 
        },
        { 
          id: 2, 
          title: 'Charizard Card', 
          seller: 'Pika_Pros', 
          currentBid: 125000, 
          image: 'https://placehold.co/600x600/png?text=Charizard' 
        },
    ];

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
    </div>
  );
};

export default MarketPage;