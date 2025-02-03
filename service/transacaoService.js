const Transacao = require("../models/transacaoModel");
const User = require("../models/userModel");

const serviceSetTransacao = async (idUserOrigem, cpfDestino, valor, mensagem = null) => {
    try {
        // Carregar usuários
        const userOrigem = await User.findById(idUserOrigem);
        const userDestino = await User.findOne({ cpf: cpfDestino });

        // Validações básicas
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

        // Atualizar saldos
        userDestino.saldo += valor;
        userOrigem.saldo -= valor;

        await userDestino.save();
        await userOrigem.save();

        // Criar transação
        const novaTransacao = new Transacao({
            userOrigem: idUserOrigem,
            userDestino: userDestino._id,
            valor,
            mensagem
        });
        await novaTransacao.save();

        return { success: true, statusCode: 200, message: "Transação realizada com sucesso" };
    } catch (e) {
        console.error(e);
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

const serviceGetAllTransacao = async (id) => {
    try {
        if (!id) {
            return { success: false, statusCode: 400, message: "ID do usuário é obrigatório" };
        }

        const user = await User.findById(id);
        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        const transacoesEnviadas = await Transacao.find({ userOrigem: id });
        const transacoesRecebidas = await Transacao.find({ userDestino: id });

        if (transacoesEnviadas.length === 0 && transacoesRecebidas.length === 0) {
            return { success: true, statusCode: 200, message: "Você não realizou nem recebeu nenhuma transação", transacoes: [] };
        }

        return { 
            success: true, 
            statusCode: 200, 
            message: "Transações resgatadas com sucesso", 
            transacoes: [...transacoesEnviadas, ...transacoesRecebidas] 
        };
    } catch (e) {
        console.error(e);
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

const serviceGetTransacao = async (idUser, idTransacao) => {
    try {
        // Verificar se o usuário existe
        const user = await User.findById(idUser);
        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        // Buscar a transação
        const transacao = await Transacao.findById(idTransacao);
        if (!transacao) {
            return { success: false, statusCode: 404, message: "Transação não encontrada" };
        }

        // Verificar se o usuário tem permissão para acessar
        if (transacao.userOrigem.toString() !== idUser && transacao.userDestino.toString() !== idUser) {
            return { 
                success: false, 
                statusCode: 403, // Código correto para acesso negado
                message: "Você não pode acessar essa transação" 
            };
        }

        return { 
            success: true, 
            statusCode: 200, 
            message: "Transação resgatada com sucesso", 
            transacao 
        };
    } catch (e) {
        console.error(e);
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
};

module.exports = { serviceSetTransacao, serviceGetAllTransacao, serviceGetTransacao };
