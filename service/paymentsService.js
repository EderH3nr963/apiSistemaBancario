const Payments = require("../models/paymentsModel");
const User = require("../models/userModel");
const UserDestino = require("../models/userDestinoModel");  // Certifique-se de ter este modelo importado
const transacaoService = require("./transacaoService");

const serviceSetPayment = async (cpf, valor) => {
    try {
        const user = await User.findOne({ cpf: cpf });

        if (!user) {
            return { success: false, statusCode: 404, message: "Usuário inexistente" };
        }

        if (valor <= 0) {
            return { success: false, statusCode: 400, message: "Valor do pagamento inválido" };
        }

        const payment = new Payments({
            user: user._id,
            valor: valor,
            status: 'pending' // Status inicial como 'pending'
        });

        await payment.save();
        return { success: true, statusCode: 201, message: "Pagamento realizado com sucesso", payment: payment };
    } catch (err) {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

const serviceGetPayment = async (idPayment, idUser) => {
    try {
        const payment = await Payments.findById(idPayment);
        const user = await User.findById(idUser);

        if (!payment || !user) {
            return { success: false, statusCode: 404, message: "Pagamento ou Usuário inexistente" };
        }

        if (payment.user.toString() !== user._id.toString()) {
            return { success: false, statusCode: 403, message: "Você não tem permissão para acessar este pagamento" };
        }

        return { success: true, statusCode: 200, message: "Pagamento encontrado", payment };
    } catch {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

const serviceGetAllPayments = async (idUser) => {
    try {
        const payments = await Payments.find({ user: idUser });

        if (!payments || payments.length === 0) {
            return { success: false, statusCode: 404, message: "Nenhum pagamento encontrado" };
        }

        return { success: true, statusCode: 200, message: "Pagamentos encontrados", payments };
    } catch {
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

const servicePayPayment = async (idPayment, idUser) => {
    try {
        const payment = await Payments.findById(idPayment);
        const user = await User.findById(idUser);
        const userDestino = await User.findById(payment.user);  // Usuário destinatário

        if (!payment || !user || !userDestino) {
            return { success: false, statusCode: 404, message: "Pagamento ou Usuário inexistente" };
        }

        if (payment.status === "completed") {
            return { success: false, statusCode: 400, message: "Este pagamento já foi pago" };
        }

        if (payment.status === "failed") {
            return { success: false, statusCode: 400, message: "Este pagamento não pode ser pago pois foi cancelado" };
        }

        if (payment.valor > user.saldo) {
            return { success: false, statusCode: 400, message: "Saldo insuficiente para pagamento" };
        }

        
        // Registra a transação entre os usuários
        const transacaoRefPag = await transacaoService.serviceSetTransacao(user._id.toString(), userDestino.cpf, payment.valor, "Pagamento");
        
        await User.updateOne({ _id: payment.user }, { $inc: { saldo: payment.valor } });
        await User.updateOne({ _id: user._id }, { $inc: { saldo: -payment.valor } });
        
        payment.transactionId = transacaoRefPag.transactionId;
        payment.status = "completed";
        payment.paidAt = new Date();

        await payment.save();
        return { success: true, statusCode: 200, message: "Pagamento feito com sucesso", payment };
    } catch (err) {
        console.error(err);
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
}

const serviceCancelPayment = async (idPayment, idUser) => {
    try {
        const payment = await Payments.findById(idPayment);
        const user = await User.findById(idUser);

        if (!payment || !user) {
            return { success: false, statusCode: 404, message: "Pagamento ou Usuário inexistente" };
        }

        if (payment.status === "completed") {
            return { success: false, statusCode: 400, message: "Este pagamento não pode ser cancelado pois já foi pago" };
        }

        if (payment.user.toString() !== user._id.toString()) {
            return { success: false, statusCode: 403, message: "Você não tem permissão para cancelar este pagamento" };
        }

        payment.status = 'canceled';
        await payment.save();

        return { success: true, statusCode: 200, message: "Pagamento cancelado com sucesso", payment };
    } catch (err) {
        console.error(err);
        return { success: false, statusCode: 500, message: "Erro interno no servidor" };
    }
};

module.exports = { serviceSetPayment, serviceGetPayment, serviceGetAllPayments, serviceCancelPayment, servicePayPayment };