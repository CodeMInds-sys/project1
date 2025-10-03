const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    course:{
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    },
    group:{
        type: mongoose.Schema.ObjectId,
        ref: 'Group'
    },
    instructor:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    questions:[{
        question:{
            type: String,
            required: true
        },
        answer:{
            type: String,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better query performance
feedbackSchema.index({ user: 1, createdAt: -1 });



const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;