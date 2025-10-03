const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Feedback = require('../models/feedBack');



exports.addFeedBack = asyncHandler(async (req, res) => {
    const {course,group,instructor,questions} = req.body;
    const feedback = new Feedback({
        course,
        group,
        instructor,
        questions
    });
    await feedback.save();
    res.status(200).json({
        success: true,
        data: feedback,
        message: 'Feedback added successfully'
    });
});