const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   RECENTLY ACTIVE USERS
========================= */

router.get("/recent-users", (req, res) => {

  const sql = `
    SELECT users.name, items.title, items.created_at
    FROM items
    JOIN users ON items.user_email = users.email
    ORDER BY items.created_at DESC
    LIMIT 5
  `;

  db.query(sql, (err, rows) => {

    if (err) {
      console.error("❌ Recent users error:", err);
      return res.status(500).send("Database error");
    }

    res.json(rows);

  });

});

module.exports = router;