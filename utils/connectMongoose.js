// /pages/api/data.js

  const mongoose = require("mongoose");
  const logger=require('./logger')
// /pages/api/data.js


// await mongoose.connection.db.collection('instructorrequests').dropIndex('email_1');

const dropIndex=async()=>{
    try {
        await mongoose.connection.db.collection('instructors').dropIndex('email_1');
        logger.info(`Index dropped successfully`);
      } catch (error) {
        logger.error(`Index drop failed: ${error.message}`);
    }
}
const connectDB = async () => {
//   if (mongoose.connections[0].readyState) return;


logger.info(`mongoose function is funning`)
  await mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
  // dropIndex();

  mongoose.connection.on("connected", () => {
    logger.info(`MongoDB Connected`);
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err.message}`)
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn(`MongoDB Disconnected`);
  })

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      logger.warn(`MongoDB connection closed due to app termination`);
      process.exit(0);
    });
  });
};

module.exports={
    connectDB
 } ;
