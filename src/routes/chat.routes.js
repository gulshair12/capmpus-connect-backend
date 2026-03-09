import express from "express";
import { protect } from "../middleware/auth.js";
import { studentOnly } from "../middleware/studentMiddleware.js";
import { getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:userId", protect, studentOnly, getChatHistory);

export default router;
