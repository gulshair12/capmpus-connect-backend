import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";

const onlineUsersMap = new Map();

export function getOnlineUserIds() {
  return Array.from(onlineUsersMap.keys());
}

export function initSocket(io) {
  io.on("connection", async (socket) => {
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      socket.emit("error", { message: "Authentication required" });
      socket.disconnect(true);
      return;
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      socket.emit("error", { message: "Invalid token" });
      socket.disconnect(true);
      return;
    }

    const user = await User.findById(userId).select("role");
    if (!user || user.role === "admin") {
      socket.emit("error", { message: "Access denied" });
      socket.disconnect(true);
      return;
    }

    const userIdStr = userId.toString();
    onlineUsersMap.set(userIdStr, socket.id);
    socket.userId = userIdStr;

    socket.emit("join", { userId: userIdStr });
    socket.broadcast.emit("userOnline", { userId: userIdStr });

    socket.on("sendMessage", async (payload) => {
      try {
        const { receiverId, message } = payload;
        if (!receiverId || !message) {
          socket.emit("error", { message: "receiverId and message required" });
          return;
        }

        const receiver = await User.findById(receiverId).select("friends");
        if (!receiver) {
          socket.emit("error", { message: "Receiver not found" });
          return;
        }
        const receiverFriends = receiver.friends || [];
        if (!receiverFriends.some((f) => f.toString() === userIdStr)) {
          socket.emit("error", { message: "Can only message friends" });
          return;
        }

        const doc = await Message.create({
          sender: userId,
          receiver: receiverId,
          message: String(message).trim(),
          isRead: false,
        });

        const savedMessage = await Message.findById(doc._id)
          .populate("sender", "fullName")
          .populate("receiver", "fullName")
          .lean();

        const receiverSocketId = onlineUsersMap.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", savedMessage);
        }

        socket.emit("receiveMessage", savedMessage);
      } catch (err) {
        socket.emit("error", { message: err.message || "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsersMap.delete(socket.userId);
        socket.broadcast.emit("userOffline", { userId: socket.userId });
      }
    });
  });
}
