const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../db");

const router = express.Router();

// Pastikan folder uploads ada
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error("Only JPG, JPEG, and PNG are allowed"));
    }
    cb(null, true);
  }
});

// CREATE Product
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) {
      return res.json({ status: false, message: "Missing required fields" });
    }

    const imageName = req.file ? req.file.filename : null;

    await pool.query(
      "INSERT INTO products (name, price, stock, image) VALUES (?, ?, ?, ?)",
      [name, price, stock, imageName]
    );

    res.json({ status: true, message: "Product created" });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

// UPDATE Product
router.post("/update", upload.single("image"), async (req, res) => {
  try {
    const { id, name, price, stock } = req.body;
    if (!id) return res.json({ status: false, message: "Product ID required" });

    if (req.file) {
      const imageName = req.file.filename;
      await pool.query(
        "UPDATE products SET name=?, price=?, stock=?, image=? WHERE id=?",
        [name, price, stock, imageName, id]
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
    const [rows] = await pool.query("SELECT image FROM products WHERE id=?", [id]);

    if (rows.length > 0 && rows[0].image) {
      const filePath = path.join(uploadDir, rows[0].image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ status: true, message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
