

const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/jwt');
const checkRole = require('../middlewares/checkRole');
const requestsController = require('../controllers/requestsController');


router.use(auth);


router.use(checkRole('manager'))


router.get('/', requestsController.getAllRequestsToEnrollInCourse);
router.get('/accepted', requestsController.getAcceptedRequests);
router.put('/accept', requestsController.acceptRequestToEnrollInCourse);
// router.put('/requests/reject', studentController.rejectRequestToEnrollInCourse);
router.get('/accepted_and_joined', requestsController.getAccepted_and_Joined_Requests);

module.exports = router;
