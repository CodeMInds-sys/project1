const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Group = require('../models/group');
const User = require('../models/user');
const Instructor = require('../models/instructor');
const Student = require('../models/student');
const Course = require('../models/course');
const Lecture = require('../models/lecture');
const ReqToEnroll = require('../models/reqToEnroll');
const {courseProgress,lectureProgressSchema} = require('../models/courseProgress');
const CourseProgress = require('../models/courseProgress').courseProgress;
const LectureProgress = require('../models/courseProgress').LectureProgress;
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
exports.createGroup = asyncHandler(async (req, res) => {
    console.log(req.user);
    const { title, startDate, endDate, totalSeats, instructorId, courseId, } = req.body;
    const group = await new Group({
        title,
        startDate,
        endDate,
        totalSeats,
        instructor:instructorId,
        course:courseId,
    });
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    course.availableGroups.push(group._id);
    await course.save();
    
    await group.save();
    await setGroupsCache();
    await delCache(`groups:instructor:${instructorId}`);
    res.status(201).json({
        success: true,
        data: group,
        message: 'group created successfully'
    });
});


exports.getGroups = asyncHandler(async (req, res) => {
    const cacheKey = `groups:all`;
    // const cachedGroups = await getCache(cacheKey);
    if (false) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedGroups),
            message: 'groups fetched successfully from cache'
        });
    } else {
        // await setGroupsCache();
        // const groups = await getCache(cacheKey);
        const groups=await Group.find({})
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
            select: 'user',
            populate:{
                path:'user',
                select:'name'
            }
        })
        .populate({
            path: 'lectures',
            // select: 'title date description'
        });
        return res.status(200).json({
            success: true,
            data: groups,
            message: 'get group success'
        });
    }



});


exports.getGroup=asyncHandler(async(req,res)=>{
    const group=await Group.findById(req.params.id)
    .populate({
        path: 'instructor',
        select: 'name email '
    })
    .populate({
        path: 'course',
        select: 'title'
    })
    .populate({
        path: 'students',
        select:'user courseProgress',
        populate:{
            path:'user courseProgress',
            select:'name course'
        },
    })
    .populate({
        path: 'lectures',
        // select: 'title date description'
    }).lean();
    if (!group) {
        throw new AppError('Group not found', 404);
    }

    let students=[];
   
    group.students.forEach(async(student) => {
        let studentId=student._id;
        let userId=student.user._id; 
        let name=student.user.name; 
        // let courseProgress=student.courseProgress;
        let courseProgress=student.courseProgress.find((progress)=>progress.course.toString()       === group.course._id.toString());
        console.log(student.courseProgress[0].course);
        console.log(group.course._id);
        console.log(courseProgress);
        students.push({studentId,userId,name,courseProgress:courseProgress._id});
    });
    group.students=students;


    res.status(200).json({
        success: true,
        data: group,
      
    });
})

// update Group info
exports.updateGroup= asyncHandler( async(req,res)=>{
    const {title,startDate,endDate,totalSeats,instructorId,courseId} = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("course not found", 404);
    }
    const group = await Group.findByIdAndUpdate(
        req.params.id,
        {title,startDate,endDate,totalSeats,
            instructor:instructorId,
            course:courseId}
        ,{new:true,runValidators:true});
    if (!group) {
        throw new AppError('Group not found', 404);
    }
    await group.save();
    await setGroupsCache();
    await delCache(`groups:instructor:${group.instructor}`);
    res.status(200).json({
        success: true,
        data: group
    });
})



exports.deleteGroup = asyncHandler(async (req, res) => {
    const group=await Group.findById(req.params.id);
    if (!group) throw new AppError('Group not found', 404);
    const courseId=group.course;
    const course=await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);
    course.availableGroups.pull(group._id);
    await course.save();
    const students=group.students;
    for (const student of students) {
        const user=await User.findById(student).populate('profileRef');
        user.profileRef.groups.pull(group._id);
        await user.save();
    }
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
        throw new AppError('Group not found', 404);
    }
    await setGroupsCache();
    await delCache(`groups:instructor:${group.instructor}`);
    res.status(200).json({
        success: true,
        data: group
    });
})







