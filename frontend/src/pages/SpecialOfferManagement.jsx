import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import Loader from '../components/Loader';
import useSearchStore from '../store/useSearchStore';
import { Gift, Plus, Search, Edit2, Trash2, Calendar, Tag, Percent, ShoppingBag, X, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SpecialOfferManagement = () => {
    const queryClient = useQueryClient();
    const query = useSearchStore(state => state.query);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: '',
        type: 'Percentage',
        value: 0,
        minPurchaseAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        applicableProducts: []
    });

    const { data: offers, isLoading } = useQuery({
        queryKey: ['offers'],
        queryFn: async () => {
            const { data } = await axios.get('/offers');
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
        mutationFn: (newOffer) => axios.post('/offers', newOffer),
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Offer launched successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedOffer) => axios.put(`/offers/${updatedOffer._id}`, updatedOffer),
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Offer updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/offers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['offers']);
            toast.success('Offer removed');
        }
    });

    if (isLoading) return <Loader />;

    const filteredOffers = offers?.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.code?.toLowerCase().includes(query.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: '', description: '', code: '', type: 'Percentage', value: 0,
            minPurchaseAmount: 0, startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true, applicableProducts: []
        });
        setEditingItem(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            updateMutation.mutate({ ...formData, _id: editingItem._id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (offer) => {
        setEditingItem(offer);
        setFormData({
            ...offer,
            startDate: new Date(offer.startDate).toISOString().split('T')[0],
            endDate: new Date(offer.endDate).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <div className="p-4 sm:p-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Special Offers</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage promotions and seasonal discounts</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus size={22} />
                    <span>Create Promotion</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Fetching active campaigns...</div>
                ) : filteredOffers?.length === 0 ? (
                    <div className="col-span-full py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">No promotions found</div>
                ) : filteredOffers?.map(offer => (
                    <motion.div
                        key={offer._id}
                        layout
                        className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col group"
                    >
                        <div className={`p-6 sm:p-8 ${offer.isActive && !isExpired(offer.endDate) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'} transition-all`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <Gift size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(offer)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => window.confirm('Remove this offer?') && deleteMutation.mutate(offer._id)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black mb-1 truncate">{offer.name}</h3>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest truncate">{offer.code || 'Auto-Apply Offer'}</p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount Benefit</span>
                                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
                                    {offer.type === 'Percentage' ? `${offer.value}%` : `$${offer.value}`}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-xs sm:text-sm font-black text-slate-500">
                                    <Calendar size={18} className="text-indigo-600 shrink-0" />
                                    <span className="truncate">{new Date(offer.startDate).toLocaleDateString()} — {new Date(offer.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs sm:text-sm font-black text-slate-500">
                                    <DollarSign size={18} className="text-indigo-600 shrink-0" />
                                    <span className="truncate">Min. Purchase: ${offer.minPurchaseAmount}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isExpired(offer.endDate)
                                    ? 'bg-red-50 text-red-600'
                                    : offer.isActive ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                    }`}>
                                    {isExpired(offer.endDate) ? (
                                        <Clock size={12} />
                                    ) : (
                                        <CheckCircle2 size={12} />
                                    )}
                                    {isExpired(offer.endDate) ? 'Expired' : offer.isActive ? 'Active' : 'Paused'}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    {offer.applicableProducts?.length || 'Global'} Coverage
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
                                        <div className="p-3 sm:p-4 bg-indigo-600 text-white rounded-2xl sm:rounded-[1.5rem] shrink-0">
                                            <Tag size={24} className="sm:w-7 sm:h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                                                {editingItem ? 'Update' : 'Launch'} Campaign
                                            </h2>
                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Define promotional parameters</p>
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
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Campaign Branding</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                placeholder="e.g. Black Friday Sale"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount Code (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:opacity-50 text-sm"
                                                placeholder="BLANK FOR AUTO-APPLY"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Benefit Model</label>
                                            <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl sm:rounded-[1.5rem]">
                                                {['Percentage', 'Fixed Amount'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, type: t })}
                                                        className={`py-3 rounded-xl sm:rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                                                            }`}
                                                    >
                                                        {t === 'Percentage' ? 'Ratio' : 'Nominal'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reward Value</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                                    {formData.type === 'Percentage' ? <Percent size={18} /> : <DollarSign size={18} />}
                                                </div>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full pl-14 pr-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-black text-xl text-indigo-600"
                                                    value={formData.value}
                                                    onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Threshold</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                                    <DollarSign size={18} />
                                                </div>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full pl-14 pr-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-black text-xl"
                                                    value={formData.minPurchaseAmount}
                                                    onChange={e => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Active From</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-900"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Valid Until</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm text-slate-900"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row gap-4 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-full sm:px-10 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] sm:rounded-[2rem] font-black hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-xs"
                                        >
                                            Discard Draft
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                                        >
                                            {editingItem ? 'Save Campaign Changes' : 'Launch Live Campaign'}
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

export default SpecialOfferManagement;
