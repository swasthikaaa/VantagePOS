import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import {
    Search,
    ShoppingCart,
    Tag,
    Trash2,
    Plus,
    Minus,
    User as UserIcon,
    CreditCard,
    Banknote,
    MoreHorizontal,
    PlusCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

const POS = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const { items, addItem, removeItem, updateQuantity, getTotal, customer, clearCart } = useCartStore();

    const addNotification = (msg, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await axios.get('/products');
            return data.data;
        }
    });

    const categories = ['All', ...new Set(products?.map(p => typeof p.category === 'object' ? p.category.name : p.category).filter(Boolean) || [])];

    const filteredProducts = products?.filter(p => {
        const pCategory = typeof p.category === 'object' ? p.category.name : p.category;
        return (category === 'All' || pCategory === category) &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (pCategory?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    });

    const handleCheckout = async (method) => {
        try {
            const { data } = await axios.post('/pos/checkout', {
                items,
                customerName: customer.name,
                customerContact: customer.contact,
                paymentMethod: method,
                amountPaid: getTotal()
            });
            addNotification(`Sale completed! Invoice: ${data.data.invoiceNumber}`);
            clearCart();
            setIsCartOpen(false);
        } catch (err) {
            addNotification(err.response?.data?.message || 'Checkout failed', 'error');
        }
    };

    const handleManualAdd = () => {
        const name = prompt('Enter item name:');
        const price = parseFloat(prompt('Enter price:'));
        if (name && !isNaN(price)) {
            addItem({ _id: 'manual-' + Date.now(), name, basePrice: price, category: 'Manual' });
            addNotification('Manual item added');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Notifications */}
            <div className="fixed top-20 right-4 sm:right-8 z-[100] space-y-3 pointer-events-none max-w-[calc(100vw-2rem)]">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className={`px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 bg-white border-l-4 ${n.type === 'success' ? 'border-green-500' : 'border-red-500'
                                } pointer-events-auto`}
                        >
                            <div className={n.type === 'success' ? 'text-green-500' : 'text-red-500'}>
                                {n.type === 'success' ? <CheckCircle2 size={24} /> : <X size={24} />}
                            </div>
                            <p className="text-xs sm:text-sm font-black text-slate-800">{n.msg}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main POS Grid */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    {/* Header */}
                    <div className="p-4 sm:p-8 pb-4">
                        <div className="flex justify-between items-start sm:items-end mb-6 sm:mb-8">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Terminal</h1>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Quick Checkout</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleManualAdd}
                                    className="bg-white border border-slate-200 text-slate-600 p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all hover:border-indigo-200"
                                    title="Add Miscellaneous Item"
                                >
                                    <PlusCircle size={18} />
                                    <span className="hidden sm:inline">Miscellaneous</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${category === cat
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105'
                                            : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-300'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 custom-scrollbar">
                        {isLoading ? (
                            <div className="col-span-full flex flex-col items-center justify-center p-20 text-slate-400">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-bold uppercase tracking-widest text-xs">Syncing inventory...</p>
                            </div>
                        ) : filteredProducts?.map(product => (
                            <motion.div
                                key={product._id}
                                layout
                                whileHover={{ y: -5 }}
                                onClick={() => {
                                    addItem(product);
                                    addNotification(`${product.name} added`);
                                }}
                                className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group flex flex-col h-full"
                            >
                                <div className="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-200 transition-all overflow-hidden relative">
                                    <Tag size={48} strokeWidth={1.5} />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                                            <Plus size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-800 text-sm mb-1 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{product.category}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xl font-black text-indigo-600">${product.basePrice}</span>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${product.totalStock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {product.totalStock} IN
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Floating Cart Button */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-40">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-2xl shadow-indigo-400 flex items-center justify-center relative active:scale-90 transition-all"
                        >
                            <ShoppingCart size={28} />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                    {items.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Cart Sidebar / Drawer */}
                <AnimatePresence>
                    {(isCartOpen || window.innerWidth >= 1024) && (
                        <>
                            {/* Backdrop for mobile */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCartOpen(false)}
                                className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45]"
                            />

                            <motion.div
                                initial={window.innerWidth < 1024 ? { x: 500 } : false}
                                animate={{ x: 0 }}
                                exit={{ x: 500 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-[450px] lg:w-[450px] bg-white shadow-2xl flex flex-col z-[50] lg:z-10 border-l border-slate-200`}
                            >
                                <div className="p-6 sm:p-8 h-20 sm:h-24 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
                                            Order
                                            <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-lg font-black">{items.length}</span>
                                        </h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={clearCart}
                                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                        <button
                                            onClick={() => setIsCartOpen(false)}
                                            className="lg:hidden p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar uppercase tracking-tight">
                                    <AnimatePresence mode="popLayout">
                                        {items.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4"
                                            >
                                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                                                    <ShoppingCart size={40} strokeWidth={1} />
                                                </div>
                                                <div className="text-center font-black uppercase tracking-widest text-[10px]">
                                                    Empty Cart
                                                </div>
                                            </motion.div>
                                        ) : items.map((item, idx) => (
                                            <motion.div
                                                key={item.productId + (item.variationId || '')}
                                                layout
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -20, opacity: 0 }}
                                                className="flex gap-4 group p-1"
                                            >
                                                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                                    <Tag size={20} className="text-slate-300 group-hover:text-indigo-300" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0">
                                                            <h4 className="font-black text-slate-800 text-xs group-hover:text-indigo-600 transition-colors truncate">{item.name}</h4>
                                                            {item.variationName && <p className="text-[10px] font-bold text-slate-400 truncate">{item.variationName}: {item.variationValue}</p>}
                                                        </div>
                                                        <button
                                                            onClick={() => removeItem(item.productId, item.variationId)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors ml-2"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-base font-black text-slate-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                                                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all"
                                                            >
                                                                <Minus size={12} strokeWidth={3} />
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                                                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all"
                                                            >
                                                                <Plus size={12} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-t-[3rem] shadow-2xl space-y-6 pt-10 mt-auto">
                                    <div className="space-y-3 opacity-60">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span>${getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-white/10 pt-6">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Total</span>
                                        <span className="text-4xl font-black text-indigo-400 leading-none">${getTotal().toFixed(2)}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8 pb-4 sm:pb-0">
                                        <button
                                            disabled={items.length === 0}
                                            onClick={() => handleCheckout('Cash')}
                                            className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-5 rounded-[2rem] transition-all disabled:opacity-20 group"
                                        >
                                            <Banknote className="text-green-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Cash</span>
                                        </button>
                                        <button
                                            disabled={items.length === 0}
                                            onClick={() => handleCheckout('Card')}
                                            className="flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-5 rounded-[2rem] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-20 group"
                                        >
                                            <CreditCard className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Pay Card</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default POS;
