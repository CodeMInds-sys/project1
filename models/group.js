
const mongoose = require("mongoose");
const { Schema } = mongoose;
const groupSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    availableSeats: {
        type: Number,
        default: 0
    },
    totalSeats: {
        type: Number,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    lectures:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture"
    }],

    
})

module.exports = mongoose.model("Group", groupSchema);