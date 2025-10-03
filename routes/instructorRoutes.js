const express = require('express');
const router = express.Router();
const instructorController  = require('../controllers/instructorController');
const { upload } = require('../utils/fileUpload');
const { auth } = require('../middlewares/jwt');
const uploadFileToGoogleDrive = require('../utils/googleDrive');
const uploadFile = upload(['application/pdf','image/jpeg', 'image/png', 'image/jpg']);
router.route('/')
    .post(auth, uploadFile.single('cv'), instructorController.createInstructor)
    .get(instructorController.getInstructors);    

router.route('/:id')
    .get(instructorController.getInstructor)
    .put(auth, instructorController.updateInstructor)
    .delete(auth, instructorController.deleteInstructor);

module.exports = router;




