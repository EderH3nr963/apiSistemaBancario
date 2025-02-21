const paymentsServices = require('../service/paymentsService');

const setPayment = async (req, res) => {
    const { cpf, valor } = req.body;
    const response = await paymentsServices.serviceSetPayment(cpf, valor);

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

const getPayment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.idUser; 
    
    const response = await paymentsServices.serviceGetPayment(id, userId);

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

const getAllPayments = async (req, res) => {
    const { userId } = req.user;
    
    const response = await paymentsServices.serviceGetAllPayments(userId);

    return res.status(response.statusCode).json({ message: response.message, payments: response.payments });
};

const payPayment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user; 
    
    const response = await paymentsServices.servicePayPayment(id, userId);
    
    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
}

const cancelPayment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user; 
    
    const response = await paymentsServices.serviceCancelPayment(id, userId);

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

module.exports = { payPayment, setPayment, getPayment, getAllPayments, cancelPayment };