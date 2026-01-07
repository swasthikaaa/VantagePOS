import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import {
    BarChart3,
    ShoppingCart,
    Package,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    Warehouse,
    Truck,
    FileText,
    Coins,
    Undo2,
    ShieldCheck,
    Gift,
    LayoutDashboard,
    Sliders,
    Receipt,
    Bell,
    Search,
    User as UserIcon,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import useSearchStore from '../store/useSearchStore';

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const { query, setQuery } = useSearchStore();
    const navigate = useNavigate();

    const { data: lowStockProducts } = useQuery({
        queryKey: ['lowStock'],
        queryFn: async () => {
            const { data } = await axios.get('/products/low-stock');
            return data.data;
        },
        refetchInterval: 30000 // Refetch every 30 seconds
    });

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Products', icon: Package, path: '/inventory', roles: ['Admin', 'Manager'] },
        { name: 'People', icon: Users, path: '/users', roles: ['Admin'] },
        { name: 'Warehouse', icon: Warehouse, path: '/warehouse', roles: ['Admin'] },
        { name: 'Sale', icon: ShoppingCart, path: '/' },
        { name: 'Purchase', icon: Truck, path: '/purchases', roles: ['Admin', 'Manager'] },
        { name: 'Quotation', icon: FileText, path: '/quotations' },
        { name: 'Currencies', icon: Coins, path: '/currencies', roles: ['Admin'] },
        { name: 'Expenses', icon: Undo2, path: '/expenses', roles: ['Admin', 'Manager'] },
        { name: 'Role/Permissions', icon: ShieldCheck, path: '/roles', roles: ['Admin'] },
        { name: 'Special Offers', icon: Gift, path: '/offers' },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
        { name: 'Adjustment', icon: Sliders, path: '/adjustments' },
        { name: 'Z bill', icon: Receipt, path: '/z-bill' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user?.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 h-16 flex items-center justify-between border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <ShoppingCart className="text-white" size={20} />
                    </div>
                    {(!collapsed || isMobileMenuOpen) && (
                        <span className="font-black text-xl tracking-tight text-slate-900">Vantage<span className="text-indigo-600">POS</span></span>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-4 mt-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                : 'text-slate-500 hover:bg-slate-50/80 hover:text-indigo-600'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`${collapsed && !isMobileMenuOpen ? 'mx-auto' : ''}`} />
                                {(!collapsed || isMobileMenuOpen) && <span className="text-[13px] tracking-wide">{item.name}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 mt-auto shrink-0">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-4 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ${collapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}
                >
                    <LogOut size={18} />
                    {(!collapsed || isMobileMenuOpen) && <span className="text-sm font-bold uppercase tracking-wider">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 transition-all duration-300 flex-col relative z-30 shadow-sm shrink-0`}
            >
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 bg-white border border-slate-200 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all z-40"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40]"
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-[50] shadow-2xl"
                        >
                            <SidebarContent />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Navigation */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 shadow-sm shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="relative w-full max-w-[400px] group hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-12 pr-4 py-2 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <button className="sm:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">
                            <Search size={18} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all group"
                            >
                                <Bell size={18} />
                                {lowStockProducts?.length > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                                        {lowStockProducts.length}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-[60]"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100/50 z-[70] overflow-hidden"
                                        >
                                            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                                                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Notifications</h3>
                                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                    {lowStockProducts?.length || 0} Low Stock
                                                </span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {lowStockProducts?.length === 0 ? (
                                                    <div className="p-10 text-center">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                                            <Bell size={24} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
                                                    </div>
                                                ) : lowStockProducts.map(product => (
                                                    <div
                                                        key={product._id}
                                                        onClick={() => {
                                                            navigate('/inventory');
                                                            setShowNotifications(false);
                                                        }}
                                                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                                                                <Package size={20} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-black text-slate-900 text-[11px] truncate uppercase tracking-tight">{product.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-bold text-red-500">
                                                                        Stock: {product.totalStock}
                                                                    </span>
                                                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                    <span className="text-[10px] font-bold text-slate-400">
                                                                        Alert at {product.alertQuantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {lowStockProducts?.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        navigate('/inventory');
                                                        setShowNotifications(false);
                                                    }}
                                                    className="w-full p-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-slate-50/50 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Manage Inventory
                                                    <ChevronRight size={14} />
                                                </button>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer group p-1 pr-0 sm:pr-3 rounded-2xl hover:bg-slate-50 transition-all">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <div className="w-full h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
