const multer = require('multer');
const path = require('path');
const AppError = require('./AppError');
const fs = require('fs');

// تكوين التخزين المؤقت في الذاكرة
const storage = multer.memoryStorage();

// التحقق من نوع الملف
const fileFilter = (allowedTypes)=>{
    return (req, file, cb) => {
    
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`you can only upload ${allowedTypes.join(', ')}`, 400), false);
        }
    }
};

// إعدادات الرفع
const upload = (allowedTypes)=>{ 
    return multer({
        storage: storage,
        fileFilter: fileFilter(allowedTypes),

        // limits: {
        //     fileSize: 5 * 1024 * 1024 // 5 ميجابايت كحد أقصى
        // }
    
})
};

// معالج الأخطاء
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت', 400));
        }
        return next(new AppError('خطأ في رفع الملف', 400));
    }
    next(error);
};

// دالة مساعدة لتحويل Buffer إلى ملف مؤقت
const bufferToFile = async (buffer, originalname) => {
    const tempPath = path.join(__dirname, '../temp', Date.now() + path.extname(originalname));
    await fs.promises.writeFile(tempPath, buffer);
    return {
        path: tempPath,
        filename: path.basename(tempPath)
    };
};

module.exports = {
    upload,
    handleUploadError,
    bufferToFile
}; 