exports.addStudentToGroup = asyncHandler(async (req, res) => {
    const { groupId, studentId,reqToEnrollId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    if (group.students.length >= group.totalSeats) {
        throw new AppError('group is already full', 400);
    }
    const reqToEnroll = await ReqToEnroll.findById(reqToEnrollId);
    if (!reqToEnroll) {
        throw new AppError('request to enroll not found', 404);
    }
    const student = await Student.findOne({user:studentId});
    if (!student) {
        throw new AppError('student not found', 404);
    } 
    
    // check if student already in group
    if (group.students.includes(student._id)) {
        throw new AppError('student already in this group', 400);
    }
    
    // check if group already in student's groups
    if (student.groups.includes(groupId)) {
        throw new AppError('group already assigned to student', 400);
    }
    
    // push student to group
    group.students.push(student);
    await group.save();
    
    // push group to student
    student.groups.push(groupId);

    // add course progress to this student

    const courseProgress=new CourseProgress({
        student:studentId,
        course:group.course,
        lectureProgress:[]
    })
    await courseProgress.save();
    student.courseProgress.push(courseProgress._id);

    await student.save();
    
    reqToEnroll.group=groupId;  
    reqToEnroll.joined=true;
    await reqToEnroll.save();
    await setGroupsCache();
    await delCache(`groups:instructor:${group.instructor}`);
    // populate group before response
    const populatedGroup = await Group.findById(groupId)
        .populate('instructor', 'name email phone profileRef profileModel')
        .populate('course', 'title')
        .populate('students', 'name email phone profileRef profileModel')
        .populate('lectures');
    res.status(200).json({
        success: true,
        message: 'student added to group successfully', 
        data: populatedGroup
    });
     
});
exports.addStudentToGroupWithInviteLink = asyncHandler(async (req, res) => {
    const  groupId  = req.params.id;
    const userId=req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    if (group.students.length >= group.totalSeats) {
        throw new AppError('group is already full', 400);
    }

    const student = await Student.findOne({user:userId});
    if (!student) {
        throw new AppError('student not found', 404);
    } 
    
    // check if student already in group
    if (group.students.includes(student._id)) {
        throw new AppError('student already in this group', 400);
    }
    
    // check if group already in student's groups
    if (student.groups.includes(groupId)) {
        throw new AppError('group already assigned to student', 400);
    }
    
    // push student to group
    group.students.push(student);
    await group.save();
    
    // push group to student
    student.groups.push(groupId);
    student.courses.push(group.course);
    // add course progress to this student

    const courseProgress=new CourseProgress({
        student:student._id,
        course:group.course,
        lectureProgress:[]
    })
    await courseProgress.save();
    student.courseProgress.push(courseProgress._id);

    await student.save();
    

    await setGroupsCache();
    await delCache(`groups:instructor:${group.instructor}`);
    // populate group before response
    const populatedGroup = await Group.findById(groupId)
        .populate('instructor', 'name email phone profileRef profileModel')
        .populate('course', 'title')
        .populate('students', 'name email phone profileRef profileModel')
        .populate('lectures');
    res.status(200).json({
        success: true,
        message: 'student added to group successfully', 
        data: populatedGroup
    });
     
});

 
exports.getGroupsOfInstructor = asyncHandler(async (req, res) => {
    const instructorId = req.params.id;
    const cacheKey = `groupsOfInstructor-${instructorId}`; // Cache key for instructor's groups
    const cachedGroups = await getCache(cacheKey); // Try to get instructor's groups from Redis cache
    // if (cachedGroups) {
    //     return res.status(200).json({
    //         success: true,
    //         data: JSON.parse(cachedGroups),
    //         message: 'groups fetched successfully from cache'
    //     });
    // }else{
        const groups = await Group.find({ instructor: instructorId },{title:1,course:1})
        .populate({
            path: 'course',
            select: 'title'
        })

        // Cache the instructor's groups data in Redis
        await setCache(cacheKey, JSON.stringify(groups));
        res.status(200).json({
            success: true,
            data: groups
        });
    // }

});

exports.getGroupsWithStatus=asyncHandler(async(req,res)=>{
    const status=req.params.status;
    let groups;
    const statusEnum={
       inProgress:"inProgress",
       pending:"pending",
       ended:"ended"
    }
    if(!statusEnum[status]){
        throw new AppError("Invalid status",400);
    }
    const getGroupsFromDB=async(condition)=>{
        return await Group.find(condition,{title:1,course:1})
        .populate({
            path: 'course',
            select: 'title'
        })
    }

    if(status===statusEnum.inProgress){
        groups=await getGroupsFromDB({startDate:{$lte:Date.now()},endDate:{$gte:Date.now()}})         
    }else if(status===statusEnum.pending){
        groups=await getGroupsFromDB({startDate:{$gt:Date.now()}})
    }else if(status===statusEnum.ended){
        groups=await getGroupsFromDB({endDate:{$lt:Date.now()}})
    }

    res.status(200).json({
        success: true,
        data: groups
    });
})
exports.getGroupsOfInstructor__old = asyncHandler(async (req, res) => {
    const instructorId = req.params.id;
    const cacheKey = `groupsOfInstructor-${instructorId}`; // Cache key for instructor's groups
    const cachedGroups = await getCache(cacheKey); // Try to get instructor's groups from Redis cache
    // if (cachedGroups) {
    //     return res.status(200).json({
    //         success: true,
    //         data: JSON.parse(cachedGroups),
    //         message: 'groups fetched successfully from cache'
    //     });
    // }else{
        const groups = await Group.find({ instructor: instructorId })
        .populate({
            path: 'course',
            select: 'title'
        }).populate({
            path: 'students',
            select: 'name email phone profileRef profileModel'
        })
        .populate({
            path: 'lectures',
            select: 'title date description'
        })
        .populate({
            path: 'instructor',
            select: 'name email phone profileRef profileModel'
        })
        .populate({
            path: 'students',
            select: 'name email phone profileRef profileModel'
        })

        // Cache the instructor's groups data in Redis
        await setCache(cacheKey, JSON.stringify(groups));
        res.status(200).json({
            success: true,
            data: groups
        });
    // }

});


exports.getGroupStudents = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    if (!groupId) {
        throw new AppError('group id is required', 400);
    }
    const group = await Group.findById(groupId,{students:1,})

    .populate({
        path: 'students',
        select: 'user age gender profileRef profileModel courseProgress',
        populate:{
            path:'user',
            select:'name'
        },
        populate:{
            path:'courseProgress',
            select:'course'
        }
    })
    .populate({
        path: 'course',
        select: 'title'
    })
    .lean();

    if (!group) {
        throw new AppError('group not found', 404);
    }
    let data=[]
    if (!group.course) {
        throw new AppError('course not found', 404);
    }
    // console.log(group);
    
    for (const student of group.students) {
        console.log("student",student);
        console.log("courseProgress",student.courseProgress);
        console.log("group.course",group.course);
        console.log("group.course._id",group.course._id);
        console.log("group.course._id.toString()",group.course._id.toString());
        console.log("student.courseProgress.course",student.courseProgress.course);     
        console.log("student.courseProgress.course.toString()",student.courseProgress[0].course.toString());
        let courseProgress=student.courseProgress.find((progress)=>progress.course.toString() === group.course._id.toString());
        data.push({
            name:student.user.name,
            age:student.age,
            gender:student.gender,
            courseProgress:courseProgress._id
        })
    }
    res.status(200).json({
        success: true,
        data: data
    });
});



