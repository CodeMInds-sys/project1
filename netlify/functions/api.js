const serverless = require("serverless-http");
const app = require("../../index"); // استورد app بدل ما تكتب كود جديد

module.exports.handler = serverless(app);
