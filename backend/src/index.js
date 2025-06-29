import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
import http from "http";
import { initSocket } from "./lib/socket.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "3mb" }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serving Frontend in Production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("/*splat", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

// Initialize Socket.io
const io = initSocket(server);
export { io };

// Start Server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    connectDB();
});
