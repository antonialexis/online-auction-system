const db = require("./db");

async function checkAuctions() {
  try {
    const { data, error } = await db.from("auctions").select("*");
    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log("Auctions:", data);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkAuctions();
