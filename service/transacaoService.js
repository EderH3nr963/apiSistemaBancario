const Transacao = require("../models/transacaoModel");
const User = require("../models/userModel");

const serviceSetTransacao = async (idUserOrigem, cpfDestino, valor, mensagem = null) => {
    try {
        // Carregar usuário de origem e de destino  
        const userOrigem = await User.findById(idUserOrigem);
        const userDestino = await User.findOne({ cpf: cpfDestino });

        // Verifique se o valor é válido  
        if (valor < 1) {
            return { success: false, statusCode: 400, message: "O valor mínimo da transação é 1.00" };
        }

        // Verifique se os usuários existem  
        if (!userOrigem) {
            return { success: false, statusCode: 404, message: "Usuário de origem inexistente" };
        }

        if (!userDestino) {
            return { success: false, statusCode: 404, message: "Usuário de destino inexistente" };
        }

        // Verifique saldo suficiente  
        if (valor > userOrigem.saldo) {
            return { success: false, statusCode: 400, message: "Saldo insuficiente" };
        }

        // Atualizar saldo dos usuários  
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
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };
    }
}

module.exports = { serviceSetTransacao, serviceGetAllTransacao };
