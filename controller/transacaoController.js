const transacaoService = require('../service/transacaoService');

const sendTransacao = (req, res) => {
    const idUserOrigem = req.user;
    const { cpfDestino, valor, mensagem } = req.body;

    response = transacaoService.serviceSendTransacao(idUserOrigem, cpfDestino, valor, !mensagem);

    res.status(response.statusCode).json(response);
}

module.exports = { sendTransacao };
