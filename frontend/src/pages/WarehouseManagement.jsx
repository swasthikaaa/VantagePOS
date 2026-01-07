import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import {
    Warehouse,
    Plus,
    Search,
    MapPin,
    Phone,
    Mail,
    Edit2,
    Trash2,
    ChevronRight,
    PlusCircle,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WarehouseManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '', contactNumber: '', email: '' });

    const { data: warehouses, isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const { data } = await axios.get('/warehouses');
            return data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newWarehouse) => axios.post('/warehouses', newWarehouse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedWarehouse) => axios.put(`/warehouses/${updatedWarehouse._id}`, updatedWarehouse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setIsModalOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setFormData({ name: '', location: '', contactNumber: '', email: '' });
        setEditingWarehouse(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingWarehouse) {
            updateMutation.mutate({ ...formData, _id: editingWarehouse._id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (w) => {
        setEditingWarehouse(w);
        setFormData({ name: w.name, location: w.location, contactNumber: w.contactNumber, email: w.email });
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Distribution</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage warehouses and storage locations</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-sm"
                >
                    <PlusCircle size={22} />
                    <span>New Warehouse</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-[2rem] sm:rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm"></div>
                    ))
                ) : warehouses?.map(warehouse => (
                    <motion.div
                        key={warehouse._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-indigo-200 transition-all flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] sm:rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Warehouse size={28} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(warehouse)}
                                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{warehouse.name}</h3>

                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs sm:text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                    <MapPin size={16} />
                                </div>
                                <span className="truncate">{warehouse.location}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs sm:text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                    <Phone size={16} />
                                </div>
                                <span className="truncate">{warehouse.contactNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs sm:text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                    <Mail size={16} />
                                </div>
                                <span className="truncate">{warehouse.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${warehouse.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {warehouse.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 group/btn hover:translate-x-1 transition-all">
                                Stock View <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                            className="relative bg-white w-full max-w-xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="p-6 sm:p-10">
                                <div className="flex justify-between items-center mb-8 sm:mb-10">
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                                        {editingWarehouse ? 'Update' : 'New'} Warehouse
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Warehouse Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                            placeholder="e.g. Main Distribution Center"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location / Address</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                            placeholder="e.g. 123 Storage Lane"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                placeholder="+1 234 567 890"
                                                value={formData.contactNumber}
                                                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                placeholder="warehouse@business.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-6 active:scale-95 disabled:opacity-50"
                                    >
                                        {editingWarehouse ? 'Save Changes' : 'Register Center'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WarehouseManagement;
