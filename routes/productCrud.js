const express = require("express");
const pool = require("../db");

const router = express.Router();

// CREATE Product
router.post("/create", async (req, res) => {
  try {
    const { name, price, stock, image } = req.body;
    if (!name || !price || !stock) {
      return res.json({ status: false, message: "Missing required fields" });
    }

    await pool.query(
      "INSERT INTO products (name, price, stock, image) VALUES (?, ?, ?, ?)",
      [name, price, stock, image || null]
    );

    res.json({ status: true, message: "Product created" });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

// UPDATE Product
router.post("/update", async (req, res) => {
  try {
    const { id, name, price, stock, image } = req.body;
    if (!id) return res.json({ status: false, message: "Product ID required" });

    if (image) {
      await pool.query(
        "UPDATE products SET name=?, price=?, stock=?, image=? WHERE id=?",
        [name, price, stock, image, id]
      );
    } else {
      await pool.query(
        "UPDATE products SET name=?, price=?, stock=? WHERE id=?",
        [name, price, stock, id]
      );
    }

    res.json({ status: true, message: "Product updated" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

// DELETE Product
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ status: true, message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