exports.addLectureToGroup = asyncHandler(async (req, res) => {
    const { groupId, title,description,date,objectives,videos} = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    if((group.instructor.toString() !== req.user._id.toString()  )&&(req.user.role!=='manager')){
        throw new AppError('you are not authorized to add lecture to this group', 401);
    }
    if (!group.course) {
        throw new AppError('course not found', 404);
    }
    const lecture = await new Lecture({
        title,
        description,
        objectives,
        date,
        videos,
        group:groupId,
        course:group.course
    });
    await lecture.save();
    group.lectures.push(lecture._id);
    await group.save();

    const students=group.students;
    for (const student of students) {
        const thisStudent= await Student.findById(student).populate('courseProgress','course');
        if (!thisStudent) {
            throw new AppError('student not found', 404);
        }
        if (!thisStudent.courseProgress) {
            throw new AppError('course progress not exists', 404);
        }
        const courseProgress=thisStudent.courseProgress.find((progress)=>progress.course.toString() === group.course.toString());
        if (!courseProgress) {
            throw new AppError('course progress not found', 404);
        }
        const lectureProgress=new LectureProgress({
            student:thisStudent._id,
            lecture:lecture._id,
            engagement:0,
            attendance:"absent",
            lectureScore:0,
            notes:"",
            task:{
                taskStatus:"pending",
                submittedAt:null,
                file:"",
                score:0,
                notes:""
            }
        });
        const thisCourseProgress=await CourseProgress.findById(courseProgress._id);
        if (!thisCourseProgress) {
            throw new AppError('course progress not found', 404);
        }
        thisCourseProgress.lectureProgress.push(lectureProgress);
        await thisCourseProgress.save();
        await thisStudent.save();
    }
    // await setGroupsCache();
    // await delCache(`groups:instructor:${group.instructor}`);

    res.status(200).json({
        success: true,
        message: 'lecture added to group successfully', 
        data: group
    });
});



exports.editLectureToGroup = asyncHandler(async (req, res) => {
    const { lectureId, title, description, objectives, date, videos } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
        throw new AppError('group not found', 404);
    }
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        throw new AppError('lecture not found', 404);
    }
    lecture.title = title;
    lecture.description = description;
    lecture.objectives = objectives;
    lecture.date = date;
    lecture.videos = videos;
    await lecture.save();

    await setGroupsCache();
    await delCache(`groups:instructor:${group.instructor}`);

    res.status(200).json({
        success: true,
        message: 'lecture updated successfully', 
        data: lecture
    });
});







