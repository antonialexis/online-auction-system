import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import ItemCard from "../components/itemcards";
import ItemModal from "../components/itemModal";

// Simulated data for your new categories and items (Items, Bids requirements)
const collectorItems = [
  {
    id: 1,
    title: "Limited Edition Naruto (Nine-Tails Chakra Mode) PVC Figurine",
    seller: "AAnime_Vault",
    sellerShort: "AV",
    currentBid: 3200,
    bids: 88,
    image: "https://placehold.co/600x600/png?text=Naruto+Figurine",
  },
  {
    id: 2,
    title: "PSA 10 Gem Mint Shadowless First Edition Charizard",
    seller: "Pika_Pros",
    sellerShort: "PP",
    currentBid: 125000,
    bids: 212,
    image: "https://placehold.co/600x600/png?text=Charizard+Card",
  },
  {
    id: 3,
    title: "Original Japanese Neo Destiny Sealed Booster Box",
    seller: "TCG_Treasures",
    sellerShort: "TT",
    currentBid: 9800,
    bids: 74,
    image: "https://placehold.co/600x600/png?text=TCG+Booster",
  },
];

const HomePage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const limitedItemsRef = useRef(null);
  const navigate = useNavigate();

  const scrollToItems = () => {
    limitedItemsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dark-theme">
      <Header />

      {/* HERO SECTION */}
      <section className="container py-5 my-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-start">
            <h1 className="display-3 fw-bold text-white mb-4 lh-sm">
              Explore the{" "}
              <span style={{ color: "var(--accent-pink)" }}>10,000+</span> best
              collectible items right here
            </h1>
            <p className="lead text-white opacity-75 mb-5">
              Buy rare digital and physical collectibles in here to add
              to your collection.
            </p>

           <div className="d-flex gap-3 justify-content-start">
              <button
                onClick={scrollToItems}
                className="btn btn-primary text-white fw-bold px-4 py-3"
                style={{ backgroundColor: "#4f46e5", borderRadius: "8px", border: "none" }}
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
                <small className="opacity-75">Artwork</small>
              </div>
              <div>
                <h2 className="mb-0 fw-bold">15K+</h2>
                <small className="opacity-75">Artist</small>
              </div>
              <div>
                <h2 className="mb-0 fw-bold">20K+</h2>
                <small className="opacity-75">Auction</small>
              </div>
            </div>
          </div>

          <div className="col-lg-6 d-none d-lg-block">
            {/* FEATURED ITEM DISPLAY */}
            <div
              className="p-3"
              style={{
                border:
                  "2px solid rgba(217, 70, 239, 0.4)" /* Pink border outline */,
                borderRadius: "24px",
              }}
              onClick={() => setSelectedItem(collectorItems[1])}
            >
              <img
                src="https://placehold.co/600x600/png?text=Featured+Lot"
                className="img-fluid rounded-4 shadow-lg"
                alt="featured collectible"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ITEM CATEGORIES  */}
      <section className="container mb-5 py-4">
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 dark-theme-border">
          <div className="d-flex align-items-center gap-2">
            <h3 className="h5 fw-bold text-white mb-0">Browse Categories:</h3>
            <button
              className="btn btn-outline-light btn-sm ms-2 dropdown-toggle rounded-pill"
              type="button"
              data-bs-toggle="dropdown"
            >
              All Collectibles
            </button>
          </div>
        </div>

        {/* CATEGORY BUTTONS */}
        <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
          <div className="col">
            <button
              className="btn btn-light w-100 text-start py-3 fw-bold rounded-4 shadow-sm"
              style={{
                backgroundColor: "#161a2d",
                color: "#fff",
                borderColor: "transparent",
              }}
            >
              <i className="bi bi-robot me-2"></i> Anime Figurines
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-light w-100 text-start py-3 fw-bold rounded-4 shadow-sm"
              style={{
                backgroundColor: "#161a2d",
                color: "#fff",
                borderColor: "transparent",
              }}
            >
              <i className="bi bi-ticket me-2"></i> Trading Cards
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-light w-100 text-start py-3 fw-bold rounded-4 shadow-sm"
              style={{
                backgroundColor: "#161a2d",
                color: "#fff",
                borderColor: "transparent",
              }}
            >
              <i className="bi bi-book me-2"></i> Rare Manga/Comics
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-light w-100 text-start py-3 fw-bold rounded-4 shadow-sm"
              style={{
                backgroundColor: "#161a2d",
                color: "#fff",
                borderColor: "transparent",
              }}
            >
              <i className="bi bi-controller me-2"></i> Vintage Gaming
            </button>
          </div>
        </div>
      </section>

      {/* LIMITED ITEMS | INIT NGA ITEMS */}
     <section ref={limitedItemsRef} className="container mb-5 pb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h4 fw-bold text-white mb-0">
              Limited Auctions <span className="text-warning small ms-2"><i className="bi bi-lightning-fill"></i> Hot Bids</span>
            </h2>

            <button 
              onClick={() => navigate('/market')} 
              className="btn btn-outline-light btn-sm rounded-pill fw-bold"
            >
              Explore More <i className="bi bi-arrow-right"></i>
            </button>
        </div>

        <div className="row row-cols-1 row-cols-md-3 g-4">
            {collectorItems.map((item) => (
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
      </section>

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      <footer className="bg-dark text-white py-3 mt-auto" style={{ borderTop: "2px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="container text-center">
          <p className="mb-0 fw-bold">Collectors.net Auction</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
