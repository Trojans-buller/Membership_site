const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 100.00
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transaction_id: {
        type: String,
        unique: true
    },
    payment_date: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
