const redisClient = require('../utils/redisClient');

const redisMiddleware = async (req, res, next) => {
    const { userId } = req.user;
    const user = await redisClient.get(`user:${userId}`);
    req.user = user;
    next();
};

module.exports = redisMiddleware;
