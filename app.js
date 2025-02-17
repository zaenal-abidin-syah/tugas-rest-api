// Import modul yang diperlukan
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;
const routes = require("./routes");

// Middleware untuk parsing JSON
app.use(express.json());

// Menjalankan server

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
