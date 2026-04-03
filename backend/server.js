const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(cors());
app.use(express.json());

// 1. Connection test
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS solution");
    res.send({ message: "Database Connected!", detail: rows });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 2. FIXED LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Search by email ONLY first
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    const user = rows[0];

    // Compare the plain text password from the user with the hashed password from the DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.status(200).json({
        message: "Login success",
        user: { id: user.id, email: user.email },
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error!" });
  }
});

// 3. REGISTER ROUTE (Updated to match new schema)
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
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.query(
      "INSERT INTO users (first_name, last_name, email, contact_number, hobbies, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name,
        email,
        contact_number,
        hobbies,
        gender,
        hashedPassword,
      ],
    );
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed!" });
  }
});

// GET route to fetch all predefined hobbies
app.get("/api/hobbies", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT hobby_name FROM hobbies ORDER BY hobby_name ASC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hobbies" });
  }
});

// 4. FORGOT PASSWORD ROUTE
app.post("/api/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedNewPassword, email],
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(404).json({ error: "Email not found!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error!" });
  }
});

// 5. GET ALL AUCTION ITEMS
app.get("/api/items", async (req, res) => {
  try {
    // JOIN to get the seller's name with item details
    const [rows] = await db.query(`
      SELECT 
        items.*, 
        users.first_name, 
        users.last_name 
      FROM items 
      JOIN users ON items.seller_id = users.id
      WHERE items.status = 'active'
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch auction items" });
  }
});

app.listen(5000, () => console.log("Server is running on port 5000!"));
