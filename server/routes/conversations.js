const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// get messages for conversation
router.get("/:id/messages", auth, async (req, res) => {
  const convId = req.params.id;
  const messages = await Message.find({ conversation: convId })
    .sort({ createdAt: 1 })
    .populate("sender", "name email");
  res.json(messages);
});

// create or get conversation between two users
router.post("/between", auth, async (req, res) => {
  const { userId } = req.body; // other user id
  let conv = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] },
  });
  if (!conv) {
    conv = await Conversation.create({ participants: [req.user._id, userId] });
  }
  res.json(conv);
});

module.exports = router;
