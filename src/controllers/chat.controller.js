import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const currentUser = await User.findById(req.user._id).select("friends");
    const friends = currentUser.friends || [];
    const idStr = userId.toString();
    if (!friends.some((f) => f.toString() === idStr)) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with friends",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullName")
      .populate("receiver", "fullName")
      .lean();

    await Message.updateMany(
      { receiver: req.user._id, sender: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const currentUserId = req.user._id.toString();
    const result = messages.map((m) => ({
      ...m,
      isRead:
        (m.receiver._id || m.receiver).toString() === currentUserId
          ? true
          : m.isRead,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};
