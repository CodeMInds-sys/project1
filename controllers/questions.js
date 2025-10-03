const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Question = require('../models/questions');





exports.addQuestion = asyncHandler(async (req, res) => {
    const {question,category} = req.body;
    if(!question || !category){
        throw new AppError('question and category are required', 400);
    }
    const questionData = new Question({
        question,
        category
    });
    await questionData.save();
    res.status(200).json({
        success: true,
        data: questionData,
        message: 'Question added successfully'
    });
}); 


exports.getQuestions = asyncHandler(async (req, res) => {
    const {category} = req.params;
    const questions = await Question.find({category});
    res.status(200).json({
        success: true,
        data: questions,
        message: 'Questions fetched successfully'
    });
});



exports.deleteQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        throw new AppError('Question not found', 404);
    }
    await question.remove();
    res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
    });
});



const updateQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        throw new AppError('Question not found', 404);
    }
    question.question = req.body.question;
    question.category = req.body.category;
    await question.save();
    res.status(200).json({
        success: true,
        data: question,
        message: 'Question updated successfully'
    });
});
