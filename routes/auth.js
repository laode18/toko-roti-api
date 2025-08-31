const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ status: false, message: "Name, Email and Password required" });
  }

  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (rows.length > 0) {
      return res.json({ status: false, message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash]);
    res.json({ status: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ status: false, message: "Email and Password required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (rows.length === 0) return res.json({ status: false, message: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ status: false, message: "Invalid password" });

    res.json({
      status: true,
      message: "Login success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;
