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

module.exports = router;
