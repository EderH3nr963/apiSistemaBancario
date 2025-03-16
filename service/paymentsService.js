const Payments = require("../models/paymentsModel");
const User = require("../models/userModel");
const transacaoService = require("./transacaoService");

const serviceSetPayment = async (idUserCobrador, cpfDevedor, valor) => {
    try {
        // Busca o cobrador e o devedor pelo CPF
        const cobrador = await User.findById(idUserCobrador);
        const devedor = await User.findOne({ cpf: cpfDevedor });

        // Verifica se o cobrador e o devedor existem
        if (!cobrador) {
            return { success: false, statusCode: 404, message: "Cobrador inexistente" };
        }
        if (!devedor) {
            return { success: false, statusCode: 404, message: "Devedor inexistente" };
        }

        // Verifica se o valor do pagamento é válido (maior que zero)
        if (valor <= 0) {
            return { success: false, statusCode: 400, message: "Valor do pagamento inválido" };
        }

        // Cria um novo pagamento com status 'pending' (pendente)
        const payment = new Payments({
            user: devedor._id, // Quem será cobrado (devedor)
            cobrador: cobrador._id, // Quem cria a cobrança (cobrador)
            valor: valor,
            status: 'pending'
        });

        // Salva o pagamento no banco de dados
        await payment.save();
        return { success: true, statusCode: 201, message: "Pagamento registrado com sucesso", payment: payment };
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};


// Função para buscar um pagamento específico
const serviceGetPayment = async (idPayment, idUser) => {
    try {
        // Busca o pagamento e o usuário pelos seus IDs
        const payment = await Payments.findById(idPayment);
        const user = await User.findById(idUser);

        // Verifica se o pagamento e o usuário existem
        if (!payment || !user) {
            return { success: false, statusCode: 404, message: "Pagamento ou Usuário inexistente" };
        }

        return { success: true, statusCode: 200, message: "Pagamento encontrado", payment };
    } catch {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

// Função para buscar todos os pagamentos de um usuário
const serviceGetAllPayments = async (idUser) => {
    try {
        // Busca todos os pagamentos associados ao usuário
        const payments = await Payments.find({ user: idUser });

        // Verifica se o usuário possui pagamentos
        if (!payments || payments.length === 0) {
            return { success: false, statusCode: 404, message: "Nenhum pagamento encontrado" };
        }

        return { success: true, statusCode: 200, message: "Pagamentos encontrados", payments };
    } catch {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

// Função para realizar o pagamento de um pagamento pendente
const servicePayPayment = async (idPayment, idUser) => {
    try {
        // Busca o pagamento, o usuário pagador e o destinatário
        const payment = await Payments.findById(idPayment);
        const user = await User.findById(idUser);
        const userDestino = await User.findById(payment.user);  // Usuário destinatário

        // Verifica se o pagamento e os usuários existem
        if (!payment || !user || !userDestino) {
            return { success: false, statusCode: 404, message: "Pagamento ou Usuário inexistente" };
        }

        // Verifica se o pagamento já foi completado ou cancelado
        if (payment.status === "completed") {
            return { success: false, statusCode: 400, message: "Este pagamento já foi pago" };
        }

        if (payment.status === "canceled") {
            return { success: false, statusCode: 400, message: "Este pagamento não pode ser pago pois foi cancelado" };
        }

        // Verifica se o usuário possui saldo suficiente
        if (payment.valor > user.saldo) {
            return { success: false, statusCode: 400, message: "Saldo insuficiente para pagamento" };
        }

        // Registra a transação entre os usuários
        const transacaoRefPag = await transacaoService.serviceSetTransacao(user._id.toString(), userDestino.cpf, payment.valor, "Pagamento");

        // Atualiza os saldos dos usuários
        await User.updateOne({ _id: payment.user }, { $inc: { saldo: payment.valor } });
        await User.updateOne({ _id: user._id }, { $inc: { saldo: -payment.valor } });

        // Atualiza o pagamento com a transação e marca como 'completed' (completado)
        payment.transactionId = transacaoRefPag.transactionId;
        payment.status = "completed";
        payment.paidAt = new Date();

        // Salva o pagamento atualizado
        await payment.save();
        return { success: true, statusCode: 200, message: "Pagamento feito com sucesso", payment };
    } catch (err) {
        console.error(err);
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
}

// Função para cancelar um pagamento
const serviceCancelPayment = async (idPayment, idUser) => {
    try {
        // Busca o pagamento e o usuário pelos seus IDs
        const payment = await Payments.findById(idPayment);
        const user = await User.findById(idUser);

        // Verifica se o pagamento e o usuário existem
        if (!payment || !user) {
            return { success: false, statusCode: 404, message: "Pagamento ou Usuário inexistente" };
        }

        // Verifica se o pagamento já foi completado (não pode ser cancelado)
        if (payment.status === "completed") {
            return { success: false, statusCode: 400, message: "Este pagamento não pode ser cancelado pois já foi pago" };
        }

        // Verifica se o usuário é o dono do pagamento
        if (payment.user.toString() !== user._id.toString()) {
            return { success: false, statusCode: 403, message: "Você não tem permissão para cancelar este pagamento" };
        }

        // Cancela o pagamento
        payment.status = 'canceled';
        await payment.save();

        return { success: true, statusCode: 200, message: "Pagamento cancelado com sucesso", payment };
    } catch (err) {
        console.error(err);
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

// Exporta as funções para uso em outros módulos
module.exports = { serviceSetPayment, serviceGetPayment, serviceGetAllPayments, serviceCancelPayment, servicePayPayment };
