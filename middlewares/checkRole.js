const AppError = require('../utils/AppError');

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new AppError('غير مصرح لك بالوصول إلى هذا المسار', 403);
        }
        next();
    };
};


module.exports = checkRole; 