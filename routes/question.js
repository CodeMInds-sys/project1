const express = require('express');

const router = express.Router();

const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const questionController = require('../controllers/questions');
router.get('/get/:category', questionController.getQuestions);

router.use(auth,checkRole('manager', 'instructor'));

router.post('/add', questionController.addQuestion);
router.delete('/delete/:id', questionController.deleteQuestion);
// router.put('/update/:id', questionController.updateQuestion);

module.exports = router;
