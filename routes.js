const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./books.db", (err) => {
  if (err) {
    console.error("Gagal terkoneksi ke database:", err.message);
  } else {
    console.log("Terhubung ke database SQLite.");
  }
});

router.options("/books", (req, res) => {
  res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");
  res.sendStatus(204); // 204 No Content
});

router.head("/books", (req, res) => {
  res.status(200).end();
});

router.get("/books", (req, res) => {
  const sql = "SELECT * FROM books";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    res.status(200).json({
      message: "Daftar buku berhasil diambil",
      data: rows,
    });
  });
});

/**
 * GET /books/:id
 * Mengambil data buku berdasarkan ID
 */
router.get("/books/:id", (req, res) => {
  const sql = "SELECT * FROM books WHERE id = ?";
  const id = req.params.id;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Buku tidak ditemukan" });
      return;
    }
    res.status(200).json({
      message: "Buku berhasil diambil",
      data: row,
    });
  });
});

/**
 * POST /books
 * Menambahkan data buku baru
 * Body JSON wajib berisi:
 *   - title (string)
 *   - author (string)
 * Optional:
 *   - published_date (string)
 *   - description (string)
 */
router.post("/books", (req, res) => {
  const { title, author, published_date, description } = req.body;
  console.log(req);

  console.log(req.body);
  if (!title || !author) {
    res.status(400).json({ message: "Field title dan author wajib diisi" });
    return;
  }
  const sql =
    "INSERT INTO books (title, author, published_date, description) VALUES (?, ?, ?, ?)";
  db.run(sql, [title, author, published_date, description], function (err) {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    res.status(201).json({
      message: "Buku berhasil dibuat",
      data: {
        id: this.lastID,
        title,
        author,
        published_date,
        description,
      },
    });
  });
});

/**
 * PUT /books/:id
 * Mengupdate seluruh data buku berdasarkan ID.
 * Wajib mengirim body JSON dengan field: title dan author.
 * Field published_date dan description bersifat opsional.
 */
router.put("/books/:id", (req, res) => {
  const { title, author, published_date, description } = req.body;
  if (!title || !author) {
    res.status(400).json({ message: "Field title dan author wajib diisi" });
    return;
  }
  const sql =
    "UPDATE books SET title = ?, author = ?, published_date = ?, description = ? WHERE id = ?";
  const id = req.params.id;
  db.run(sql, [title, author, published_date, description, id], function (err) {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Buku tidak ditemukan" });
      return;
    }
    res.status(200).json({
      message: "Buku berhasil diupdate",
      data: { id: parseInt(id), title, author, published_date, description },
    });
  });
});

/**
 * PATCH /books/:id
 * Mengupdate sebagian data buku (partial update) berdasarkan ID.
 * Body JSON dapat berisi salah satu atau beberapa field: title, author, published_date, description.
 */
router.patch("/books/:id", (req, res) => {
  const id = req.params.id;
  const fields = [];
  const values = [];

  if (req.body.title) {
    fields.push("title = ?");
    values.push(req.body.title);
  }
  if (req.body.author) {
    fields.push("author = ?");
    values.push(req.body.author);
  }
  if (req.body.published_date) {
    fields.push("published_date = ?");
    values.push(req.body.published_date);
  }
  if (req.body.description) {
    fields.push("description = ?");
    values.push(req.body.description);
  }

  if (fields.length === 0) {
    res
      .status(400)
      .json({ message: "Tidak ada field yang valid untuk diupdate" });
    return;
  }

  const sql = `UPDATE books SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, function (err) {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Buku tidak ditemukan" });
      return;
    }
    res.status(200).json({
      message: "Buku berhasil diupdate (partial update)",
      data: { id: parseInt(id), ...req.body },
    });
  });
});

/**
 * DELETE /books/:id
 * Menghapus buku berdasarkan ID.
 */
router.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM books WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Buku tidak ditemukan" });
      return;
    }
    res.status(200).json({
      message: "Buku berhasil dihapus",
    });
  });
});
module.exports = router;
