const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Generate Reset Password Token
const generateResetToken = (userId) => {
    return jwt.sign(
        { id: userId, purpose: 'reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Token Configuration
const tokenConfig = {
    accessTokenExpiry: '24h',
    resetTokenExpiry: '1h',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

module.exports = {
    generateToken,
    verifyToken,
    generateResetToken,
    tokenConfig
};
