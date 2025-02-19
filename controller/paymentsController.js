const paymentsServices = require('../service/paymentsService');

const bill = async (req, res) => {
    const { numeroCodigoDeBarras } = req.body;

    const response = await paymentsServices.serviceBill();

    return res.status(response.statusCode).json(response);
}

const qrCode = async (req, res) => {
    const { numeroCodigoDeBarras } = req.body;

    const response = await paymentsServices.serviceQrCode();

    return res.status(response.statusCode).json(response);
}

const history = async (req, res) => {
    const { numeroCodigoDeBarras } = req.body;
    
    const response = await paymentsServices.serviceHistory();
    
    return res.status(response.statusCode).json(response);
}

module.exports = {bill, qrCode, history};