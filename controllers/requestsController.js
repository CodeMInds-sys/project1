

const User = require('../models/user');
const Student = require('../models/student');
const Course = require('../models/course');
const ReqToEnroll = require('../models/reqToEnroll');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');












// requests to enroll student in course
exports.enrollStudentInCourse = asyncHandler(async (req, res) => {
    const {courseId } = req.body; 

    const user=req.user;
    if(!user){
        throw new AppError('user not found', 404);
    }
    if(user.role!=='student'){
        throw new AppError('user is not a student', 404);
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('course not found', 404);
    }

    const reqToEnrollExist = await ReqToEnroll.findOne({
        student: user._id,
        course: courseId,
        status: 'pending'
    });
    if (reqToEnrollExist) {
        throw new AppError('request to enroll student in course already exists', 400);
    }
    
    const reqToEnroll = await ReqToEnroll.create({
        student: user._id,
        course: courseId,
        status: 'pending'
    });
    
    
    if(!reqToEnroll ){
        throw new AppError('failed to enroll student in course', 404);
    }
    res.status(200).json({
        success: true,
        message: 'request to enroll student in course created successfully',
        data: reqToEnroll
    });
});


exports.acceptRequestToEnrollInCourse = asyncHandler(async (req, res) => {
    const { requestId } = req.body;

 
    const reqToEnroll = await ReqToEnroll.findOne({
        _id: requestId,
        status: 'pending',
        
    });
    if (!reqToEnroll) {
        throw new AppError('request to enroll student in course not found', 404);
    }
    console.log("reqToEnroll",reqToEnroll);
    const course = await Course.findById(reqToEnroll.course);
    if (!course) {
        throw new AppError('course not found', 404);
    }
    const user = await User.findById(reqToEnroll.student);
    console.log("user",user);
    if (!user) {
        throw new AppError('user not found', 404);
    }
    const student = await Student.findById(user.profileRef);
    console.log("student",student);
    if (!student) {
        throw new AppError('student not found', 404);
    }
    student.courses.push(reqToEnroll.course);
    await student.save();

 

    reqToEnroll.status = 'accepted';
    await reqToEnroll.save();
    res.status(200).json({
        success: true,
        message: 'request to enroll student in course accepted successfully',
        data: reqToEnroll
    });
});


exports.getAllRequestsToEnrollInCourse = asyncHandler(async (req, res) => {
    const reqToEnroll = await ReqToEnroll.find({})
    .populate({
      path: 'student',
      select: 'name email phone profileRef profileModel'
    })
    .populate('course', 'title');

  for (const req of reqToEnroll) {
    const student = req.student;
    if (student?.profileRef && student?.profileModel) {
      await student.populate({
        path: 'profileRef',
        model: student.profileModel
      });
    }
  }

    

    if (!reqToEnroll) {
        throw new AppError('requests to enroll student in course not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'requests to enroll student in course found successfully',
        data: reqToEnroll   
    });
});
exports.getAcceptedRequests = asyncHandler(async (req, res) => {
    let reqToEnroll = await ReqToEnroll.find({ status: 'accepted', joined: false })
    .populate({
      path: 'student',
      match: { role: 'student' },
      select: 'name email phone profileRef profileModel'
    })
    .populate('course', 'title');
  
  // إزالة الطلبات اللي ماعندهاش طالب (بسبب match)
  reqToEnroll = reqToEnroll.filter(req => req.student);
  
  for (const req of reqToEnroll) {
    const student = req.student;
    if (student?.profileRef && student?.profileModel) {
      await student.populate({
        path: 'profileRef',
        model: student.profileModel
      });
    }
  }
  

    

    if (!reqToEnroll) {
        throw new AppError('requests to enroll student in course not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'requests to enroll student in course found successfully',
        data: reqToEnroll   
    });
});



exports.getAccepted_and_Joined_Requests = asyncHandler(async (req, res) => {
    let reqToEnroll = await ReqToEnroll.find({ status: 'accepted', joined: true })
    .populate({
      path: 'student',
      match: { role: 'student' },
      select: 'name email phone profileRef profileModel'
    })
    .populate('course', 'title');
  
  // إزالة الطلبات اللي ماعندهاش طالب (بسبب match)
  reqToEnroll = reqToEnroll.filter(req => req.student);
  
  for (const req of reqToEnroll) {
    const student = req.student;
    if (student?.profileRef && student?.profileModel) {
      await student.populate({
        path: 'profileRef',
        model: student.profileModel
      });
    }
  }
  

    

    if (!reqToEnroll) {
        throw new AppError('requests to enroll student in course not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'requests to enroll student in course found successfully',
        data: reqToEnroll   
    });
});


