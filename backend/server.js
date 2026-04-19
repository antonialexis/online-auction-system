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
    role,
  } = req.body;
  if (!role) return res.status(400).json({ error: "Role is required." });

  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharRegex.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain a special character." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = `INSERT INTO users (first_name, last_name, email, contact_number, hobbies, gender, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.query(sql, [
      first_name,
      last_name,
      email,
      contact_number,
      hobbies,
      gender,
      hashedPassword,
      role,
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

  db.query(sql, [email, contact_number, hobbies, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database update failed" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated successfully" });
  });
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
