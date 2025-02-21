const express = require('express');
const authController = require('../controller/authController');
const { validateAuth } = require('../middleware/validateAuth');
const { validateUserSignUp, validateUserSignIn, validateUser, validateCpf, validateEmail, validatePasswordEConfirmPass } = require('../middleware/authUser');

const router = express.Router(); // Usando const

// Rotas de autenticação
router.post('/sign-in', validateUserSignIn, validateUser, authController.userLogin);
router.post('/sign-up', validateUserSignUp, validateUser, authController.userRegister);
router.post('/send-code-verification', authController.sendCodeVerification);
router.post('/email-not-in-use', validateEmail, authController.emailNotInUse);
router.post('/cpf-not-in-use', validateCpf, authController.cpfNotInUse);
router.post('/verification-auth', validateAuth, (req, res) => res.status(200).json({ success: true, mensagem: "Token válido" }));
router.patch('/forgot-password', validatePasswordEConfirmPass, validateUser, authController.forgotPassword);

module.exports = router;