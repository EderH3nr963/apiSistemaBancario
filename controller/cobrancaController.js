const cobrancaService = require('../service/cobrancaService');

const createCobranca = async (req, res) => {
    const { cpf, valor, menssagem = null } = req.body;
    const { idUser } = req.idUser;
    const response = await cobrancaService.createCobranca({ idUser, cpf, valor, menssagem });

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

const getCobranca = async (req, res) => {
    const { idCobranca } = req.params;
    const { userId } = req.idUser;

    const response = await cobrancaService.getCobranca({ userId, idCobranca });

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

const getAllCobrancas = async (req, res) => {
    const { userId } = req.user;

    const response = await cobrancaService.getAllCobrancas({ userId });

    return res.status(response.statusCode).json({ message: response.message, payments: response.payments });
};

const cancelCobranca = async (req, res) => {
    const { idCobranca } = req.params;
    const { userId } = req.user;

    const response = await cobrancaService.cancelCobranca({ userId, idCobranca });

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

const payCobranca = async (req, res) => {
    const { idCobranca } = req.params;
    const { userId } = req.user;

    const response = await cobrancaService.payCobranca({ userId, idCobranca });

    return res.status(response.statusCode).json({ message: response.message, payment: response.payment });
};

module.exports = { createCobranca, getCobranca, getAllCobrancas, cancelCobranca, payCobranca };