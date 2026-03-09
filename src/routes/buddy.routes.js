import express from "express";
import { protect } from "../middleware/auth.js";
import { studentOnly } from "../middleware/studentMiddleware.js";
import {
  getAllUsersWithStatus,
  sendFriendRequest,
  getIncomingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelSentRequest,
  getFriends,
  getOnlineUsers,
} from "../controllers/buddy.controller.js";

const router = express.Router();

router.get("/users", protect, studentOnly, getAllUsersWithStatus);
router.get("/requests", protect, studentOnly, getIncomingRequests);
router.post("/request/:userId", protect, studentOnly, sendFriendRequest);
router.post("/accept/:userId", protect, studentOnly, acceptFriendRequest);
router.post("/reject/:userId", protect, studentOnly, rejectFriendRequest);
router.post("/cancel/:userId", protect, studentOnly, cancelSentRequest);
router.get("/friends", protect, studentOnly, getFriends);
router.get("/online", protect, studentOnly, getOnlineUsers);

export default router;
