const express = require('express');
const { validateAuth } = require('../middleware/validateAuth');
const transacaoController = require('../controller/transacaoController');

const router = express.Router();

// Rotas de Transacao
router.post('/transfer', transacaoController.transfer);
router.get('/history', transacaoController.getAllTransacao);
router.get('/:idTransacao', transacaoController.getTransacao);
router.post('/deposit', transacaoController.deposit);
router.post('/withdraw', transacaoController.withdraw);

module.exports = router;