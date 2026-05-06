module.exports = function (io) {
  const express = require("express");
  const router = express.Router();
  const db = require("../db");
  const { similarityScore } = require("../utils/duplicateDetector");

  /* =========================
     ADD ITEM (WITH DUPLICATE CHECK)
  ========================= */
  router.post("/add", (req, res) => {
    const {
      title,
      description,
      image,
      status,
      user_email,
      latitude,
      longitude,
      location_text
    } = req.body;

    if (!title || !status || !user_email) {
      return res.status(400).send("Missing required fields");
    }

    db.query(
      "SELECT id, title, description FROM items WHERE status = ?",
      [status],
      (err, items) => {
        if (err) return res.status(500).send("DB error");

        let bestMatch = null;
        let bestScore = 0;

        items.forEach(item => {
          const score = similarityScore(
            `${title} ${description}`,
            `${item.title} ${item.description}`
          );

          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        });

        const match =
          bestScore >= 0.4
            ? { id: bestMatch.id, title: bestMatch.title }
            : null;

        const sql = `
          INSERT INTO items
          (title, description, image, status, user_email, latitude, longitude, location_text)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            title,
            description,
            image,
            status,
            user_email,
            latitude || null,
            longitude || null,
            location_text || null
          ],
          (err2, result) => {
            if (err2) {
              console.error("❌ Add item error:", err2);
              return res.status(500).send("Database error");
            }

            const newItem = {
              id: result.insertId,
              title,
              description,
              status,
              user_email,
              image,
              latitude,
              longitude,
              location_text
            };

            /* 🔴 LIVE FEED FEATURE */
            io.emit("new_item", newItem);

            /* 🔔 LOST ITEM ALERT SYSTEM */
            db.query(
              "SELECT user_email FROM alert_subscriptions WHERE item_keyword LIKE ?",
              [`%${title}%`],
              (err3, users) => {
                if (!err3 && users.length > 0) {
                  users.forEach(user => {
                    db.query(
                      `INSERT INTO notifications(user_email,title,body)
                       VALUES(?,?,?)`,
                      [
                        user.user_email,
                        "Lost Item Alert 🔔",
                        `${title} was reported near ${location_text || "unknown location"}`
                      ]
                    );

                    io.to(`user_${user.user_email}`).emit("new_notification", {
                      title: "Lost Item Alert 🔔",
                      body: `${title} was reported near ${location_text}`
                    });
                  });
                }
              }
            );

            res.json({
              message: "Item added successfully",
              item_id: result.insertId,
              match
            });
          }
        );
      }
    );
  });

  /* =========================
     GET ALL ITEMS
  ========================= */
  /* =========================
   GET ALL ITEMS
========================= */
router.get("/list", (req, res) => {

  const sql = `
    SELECT items.*, users.id AS user_id, users.verified
    FROM items
    LEFT JOIN users ON items.user_email = users.email
    ORDER BY items.created_at DESC
  `;

  db.query(sql, (err, rows) => {

    if (err) {
      console.error("❌ Items fetch error:", err);
      return res.status(500).send("DB error");
    }

    res.json(rows);

  });

});

 /* =========================
   ALERT SUBSCRIPTION
========================= */
router.post("/alert-subscribe", (req, res) => {

  const { user_email, keyword } = req.body;

  if (!user_email || !keyword) {
    return res.status(400).json({
      message: "Missing email or keyword"
    });
  }

  const sql = `
    INSERT INTO alert_subscriptions (user_email, item_keyword)
    VALUES (?,?)
  `;

  db.query(sql, [user_email, keyword], (err, result) => {

    if (err) {
      console.error("Alert subscription error:", err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    res.json({
      message: "Alert subscribed successfully"
    });

  });

});/* =========================
   ALERT SUBSCRIPTION
========================= */
router.post("/alert-subscribe", (req, res) => {

  console.log("🔔 ALERT API CALLED:", req.body);

  const { user_email, keyword } = req.body;

  if (!user_email || !keyword) {
    return res.status(400).json({
      message: "Missing email or keyword"
    });
  }

  const sql = `
    INSERT INTO alert_subscriptions (user_email, item_keyword)
    VALUES (?, ?)
  `;

  db.query(sql, [user_email, keyword], (err, result) => {

    if (err) {
      console.error("❌ ALERT DB ERROR:", err);
      return res.status(500).json({
        message: "Database error while saving alert"
      });
    }

    console.log("✅ Alert saved successfully");

    res.json({
      message: "Alert subscribed successfully"
    });

  });

});

  /* =========================
     SUBMIT CLAIM
  ========================= */
  router.post("/claim", (req, res) => {
    const { item_id, claimant_id, answers } = req.body;

    if (!item_id || !claimant_id || !answers) {
      return res.status(400).send("Missing claim data");
    }

    db.query(
      "INSERT INTO claims (item_id, claimant_id, answers) VALUES (?, ?, ?)",
      [item_id, claimant_id, answers],
      (err, result) => {
        if (err) return res.status(500).send("Claim failed");

        const claimId = result.insertId;

        db.query(
          "SELECT user_email FROM items WHERE id = ?",
          [item_id],
          (err2, rows) => {
            if (!rows || rows.length === 0) {
              return res.send("Claim submitted");
            }

            const ownerEmail = rows[0].user_email;

            io.to(`user_${ownerEmail}`).emit("new_notification", {
              title: "New Claim Request",
              body: answers,
              claim_id: claimId,
              role: "owner"
            });

            res.send("Claim submitted");
          }
        );
      }
    );
  });

  /* =========================
     APPROVE CLAIM
  ========================= */
  router.post("/claim/approve", (req, res) => {
    const { claim_id, location_text } = req.body;

    if (!claim_id || !location_text) {
      return res.status(400).send("Missing data");
    }

    db.query(
      "UPDATE claims SET status='approved' WHERE id=?",
      [claim_id],
      (err) => {
        if (err) return res.status(500).send("Approve failed");

        db.query(
          `SELECT users.email
           FROM claims
           JOIN users ON claims.claimant_id = users.id
           WHERE claims.id = ?`,
          [claim_id],
          (err2, rows) => {
            if (!rows || rows.length === 0) {
              return res.send("Approved");
            }

            const claimantEmail = rows[0].email;

            io.to(`user_${claimantEmail}`).emit("new_notification", {
              title: "Claim Approved ✅",
              body: `Pickup location: ${location_text}`,
              role: "claimant"
            });

            res.send("Claim approved");
          }
        );
      }
    );
  });

  /* =========================
     REJECT CLAIM
  ========================= */
  router.post("/claim/reject", (req, res) => {
    const { claim_id } = req.body;

    if (!claim_id) {
      return res.status(400).send("Missing claim id");
    }

    db.query(
      "UPDATE claims SET status='rejected' WHERE id=?",
      [claim_id],
      (err) => {
        if (err) return res.status(500).send("Reject failed");

        db.query(
          `SELECT users.email
           FROM claims
           JOIN users ON claims.claimant_id = users.id
           WHERE claims.id = ?`,
          [claim_id],
          (err2, rows) => {
            if (!rows || rows.length === 0) {
              return res.send("Rejected");
            }

            const claimantEmail = rows[0].email;

            io.to(`user_${claimantEmail}`).emit("new_notification", {
              title: "Claim Rejected ❌",
              body: "Owner rejected your claim request",
              role: "claimant"
            });

            res.send("Rejected");
          }
        );
      }
    );
  });

  /* =========================
     USER ITEMS
  ========================= */
  router.get("/user/:email", (req, res) => {
    const { email } = req.params;

    db.query(
      "SELECT * FROM items WHERE user_email = ? ORDER BY created_at DESC",
      [email],
      (err, rows) => {
        if (err) {
          console.error("❌ User items error:", err);
          return res.status(500).send("DB error");
        }
        res.json(rows);
      }
    );
  });

  /* =========================
     USER CLAIMS
  ========================= */
  router.get("/claims/:userId", (req, res) => {
    const { userId } = req.params;

    db.query(
      `SELECT claims.*, items.title
       FROM claims
       JOIN items ON claims.item_id = items.id
       WHERE claims.claimant_id = ?
       ORDER BY claims.created_at DESC`,
      [userId],
      (err, rows) => {
        if (err) {
          console.error("❌ User claims error:", err);
          return res.status(500).send("DB error");
        }
        res.json(rows);
      }
    );
  });

  return router;
};