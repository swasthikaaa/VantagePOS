import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import Loader from '../components/Loader';
import useSearchStore from '../store/useSearchStore';
import { Plus, ArrowUpRight, ArrowDownRight, Search, Filter, Package, Edit2, Trash2, ChevronRight, AlertCircle, History, X, Save, Settings2, Warehouse as WarehouseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdjustmentManagement = () => {
    const queryClient = useQueryClient();
    const query = useSearchStore(state => state.query);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        variationId: '',
        warehouseId: '',
        type: 'Addition',
        quantity: 0,
        reason: 'Correction',
        notes: ''
    });

    const { data: adjustments, isLoading: adjustmentsLoading } = useQuery({
        queryKey: ['adjustments'],
        queryFn: async () => {
            const { data } = await axios.get('/adjustments');
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

    const { data: warehouses } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const { data } = await axios.get('/warehouses');
            return data.data;
        }
    });

    const isLoading = adjustmentsLoading;

    const createMutation = useMutation({
        mutationFn: (newAdjustment) => axios.post('/adjustments', newAdjustment),
        onSuccess: () => {
            queryClient.invalidateQueries(['adjustments']);
            queryClient.invalidateQueries(['products']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Stock adjusted successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to adjust stock')
    });

    if (isLoading) return <Loader />;

    const filteredAdjustments = adjustments?.filter(a =>
        a.reason?.toLowerCase().includes(query.toLowerCase()) ||
        a.productId?.name?.toLowerCase().includes(query.toLowerCase()) ||
        a.type?.toLowerCase().includes(query.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            productId: '', variationId: '', warehouseId: '',
            type: 'Addition', quantity: 0, reason: 'Correction', notes: ''
        });
    };

    const selectedProduct = products?.find(p => p._id === formData.productId);

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Stock Adjustments</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manual inventory corrections and damage logs</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus size={22} />
                    <span>New Adjustment</span>
                </button>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center gap-6">
                    <div className="relative flex-1 text-slate-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">
                        Inventory Audit Trail — System Managed Logs
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Reference / Date</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Product</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Adjustment</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Reason</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Adjusted By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAdjustments?.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">No audit logs available</td></tr>
                            ) : filteredAdjustments?.map(adj => (
                                <tr key={adj._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className="font-black text-slate-900 text-sm sm:text-base">{new Date(adj.createdAt).toLocaleDateString()}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">#{adj._id.slice(-6).toUpperCase()}</div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className="font-black text-slate-800 text-sm sm:text-base">{adj.productId?.name}</div>
                                        {adj.variationId && <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Variation SKU</div>}
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className={`flex items-center gap-2 font-black ${adj.type === 'Addition' ? 'text-green-600' : 'text-red-500'}`}>
                                            {adj.type === 'Addition' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                            <span className="text-lg sm:text-xl tracking-tighter">{adj.type === 'Addition' ? '+' : '-'}{adj.quantity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">{adj.reason}</span>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 line-clamp-1 max-w-[200px]">{adj.notes}</p>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-[10px] uppercase shadow-sm border border-indigo-100/50">
                                                {adj.adjustedBy?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-black text-slate-700 text-xs sm:text-sm">{adj.adjustedBy?.name || 'System User'}</span>
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
                            className="relative bg-white w-full max-w-4xl rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
                        >
                            <div className="p-6 sm:p-10 pb-6 shrink-0 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 sm:gap-5">
                                        <div className="p-3 sm:p-4 bg-indigo-600 text-white rounded-2xl sm:rounded-[1.5rem] shadow-lg shadow-indigo-100/30">
                                            <Settings2 size={24} className="sm:w-7 sm:h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Manual Adjustment</h2>
                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Correct inventory levels</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-4 text-slate-400 hover:bg-white rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Product</label>
                                            <div className="relative">
                                                <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <select
                                                    required
                                                    className="w-full pl-14 pr-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold appearance-none text-sm"
                                                    value={formData.productId}
                                                    onChange={e => setFormData({ ...formData, productId: e.target.value, variationId: '' })}
                                                >
                                                    <option value="">Choose item...</option>
                                                    {products?.map(p => (
                                                        <option key={p._id} value={p._id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Warehouse</label>
                                            <div className="relative">
                                                <WarehouseIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <select
                                                    required
                                                    className="w-full pl-14 pr-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold appearance-none text-sm"
                                                    value={formData.warehouseId}
                                                    onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                                >
                                                    <option value="">Select location...</option>
                                                    {warehouses?.map(w => (
                                                        <option key={w._id} value={w._id}>{w.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProduct?.variations?.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Variation</label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                                {selectedProduct.variations.map(v => (
                                                    <button
                                                        key={v._id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, variationId: v._id })}
                                                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all font-bold text-xs sm:text-sm ${formData.variationId === v._id
                                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100/20'
                                                            : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                                                            }`}
                                                    >
                                                        {v.name}: {v.value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adjustment Type</label>
                                            <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl sm:rounded-[1.5rem]">
                                                {['Addition', 'Subtraction'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, type: t })}
                                                        className={`py-3 rounded-xl sm:rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t
                                                            ? t === 'Addition' ? 'bg-green-600 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'
                                                            : 'text-slate-400'
                                                            }`}
                                                    >
                                                        {t === 'Addition' ? 'Stock In' : 'Stock Out'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-center md:text-left">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quantity</label>
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-black text-xl sm:text-2xl text-center"
                                                value={formData.quantity}
                                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason</label>
                                            <select
                                                required
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold appearance-none text-sm"
                                                value={formData.reason}
                                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            >
                                                {['Correction', 'Damage', 'Return', 'Expired', 'Lost', 'Other'].map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Audit Narrative</label>
                                        <textarea
                                            placeholder="Provide context for this adjustment..."
                                            className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold h-24 sm:h-32 resize-none text-sm placeholder:text-slate-300"
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row gap-4 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-full sm:px-10 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] sm:rounded-[2rem] font-black hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-[10px]"
                                        >
                                            Discard Adjustment
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            className={`flex-1 py-5 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-[10px] ${formData.type === 'Addition' ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-500 shadow-red-100 hover:bg-red-600'
                                                }`}
                                        >
                                            {createMutation.isPending ? 'Propagating...' : 'Authorize Adjustment'}
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

export default AdjustmentManagement;
