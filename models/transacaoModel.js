const { text } = require("express");
const mongoose = require("mongoose");

const transacaoSchema = new mongoose.Schema({
    userOrigem: {
        type: String,
        required: true
    },
    userDestino: {
        type: String,
        required: true
    },
    valor: {
        type: Double,
        required: true,
    },
    mensagem: {
        type: Text,
        required: false,
    },
    dataEnvio: {
        type: Date,
        required: false,
        default: Date.now()
    }
});

module.exports = mongoose.model('Transacao', transacaoSchema);