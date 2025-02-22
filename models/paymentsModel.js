const mongoose = require("mongoose");

const Payments = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        required: false
    },
    paidAt: {
        type: Date,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payments', Payments);