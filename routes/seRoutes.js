const express = require('express');
const router = express.Router();
const seController = require('../Controller/seController');
const { userAuth, checkRole } = require('../Controller/authFunctions');

router.get('/view-assigned-complaints', userAuth, checkRole(['se']), seController.viewAssignedComplaints);
router.put('/update-complaint-status', userAuth, checkRole(['se']), seController.updateComplaintStatus);
router.post('/respond-complaint', userAuth, checkRole(['se']),seController.respondToComplaint);
router.get('/sent-responses', userAuth, seController.getSentResponses);
module.exports = router;
