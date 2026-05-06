const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ==========================
// MAILTRAP TRANSPORTER
// ==========================
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "dc03493b7b0b52",
    pass: "74452043294e87"
  }
});

// ==========================
// SIGNUP WITH EMAIL VERIFY
// ==========================
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(email)) {
    return res.status(400).send("Please enter a valid Gmail address");
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).send("DB error");
    if (result.length > 0) return res.status(400).send("User already exists");

    const token = crypto.randomBytes(32).toString("hex");

    db.query(
      "INSERT INTO users (name, email, password, verified, verification_token) VALUES (?, ?, ?, 0, ?)",
      [name, email, password, token],
      async (err2) => {
        if (err2) return res.status(500).send("Signup error");

        try {
          const link = `http://localhost:4000/api/users/verify-email?token=${token}`;
          await transporter.sendMail({
            from: "no-reply@lostfound.com",
            to: email,
            subject: "Verify your email",
            html: `<a href="${link}">Verify Email</a>`
          });

          res.send("Verification email sent");
        } catch {
          res.status(500).send("Email sending failed");
        }
      }
    );
  });
});

// ==========================
// VERIFY EMAIL
// ==========================
router.get("/verify-email", (req, res) => {
  const { token } = req.query;

  db.query(
    "SELECT * FROM users WHERE verification_token = ?",
    [token],
    (err, result) => {
      if (err || result.length === 0) {
        return res.send("Invalid or expired link");
      }

      db.query(
        "UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?",
        [result[0].id],
        () => res.send("Email verified successfully")
      );
    }
  );
});

// ==========================
// LOGIN
// ==========================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).send("DB error");
      if (result.length === 0) return res.status(400).send("Invalid credentials");
      if (!result[0].verified) return res.status(403).send("Verify email first");

      res.json({ message: "Login successful", user: result[0] });
    }
  );
});

// =====================================================
// 🆕 USER PROFILE (NEW FEATURE)
// =====================================================
router.get("/profile/:userId", (req, res) => {
  const userId = req.params.userId;

  // 1️⃣ Get user info
  db.query(
    "SELECT id, email FROM users WHERE id = ?",
    [userId],
    (err, users) => {
      if (err || users.length === 0) {
        return res.status(404).send("User not found");
      }

      const user = users[0];

      // 2️⃣ Get items posted
      db.query(
        "SELECT * FROM items WHERE user_email = ?",
        [user.email],
        (err2, items) => {
          if (err2) return res.status(500).send("Items fetch error");

          // 3️⃣ Get claims made
          db.query(
            "SELECT * FROM claims WHERE claimant_id = ?",
            [userId],
            (err3, claims) => {
              if (err3) return res.status(500).send("Claims fetch error");

              res.json({
                user,
                items,
                claims
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
