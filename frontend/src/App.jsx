import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/register";
import ForgotPassword from "./pages/forgotpassword";
import HomePage from "./pages/homepage";
import BidHistory from "./pages/bidHistory"; 
import MarketPage from "./pages/marketPage";
import ItemCard from "./components/itemcards";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/bidHistory" element={<BidHistory />} />
        <Route path="/item/:id" element={<ItemCard />} />
      </Routes>
    </Router>
  );
}

export default App;
