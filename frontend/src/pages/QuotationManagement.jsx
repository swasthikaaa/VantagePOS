import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { FileText, Plus, User, Calendar, DollarSign, CheckCircle2, XCircle, Clock, Trash2, Edit2, X, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const QuotationManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        customer: { name: '', contact: '', email: '' },
        items: [{ productId: '', name: '', quantity: 1, price: 0, total: 0 }],
        totalAmount: 0,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
    });

    const { data: quotations, isLoading } = useQuery({
        queryKey: ['quotations'],
        queryFn: async () => {
            const { data } = await axios.get('/quotations');
            return data.data;
        }
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('/products');
            return data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newQuotation) => axios.post('/quotations', newQuotation),
        onSuccess: () => {
            queryClient.invalidateQueries(['quotations']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Quotation generated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create quotation')
    });

    const updateMutation = useMutation({
        mutationFn: (updatedQuotation) => axios.put(`/quotations/${updatedQuotation._id}`, updatedQuotation),
        onSuccess: () => {
            queryClient.invalidateQueries(['quotations']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Quotation updated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update quotation')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/quotations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['quotations']);
            toast.success('Quotation deleted successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete quotation')
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => axios.put(`/quotations/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['quotations']);
            toast.success('Quotation status updated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status')
    });

    const resetForm = () => {
        setFormData({
            customer: { name: '', contact: '', email: '' },
            items: [{ productId: '', name: '', quantity: 1, price: 0, total: 0 }],
            totalAmount: 0,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: ''
        });
        setEditingItem(null);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', name: '', quantity: 1, price: 0, total: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        const totalAmount = newItems.reduce((sum, item) => sum + (item.total || 0), 0);
        setFormData({ ...formData, items: newItems, totalAmount });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];

        if (field === 'productId') {
            const product = products?.find(p => p._id === value);
            if (product) {
                newItems[index].productId = value;
                newItems[index].name = product.name;
                newItems[index].price = product.basePrice || 0;
            }
        } else {
            newItems[index][field] = value;
        }

        if (field === 'quantity' || field === 'price' || field === 'productId') {
            newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].price || 0);
        }

        const totalAmount = newItems.reduce((sum, item) => sum + (item.total || 0), 0);
        setFormData({ ...formData, items: newItems, totalAmount });
    };

    const handleEdit = (quotation) => {
        if (quotation.status === 'Accepted') {
            toast.error('Cannot edit an accepted quotation');
            return;
        }
        setEditingItem(quotation);
        setFormData({
            customer: quotation.customer,
            items: quotation.items.map(item => ({
                productId: item.productId?._id || item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })),
            totalAmount: quotation.totalAmount,
            validUntil: new Date(quotation.validUntil).toISOString().split('T')[0],
            notes: quotation.notes || ''
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-600';
            case 'Rejected': return 'bg-red-100 text-red-600';
            case 'Pending': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Quotations</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage client estimates and offers</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus size={22} />
                    <span>New Quotation</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Ref Number</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Customer</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Valid Until</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Total Amount</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Fetching quotation records...</td></tr>
                            ) : quotations?.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No active quotations</td></tr>
                            ) : quotations?.map(quote => (
                                <tr key={quote._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="font-black text-indigo-600 tracking-tight">#{quote.quotationNumber}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className="font-black text-slate-900 text-sm sm:text-base tracking-tight">{quote.customer.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{quote.customer.contact}</div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="text-slate-500 font-black text-xs uppercase tracking-widest">{new Date(quote.validUntil).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">${quote.totalAmount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(quote.status)} shadow-sm`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            {quote.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => statusMutation.mutate({ id: quote._id, status: 'Accepted' })}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-white rounded-lg transition-all"
                                                        title="Accept"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => statusMutation.mutate({ id: quote._id, status: 'Rejected' })}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(quote)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {quote.status !== 'Accepted' && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this quotation?')) {
                                                            deleteMutation.mutate(quote._id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
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
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white w-full max-w-6xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="p-6 sm:p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                                        {editingItem ? 'Update' : 'Generate'} Quotation
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer Client</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                placeholder="e.g. John Doe"
                                                value={formData.customer.name}
                                                onChange={e => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Metadata</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                placeholder="Email or Phone"
                                                value={formData.customer.contact}
                                                onChange={e => setFormData({ ...formData, customer: { ...formData.customer, contact: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expiration Date</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-900"
                                                value={formData.validUntil}
                                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 p-4 sm:p-6 rounded-[2rem] border border-slate-100/50">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Proposal Items</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Define unit pricing and quantities</p>
                                            </div>
                                            <button type="button" onClick={addItem} className="w-full sm:w-auto bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-white shadow-sm transition-all border border-indigo-100 uppercase tracking-widest">
                                                <PlusCircle size={16} /> Add Position
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.items.map((item, index) => (
                                                <div key={index} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 p-5 sm:p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-indigo-100 transition-all group relative">
                                                    <div className="lg:col-span-4 space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Resource</label>
                                                        <select
                                                            required
                                                            className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm shadow-sm"
                                                            value={item.productId}
                                                            onChange={e => updateItem(index, 'productId', e.target.value)}
                                                        >
                                                            <option value="">Choose item...</option>
                                                            {products?.map(p => (
                                                                <option key={p._id} value={p._id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 lg:col-span-5 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantity</label>
                                                            <input
                                                                required
                                                                type="number"
                                                                className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm shadow-sm text-center"
                                                                value={item.quantity}
                                                                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Price</label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">$</span>
                                                                <input
                                                                    required
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-full pl-8 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm shadow-sm"
                                                                    value={item.price}
                                                                    onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-2 space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Line Total</label>
                                                        <div className="h-[48px] flex items-center px-4 font-black text-slate-900 bg-white rounded-xl shadow-sm text-sm">
                                                            ${(item.total || 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-1 flex items-end justify-end lg:justify-center lg:pb-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 sm:p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl gap-8">
                                        <div className="w-full lg:max-w-md">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Terms & Conditions</label>
                                            <textarea
                                                className="w-full px-6 py-4 bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500 outline-none font-bold text-sm text-white resize-none h-20 placeholder:text-slate-600"
                                                placeholder="Enter any terms or specific notes..."
                                                value={formData.notes}
                                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            />
                                        </div>
                                        <div className="text-left lg:text-right w-full lg:w-auto border-t lg:border-t-0 border-slate-800 pt-6 lg:pt-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Estimated Total Proposal</span>
                                            <div className="flex items-baseline justify-start lg:justify-end gap-1">
                                                <span className="text-white font-black text-2xl mb-4">$</span>
                                                <span className="text-5xl sm:text-6xl font-black text-indigo-400 tracking-tighter block">{formData.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 order-2 sm:order-1 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-xs"
                                        >
                                            Discard Draft
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-[2] order-1 sm:order-2 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                                        >
                                            {editingItem ? 'Confirm Changes' : 'Generate Quotation'}
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

export default QuotationManagement;
