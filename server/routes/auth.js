const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    // checking if any missing field
    return res.status(400).json({ message: "Missing fields" });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const salt = await bcrypt.genSalt(10); // using 10 rounds salt
    console.log("Salt generated:", salt);

    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log("User registered:", user.name, user.email);

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
    console.log("User:", user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log("User logged in:", user.name, user.email);

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
