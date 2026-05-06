const express = require("express");
const router = express.Router();
const db = require("../db");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASS = "admin123";

// LOGIN
router.post("/login", (req, res) => {
  console.log("Incoming admin login:", req.body);  // ⭐ REQUIRED FOR DEBUGGING

  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    return res.json({ token: "ADMIN_SECRET_TOKEN" });
  }

  res.status(400).send("Invalid admin login");
});

// AUTH MIDDLEWARE
router.use((req, res, next) => {
  if (req.headers.authorization !== "ADMIN_SECRET_TOKEN") {
    return res.status(403).send("Not authorized");
  }
  next();
});

// GET ITEMS
router.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, rows) => {
    if (err) return res.status(500).send("DB error");
    res.json(rows);
  });
});

// DELETE ITEM
router.delete("/items/:id", (req, res) => {
  db.query("DELETE FROM items WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("DB error");
    res.send("Deleted");
  });
});

// GET USERS
router.get("/users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, rows) => {
    if (err) return res.status(500).send("DB error");
    res.json(rows);
  });
});

module.exports = router;
