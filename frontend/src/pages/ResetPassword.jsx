import React, { useState } from 'react';
import axios from '../api/axios';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await axios.post(`/auth/reset-password/${token}`, { password });
            toast.success('Password updated successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100"
            >
                <div className="text-center mb-10">
                    <Logo size="large" className="justify-center mb-8" />
                    <h1 className="text-2xl font-black text-slate-900">New Password</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Strengthen your security</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 group"
                    >
                        {loading ? 'Updating...' : 'Reset Password'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        Return to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
