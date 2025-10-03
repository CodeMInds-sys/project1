const mongoose = require("mongoose");


const instructorRequestSchema = new mongoose.Schema(
  {
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:[true,'your instructor request already exists']
    },
    specialization: {
      type: String,
      required: [true,'specialization is required'],
    },
    experienceYears: {
      type: String,
      required: [true,'experienceYears is required'],
    },
    bio: {
      type: String,
      required: [true,'bio is required'],
    },
    github: {
      type: String,
      required: [true,'github is required'],
    },
    linkedin: {
      type: String,
      required: [true,'linkedin is required'],
    },
    coursesCanTeach: {
      type: String,
      required: [true,'coursesCanTeach is required'],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    cv:{
      fileId: {
        type: String,
        // required: [true,'cv is required'],
      },
      fileUrl: {
        type: String,
        // required: [true,'cv is required'],
      },
    }
  },
  { timestamps: true }
);




module.exports = mongoose.model("Instructor", instructorRequestSchema);
