const db = require("./db");
const bcrypt = require("bcrypt");

const seedAdmin = async () => {
  const email = "admin@collectors.net";
  const password = "admin123123123!"; // Change this!
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if admin already exists
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length === 0) {
      const sql = `INSERT INTO users (first_name, last_name, email, contact_number, hobbies, gender, password, role) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      await db.query(sql, [
        "Admin",
        "User",
        email,
        "0000000000",
        "Admin",
        "N/A",
        hashedPassword,
        "Admin",
      ]);
      console.log("Admin account created successfully!");
    } else {
      console.log("Admin account already exists.");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  } finally {
    process.exit();
  }
};

seedAdmin();
