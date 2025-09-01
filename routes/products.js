const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json({ status: true, data: rows });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
