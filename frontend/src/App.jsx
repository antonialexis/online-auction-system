import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/register";
import ForgotPassword from "./pages/forgotpassword";
import HomePage from "./pages/homepage";
import Bids from "./pages/bids"; 
import MarketPage from "./pages/marketPage";
import ItemCard from "./components/itemcards";
import AboutPage from "./pages/about";
import CreateAuction from "./pages/createAuction";
import ProfilePage from "./pages/profilePage";
import HistoryPage from "./pages/history";
import AdminPage from "./pages/adminPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import BanListener from "./components/BanListener";
import NotificationToasts from "./components/NotificationToasts";

function App() {
  return (
    <Router>
      <BanListener />
      <NotificationToasts />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />

        {/* Authenticated User Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/bids" element={<Bids />} />
        <Route path="/item/:id" element={<ItemCard />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<HistoryPage />} />

        {/* Admin-Only Route — protected by server-side role check */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
