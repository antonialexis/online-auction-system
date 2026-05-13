const db = require("./db");

async function testFetch() {
  try {
    const { data, error } = await db
      .from("auctions")
      .select(`
        *,
        users (
          first_name
        )
      `)
      .limit(1);

    if (error) {
      console.error("Fetch with 'users' failed:", error.message);
      // Try with the explicit fkey name
      const { data: data2, error: error2 } = await db
        .from("auctions")
        .select(`
          *,
          users!auctions_seller_id_fkey (
            first_name
          )
        `)
        .limit(1);
      
      if (error2) {
        console.error("Fetch with 'auctions_seller_id_fkey' failed:", error2.message);
      } else {
        console.log("Success with 'auctions_seller_id_fkey'");
      }
    } else {
      console.log("Success with 'users'");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    process.exit();
  }
}

testFetch();
