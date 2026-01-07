import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import Loader from '../components/Loader';
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingBag, ArrowUpRight, ArrowDownRight, Printer, Download, Calendar, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const ReportManagement = () => {
    const [timeRange, setTimeRange] = useState('7d');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['reports', timeRange],
        queryFn: async () => {
            // In a real app, this would be a dedicated report endpoint
            // For now, we'll aggregate from existing data or simulate the response
            const [invoices, expenses, products] = await Promise.all([
                axios.get('/pos/invoices'),
                axios.get('/expenses'),
                axios.get('/products')
            ]);

            return {
                sales: invoices.data.data,
                expenses: expenses.data.data,
                products: products.data.data
            };
        }
    });

    const getStats = () => {
        if (!reportData) return { totalSales: 0, totalExpenses: 0, profit: 0, lowStock: 0 };
        const totalSales = reportData.sales.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalExpenses = reportData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const lowStock = reportData.products.filter(p => p.totalStock < 10).length;
        return { totalSales, totalExpenses, profit: totalSales - totalExpenses, lowStock };
    };

    const stats = getStats();

    if (isLoading) return <Loader />;

    const salesChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Daily Sales',
                data: [1200, 1900, 800, 1500, 2200, 3000, 2500],
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 12,
            },
        ],
    };

    const categoryChartData = {
        labels: ['Electronics', 'Clothing', 'Home', 'Groceries', 'Others'],
        datasets: [
            {
                data: [35, 25, 15, 20, 5],
                backgroundColor: [
                    '#4f46e5',
                    '#818cf8',
                    '#c7d2fe',
                    '#312e81',
                    '#e0e7ff',
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1700px] mx-auto">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-8 sm:mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Intelligence & Reports</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Real-time business performance & inventory audit</p>
                </div>

                <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 sm:flex-none">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="w-full sm:w-auto bg-white border border-slate-100 pl-12 pr-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="24h">Daily Cycle</option>
                            <option value="7d">Weekly Span</option>
                            <option value="30d">Monthly View</option>
                            <option value="1y">Fiscal Year</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Sales', color: 'bg-indigo-600' },
                            { label: 'Purchases', color: 'bg-indigo-600' },
                            { label: 'Expenses', color: 'bg-red-500' }
                        ].map(type => (
                            <button
                                key={type.label}
                                className={`flex-1 sm:flex-none ${type.color} text-white px-4 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
                            >
                                <FileDown size={14} />
                                <span>Export {type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
                {[
                    { label: 'Gross Revenue', value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12.5%' },
                    { label: 'Operational Cost', value: `$${stats.totalExpenses.toFixed(2)}`, icon: ShoppingBag, color: 'text-red-500', bg: 'bg-red-50', trend: '+2.1%' },
                    { label: 'Net Liquidity', value: `$${stats.profit.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+8.4%' },
                    { label: 'Stock Alerts', value: stats.lowStock, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Audit Needed' }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 group relative overflow-hidden"
                    >
                        <div className={`p-4 ${item.bg} ${item.color} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                            <item.icon size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{item.value}</span>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${item.trend.includes('+') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {item.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Sales Momentum</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily interaction volume</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] sm:h-[400px]">
                        <Bar
                            data={salesChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { color: '#f8fafc' }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } },
                                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Segment Share</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Contribution by category</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="w-full max-w-[240px] sm:max-w-[280px]">
                            <Doughnut
                                data={categoryChartData}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                usePointStyle: true,
                                                font: { weight: '900', size: 10 },
                                                padding: 20,
                                                boxWidth: 8
                                            }
                                        }
                                    },
                                    cutout: '75%',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportManagement;
