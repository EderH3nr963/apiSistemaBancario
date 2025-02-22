const transacaoService = require('../service/transacaoService');

const transfer = async (req, res) => {
    const idUser = req.idUser;
    const { cpf, valor, mensagem } = req.body;

    response = await transacaoService.serviceSetTransacao(idUser, cpf, valor, !mensagem);

    res.status(response.statusCode).json(response);
}

const getAllTransacao = async (req, res) => {
    const idUser = req.idUser;
    
    response = await transacaoService.serviceGetAllTransacao(idUser);
    
    res.status(response.statusCode).json(response);
}

const getTransacao = async (req, res) => {
    const idUser = req.idUser;
    const idTransacao = req.param.idTransacao;
    
    response = await transacaoService.serviceGetTransacao(idUser, idTransacao);
    
    res.status(response.statusCode).json(response);
}

const deposit = async (req, res) => {
    const idUser = req.idUser;
    const { valor } = req.body;

    response = await transacaoService.serviceDeposit(idUser, valor);
    
    res.status(response.statusCode).json(response);
}

const withdraw = async (req, res) => {
    const idUser = req.idUser;
    const { valor } = req.body;

    response = await transacaoService.serviceWithdraw(idUser, valor);
    
    res.status(response.statusCode).json(response);
}

module.exports = { transfer, getAllTransacao, getTransacao, deposit, withdraw};
