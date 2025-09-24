// src/index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend (only if backend + frontend are deployed together)
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../frontend/dist");

  // Serve static assets (CSS, JS, images, etc.)
  app.use(express.static(frontendDist));

  // Fallback: serve index.html for any GET request that accepts HTML
  // This avoids using express route strings that path-to-regexp would parse (and possibly reject).
  app.use((req, res, next) => {
    // Only handle GET requests that accept HTML (i.e., browser navigation)
    if (req.method !== "GET") return next();
    const accept = req.headers.accept || "";
    if (!accept.includes("text/html")) return next();

    // Send the SPA entrypoint
    res.sendFile(path.join(frontendDist, "index.html"), (err) => {
      if (err) {
        // If index.html is missing or another error occurs, pass it to error handlers
        next(err);
      }
    });
  });
}

// Connect DB first, then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server running on PORT: " + PORT);
  });
}).catch((err) => {
  console.error("Failed to connect DB:", err);
  process.exit(1);
});
