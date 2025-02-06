const express = require('express');
const userController = require('../controller/userController');
const transacaoController = require('../controller/transacaoController');
const { validateAuth } = require('../middleware/validateAuth');
const { validateUserSignUp, validateUserSignIn, validateUser, validateCpf, validateEmail, validatePasswordEConfirmPass } = require('../middleware/authUser');

const router = express.Router(); // Usando const

// Rotas de autenticação
router.post('/sign-in', validateUserSignIn, validateUser, userController.userLogin);
router.post('/sign-up', validateUserSignUp, validateUser, userController.userRegister);
router.post('/send-code-verification', userController.sendCodeVerification);
router.post('/email-not-in-use', validateEmail, userController.emailNotInUse);
router.post('/cpf-not-in-use', validateCpf, userController.cpfNotInUse);
router.post('/verification-auth', validateAuth, (req, res) => res.status(200).json({ success: true, mensagem: "Token válido" }));

// Atualização de dados
router.patch('/update-password', validatePasswordEConfirmPass, validateUser, userController.updatePassword);
router.patch('/update-email', validateAuth, userController.updateEmail);
router.get('/get-user', validateAuth, userController.getUser);

// Serviços do usuário
router.post('/set-transacao', validateAuth, transacaoController.setTransacao);
router.get('/get-all-transacao', validateAuth, transacaoController.getAllTransacao);
router.get('/get-transacao/:idTransacao', validateAuth, transacaoController.getTransacao);

module.exports = router;
