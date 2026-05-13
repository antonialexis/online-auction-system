const db = require("./db");

async function checkData() {
  try {
    const { data: users, error: uError } = await db.from("users").select("id, email");
    console.log("Users:", users);
    
    const { data: auctions, error: aError } = await db.from("auctions").select("*");
    console.log("Auctions:", auctions);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkData();
