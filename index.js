const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectMongoose = require("./utils/connectMongoose");
const Logger = require("./utils/logger");
const path = require("path");
const passport = require("./passport");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

// Logging middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    ip: req.ip,
  });
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const studentRoutes = require("./routes/studentRoutes");
const requestsRoutes = require("./routes/requestsRoutes");
const questionRoutes = require("./routes/question");
const feedbackRoutes = require("./routes/feedBack");
const courseProgressRoutes = require("./routes/courseProgress");

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/courseProgress", courseProgressRoutes);

app.get("*", (req, res) => {
  res.send("Not found API");
});

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error("Server Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "حدث خطأ في الخادم",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Database connection (هتشغلها مرة واحدة عند أول Request)
(async () => {
  try {
    await connectMongoose.connectDB();
    Logger.info("✅ MongoDB connected");
  } catch (error) {
    Logger.error("❌ Failed to connect to DB:", { error: error.message });
  }
})();

module.exports = app;
