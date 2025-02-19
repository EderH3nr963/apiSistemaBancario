const express = require('express');
const userController = require('../controller/userController');
const { validateAuth } = require('../middleware/validateAuth');
const { validateUserSignUp, validateUserSignIn, validateUser, validateCpf, validateEmail } = require('../middleware/authUser');

const router = express.Router(); // Usando const

// Rotas de autenticação
router.post('/sign-in', validateUserSignIn, validateUser, userController.userLogin);
router.post('/sign-up', validateUserSignUp, validateUser, userController.userRegister);
router.post('/send-code-verification', userController.sendCodeVerification);
router.post('/email-not-in-use', validateEmail, userController.emailNotInUse);
router.post('/cpf-not-in-use', validateCpf, userController.cpfNotInUse);
router.post('/verification-auth', validateAuth, (req, res) => res.status(200).json({ success: true, mensagem: "Token válido" }));
router.patch('/update-password', validatePasswordEConfirmPass, validateUser, userController.updatePassword);