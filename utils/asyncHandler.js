const Logger = require('./logger');
const AppError = require('./AppError');
const mongoose = require('mongoose');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch((error) => {
                let customError;

                // التعامل مع أخطاء Mongoose
                if (error instanceof mongoose.Error.ValidationError) {
                    // تجميع رسائل الخطأ من كل الحقول
                    const messages = Object.values(error.errors).map(err => err.message);
                    Logger.error('Validation Error:', {
                        messages,
                        path: req.path,
                        method: req.method
                    });
                    customError = new AppError(messages[0], 400);
                }
                // التعامل مع خطأ التكرار في Mongoose
                else if (error.code === 11000) {
                    const field = Object.keys(error.keyPattern)[0];
                    const message = `${field} مستخدم بالفعل`;
                    Logger.error('Duplicate Key Error:', {
                        field,
                        value: error.keyValue[field],
                        path: req.path,
                        method: req.method
                    });
                    customError = new AppError(message, 400);
                }
                // التعامل مع خطأ CastError في Mongoose
                else if (error instanceof mongoose.Error.CastError) {
                    const message = `قيمة غير صالحة: ${error.value} للحقل ${error.path}`;
                    Logger.error('Cast Error:', {
                        value: error.value,
                        path: error.path,
                        method: req.method
                    });
                    customError = new AppError(message, 400);
                }
                // التعامل مع AppError المخصص
                else if (error instanceof AppError) {
                    customError = error;
                }
                // التعامل مع الأخطاء غير المتوقعة
                else {
                    Logger.error('Unexpected Error:', {
                        error: error.message,
                        stack: error.stack,
                        path: req.path,
                        method: req.method
                    });
                    customError = new AppError(error.message || 'حدث خطأ غير متوقع', 500);
                }

                next(customError);
            });
    };
};

module.exports = asyncHandler; 