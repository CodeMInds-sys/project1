const Course = require('../models/course');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { bufferToFile } = require('../utils/fileUpload');
const fs = require('fs');
function getPublicIdFromUrl(url) {
    const parts = url.split('/');
    const fileName = parts.pop(); // آخر جزء في الرابط
    const fileNameWithoutExtension = fileName.split('.')[0]; // شيل .png أو .jpg
  
    const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/');
    return `${folderPath}/${fileNameWithoutExtension}`;
  }
  
  
// دالة لإنشاء دورة تدريبية
exports.createCourse = asyncHandler(async (req, res) => {
    let imageUrl = 'default-course.png';
    let imagePublicId = null;
  
    if (req.file) {
      try {
        // تحويل Buffer إلى base64
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  
        // رفع الملف إلى Cloudinary
        const uploadResult = await uploadToCloudinary(fileStr, req.file.originalname);
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.public_id;

        console.log(imageUrl,imagePublicId);
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.status(500).json({ 
            success: false,
            message: 'فشل في رفع الصورة إلى Cloudinary' ,
            data: null
        });
      }
    }
  
    // إنشاء الدورة التدريبية
    try {   
    const {title,description,price,}=req.body;
    const course = await Course.create({
      title,
      description,
      price,
      imageUrl,
    });
    // in case error delete image fromt coudinary agai
    res.status(201).json({
      success: true,
      message:"course created successfully",
      data: course
    });

    } catch (error) {
        console.error('Error creating course:', error);
        if(imagePublicId)
             await deleteFromCloudinary(imagePublicId);
        return res.status(500).json({ 
            success: false,
            message: 'fail to create course' ,
            data: null
        });
    }

    
  });

  
exports.getCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find()
        // .populate('instructors', 'name email ')
        // .populate('createdBy', 'name');

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

exports.getCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email')
        .populate('createdBy', 'name')
        .populate('enrolledStudents', 'name email');

    if (!course) {
        throw new AppError('الكورس غير موجود', 404);
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

exports.updateCourse = asyncHandler(async (req, res) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        throw new AppError('الكورس غير موجود', 404);
    }
    let imageUrl = 'default-course.png';



    if (req.file) {
        try {
            if (course.imageUrl) {
                const publicId = getPublicIdFromUrl(course.imageUrl);
                console.log("publicId==============================",publicId);
                await deleteFromCloudinary(publicId);
            }

          // تحويل Buffer إلى base64
          const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
          // رفع الملف إلى Cloudinary
          const uploadResult = await uploadToCloudinary(fileStr, req.file.originalname);
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.public_id;
          course.imageUrl=imageUrl;

          console.log(imageUrl,imagePublicId);
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          return res.status(500).json({ 
              success: false,
              message: 'فشل في رفع الصورة إلى Cloudinary' ,
              data: null
          });
        }
      }
    

    const {title,description,price}=req.body;

    course.title=title? title:course.title;
    course.description=description? description:course.description;
    course.price=price? price:course.price;
    await course.save();
    res.status(200).json({
        success: true,
        data: course
    });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  


    // التحقق من الصلاحيات
    // if (req.user.role !== 'manager') {
    //     throw new AppError('غير مصرح لك بحذف هذا الكورس', 403);
    // }
    const course = await Course.findByIdAndDelete(req.params.id);
    if (course.imageUrl) {
        await deleteFromCloudinary(getPublicIdFromUrl(course.imageUrl));
    }

    res.status(200).json({
        success: true,
        message: 'تم حذف الكورس بنجاح'
    });
}); 