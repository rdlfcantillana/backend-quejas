const express = require('express');
const router = express.Router();
const adminController = require('../Controller/adminController');
const { userAuth, checkRole } = require('../Controller/authFunctions');

// Ruta para registrar un support
router.post('/register-support', userAuth, checkRole(['admin']), adminController.registerSupport);



router.get('/view-all-complaints-admin', userAuth, checkRole('admin'), adminController.viewAllComplaintsAdmin);

router.get('/test' , userAuth, checkRole(['admin']), adminController.testAuth);
// Ruta para registrar un SE
router.post('/register-se', userAuth, checkRole(['admin']), adminController.registerSE);

// Ruta para ver todos los supports
router.get('/view-supports', userAuth, checkRole(['admin']), adminController.viewSupports);

// Ruta para ver todos los SEs
router.get('/view-ses', userAuth, checkRole(['admin','support']), adminController.viewSEs);

// Ruta para eliminar un empleado
router.delete('/delete-employee/:id', userAuth, checkRole(['admin']), adminController.deleteEmployee);

router.delete('/complaints/:id', userAuth, checkRole(['admin', 'support']), adminController.deleteComplaint);

module.exports = router;
