import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import Loader from '../components/Loader';
import {
    Building2, Receipt, Mail, Save, Upload, CheckCircle2,
    Printer, Globe, MapPin, Phone, Settings as SettingsIcon, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsManagement = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('company');

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await axios.get('/settings');
            return data.data;
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings) => axios.put('/settings', newSettings),
        onSuccess: () => {
            queryClient.invalidateQueries(['settings']);
        }
    });

    const handleChange = (section, field, value) => {
        const newSettings = {
            ...settings,
            [section]: {
                ...settings[section],
                [field]: value
            }
        };
        updateSettingsMutation.mutate(newSettings);
    };

    if (isLoading) return <Loader />;

    const tabs = [
        { id: 'company', label: 'Company Profile', icon: Building2 },
        { id: 'receipt', label: 'Receipt Settings', icon: Receipt },
        { id: 'stock', label: 'Stock Alerts', icon: Package },
        { id: 'mail', label: 'Mail Server', icon: Mail },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 sm:mb-10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">System Environment</h1>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Configure your global POS architecture</p>
                </div>
                <div className="w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    <div className="bg-white p-1.5 rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-slate-100 flex min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-xl font-black transition-all text-[10px] sm:text-xs uppercase tracking-widest ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 sm:p-10">

                {/* COMPANY SETTINGS */}
                {activeTab === 'company' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 text-center sm:text-left">
                            <div className="w-24 h-24 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer group">
                                <Upload size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] uppercase font-black tracking-widest mt-2 px-2 text-center">Core Identity</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enterprise Identity</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">This signature will represent your brand on all fiscal documents</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Entity Name</label>
                                <div className="relative">
                                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={settings?.company?.name || ''}
                                        onChange={(e) => handleChange('company', 'name', e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax Registration / VAT</label>
                                <input
                                    type="text"
                                    value={settings?.company?.taxId || ''}
                                    onChange={(e) => handleChange('company', 'taxId', e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Headquarters</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={settings?.company?.address || ''}
                                        onChange={(e) => handleChange('company', 'address', e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Corporate Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={settings?.company?.email || ''}
                                        onChange={(e) => handleChange('company', 'email', e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Contact Phone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={settings?.company?.phone || ''}
                                        onChange={(e) => handleChange('company', 'phone', e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Digital Presence (URL)</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={settings?.company?.website || ''}
                                        onChange={(e) => handleChange('company', 'website', e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RECEIPT SETTINGS */}
                {activeTab === 'receipt' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <Printer size={24} className="text-indigo-600" />
                                Print Topology
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'showCompanyName', label: 'Entity Name' },
                                    { key: 'showAddress', label: 'Office Address' },
                                    { key: 'showPhone', label: 'System Phone' },
                                    { key: 'showTaxId', label: 'VAT Registry' },
                                    { key: 'showDate', label: 'Iso Date' },
                                    { key: 'showTime', label: 'Chronos Time' },
                                    { key: 'showThankYou', label: 'Appreciation' },
                                ].map(item => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.label}</span>
                                        <button
                                            onClick={() => handleChange('receipt', item.key, !settings?.receipt?.[item.key])}
                                            className={`w-10 h-5 rounded-full transition-all relative ${settings?.receipt?.[item.key] ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-300'
                                                }`}
                                        >
                                            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all ${settings?.receipt?.[item.key] ? 'left-6' : 'left-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                ))}

                                <div className="sm:col-span-2 pt-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Fiscal Narrative (Footer)</label>
                                    <textarea
                                        value={settings?.receipt?.footerText || ''}
                                        onChange={(e) => handleChange('receipt', 'footerText', e.target.value)}
                                        className="w-full p-6 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 h-28 resize-none text-sm placeholder:text-slate-300"
                                        placeholder="Terms, conditions, or appreciation..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LIVE PREVIEW - Optimized for Mobile */}
                        <div className="bg-slate-50/50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 border-dashed flex items-center justify-center">
                            <div className="w-full max-w-[320px] bg-white shadow-2xl rounded-sm p-6 sm:p-8 text-[11px] font-mono leading-relaxed relative border-t-8 border-indigo-600">
                                <div className="text-center mb-6 border-b border-dashed border-slate-200 pb-4">
                                    {settings?.receipt?.showCompanyName && <div className="font-black text-base uppercase tracking-widest mb-1">{settings?.company?.name || 'VANTAGE POS'}</div>}
                                    {settings?.receipt?.showAddress && <div className="text-slate-500 text-[10px]">{settings?.company?.address || 'GLOBAL HQ, DIST 9'}</div>}
                                    {settings?.receipt?.showPhone && <div className="text-slate-500 text-[10px]">TEL: {settings?.company?.phone || '+0 000 000'}</div>}
                                    {settings?.receipt?.showTaxId && <div className="text-slate-500 text-[10px] mt-1 italic">TAX: {settings?.company?.taxId || 'FISC-999'}</div>}
                                </div>

                                <div className="flex justify-between text-[10px] text-slate-400 mb-4 font-black uppercase">
                                    <div>{settings?.receipt?.showDate && <span>22 OCT 2026</span>}</div>
                                    <div>{settings?.receipt?.showTime && <span>14:32:01</span>}</div>
                                </div>

                                <div className="space-y-2 mb-6 border-b border-dashed border-slate-200 pb-4">
                                    <div className="flex justify-between">
                                        <span>CORE MODULE A</span>
                                        <span className="font-black">$199.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>QUANTUM LICENSE</span>
                                        <span className="font-black">$25.30</span>
                                    </div>
                                </div>

                                <div className="flex justify-between font-black text-sm mb-6 uppercase tracking-widest">
                                    <span>GRAND TOTAL</span>
                                    <span>$224.30</span>
                                </div>

                                <div className="text-center text-[10px] text-slate-500">
                                    {settings?.receipt?.footerText && <div className="mb-2 italic uppercase">{settings?.receipt?.footerText}</div>}
                                    {settings?.receipt?.showThankYou && <div className="font-black opacity-30 mt-4 tracking-[0.3em]">-- SECURED --</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIL SETTINGS */}
                {activeTab === 'mail' && (
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                            <Mail size={24} className="text-indigo-600" />
                            Mail Matrix (SMTP)
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grid Host</label>
                                <input
                                    type="text"
                                    value={settings?.mail?.smtpHost || ''}
                                    onChange={(e) => handleChange('mail', 'smtpHost', e.target.value)}
                                    placeholder="smtp.relay.net"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm placeholder:text-slate-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grid Port</label>
                                <input
                                    type="number"
                                    value={settings?.mail?.smtpPort || ''}
                                    onChange={(e) => handleChange('mail', 'smtpPort', e.target.value)}
                                    placeholder="587"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Authority ID (User)</label>
                                <input
                                    type="text"
                                    value={settings?.mail?.smtpUser || ''}
                                    onChange={(e) => handleChange('mail', 'smtpUser', e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Token (PASS)</label>
                                <input
                                    type="password"
                                    value={settings?.mail?.smtpPassword || ''}
                                    onChange={(e) => handleChange('mail', 'smtpPassword', e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sender Signature</label>
                                <input
                                    type="text"
                                    value={settings?.mail?.fromName || ''}
                                    onChange={(e) => handleChange('mail', 'fromName', e.target.value)}
                                    placeholder="System Automator"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Origin Address</label>
                                <input
                                    type="email"
                                    value={settings?.mail?.fromEmail || ''}
                                    onChange={(e) => handleChange('mail', 'fromEmail', e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-10">
                            <button className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl">
                                <CheckCircle2 size={18} />
                                Verify Connection Pulse
                            </button>
                        </div>
                    </div>
                )}

                {/* STOCK SETTINGS */}
                {activeTab === 'stock' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 text-center sm:text-left">
                            <div className="p-4 bg-amber-50 text-amber-600 rounded-[1.5rem]">
                                <Package size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Inventory Watchdogs</h3>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Configure threshold monitors for supply integrity</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-6 sm:p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Automated Alerts</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Broadcast notifications for low stock</p>
                                </div>
                                <button
                                    onClick={() => handleChange('stock', 'enableAlerts', !settings?.stock?.enableAlerts)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${settings?.stock?.enableAlerts ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings?.stock?.enableAlerts ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Delta (Threshold)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={settings?.stock?.lowStockThreshold || 10}
                                            onChange={(e) => handleChange('stock', 'lowStockThreshold', parseInt(e.target.value))}
                                            className="w-full px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-black text-xl text-indigo-600"
                                        />
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[9px] uppercase tracking-[0.2em] pointer-events-none">Units</div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 ml-1 uppercase tracking-tighter italic">Trigger alert below this quantification</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sync Frequency</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-8 py-4 sm:py-5 bg-slate-50 border-none rounded-2xl sm:rounded-[1.8rem] focus:ring-4 focus:ring-indigo-100 outline-none font-bold appearance-none text-sm uppercase tracking-widest"
                                            value={settings?.stock?.alertFrequency || 'Immediate'}
                                            onChange={(e) => handleChange('stock', 'alertFrequency', e.target.value)}
                                        >
                                            <option value="Immediate">Real-time Pulse</option>
                                            <option value="Daily Summary">Daily Batch</option>
                                            <option value="Weekly Summary">Weekly Ledger</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center sm:justify-end">
                <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-50 shadow-sm">
                    <Save size={14} className="animate-pulse" />
                    <span>Autonomous Sync Active</span>
                </div>
            </div>

        </div>
    );
};

export default SettingsManagement;
