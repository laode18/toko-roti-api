const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pool = require("../db");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// CREATE Product
router.post("/create", upload.single("image"), async (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || !price || !stock) {
    return res.json({ status: false, message: "Missing required fields" });
  }

  let imageName = null;
  if (req.file) {
    const ext = path.extname(req.file.originalname);
    imageName = Date.now() + "_" + req.file.filename + ext;
    fs.renameSync(req.file.path, `uploads/${imageName}`);
  }

  try {
    await pool.query("INSERT INTO products (name, price, stock, image) VALUES (?, ?, ?, ?)", [name, price, stock, imageName]);
    res.json({ status: true, message: "Product created" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// UPDATE Product
router.post("/update", upload.single("image"), async (req, res) => {
  const { id, name, price, stock } = req.body;
  if (!id) return res.json({ status: false, message: "Product ID required" });

  try {
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const imageName = Date.now() + "_" + req.file.filename + ext;
      fs.renameSync(req.file.path, `uploads/${imageName}`);

      await pool.query("UPDATE products SET name=?, price=?, stock=?, image=? WHERE id=?", [name, price, stock, imageName, id]);
    } else {
      await pool.query("UPDATE products SET name=?, price=?, stock=? WHERE id=?", [name, price, stock, id]);
    }
    res.json({ status: true, message: "Product updated" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// DELETE Product
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT image FROM products WHERE id=?", [id]);
    if (rows.length > 0 && rows[0].image) {
      const filePath = path.join(__dirname, "../uploads/", rows[0].image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ status: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
