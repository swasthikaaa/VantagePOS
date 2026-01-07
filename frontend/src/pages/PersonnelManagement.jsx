import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import {
    Users,
    Plus,
    Search,
    Shield,
    Mail,
    Phone,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    PlusCircle,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PersonnelManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Cashier',
        isActive: true
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get('/auth');
            return data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newUser) => axios.post('/auth/register', newUser),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Staff member registered successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to register staff');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updatedUser) => axios.put(`/auth/${updatedUser._id}`, updatedUser),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsModalOpen(false);
            resetForm();
            toast.success('User updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/auth/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('User deleted successfully');
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'Cashier',
            isActive: true
        });
        setEditingUser(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            updateMutation.mutate({ ...formData, _id: editingUser._id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't show password for editing
            role: user.role,
            isActive: user.isActive
        });
        setIsModalOpen(true);
    };

    const stats = [
        { label: 'Total Staff', value: users?.length || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active', value: users?.filter(u => u.isActive).length || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Deactivated', value: users?.filter(u => !u.isActive).length || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Personnel</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Manage staff roles and system access</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 text-sm active:scale-95"
                >
                    <PlusCircle size={22} />
                    <span>Hire Staff Member</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 sm:p-8 rounded-[2.2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6 group hover:border-indigo-200 transition-all">
                        <div className={`${stat.bg} ${stat.color} w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon size={stat.icon === Users ? 28 : 24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Staff Member</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Role</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-left text-xs font-black uppercase tracking-widest text-slate-400">Joined</th>
                                <th className="px-6 sm:px-8 py-5 sm:py-6 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-extrabold uppercase tracking-widest text-xs">Accessing personnel vault...</td></tr>
                            ) : users?.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm sm:text-base">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-sm sm:text-base tracking-tight">{user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                                        <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-green-600' : 'text-red-500'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-600 animate-pulse' : 'bg-red-500'}`} />
                                            {user.isActive ? 'Active' : 'Locked'}
                                        </span>
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to remove this staff member?')) {
                                                        deleteMutation.mutate(user._id);
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
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        {editingUser ? 'Update Staff Member' : 'Hire New Staff'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    {!editingUser && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Default Password</label>
                                            <input
                                                required
                                                type="password"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="Cashier">Cashier</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Member Status</label>
                                            <div className="flex items-center h-[56px] px-2">
                                                <label className="flex items-center cursor-pointer group">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={formData.isActive}
                                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                        />
                                                        <div className={`w-14 h-8 rounded-full transition-all ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-all shadow-sm ${formData.isActive ? 'translate-x-6' : ''}`} />
                                                    </div>
                                                    <span className="ml-3 font-black text-[10px] uppercase tracking-widest text-slate-500">{formData.isActive ? 'Active Member' : 'Locked'}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={createMutation.isLoading || updateMutation.isLoading}
                                        className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-6 active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest"
                                    >
                                        {editingUser ? 'Update Staff Member' : 'Hire Member Now'}
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

export default PersonnelManagement;
