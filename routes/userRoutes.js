const express = require('express');
const userController = require('../controller/userController');
const { validateAuth } = require('../middleware/validateAuth');

const router = express.Router(); // Usando const

// Atualização de dados
router.patch('/update-email', userController.updateEmail);
router.get('/get-user', userController.getUser);
router.patch('/update-password', validatePasswordEConfirmPass, validateUser, userController.updatePassword);

module.exports = router;
