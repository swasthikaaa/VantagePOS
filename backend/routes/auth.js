const express = require('express');
const { register, login, getMe, registerStaff, getUsers, updateUser, deleteUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.post('/register-staff', protect, authorize('Admin'), registerStaff);
router.get('/', protect, authorize('Admin'), getUsers);
router.put('/:id', protect, authorize('Admin'), updateUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
