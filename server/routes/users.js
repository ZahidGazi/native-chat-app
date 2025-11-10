const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  // get list of all users except the current user

  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-passwordHash"
  );
  console.log(users);

  res.json(users);
});

// Get single user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
