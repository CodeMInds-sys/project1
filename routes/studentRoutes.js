const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const studentController = require('../controllers/studentController');
const requestsController = require('../controllers/requestsController');

router.use(auth);


// routes for student
router.route('/')
.post(studentController.createStudent)
.get(studentController.getStudents);    
 
router.put('/:id', checkRole('student'), studentController.updateStudent);
router.delete('/:id', checkRole('student'), studentController.deleteStudent); 
router.get('/:id', checkRole('student'), studentController.getStudent);

router.post('/enroll', checkRole('student'), requestsController.enrollStudentInCourse);






module.exports = router;  