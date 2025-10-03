const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Instructor = require('../models/instructor');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinary');


exports.getInstructors = asyncHandler(async (req, res) => {
    const instructors = await User.find({ role: 'instructor' })
    .populate(
        {
            path: 'profileRef',
            match: { status: 'pending' },
            // select: 'status specialization coursesCanTeach'
        }
    )
    if(!instructors){
        throw new AppError('instructors not found', 404);
    }
    // const acceptedInstructors = instructors.filter(instructor => instructor.profileRef.status === 'pending');
    res.status(200).json({
        success: true,
        data: instructors
    });
});

exports.createInstructor = asyncHandler(async (req, res) => {
    const user = req.user; 
    const fileStr= `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadResult = await uploadToCloudinary(fileStr, req.file.originalname);
    const {fileId,fileUrl}=uploadResult;
    const userId = user._id;
    const {specialization,experienceYears,bio,
          github,linkedin, coursesCanTeach } = req.body;
    const instructorRequest = await Instructor.findOne({ user: userId });
    if(instructorRequest){
        instructorRequest.specialization=specialization;
        instructorRequest.experienceYears=experienceYears;
        instructorRequest.bio=bio;
        instructorRequest.github=github;
        instructorRequest.linkedin=linkedin;
        instructorRequest.coursesCanTeach=coursesCanTeach;
        instructorRequest.cv={
            fileId,
            fileUrl
        }
        await instructorRequest.save();
        res.status(200).json({
            success: true,
            data: instructorRequest,
            message: 'instructor updated successfully'
        });
        return;
    }       
    const instructor = await new Instructor({
        user:userId, 
        specialization,
        experienceYears,
        bio,
        github,
        linkedin,
        coursesCanTeach,
        cv:{
            fileId,
            fileUrl
        }
    });
    await instructor.save();
    user.role='instructor';

    user.profileRef=instructor._id;
    user.profileModel='Instructor';
    await user.save();
    res.status(201).json({
        success: true,
        data: instructor,
        message: 'instructor created successfully'
    });
   
});

exports.updateInstructor = asyncHandler(async (req, res) => {
    const instructor = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!instructor) {
        throw new AppError('المحاضر غير موجود', 404);
    }

    res.status(200).json({
        success: true,
        data: instructor,
        message: 'تم تحديث بيانات المحاضر بنجاح'
    });
});

exports.deleteInstructor = asyncHandler(async (req, res) => {
    const instructor = await User.findById(req.params.id);

    if (!instructor) {
        throw new AppError('المحاضر غير موجود', 404);
    }

    await instructor.remove();

    res.status(200).json({
        success: true,
        message: 'تم حذف المحاضر بنجاح'
    });
});

exports.getInstructor = asyncHandler(async (req, res) => {
    const instructor = await User.findById(req.params.id)
        .select('name email specialization courses');

    if (!instructor) {
        throw new AppError('المحاضر غير موجود', 404);
    }

    res.status(200).json({
        success: true,
        data: instructor
    });
}); 