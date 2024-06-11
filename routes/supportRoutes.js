const express = require('express');
const router = express.Router();
const supportController = require('../Controller/supportController'); 
const { userAuth, checkRole } = require('../Controller/authFunctions');

// Rutas para las funcionalidades de soporte
router.get('/view-all-complaints', userAuth, checkRole(['support']), supportController.viewAllComplaints);
router.post('/assign-complaint', userAuth, checkRole(['support']), supportController.assignComplaint);

module.exports = router;
