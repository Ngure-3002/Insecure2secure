const User = require('../models/User');
const { generateToken, generateResetToken } = require('../config/auth');
const bcrypt = require('bcryptjs');

// Register user
const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            phone,
            subscriptionPlan: 'None',
            lastLogin: new Date()
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = generateResetToken(user._id);
        // In production, send this token via email
        
        res.json({
            success: true,
            message: 'Password reset token generated',
            resetToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    resetPassword
};
