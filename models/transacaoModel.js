const { text } = require("express");
const mongoose = require("mongoose");

const transacaoSchema = new mongoose.Schema({
    userOrigem: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userDestino: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    valor: {
        type: Number,
        required: true,
    },
    dataEnvio: {
        type: Date,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model('Transacao', transacaoSchema);