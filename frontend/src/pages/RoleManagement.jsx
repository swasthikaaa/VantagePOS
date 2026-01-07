import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import Loader from '../components/Loader';
import useSearchStore from '../store/useSearchStore';
import { ShieldCheck, Plus, Search, Edit2, Trash2, Check, ChevronRight, Shield, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const permissionGroups = {
    Products: ['products.read', 'products.create', 'products.edit', 'products.delete'],
    Users: ['users.read', 'users.create', 'users.edit', 'users.delete'],
    Roles: ['roles.read', 'roles.create', 'roles.edit', 'roles.delete'],
    Sales: ['sales.read', 'sales.create', 'sales.edit', 'sales.delete'],
    Inventory: ['warehouses.read', 'warehouses.create', 'warehouses.edit', 'warehouses.delete', 'adjustments.read', 'adjustments.create'],
    Offers: ['offers.read', 'offers.create', 'offers.edit', 'offers.delete'],
    Financials: ['expenses.read', 'expenses.create', 'expenses.edit', 'expenses.delete', 'zbills.read', 'zbills.create'],
    Settings: ['settings.read', 'settings.edit']
};

const RoleManagement = () => {
    const queryClient = useQueryClient();
    const query = useSearchStore(state => state.query);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });

    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data } = await axios.get('/roles');
            return data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newRole) => axios.post('/roles', newRole),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Role created successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedRole) => axios.put(`/roles/${updatedRole._id}`, updatedRole),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Role updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/roles/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            toast.success('Role deleted successfully');
        }
    });

    if (isLoading) return <Loader />;

    const filteredRoles = roles?.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ name: '', description: '', permissions: [] });
        setEditingItem(null);
    };

    const handlePermissionToggle = (perm) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const handleSelectAllInGroup = (groupPerms) => {
        const allSelected = groupPerms.every(p => formData.permissions.includes(p));
        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                permissions: prev.permissions.filter(p => !groupPerms.includes(p))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissions: [...new Set([...prev.permissions, ...groupPerms])]
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            updateMutation.mutate({ ...formData, _id: editingItem._id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (role) => {
        setEditingItem(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions
        });
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Roles & Permissions</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Define what your staff can access</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus size={22} />
                    <span>New Role</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Authority Matrix...</div>
                ) : filteredRoles?.map(role => (
                    <motion.div
                        key={role._id}
                        layout
                        className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110" />

                        <div className="relative z-10 flex justify-between items-start mb-6">
                            <div className="p-3 sm:p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <ShieldCheck size={28} className="sm:w-8 sm:h-8" />
                            </div>
                            <div className="flex gap-2">
                                {!role.isPreset && (
                                    <>
                                        <button onClick={() => handleEdit(role)} className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => window.confirm('Delete this role?') && deleteMutation.mutate(role._id)} className="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90">
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 uppercase">{role.name}</h3>
                            <p className="text-slate-400 font-bold text-[10px] sm:text-sm mb-6 leading-relaxed line-clamp-2">{role.description || 'Global authority profile with custom permissions.'}</p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {role.permissions.length} Scopes
                                </span>
                                {role.isPreset && (
                                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        System Core
                                    </span>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Deployment Date</span>
                                <span className="text-slate-900">{new Date(role.createdAt).toLocaleDateString()}</span>
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
                            className="relative bg-white w-full max-w-5xl rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
                        >
                            <div className="p-6 sm:p-10 pb-6 shrink-0 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 sm:gap-5">
                                        <div className="p-3 sm:p-4 bg-indigo-600 text-white rounded-2xl sm:rounded-[1.5rem] shadow-xl shadow-indigo-100/30">
                                            <Shield size={24} className="sm:w-7 sm:h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                                                {editingItem ? 'Edit Profile' : 'New Authority'}
                                            </h2>
                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Configure security scopes</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-4 text-slate-400 hover:bg-white rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm sm:text-lg placeholder:text-slate-300"
                                                placeholder="e.g. Regional Auditor"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Scope Description</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.5rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm sm:text-lg placeholder:text-slate-300"
                                                placeholder="Audit and review inventory..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 sm:space-y-8">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Access Scopes</h3>
                                            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                                                {formData.permissions.length} Active
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                            {Object.entries(permissionGroups).map(([group, perms]) => (
                                                <div key={group} className="bg-slate-50/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100/50">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{group}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectAllInGroup(perms)}
                                                            className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                                                        >
                                                            {perms.every(p => formData.permissions.includes(p)) ? 'Scope Reset' : 'Select All'}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {perms.map(perm => (
                                                            <div
                                                                key={perm}
                                                                onClick={() => handlePermissionToggle(perm)}
                                                                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all border ${formData.permissions.includes(perm)
                                                                    ? 'bg-white border-indigo-200 shadow-sm'
                                                                    : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-white/50'
                                                                    }`}
                                                            >
                                                                <span className="text-xs font-bold text-slate-700 capitalize">
                                                                    {perm.split('.')[1]} {perm.split('.')[0]}
                                                                </span>
                                                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-all ${formData.permissions.includes(perm)
                                                                    ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100/30'
                                                                    : 'bg-slate-200 text-transparent'
                                                                    }`}>
                                                                    <Check size={12} strokeWidth={4} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row gap-4 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-full sm:px-10 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] sm:rounded-[2rem] font-black hover:bg-slate-200 transition-all active:scale-95 border border-slate-200 uppercase tracking-widest text-[10px]"
                                        >
                                            Discard Configuration
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px]"
                                        >
                                            {editingItem ? 'Update Authority scopes' : 'Establish New Matrix'}
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

export default RoleManagement;
