const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    const products = rows.map((row) => ({
      ...row,
      image_url: row.image ? `${req.protocol}://${req.get("host")}/uploads/${row.image}` : null,
    }));
    res.json({ status: true, data: products });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
