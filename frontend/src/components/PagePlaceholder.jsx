import React from 'react';
import { motion } from 'framer-motion';

const PagePlaceholder = ({ title, icon: Icon }) => {
    return (
        <div className="p-8 min-h-full flex flex-col items-center justify-center text-slate-400">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    {Icon && <Icon size={40} />}
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">{title}</h1>
                <p className="text-sm font-medium text-slate-400 text-center max-w-xs">
                    This module is currently under development. Soon you will be able to manage your {title.toLowerCase()} here.
                </p>
                <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default PagePlaceholder;
