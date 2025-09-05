const router = require('express').Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sanitizeInput, validatePaymentData } = require('../utils/validation');
const { generateCSRFToken, validateCSRFToken } = require('../utils/security');

// Submit payment
router.post('/submit', auth, validateCSRFToken, async (req, res) => {
    try {
        const paymentData = sanitizeInput(req.body);
        const { error } = validatePaymentData(paymentData);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const payment = new Payment({
            ...paymentData,
            userId: req.user.id
        });

        await payment.save();
        res.status(201).json({ message: 'Payment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting payment' });
    }
});

// Get user payments
router.get('/history', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-commission');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment history' });
    }
});

// Admin approve/reject payment
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = sanitizeInput(req.body);
        const payment = await Payment.findById(req.params.id);
        
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        
        payment.status = status;
        
        if (status === 'approved') {
            await handleApprovedPayment(payment);
        }
        
        await payment.save();
        res.json({ message: 'Payment status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment status' });
    }
});

async function handleApprovedPayment(payment) {
    const user = await User.findById(payment.userId);
    if (!user) throw new Error('User not found');

    // Update user subscription
    user.subscriptionPlan = payment.plan;
    user.accessEndTime = calculateAccessEndTime(payment.plan);
    
    // Handle affiliate commission
    if (user.referredBy) {
        const commission = calculateCommission(payment.amount);
        payment.commission = {
            affiliateId: user.referredBy,
            amount: commission
        };
        
        // Update affiliate earnings
        const affiliate = await User.findById(user.referredBy);
        if (affiliate) {
            affiliate.affiliateStats.earnings += commission;
            affiliate.affiliateStats.referrals += 1;
            await affiliate.save();
        }
    }
    
    await user.save();
}

module.exports = router;