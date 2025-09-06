const Payment = require('../models/Payment');
const User = require('../models/User');

// Submit payment
const submitPayment = async (req, res) => {
    try {
        const { mpesaCode, phoneNumber, amount, plan } = req.body;
        
        // Check for duplicate transaction
        const existingPayment = await Payment.findOne({ mpesaCode });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Transaction code already used'
            });
        }

        const payment = await Payment.create({
            mpesaCode,
            phoneNumber,
            amount,
            plan,
            userId: req.user._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Approve payment
const approvePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        payment.status = 'approved';
        await payment.save();

        // Update user subscription
        const user = await User.findById(payment.userId);
        if (user) {
            user.subscriptionPlan = payment.plan;
            user.accessEndTime = calculateAccessEndTime(payment.plan);
            await user.save();
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get payments
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'fullName email');

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    submitPayment,
    approvePayment,
    getPayments
};
