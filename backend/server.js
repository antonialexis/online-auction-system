const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db"); // This is now the Supabase client
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
    const { error } = await db.from("users").insert([
      {
        first_name,
        last_name,
        email,
        contact_number,
        hobbies,
        gender,
        password: hashedPassword,
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: "Registered successfully!" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: users, error } = await db
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) throw error;
    if (!users || users.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
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
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- PROTECTED ROUTES ---
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const { data, error } = await db
      .from("users")
      .select("first_name, last_name, email, contact_number, hobbies, gender")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "User not found" });

    res.status(200).json(data);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/profile/update", verifyToken, async (req, res) => {
  const { email, contact_number, hobbies } = req.body;
  const userId = req.user.id;

  try {
    const { data, error, count } = await db
      .from("users")
      .update({ email, contact_number, hobbies })
      .eq("id", userId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0)
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
    const { data: user, error: fetchError } = await db
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (fetchError || !user)
      return res.status(404).json({ message: "User not found" });

    // 2. Verify old password
    const valid = await bcrypt.compare(old_password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Incorrect current password" });

    // 3. Hash and update
    const newHash = await bcrypt.hash(new_password, 10);
    const { error: updateError } = await db
      .from("users")
      .update({ password: newHash })
      .eq("id", userId);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error occurred" });
  }
});

// --- AUCTION ROUTES ---
app.post("/api/auctions/create", verifyToken, async (req, res) => {
  const { title, description, starting_bid, end_time } = req.body;
  const seller_id = req.user.id;

  try {
    const { error } = await db.from("auctions").insert([
      {
        seller_id,
        title,
        description,
        starting_bid,
        current_bid: starting_bid,
        end_time,
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: "Auction created successfully!" });
  } catch (err) {
    console.error("Auction Creation Error:", err);
    res.status(500).json({ error: "Failed to create auction." });
  }
});

app.post("/api/bids/place", verifyToken, async (req, res) => {
  const { auction_id, bid_amount } = req.body;
  const bidder_id = req.user.id;

  const numericBid = parseFloat(bid_amount);
  if (isNaN(numericBid)) {
    return res.status(400).json({ error: "Invalid bid amount." });
  }

  try {
    // Using the RPC function defined in schema.sql for atomic transaction
    const { error } = await db.rpc("place_bid", {
      p_auction_id: auction_id,
      p_bidder_id: bidder_id,
      p_bid_amount: numericBid,
    });

    if (error) {
      // Supabase RPC errors often contain a 'message' that we can show
      return res.status(400).json({ error: error.message || "Bidding failed." });
    }

    res.status(200).json({ message: "Bid placed successfully!" });
  } catch (err) {
    console.error("Bidding Error:", err);
    res.status(500).json({ error: "Bidding failed due to a server error." });
  }
});

// Get all active auctions
app.get("/api/auctions", async (req, res) => {
  try {
    const { data, error } = await db
      .from("auctions")
      .select(`
        *,
        users (
          first_name
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data to match the expected format (seller_name)
    const transformedData = data.map(item => ({
      ...item,
      seller_name: item.users ? item.users.first_name : "Unknown"
    }));

    res.json(transformedData);
  } catch (err) {
    console.error("Fetch Auctions Error:", err);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
