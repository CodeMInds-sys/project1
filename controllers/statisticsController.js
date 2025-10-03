const Course = require('../models/course');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

exports.getStatistics = asyncHandler(async (req, res) => {
    try {
        // حساب عدد الطلاب
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        // حساب عدد المحاضرين
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        
        // حساب عدد الكورسات
        const totalCourses = await Course.countDocuments();
        
        // يمكن إضافة المزيد من الإحصائيات حسب الحاجة
        const statistics = {
            totalStudents,
            totalInstructors,
            totalCourses,
            totalRevenue: 0 // يمكن حسابها من المبيعات لاحقاً
        };

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في جلب الإحصائيات' 
        });
    }
}); 