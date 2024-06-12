const express = require('express');
const router = express.Router();
const ciudadanoController = require('../Controller/ciudadanoController');
const { userAuth, checkRole } = require('../Controller/authFunctions');

// Ruta para crear una queja
router.post('/create-complaint', userAuth, checkRole(['ciudadano']), ciudadanoController.createComplaint);

// Ruta para ver las quejas
router.get('/view-complaints', userAuth, checkRole(['ciudadano']), ciudadanoController.viewComplaints);

router.get('/view-responses', userAuth,checkRole(['ciudadano']), ciudadanoController.viewResponses);


module.exports = router;
