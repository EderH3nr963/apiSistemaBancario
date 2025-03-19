const express = require('express');
const cobrancaController = require("../controller/cobrancaController");
const router = express.Router();

router.post('/pay/:idCobranca', cobrancaController.payCobranca)
router.post('/', cobrancaController.createCobranca); // Cria um pagamento
router.delete('/:idCobranca', cobrancaController.cancelCobranca); // Cancela um pagamento

// Getters de pagamentos
router.get('/', cobrancaController.getAllCobrancas);
router.get('/:idCobranca', cobrancaController.getCobranca);

module.exports = router