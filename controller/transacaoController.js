const transacaoService = require('../service/transacaoService');

const setTransacao = async (req, res) => {
    const idUserOrigem = req.idUser;
    const { cpfDestino, valor, mensagem } = req.body;

    response = await transacaoService.serviceSetTransacao(idUserOrigem, cpfDestino, valor, !mensagem);

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

module.exports = { setTransacao, getAllTransacao, getTransacao };
