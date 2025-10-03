
const express = require('express');
const router = express.Router();

const { upload } = require('../utils/fileUpload');
const uploadFileToGoogleDrive = require('../utils/googleDrive');

const controller = require('../controllers/userController');
router.post('/view', controller.viewUser);
router.get('/views', controller.getViews);

const uploadFile = upload(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
// router.post('/upload', uploadFile.single('file'), uploadFileToGoogleDrive,controller.uploadFileToGoogleDrive);

module.exports = router;
