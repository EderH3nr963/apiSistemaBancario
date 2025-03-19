const Cobrancas = require("../models/paymentsModel");
const User = require("../models/userModel");
const transacaoService = require("./transacaoService");

async function createCobranca({ idCobrador, cpfDevedor /* Id de quem será cobrado */, valor, descricao }) {
    try {
        // Verifica se o usuário que será cobrado existe
        if (!(User.findOne({ cpf: cpfDevedor }))) return { success: false, statusCode: 404, message: "Usuário não encontrado" }

        // Verificar se o valor da cobrança é válido
        if (valor < 0) return { success: false, statusCode: 500, message: "O valor de cobrancça não pode ser menor ou igual a zero" }

        // Registra a divida no banco de dados
        const cobranca = new Cobrancas(cpfDevedor, idCobrador, valor, descricao, "pendente");
        await cobranca.save();

        return { success: true, statusCode: 200, message: "Cobranca registrada com sucesso" }
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" }
    }
}

async function getCobranca({ idCobrador, idCobranca }) {
    try {
        var cobranca = await Cobrancas.findById(idCobranca);

        const cobrador = await User.findById(idCobrador);
        const devedor = await User.findById(cobranca.id);

        if (!devedor) return { success: false, statusCode: 404, message: "Usuário não encontrado" } // Verifica se o Id é valido

        if (!cobranca) return { success: false, statusCode: 404, message: "Cobrança não encontrada" } // Verifica se a Cobrança existe

        // Verifica se o usuario pode ter acesso
        if (cobranca.idDevedor !== cobrador._id || cobranca.idDevedor !== devedor._id) return { success: false, statusCode: 503, message: "O usuário não pode ter acesso a essa cobrança" }

        var { idDevedor, idCobrador, ...cobranca } = cobranca; // Desmenbrando o obejeto de cobrança para remover os id's de usuários

        return { success: true, statusCode: 200, message: "", cobranca: { cpfCobrador: cobrador.cpf, cpfDevedor: devedor.cpf, ...cobranca } }
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" }
    }
}

async function getAllCobrancas({ idUser }) {
    try {
        const cobrancasDev = await Cobrancas.find({ idDevedor: idUser });
        const cobrancasCob = await Cobrancas.find({ idCobrador: idUser });

        // Reconfigura a lista para retornar os cpf's dos usuarios
        var cobrancas = [...cobrancasDev, ...cobrancasCob].map(async (cobranca) => {
            const cobrador = await User.findById(cobranca.idCobrador);
            const devedor = await User.findById(cobranca.idDevedor);

            return {
                cpfCobrador: cobrador.cpf,
                cpfDevedor: devedor.cpf,
                id: cobranca._id,
                valor: cobranca.valor,
                descricao: cobranca.descricao,
                status: cobranca.status
            }
        });

        return { success: true, statusCode: 200, message: "", cobrancas }
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" }
    }
}

async function cancelCobranca({ idUser, idCobranca }) {
    try {
        var cobranca = await Cobrancas.findById(idCobranca);

        const cobrador = await User.findById(idUser);

        if (cobranca.idDevedor !== cobrador._id) return { success: false, statusCode: 503, message: "O usuário não pode ter acesso a essa cobrança" }

        if (cobranca.status === "cancelada") return { success: false, statusCode: 404, message: "Cobrança não encontrada" }

        // Altera o status
        cobranca.status = "cancelada";
        await cobranca.save();

        return { success: true, statusCode: 200, message: "Cobrança cancelada com sucesso" }
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" }
    }
}

async function payCobranca({ idUser, idCobranca }) {
    try {
        const cobranca = await Cobrancas.findById(idCobranca);

        const devedor = await User.findById(idUser);

        if (cobranca.idDevedor != devedor._id) return { success: false, statusCode: 500, message: "Você não pode pagar essa cobrançaF" }

        if (devedor.saldo < cobranca.valor) return { success: false, statusCode: 401, message: "Saldo insuficiente" }

        // Realiza a transacao
        await transacaoService.serviceSetTransacao({ 
            idUser: devedor._id, 
            cpfDestinatario: cobranca.cobrador, 
            valor: cobranca.valor, 
            mensagem: cobranca.descricao 
        });
        
        cobranca.status = "paga";
        cobranca.save();

        return { success: true, statusCode: 200, message: "Pagamento realizado" }
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" }
    }
}

// Exporta as funções para uso em outros módulos
module.exports = { createCobranca, getCobranca, getAllCobrancas, cancelCobranca, payCobranca };
