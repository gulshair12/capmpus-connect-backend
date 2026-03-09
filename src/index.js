import "dotenv/config";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import eventRoutes from "./routes/event.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import buddyRoutes from "./routes/buddy.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { initSocket } from "./socket/socket.js";
import dns from "node:dns";

// Force public DNS servers (Google 8.8.8.8, Cloudflare 1.1.1.1)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - allow frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging - logs method, url, status, response time
app.use(morgan("dev"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/buddy", buddyRoutes);
app.use("/api/chat", chatRoutes);

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
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: { origin: "http://localhost:3000" },
    });
    initSocket(io);

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

export default app;
