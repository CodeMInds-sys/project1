
const mongoose = require("mongoose");
const { Schema } = mongoose;



const studentSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: [true, 'student already exists']
    },
    age: {
      type: Number,
      required: true,
      min: 5,
      max: 50
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true
    },
  
    // الكورسات اللي مشترك فيها الطالب
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
    
  
    // الجروبات اللي الطالب منضم ليها
    groups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    }],
    // التقدم في كل كورس (تقييمات – واجبات – الحضور)
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress"
      }
    ]
    
  }, { timestamps: true });
  
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;