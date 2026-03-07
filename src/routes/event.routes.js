import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { upload } from "../config/multer.js";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", protect, adminOnly, upload.single("image"), createEvent);
router.put("/:id", protect, adminOnly, upload.single("image"), updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

export default router;
