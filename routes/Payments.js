const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');

router.post('/submit', protect, validatePayment, async (req, res) => {
    try {
        const payment = new Payment({
            ...req.body,
            userId: req.user.id
        });
        await payment.save();
        
        res.status(201).json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('userId', 'fullName email');
        res.json({
            success: true,
            payments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
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
        await updateUserSubscription(payment.userId, payment.plan);
        
        res.json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
