const express = require('express');

const router = express.Router();

router.post('/bill') // Pagamento com boleto
router.post('/qr-code') // Pagamento com QRcode
router.post('/card') // Pagamento com Cartao
router.get('/history') // Histórico de pagamentos

module.exports = router