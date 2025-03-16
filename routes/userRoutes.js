const express = require('express');
const userController = require('../controller/userController');
const { validatePasswordEConfirmPass } = require('../middleware/authUser');

const router = express.Router(); // Usando const

router.patch('/update-email', userController.updateEmail);
router.get('/get-user', userController.getUser);
router.get('/get-user/:id', userController.getUserWithoutSensitiveData);
router.patch('/update-password', validatePasswordEConfirmPass, userController.updatePassword);

module.exports = router;
