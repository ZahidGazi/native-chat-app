require("dotenv").config();
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const convRoutes = require("./routes/conversations");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: "*" },
});

connectDB(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/conversations", convRoutes);

// in-memory map userId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  
  socket.on("user:online", async (userId) => {
    // allow multiple sockets per user ... this is for multiple chats
    const set = onlineUsers.get(userId) || new Set();
    set.add(socket.id);
    onlineUsers.set(userId, set);

    // mark user online in DB
    await User.findByIdAndUpdate(userId, { online: true });
    io.emit("presence:update", { userId, online: true });
  });

  socket.on("disconnect", async () => {
    // remove socket id from any user sets
    for (const [userId, set] of onlineUsers.entries()) {
      if (set.has(socket.id)) {
        set.delete(socket.id);

        if (set.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { online: false });
          io.emit("presence:update", { userId, online: false });
        } else {
          onlineUsers.set(userId, set);
        }
        break;
      }
    }
  });

  socket.on("message:send", async (payload) => {
    try {
      const { conversationId, senderId, text } = payload;
      
      if (!conversationId || !senderId || !text) {
        console.log("missing fields:", { conversationId, senderId, text });
        return;
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text,
        readBy: [senderId],
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
      });

      const populatedMessage = await Message.findById(message._id).populate("sender", "name email");

      const conversation = await Conversation.findById(conversationId).populate(
        "participants",
        "_id"
      );
      
      conversation.participants.forEach((p) => {
        const sockets = onlineUsers.get(String(p._id));
        if (sockets) {
          sockets.forEach((sid) => io.to(sid).emit("message:new", populatedMessage));
        }
      });

      socket.emit("message:sent", populatedMessage);
    } catch (error) {
      console.log("message send error:", error);
      socket.emit("message:error", { error: error.message });
    }
  });

  // typing
  socket.on("typing:start", ({ conversationId, userId }) => {
    // broadcast to conversation participants
    io.emit("typing:start", { conversationId, userId });
  });
  socket.on("typing:stop", ({ conversationId, userId }) => {
    io.emit("typing:stop", { conversationId, userId });
  });

  // message read
  socket.on("message:read", async ({ messageId, userId }) => {
    const message = await Message.findById(messageId);
    if (!message) return;
    if (!message.readBy.find((id) => id.toString() === userId)) {
      message.readBy.push(userId);
      await message.save();
    }
    io.emit("message:read", { messageId, userId });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
