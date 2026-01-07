import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { DollarSign, Plus, Calendar, Tag, Trash2, Edit2, TrendingDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ExpenseManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        category: 'Utilities',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash'
    });

    const categories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Maintenance', 'Others'];

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const { data } = await axios.get('/expenses');
            return data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newExpense) => axios.post('/expenses', newExpense),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Expense recorded successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to record expense')
    });

    const updateMutation = useMutation({
        mutationFn: (updatedExpense) => axios.put(`/expenses/${updatedExpense._id}`, updatedExpense),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Expense updated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update expense')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            toast.success('Expense deleted successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete expense')
    });

    const resetForm = () => {
        setFormData({
            category: 'Utilities',
            amount: 0,
            description: '',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash'
        });
        setEditingItem(null);
    };

    const handleEdit = (expense) => {
        setEditingItem(expense);
        setFormData({
            category: expense.category,
            amount: expense.amount,
            description: expense.description || '',
            date: new Date(expense.date).toISOString().split('T')[0],
            paymentMethod: expense.paymentMethod
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            updateMutation.mutate({ ...formData, _id: editingItem._id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    const getCategoryColor = (category) => {
        const colors = {
            'Rent': 'bg-purple-100 text-purple-600',
            'Utilities': 'bg-blue-100 text-blue-600',
            'Salaries': 'bg-green-100 text-green-600',
            'Supplies': 'bg-yellow-100 text-yellow-600',
            'Marketing': 'bg-pink-100 text-pink-600',
            'Maintenance': 'bg-orange-100 text-orange-600',
            'Others': 'bg-slate-100 text-slate-600'
        };
        return colors[category] || colors['Others'];
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Expense Tracking</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Monitor and manage business expenditures</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus size={22} />
                    <span>Log Expense</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-2xl shadow-red-200">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingDown size={32} className="opacity-80" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Outgoing</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black tracking-tighter">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                {categories.slice(0, 3).map(cat => {
                    const catTotal = expenses?.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0) || 0;
                    return (
                        <div key={cat} className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{cat}</div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">${catTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Description</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Payment</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Accessing financial records...</td></tr>
                            ) : expenses?.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No expenditure history</td></tr>
                            ) : expenses?.map(expense => (
                                <tr key={expense._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="font-black text-slate-600 text-xs sm:text-sm">{new Date(expense.date).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getCategoryColor(expense.category)} shadow-sm`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="text-slate-900 font-black text-sm tracking-tight">{expense.description || 'No description'}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tighter">${expense.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{expense.paymentMethod}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this expense?')) {
                                                        deleteMutation.mutate(expense._id);
                                                    }
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="p-6 sm:p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                                        {editingItem ? 'Update' : 'Journal'} Expense
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Capital Category</label>
                                            <select
                                                required
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monetary Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">$</span>
                                                <input
                                                    required
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full pl-8 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                    value={formData.amount}
                                                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transaction Date</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-900"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Channel</label>
                                            <select
                                                required
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={formData.paymentMethod}
                                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            >
                                                <option value="Cash">Cash Liquidity</option>
                                                <option value="Bank Transfer">Bank Settlement</option>
                                                <option value="Card">Digital Card</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expenditure Narrative</label>
                                        <textarea
                                            rows="3"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm resize-none placeholder:text-slate-300"
                                            placeholder="Provide additional context for this outlay..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 order-2 sm:order-1 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-xs"
                                        >
                                            Discard Entry
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-1 order-1 sm:order-2 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                                        >
                                            {editingItem ? 'Confirm Adjustments' : 'Finalize Ledger'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExpenseManagement;
