import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required.");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

app.get("/", (req, res) => {
  res.send("TutorBridge API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use(errorHandler);

export default app;
