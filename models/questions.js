const mongoose = require("mongoose");

const questionsSchema = new mongoose.Schema({
    question:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true,
        enum: ["feedBack"],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
})

const Questions = mongoose.model("Questions", questionsSchema);
module.exports = Questions;
