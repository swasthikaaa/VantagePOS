import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import Loader from '../components/Loader';
import useSearchStore from '../store/useSearchStore';
import { Banknote, Plus, History, ChevronRight, CheckCircle2, AlertCircle, DollarSign, X, Receipt, Calculator, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ZBillManagement = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        openingCash: 0,
        actualCash: 0,
        notes: ''
    });
    const query = useSearchStore(state => state.query);

    const { data: bills, isLoading } = useQuery({
        queryKey: ['zbills'],
        queryFn: async () => {
            const { data } = await axios.get('/zbills');
            return data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (newBill) => axios.post('/zbills', newBill),
        onSuccess: () => {
            queryClient.invalidateQueries(['zbills']);
            setIsModalOpen(false);
            resetForm();
            toast.success('Day closed and Z-Bill generated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate Z-bill')
    });

    if (isLoading) return <Loader />;

    const filteredBills = bills?.filter(z =>
        z.billNumber?.toLowerCase().includes(query.toLowerCase()) ||
        new Date(z.createdAt).toLocaleDateString().includes(query) ||
        z.status?.toLowerCase().includes(query.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ openingCash: 0, actualCash: 0, notes: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData); // Changed generateMutation to createMutation
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Terminal Closure</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Reconcile daily sales and close registers</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Calculator size={22} />
                    <span>Run Daily Closure</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 lg:col-span-3">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <History size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Audit History</h2>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Ledger...</div>
                        ) : filteredBills?.length === 0 ? (
                            <div className="py-20 text-center font-black text-slate-400 uppercase tracking-widest text-xs">No sequence logs available</div>
                        ) : filteredBills?.map(bill => (
                            <div key={bill._id} className="group p-5 sm:p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-6">
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className={`p-4 rounded-2xl shrink-0 ${bill.difference === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <Receipt size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">AUDIT {bill.billNumber}</div>
                                        <div className="font-black text-slate-900 text-base sm:text-lg leading-tight">{new Date(bill.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between sm:justify-end gap-8 sm:gap-12 items-center border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <div className="text-left sm:text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Net Sales</div>
                                        <div className="font-black text-slate-900 text-base sm:text-lg">${bill.totalSales.toFixed(2)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Variance</div>
                                        <div className={`font-black text-base sm:text-lg ${bill.difference === 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {bill.difference >= 0 ? '+' : ''}${bill.difference.toFixed(2)}
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="hidden sm:block text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600 p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-200 flex flex-col justify-between text-white relative overflow-hidden group min-h-[250px] lg:min-h-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-all" />
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Cycle Closure</h3>
                        <p className="text-indigo-100 text-xs font-bold opacity-80 leading-relaxed uppercase tracking-wider">Finalize all terminal activities and generate the Z-Report for fiscal records.</p>
                    </div>
                    <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl relative z-10 border border-white/10">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Last Sequence</div>
                        <div className="font-black text-lg">{bills?.[0] ? new Date(bills[0].createdAt).toLocaleDateString() : 'INITIAL'}</div>
                    </div>
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
                                        <div className="p-3 sm:p-4 bg-indigo-600 text-white rounded-2xl sm:rounded-[1.5rem] shadow-xl shadow-indigo-100/30">
                                            <Calculator size={24} className="sm:w-7 sm:h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Daily Z-Report</h2>
                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">End of day reconciliation</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-4 text-slate-400 hover:bg-white rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                                    <div className="bg-amber-50 rounded-2xl sm:rounded-3xl p-6 border border-amber-100 flex gap-4">
                                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-black text-amber-900 text-[10px] uppercase tracking-widest mb-1">Fiscal Requirement</h4>
                                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">Manually audit the register and input precision cash values. The system will audit variance based on operational delta.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Opening Cash Balance</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                                    <DollarSign size={18} />
                                                </div>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full pl-14 pr-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-black text-xl placeholder:text-slate-300"
                                                    value={formData.openingCash}
                                                    onChange={e => setFormData({ ...formData, openingCash: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Cash Audit</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                                    <DollarSign size={18} />
                                                </div>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full pl-14 pr-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-black text-xl sm:text-2xl text-indigo-600 placeholder:text-slate-300"
                                                    value={formData.actualCash}
                                                    onChange={e => setFormData({ ...formData, actualCash: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Audit Narrative</label>
                                        <textarea
                                            placeholder="Document any discrepancies or operational notes..."
                                            className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold h-24 sm:h-32 resize-none text-sm placeholder:text-slate-300"
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row gap-4 shrink-0">
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                        >
                                            {createMutation.isPending ? 'Validating Ledger...' : 'Finalize Sequence & Generate Report'}
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

export default ZBillManagement;
