const express = require("express");
const router = express.Router();
const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const groupController = require('../controllers/groupController');

router.get('/:id', groupController.getGroup); 

router.use(auth);

router
  .route('/')
  .get(groupController.getGroups)
  .post(checkRole('instructor','manager', 'admin'), groupController.createGroup);

router
  .route('/:id')
  // .get(groupController.getGroup)
  .put(checkRole('instructor','manager', 'admin'), groupController.updateGroup)
  .delete(checkRole('instructor','manager', 'admin'), groupController.deleteGroup);

router.get('/status/:status',checkRole('manager', 'admin'), groupController.getGroupsWithStatus);

router.post('/addStudent', groupController.addStudentToGroup);
router.get('/instructorGroups/:id', groupController.getGroupsOfInstructor);

router.post('/addLecToGroup', groupController.addLectureToGroup);
router.put('/editLecToGroup/:id', groupController.editLectureToGroup);

router.get('/students/:id', groupController.getGroupStudents);

router.get('/join/:id', groupController.addStudentToGroupWithInviteLink);
module.exports = router;
