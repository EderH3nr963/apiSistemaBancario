const express = require('express');
const transacaoController = require('../controller/transacaoController');

const router = express.Router();

// Rotas de Transacao
router.post('/transfer', validateAuth, transacaoController.transfer);
router.get('/history', validateAuth, transacaoController.getAllTransacao);
router.get('/:idTransacao', validateAuth, transacaoController.getTransacao);
router.post('/deposit', validateAuth, transacaoController.deposit);
router.post('/withdraw', validateAuth, transacaoController.withdraw);

module.exports = router;