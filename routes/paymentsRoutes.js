const express = require('express');
const paymentsController = require("../controller/paymentsController");
const router = express.Router();

router.post('/create', paymentsController.setPayment);
router.post('/:id/cancel', paymentsController.cancelPayment); 
router.get('/', paymentsController.getAllPayments);
router.get('/:id', paymentsController.getPayment);
router.put('/:id/pay', paymentsController.payPayment); 

module.exports = router