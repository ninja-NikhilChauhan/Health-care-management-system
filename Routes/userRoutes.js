const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userControllers');



router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);


module.exports = router;