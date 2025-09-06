const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

router.post('/register', validateUser, async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        const user = new User({ fullName, email, password, phone });
        await user.save();
        
        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && (await user.matchPassword(password))) {
            user.lastLogin = new Date();
            await user.save();
            
            const token = generateToken(user._id);
            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    subscriptionPlan: user.subscriptionPlan,
                    accessEndTime: user.accessEndTime
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
