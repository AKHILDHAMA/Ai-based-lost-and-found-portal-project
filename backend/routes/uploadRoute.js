const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadFolder = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
  console.log("📁 Uploads folder created");
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload route
router.post("/", upload.single("image"), (req, res) => {
  console.log("🔥 Upload route hit:", req.file);

  // Error: No file uploaded
  if (!req.file) {
    console.log("❌ No file uploaded!");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `http://localhost:4000/uploads/${req.file.filename}`;

  res.json({
    message: "File uploaded successfully",
    url: fileUrl
  });
});

module.exports = router;
