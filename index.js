// Environment and core dependencies
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Database and utilities
const connectMongoose = require("./utils/connectMongoose");
const Logger = require("./utils/logger");
const passport = require("./passport");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

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
    ip: req.ip 
  });
  next();
});

// Import route handlers
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

// Static files
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// API Routes
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

// 404 Handler
app.get("*", (req, res) => {
  Logger.info("Root endpoint accessed");
  res.send("not found api");
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  Logger.error("Server Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Send error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "حدث خطأ في الخادم",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Database connection and server startup
(async () => {
  try {
    await connectMongoose.connectDB();
    app.listen(port, () => {
      Logger.info(`  Server is running on port ${port}`);
    });
  } catch (error) {
    Logger.error("Failed to start server:", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();

// Model imports (consider moving these to separate controller files)
const User = require("./models/user");
const Group = require("./models/group");
const Course = require("./models/course");
const Lecture = require("./models/lecture");
const { courseProgress: CourseProgress, LectureProgress } = require("./models/courseProgress");
const Student = require("./models/student");
const Instructor = require("./models/instructor");
const ReqToEnroll = require("./models/reqToEnroll");
const FeedBack = require("./models/feedBack");

// Helper script to initialize course progress for students
const initializeStudentCourseProgress = async () => {
  const students = await Student.find({}).populate({
    path: "user",
    select: "name"
  });
  
  let count = 0;
  console.log("Total students:", students.length);
  
  for (const student of students) {
    count++;
    console.log(`Processing student ${count}: ${student.user?.name || 'Unknown'}`);
    
    if (student.courses.length === 0) {
      console.log(`Student ${student.user?.name || 'Unknown'} has no courses`);
      continue;
    }
    
    // Create course progress for any missing courses
    if (student.courseProgress.length < student.courses.length) {
      for (let i = student.courseProgress.length; i < student.courses.length; i++) {
        const courseProgress = new CourseProgress({
          student: student._id,
          course: student.courses[i]
        });
        
        await courseProgress.save();
        student.courseProgress.push(courseProgress._id);
        await student.save();
      }
    }
    
    // Process lecture progress for each group
    for (const groupId of student.groups) {
      const group = await Group.findById(groupId);
      if (!group) {
        console.log(`Group ${groupId} not found`);
        continue;
      }
      
      const courseProgress = await CourseProgress.findOne({
        student: student._id,
        course: group.course
      });
      
      if (!courseProgress) {
        console.log(`Course progress not found for group ${group._id}`);
        continue;
      }
      
      // Skip if all lectures already have progress
      if (courseProgress.lectureProgress.length >= group.lectures.length) {
        console.log(`Student ${student.user?.name || 'Unknown'} already has progress for all lectures in group ${group.title}`);
        continue;
      }
      
      // Create progress for each lecture
      for (const lectureId of group.lectures) {
        const existingProgress = courseProgress.lectureProgress.find(
          lec => lec.lecture.toString() === lectureId.toString()
        );
        
        if (existingProgress) {
          console.log(`Lecture progress already exists for lecture ${lectureId}`);
          continue;
        }
        
        const lectureProgress = new LectureProgress({
          student: student._id,
          lecture: lectureId,
          engagement: 0,
          attendance: "absent",
          lectureScore: 0,
          notes: "",
          task: {
            taskStatus: "pending",
            submittedAt: null,
            file: "",
            score: 0,
            notes: ""
          }
        });
        
        courseProgress.lectureProgress.push(lectureProgress);
        await courseProgress.save();
        console.log(`Progress saved for student ${student.user?.name || 'Unknown'} in course ${group.course}`);
      }
    }
  }
};

// Uncomment to run the initialization script
// initializeStudentCourseProgress();

// Export the Express app

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
module.exports = app;