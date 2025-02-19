const express = require('express');
const paymentsController = require("../controller/paymentsController");
const router = express.Router();

router.post('/bill', paymentsController.bill) // Pagamento com boleto
router.post('/qr-code', paymentsController.qrCode) // Pagamento com QRcode
router.get('/history', paymentsController.history) // Histórico de pagamentos

module.exports = router