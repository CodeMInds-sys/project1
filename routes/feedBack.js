const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const feedBackController = require('../controllers/feedBack');

router.use(auth);

router.post('/add', feedBackController.addFeedBack);
// router.delete('/delete/:id', feedBackController.deleteFeedBack);
// router.put('/update/:id', feedBackController.updateFeedBack);

module.exports = router;