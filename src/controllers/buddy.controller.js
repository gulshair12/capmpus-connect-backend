import mongoose from "mongoose";
import User from "../models/User.js";
import { getOnlineUserIds } from "../socket/socket.js";

const getConnectionStatus = (currentUser, targetUserId) => {
  const id = targetUserId.toString();
  const friends = currentUser.friends || [];
  const sentRequests = currentUser.sentRequests || [];
  const friendRequests = currentUser.friendRequests || [];
  if (friends.some((f) => f.toString() === id)) return "friends";
  if (sentRequests.some((r) => r.toString() === id)) return "pending_sent";
  if (friendRequests.some((r) => r.toString() === id))
    return "pending_received";
  return "none";
};

export const getAllUsersWithStatus = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .select("friends sentRequests friendRequests")
      .lean();

    const users = await User.find({
      _id: { $ne: req.user._id },
      role: { $ne: "admin" },
    })
      .select("fullName department university")
      .lean();

    const result = users.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      department: user.department,
      university: user.university,
      connectionStatus: getConnectionStatus(currentUser, user._id),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const sendFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot send request to yourself" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (targetUser.role === "admin") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot send request to admin" });
    }

    const currentUser = await User.findById(req.user._id).select(
      "friends sentRequests friendRequests"
    );
    const friends = currentUser.friends || [];
    const sentRequests = currentUser.sentRequests || [];
    const friendRequests = currentUser.friendRequests || [];

    const idStr = userId.toString();
    if (friends.some((f) => f.toString() === idStr)) {
      return res
        .status(400)
        .json({ success: false, message: "Already friends" });
    }
    if (sentRequests.some((r) => r.toString() === idStr)) {
      return res
        .status(400)
        .json({ success: false, message: "Request already sent" });
    }
    if (friendRequests.some((r) => r.toString() === idStr)) {
      return res
        .status(400)
        .json({ success: false, message: "Request already received" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { sentRequests: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friendRequests: req.user._id },
    });

    res.status(201).json({
      message: "Friend request sent",
      status: "pending_sent",
    });
  } catch (err) {
    next(err);
  }
};

export const getIncomingRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friendRequests", "fullName department university")
      .lean();

    res.json(user.friendRequests || []);
  } catch (err) {
    next(err);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const currentUser = await User.findById(req.user._id).select(
      "friends friendRequests sentRequests"
    );
    const friendRequests = currentUser.friendRequests || [];
    const idStr = userId.toString();
    if (!friendRequests.some((r) => r.toString() === idStr)) {
      return res
        .status(400)
        .json({ success: false, message: "No pending request from this user" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friendRequests: userId },
      $addToSet: { friends: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { sentRequests: req.user._id },
      $addToSet: { friends: req.user._id },
    });

    res.json({ message: "Friend request accepted", status: "friends" });
  } catch (err) {
    next(err);
  }
};

export const rejectFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const currentUser = await User.findById(req.user._id).select(
      "friendRequests"
    );
    const friendRequests = currentUser.friendRequests || [];
    const idStr = userId.toString();
    if (!friendRequests.some((r) => r.toString() === idStr)) {
      return res
        .status(400)
        .json({ success: false, message: "No pending request from this user" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friendRequests: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { sentRequests: req.user._id },
    });

    res.json({ message: "Friend request rejected", status: "none" });
  } catch (err) {
    next(err);
  }
};

export const cancelSentRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const currentUser = await User.findById(req.user._id).select("sentRequests");
    const sentRequests = currentUser.sentRequests || [];
    const idStr = userId.toString();
    if (!sentRequests.some((r) => r.toString() === idStr)) {
      return res
        .status(400)
        .json({ success: false, message: "No sent request to this user" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { sentRequests: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: req.user._id },
    });

    res.json({ message: "Request cancelled", status: "none" });
  } catch (err) {
    next(err);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "fullName department university")
      .lean();

    res.json(user.friends || []);
  } catch (err) {
    next(err);
  }
};

export const getOnlineUsers = async (req, res, next) => {
  try {
    const onlineIds = getOnlineUserIds();
    res.json(onlineIds);
  } catch (err) {
    next(err);
  }
};
