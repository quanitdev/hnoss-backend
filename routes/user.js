const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // đường dẫn tùy dự án của bạn

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
