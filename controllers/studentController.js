const User = require('../models/user');
const Student = require('../models/student');
const Course = require('../models/course');
const ReqToEnroll = require('../models/reqToEnroll');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.createStudent = asyncHandler(async (req, res) => {
    const {age,gender} = req.body;
    const user = req.user;
    if(!user){
        throw new AppError('user not found', 404);
    }
    const student = await Student.create({
        age,
        gender,
        user:user._id
    });

    user.role='student';
    user.profileRef=student._id;
    user.profileModel='Student';
    await user.save();

    res.status(201).json({
        success: true,
        data: student,
        message: 'تم إضافة الطالب بنجاح'
    });
});


exports.getStudents = asyncHandler(async (req, res) => {
    const students = await User.find({ role: 'student' })
        .select('name email phone courses groups profileRef profileModel')
        .populate('profileRef');
        // .populate('courses');
    
    res.status(200).json({
        success: true,
        count: students.length,
        data: students
    });
});

exports.updateStudent = asyncHandler(async (req, res) => {
    const student = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!student) {
        throw new AppError('الطالب غير موجود', 404);
    }

    res.status(200).json({
        success: true,
        data: student,
        message: 'تم تحديث بيانات الطالب بنجاح'
    });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id);

    if (!student) {
        throw new AppError('الطالب غير موجود', 404);
    }

    await student.remove();

    res.status(200).json({
        success: true,
        message: 'تم حذف الطالب بنجاح'
    });
});

exports.getStudent = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id)
        .select('name email phone courses groups profileRef profileModel')
        .populate('enrolledCourses', 'name description');

    if (!student) {
        throw new AppError('الطالب غير موجود', 404);
    }

    res.status(200).json({
        success: true,
        data: student
    });
});






// ... باقي الدوال 