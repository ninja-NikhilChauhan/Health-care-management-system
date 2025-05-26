const express = require('express');
const {createAdmin ,adminLogin ,verifyOTP } = require('../Controllers/adminAuthController');

const router = express.Router();

router.post('/signup', createAdmin);
router.post("/login", adminLogin);     
router.post("/verify-otp", verifyOTP); 

module.exports = router;
