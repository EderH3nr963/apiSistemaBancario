const express = require('express');
const userController = require('../controller/userController');
const { validateUserSignUp, validateUserSignIn, validateUser } = require('../middleware/authUser');

const router = express.Router(); // Usando const

// Rotas de autenticação
router.post('/sign-in', validateUserSignIn, validateUser, userController.userLogin);
router.post('/sign-up', validateUserSignUp, validateUser, userController.userRegister);

module.exports = router;
