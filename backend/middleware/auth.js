const express = require('express');
const router = express.Router();
const {
    register,
    registerStaff,
    login,
    getMe,
    getUsers,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');

// ---------------- Public Routes ----------------
router.post('/register', register); // normal user registration
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ---------------- Protected Routes ----------------
router.get('/me', protect, getMe);

// ---------------- Admin Routes ----------------
router.post('/register-staff', protect, authorize('admin'), registerStaff);
router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
