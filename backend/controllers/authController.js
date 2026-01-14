const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { z } = require('zod');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Validation schema
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// ---------------- Public Registration ----------------
exports.register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password } = validatedData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'Admin' : 'Cashier';

        const user = await User.create({ name, email, password, role });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Staff/Admin Registration ----------------
exports.registerStaff = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role });

        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Login ----------------
exports.login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        const token = generateToken(user);

        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Get Current User ----------------
exports.getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

// ---------------- Get All Users ----------------
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort('-createdAt');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Update User ----------------
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, isActive },
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Delete User ----------------
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Forgot Password ----------------
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message: `Reset your password here: ${resetUrl}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset for your VantagePOS account.</p>
                        <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p>If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            console.error('Email error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ---------------- Reset Password ----------------
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
