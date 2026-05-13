const mysql = require("mysql2/promise");
const db = require("./db"); // Your existing pool
require("dotenv").config(); // Ensure variables are loaded

async function setupDatabase() {
  try {
    // 1. Connect to the server WITHOUT a database name
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // 2. Create the database
    console.log(`Checking/Creating database: ${process.env.DB_NAME}...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``,
    );
    await connection.end(); // Close this connection

    // 3. Now use your pool to create the tables
    console.log("Database ready. Setting up tables...");
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email VARCHAR(150) UNIQUE,
      contact_number VARCHAR(20),
      hobbies TEXT,
      gender VARCHAR(20),
      password VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log("Tables ready.");
    process.exit(0);
  } catch (err) {
    console.error("Setup failed:", err);
    process.exit(1);
  }
}

setupDatabase();
