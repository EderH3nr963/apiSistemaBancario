const Transacao = require("../models/transacaoModel"); // Importa o modelo de transações
const User = require("../models/userModel"); // Importa o modelo de usuários

// Serviço para realizar uma transação entre dois usuários
const serviceSetTransacao = async (idUser, cpf, valor, mensagem = null) => {
    try {
        // Carregar os usuários de origem e destino, em uma única operação assíncrona
        const [userOrigem, userDestino] = await Promise.all([
            User.findById(idUser).session(session), // Busca o usuário de origem
            User.findOne({ cpf: cpf.replace(/\D/g, "") }).session(session) // Busca o usuário de destino, removendo pontuação do CPF
        ]);

        // Validações de entrada
        if (valor < 1) {
            return { success: false, statusCode: 400, message: "O valor mínimo da transação é 1.00" };
        }
        if (!userOrigem) {
            return { success: false, statusCode: 404, message: "Usuário de origem inexistente" };
        }
        if (!userDestino) {
            return { success: false, statusCode: 404, message: "Usuário de destino inexistente" };
        }
        if (valor > userOrigem.saldo) {
            return { success: false, statusCode: 400, message: "Saldo insuficiente" };
        }

        // Atualiza os saldos dos usuários após a transação
        await User.updateOne({ _id: userOrigem._id }, { $inc: { saldo: -valor } });
        await User.updateOne({ _id: userDestino._id }, { $inc: { saldo: valor } });

        // Cria uma nova transação e a salva no banco de dados
        const novaTransacao = new Transacao({
            userOrigem: idUserOrigem,
            userDestino: userDestino._id,
            valor,
            mensagem
        });
        await novaTransacao.save();

        // Retorna a resposta de sucesso com o ID da transação
        return { success: true, statusCode: 200, message: "Transação realizada com sucesso", transacaoId: novaTransacao._id.toString() };
    } catch (e) {
        console.error(e); // Exibe o erro para depuração
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

// Serviço para buscar todas as transações de um usuário (enviadas e recebidas)
const serviceGetAllTransacao = async (id) => {
    try {
        // Verifica se o ID do usuário foi fornecido
        if (!id) {
            return { success: false, statusCode: 400, message: "ID do usuário é obrigatório" };
        }

        // Busca o usuário no banco de dados
        const user = await User.findById(id);
        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        // Busca as transações enviadas e recebidas pelo usuário
        const transacoesEnviadas = await Transacao.find({ userOrigem: id });
        const transacoesRecebidas = await Transacao.find({ userDestino: id });

        // Caso não haja transações, retorna uma mensagem adequada
        if (transacoesEnviadas.length === 0 && transacoesRecebidas.length === 0) {
            return { success: true, statusCode: 200, message: "Você não realizou nem recebeu nenhuma transação", transacoes: [] };
        }

        // Retorna as transações enviadas e recebidas pelo usuário
        return {
            success: true,
            statusCode: 200,
            message: "Transações resgatadas com sucesso",
            transacoes: [...transacoesEnviadas, ...transacoesRecebidas]
        };
    } catch (e) {
        console.error(e); // Exibe o erro para depuração
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

// Serviço para buscar uma transação específica
const serviceGetTransacao = async (idUser, idTransacao) => {
    try {
        // Verifica se o usuário existe
        const user = await User.findById(idUser);
        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        // Busca a transação no banco de dados
        const transacao = await Transacao.findById(idTransacao);
        if (!transacao) {
            return { success: false, statusCode: 404, message: "Transação não encontrada" };
        }

        // Verifica se o usuário tem permissão para acessar essa transação
        if (transacao.userOrigem.toString() !== idUser && transacao.userDestino.toString() !== idUser) {
            return {
                success: false,
                statusCode: 403, // Código de acesso negado
                message: "Você não pode acessar essa transação"
            };
        }

        // Retorna a transação se o usuário tem permissão para acessá-la
        return {
            success: true,
            statusCode: 200,
            message: "Transação resgatada com sucesso",
            transacao
        };
    } catch (e) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

// Serviço para realizar um depósito na conta de um usuário
const serviceDeposit = async (idUser, valor) => {
    try {
        // Busca o usuário no banco de dados
        user = await User.findById(idUser);

        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        // Atualiza o saldo do usuário com o valor do depósito
        await User.updateOne({ _id: user._id }, { $inc: { saldo: valor } });

        // Retorna mensagem de sucesso
        return { success: true, statusCode: 200, message: "Depósito realizado com sucesso" };
    } catch (e) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

// Serviço para realizar um saque na conta de um usuário
const serviceWithdraw = async (idUser, valor) => { 
    try {
        // Busca o usuário no banco de dados
        user = await User.findById(idUser);

        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        // Atualiza o saldo do usuário, descontando o valor do saque
        await User.updateOne({ _id: user._id }, { $inc: { saldo: -valor } });

        // Retorna mensagem de sucesso
        return { success: true, statusCode: 200, message: "Saque realizado com sucesso" };
    } catch (e) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

module.exports = { serviceSetTransacao, serviceGetAllTransacao, serviceGetTransacao, serviceDeposit, serviceWithdraw }; // Exporta os serviços para serem usados em outras partes do código
