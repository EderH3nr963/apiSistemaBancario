const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    numero: {
        type: String,
        required: true
    },
    validade: {
        type: Date,
        required: true
    },
    cvv: {
        type: String,
        required: true
    },
    titular: {
        type: String,
        required: true
    },
    saldo: {
        type: Number,
        default: 0,
        required: false
    }
})

// Exporta o modelo de Usuário
module.exports = mongoose.model('Card', CardSchema); 