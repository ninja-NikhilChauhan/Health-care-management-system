const express = require('express');
const router = express.Router();
const doctorController = require('../Controllers/doctorListController.js');
const {isAdminAuthenticated} = require('../middleware/authMiddleware.js')
// Define routes for doctors
router.post('/createdoctors', doctorController.createDoctor); // Create doctor
router.get('/doctors', doctorController.getAllDoctors); // Get all doctors
router.get('/doctors/:id', doctorController.getDoctorById); // Get doctor by ID
router.put('/doctors/:id',doctorController.updateDoctor); // Update doctor
router.delete('/doctors/:id',doctorController.deleteDoctor); // Delete doctor

module.exports = router;
                                

