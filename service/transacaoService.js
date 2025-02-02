const Transacao = require("../models/transacaoModel");  
const User = require("../models/userModel");  
const jwt = require("jsonwebtoken");  

const serviceSendTransacao = async (idUserOrigem, cpfDestino, valor, mensagem = null) => {  
    try {  
        // Carregar usuário de origem e de destino  
        const userOrigem = await User.findById(idUserOrigem);  
        const userDestino = await User.findOne({ cpf: cpfDestino });  

        // Verifique se o valor é válido  
        if (valor < 1) {  
            return { success: false, statusCode: 400, message: "O valor minimo da transacao é 1.00" };  
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

        // Adicionar valor ao saldo do usuário de destino  
        userDestino.saldo += valor;  
        await userDestino.save();  

        // Deduzir o valor do saldo do usuário de origem  
        userOrigem.saldo -= valor;  
        await userOrigem.save();  

        // Criar transação (se necessário)  
        const novaTransacao = new Transacao({  
            userOrigem: idUserOrigem,  
            userDestino: userDestino._id,  
            valor,
            mensagem
        });  
        await novaTransacao.save();  

        return { success: true, statusCode: 200, message: "Transação realizada com sucesso" };  
    } catch (e) {  
        console.error(e); // Logar o erro  
        return { success: false, statusCode: 500, message: "Erro interno no servidor, tente novamente mais tarde" };  
    }  
};  

module.exports = { serviceSendTransacao };