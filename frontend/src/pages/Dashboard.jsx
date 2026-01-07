import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import {
    Users,
    Package,
    TrendingUp,
    AlertCircle,
    LogOut,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Dashboard = () => {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);

    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            // Placeholder for now
            return {
                todaySales: 1250,
                pendingOrders: 5,
                lowStock: 12,
                totalCustomers: 450
            };
        }
    });

    const cards = [
        { title: 'Today\'s Sales', value: `$${stats?.todaySales}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+12%' },
        { title: 'Low Stock Items', value: stats?.lowStock, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', trend: 'Critical' },
        { title: 'Total Customers', value: stats?.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5%' },
        { title: 'Pending returns', value: stats?.pendingOrders, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2%' },
    ];

    return (
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">VantagePOS Overview</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:text-red-600 hover:border-red-100 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${card.bg} ${card.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <card.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${card.trend.includes('+') || card.trend.includes('Sales') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {card.trend}
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{card.title}</h3>
                        <p className="text-2xl font-black text-slate-900 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Activity</h2>
                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shadow-sm border border-slate-100">
                                        #{i}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">Sale INV-00{i}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">2 mins ago • Sarah</p>
                                    </div>
                                </div>
                                <span className="font-black text-slate-900 text-sm sm:text-base">$245.00</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Priority Alerts</h2>
                    <div className="space-y-6">
                        {['Nike Air Max', 'Levi\'s 501', 'Adidas Ultraboost'].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-1.5 h-10 bg-red-500 rounded-full group-hover:h-12 transition-all"></div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{item}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Low Stock: 2 units</span>
                                        <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Restock</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
