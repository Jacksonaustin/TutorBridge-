import "dotenv/config";
import mongoose from "mongoose";
import { serveFrontend } from "./config/serveFrontend.js";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import conversationRoutes from "./routes/conversationRoutes.js";


const app = express();
// Render provides this URL automatically; override FRONTEND_URL for a custom domain.
const frontendUrl = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5173";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required.");
}

if (process.env.NODE_ENV === "production") {
  if (!frontendUrl.startsWith("https://")) {
    throw new Error("Production FRONTEND_URL must use HTTPS.");
  }
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error("Production SESSION_SECRET must contain at least 32 characters.");
  }
  // Render's HTTPS edge is the immediate proxy.
  app.set("trust proxy", 1);
}

// Readiness probe does not create sessions or read user data.
app.get("/api/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));

app.use(
  session({
    name: "tutorbridge.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

if (process.env.SERVE_FRONTEND !== "true") {
  app.get("/", (req, res) => res.send("TutorBridge API is running"));
}

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/conversations", conversationRoutes);

if (process.env.SERVE_FRONTEND === "true") serveFrontend(app);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use(errorHandler);

export default app;
