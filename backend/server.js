const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Auction API is running!");
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
