const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const app = express();
const saltRounds = 10;
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = decoded;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    contact_number,
    hobbies,
    gender,
    password,
  } = req.body;

  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>-]/;
  if (!specialCharRegex.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain a special character." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = `INSERT INTO users (first_name, last_name, email, contact_number, hobbies, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await db.query(sql, [
      first_name,
      last_name,
      email,
      contact_number,
      hobbies,
      gender,
      hashedPassword,
    ]);
    res.status(201).json({ message: "Registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res
        .status(200)
        .json({ message: "Login successful", token, name: user.first_name });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- PROTECTED ROUTES ---
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT first_name, last_name, email, contact_number, hobbies, gender FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/profile/update", verifyToken, async (req, res) => {
  const { email, contact_number, hobbies } = req.body;
  const userId = req.user.id;
  const sql = `UPDATE users SET email = ?, contact_number = ?, hobbies = ? WHERE id = ?`;

  try {
    const [result] = await db.query(sql, [email, contact_number, hobbies, userId]);
    
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
      
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Database update failed" });
  }
});

app.post("/api/profile/change-password", verifyToken, async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;

  if (!old_password || !new_password) {
    return res.status(400).json({ message: "Both passwords are required" });
  }

  try {
    // 1. Fetch current password
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    // 2. Verify old password
    const valid = await bcrypt.compare(old_password, rows[0].password);
    if (!valid)
      return res.status(401).json({ message: "Incorrect current password" });

    // 3. Hash and update
    const newHash = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      newHash,
      userId,
    ]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error occurred" });
  }
});
// --- AUCTION ROUTES ---
app.post("/api/auctions/create", verifyToken, async (req, res) => {
  const { title, description, starting_bid, end_time } = req.body;
  const seller_id = req.user.id; // From verifyToken decoded JWT

  try {
    const sql = `INSERT INTO auctions (seller_id, title, description, starting_bid, current_bid, end_time) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    await db.query(sql, [seller_id, title, description, starting_bid, starting_bid, end_time]);
    res.status(201).json({ message: "Auction created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create auction." });
  }
});
app.post("/api/bids/place", verifyToken, async (req, res) => {
  const { auction_id, bid_amount } = req.body;
  const bidder_id = req.user.id;

  // Ensure bid_amount is a valid number
  const numericBid = parseFloat(bid_amount);
  if (isNaN(numericBid)) {
    return res.status(400).json({ error: "Invalid bid amount." });
  }

  try {
    // 1. Fetch auction details including seller_id
    const [rows] = await db.query(
      "SELECT current_bid, end_time, status, seller_id FROM auctions WHERE id = ?", 
      [auction_id]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: "Auction not found." });
    
    const auction = rows[0];

    // Check if bidder is the seller
    if (auction.seller_id === bidder_id) {
      return res.status(400).json({ error: "You cannot bid on your own auction." });
    }

    // Check if auction is still active
    if (auction.status === 'closed' || new Date(auction.end_time) < new Date()) {
        return res.status(400).json({ error: "Auction has already ended." });
    }

    // Check if bid is high enough
    if (numericBid <= auction.current_bid) {
      return res.status(400).json({ error: "Bid must be higher than the current bid." });
    }

    // 2. START TRANSACTION
    // This ensures both the history log and the price update succeed together
    await db.query("START TRANSACTION");

    try {
      // Record the bid in history
      await db.query(
        "INSERT INTO bids (auction_id, bidder_id, bid_amount) VALUES (?, ?, ?)", 
        [auction_id, bidder_id, numericBid]
      );

      // Update the main auction price
      await db.query(
        "UPDATE auctions SET current_bid = ? WHERE id = ?", 
        [numericBid, auction_id]
      );

      await db.query("COMMIT");
      res.status(200).json({ message: "Bid placed successfully!" });

    } catch (transactionError) {
      await db.query("ROLLBACK");
      throw transactionError; // Pass to the outer catch block
    }

  } catch (err) {
    console.error("Bidding Error:", err);
    res.status(500).json({ error: "Bidding failed due to a server error." });
  }
});
// Get all active auctions
app.get("/api/auctions", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT auctions.*, users.first_name as seller_name 
       FROM auctions 
       JOIN users ON auctions.seller_id = users.id 
       WHERE status = 'active' 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
