const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    mpesaCode: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Z0-9]{10}$/, 'Please enter a valid M-Pesa code']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    },
    plan: {
        type: String,
        required: true,
        enum: ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Annual']
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(?:4[0-3])|(?:4[5-9])|(?:5[7-9])|(?:6[8-9])[0-9]{6})$/, 'Please enter a valid phone number']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
