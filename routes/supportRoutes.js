const express = require('express');
const router = express.Router();
const supportController = require('../Controller/supportController'); 
const { userAuth, checkRole } = require('../Controller/authFunctions');

// Rutas para las funcionalidades de soporte
router.get('/view-all-complaints', userAuth, checkRole(['support'|| 'admin']), supportController.viewAllComplaints);
router.post('/assign-complaint', userAuth, checkRole(['support'|| 'admin']), supportController.assignComplaint);

router.get('/se-with-complaints', userAuth, checkRole(['support','admin']), supportController.getSEsWithComplaints);
router.patch('/complaint/:id/unassign', userAuth, checkRole(['support', 'admin']), supportController.unassignComplaint);

module.exports = router;
