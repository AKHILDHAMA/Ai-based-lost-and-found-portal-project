const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   ADD STORY
========================= */
router.post("/add-story", (req, res) => {

  const { item_name, location, story, user_email } = req.body;

  if (!user_email) {
    return res.status(400).send("User not logged in");
  }

  const sql = `
    INSERT INTO recovery_stories
    (item_name, location, story, user_email)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [item_name, location, story, user_email], (err) => {
    if (err) {
      console.log("ADD STORY ERROR:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Story added" });
  });

});

/* =========================
   GET STORIES + COMMENTS
========================= */
router.get("/stories", (req, res) => {

  const sql = `SELECT * FROM recovery_stories ORDER BY date_posted DESC`;

  db.query(sql, (err, stories) => {

    if (err) return res.status(500).json(err);

    if (stories.length === 0) return res.json([]);

    let count = 0;

    stories.forEach((s, i) => {

      db.query(
        "SELECT * FROM story_comments WHERE story_id=? ORDER BY created_at DESC",
        [s.id],
        (err2, comments) => {

          if (err2) {
            console.log("COMMENT FETCH ERROR:", err2);
          }

          stories[i].comments = comments || [];

          count++;
          if (count === stories.length) {
            res.json(stories);
          }

        }
      );

    });

  });

});

/* =========================
   ADD COMMENT (FIXED)
========================= */
router.post("/comment", (req, res) => {

  const { story_id, comment, user_email } = req.body;

  console.log("Incoming comment:", req.body);

  if (!story_id || !comment || !user_email) {
    return res.status(400).send("Missing data");
  }

  const sql = `
    INSERT INTO story_comments (story_id, comment, user_email)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [story_id, comment, user_email], (err, result) => {

    if (err) {
      console.log("❌ COMMENT ERROR:", err);
      return res.status(500).send("DB error");
    }

    console.log("✅ Comment added:", result.insertId);

    res.send("Comment added");

  });

});

/* =========================
   DELETE COMMENT
========================= */
router.delete("/comment/:id/:email", (req, res) => {

  const { id, email } = req.params;

  const sql = `
    DELETE FROM story_comments
    WHERE id=? AND user_email=?
  `;

  db.query(sql, [id, email], (err) => {

    if (err) {
      console.log("DELETE COMMENT ERROR:", err);
      return res.status(500).send("Delete failed");
    }

    res.send("Comment deleted");

  });

});

/* =========================
   DELETE STORY
========================= */
router.delete("/delete/:id/:email", (req, res) => {

  const { id, email } = req.params;

  const sql = `
    DELETE FROM recovery_stories
    WHERE id=? AND user_email=?
  `;

  db.query(sql, [id, email], (err) => {

    if (err) {
      console.log("DELETE STORY ERROR:", err);
      return res.status(500).send("Delete failed");
    }

    res.send("Story deleted");

  });

});

module.exports = router;