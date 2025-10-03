const express = require('express');
const router = express.Router();

const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const courseProgressController = require('../controllers/courseProgress');


router.get('/get/:id', courseProgressController.getCourseProgress);
router.put('/update/:id', courseProgressController.updateLectureProgress);

module.exports = router;