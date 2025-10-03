const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const Logger = require('../utils/logger');
const User = require('../models/user');
const generateToken = (payload,time) => {
    const options={};
    if(typeof time === 'string' && time.trim() !== ''){
        options.expiresIn = time;
    }
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        options
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError("token expired", 401);
        }
        if (error.name === 'JsonWebTokenError') {
            throw new AppError("invalid token", 401);
        }
        throw new AppError("invalid token", 401);
    }
};

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            throw new AppError('يرجى تسجيل الدخول', 401);
        }

        const decoded = verifyToken(token);
        const user = await User.findOne({ 
            _id: decoded.id,
        });

        if (!user) {
            throw new AppError('user not found', 401);
        }

        // if(user.authToken != token){
        //     throw new AppError('user logged in from another device', 401);
        // }
        req.user = user;
        next();  
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateToken,
    verifyToken,
    auth
}; 