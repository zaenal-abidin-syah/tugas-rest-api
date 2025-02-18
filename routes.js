const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./books.db", (err) => {
  if (err) {
    console.error("failed connected to database", err.message);
  } else {
    console.log("success connected to database");
  }
});

// OPTIONS endpoint for /books: sets allowed HTTP methods in the response header
router.options("/books", (req, res) => {
  res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");
  res.sendStatus(204);
});

// HEAD endpoint for /books: returns only headers (no response body)
router.head("/books", (req, res) => {
  res.status(200).end();
});

// GET endpoint for /books: retrieves the list of all books
router.get("/books", (req, res) => {
  const sql = "SELECT * FROM books";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    res.status(200).json({
      message: "Books list retrieved successfully",
      data: rows,
    });
  });
});

// GET endpoint for /books/:id: retrieves details of a specific book by id
router.get("/books/:id", (req, res) => {
  const sql = "SELECT * FROM books WHERE id = ?";
  const id = req.params.id;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.status(200).json({
      message: "Book retrieved successfully",
      data: row,
    });
  });
});

// POST endpoint for /books: creates a new book record
router.post("/books", (req, res) => {
  const { title, author, published_date, description } = req.body;
  console.log(req);

  console.log(req.body);
  if (!title || !author) {
    res.status(400).json({ message: "Title and author fields are required" });
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
      message: "Book created successfully",
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

// PUT endpoint for /books/:id: updates an entire book record by id
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
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.status(200).json({
      message: "Book updated successfully",
      data: { id: parseInt(id), title, author, published_date, description },
    });
  });
});

// PATCH endpoint for /books/:id: partially updates a book record by id
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
    res.status(400).json({ message: "No valid fields to update" });
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
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.status(200).json({
      message: "Book partially updated successfully",
      data: { id: parseInt(id), ...req.body },
    });
  });
});

// DELETE endpoint for /books/:id: deletes a book record by id
router.delete("/books/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM books WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.status(200).json({
      message: "Book deleted successfully",
    });
  });
});
module.exports = router;
