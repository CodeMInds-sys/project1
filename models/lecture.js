const mongoose = require("mongoose");
const { Schema } = mongoose;
const lectureSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos:[{
        type: String,
        required:[true,"videos are required"],
        unique:[true,"this video already exists"]
    }],
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    objectives:[{
        type: String,
    }],

    
},{timestamps:true})

module.exports = mongoose.model("Lecture", lectureSchema);