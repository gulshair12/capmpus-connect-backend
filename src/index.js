import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - allow frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Campus Connect API" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

export default app;
