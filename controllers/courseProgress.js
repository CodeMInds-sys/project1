const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const CourseProgress = require('../models/courseProgress').courseProgress;
const LectureProgress = require('../models/courseProgress').LectureProgress;
const Group = require('../models/group');
const Course = require('../models/course');
const Lecture = require('../models/lecture');
const Student = require('../models/student');
const Instructor = require('../models/instructor');
const ReqToEnroll = require('../models/reqToEnroll');
// Import Redis cache functions from the redisClient utility
const { setCache, getCache, delCache } = require('../utils/redisClient');

// Helper function to fetch all groups and cache them in Redis
const setGroupsCache = async () => {
    const groups = await Group.find({})
    .populate({
        path: 'instructor',
        select: 'name email phone profileRef profileModel'
    })
    .populate({
        path: 'course',
        select: 'title'
    })
    .populate({
        path: 'students',
        select: 'name email phone profileRef profileModel'
    })
    .populate({
        path: 'lectures',
        // select: 'title date description'
    });
    const cacheKey = `groups:all`;
    await setCache(cacheKey, JSON.stringify(groups));
}



exports.getCourseProgress = asyncHandler(async (req, res) => {
    const progressId=req.params.id;
    const courseProgress = await CourseProgress.findById(progressId)
    .populate({
        path: 'student',
        select:'user',
        populate:{
            path:'user',
            select:'name email phone profileRef profileModel'
        }
    })
    .populate({
        path: 'course',
        select: 'title'
    })
    .populate({
        path: 'lectureProgress',
        select: 'lecture',
        populate:{
            path:'lecture',
            select:'title'
        }
    })
  

    if (!courseProgress) {
        throw new AppError('Course progress not found', 404);
    }
    res.status(200).json({
        success: true,
        data: courseProgress,
        message: 'Course progress fetched successfully'
    });
});


exports.updateLectureProgress = asyncHandler(async (req, res) => {
    const progressId=req.params.id;
    const courseProgress = await CourseProgress.findById(progressId);
    if (!courseProgress) {
        throw new AppError('Course progress not found', 404);
    }
    const {lectureId,attendance,notes,engagement,taskStatus,submittedAt,score,taskNotes}=req.body;
    // const lectureScore=;
    const lectureProgress = new LectureProgress({
        student:courseProgress.student,
        lecture:lectureId,
        attendance,
        notes,
        engagement,
        // lectureScore,
        task:{
            taskStatus,
            submittedAt,
            score,
            notes:taskNotes
        }
    });
    courseProgress.lectureProgress.push(lectureProgress);
    await courseProgress.save();
    res.status(200).json({
        success: true,
        data: lectureProgress,
        message: 'Lecture progress added successfully'
    });
});








