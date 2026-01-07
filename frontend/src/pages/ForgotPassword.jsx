import React, { useState } from 'react';
import axios from '../api/axios';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/forgot-password', { email });
            setStatus('success');
        } catch (err) {
            setStatus('error');
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
                    <h1 className="text-2xl font-black text-slate-900">Recovery</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Reset your secure password</p>
                </div>

                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Instructions Sent</h3>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">
                            We've sent recovery instructions to <strong>{email}</strong>. Please check your inbox.
                        </p>
                        <Link to="/login" className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recovery Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Recovery Link'}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                <ArrowLeft size={14} />
                                Nevermind, I remember
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
