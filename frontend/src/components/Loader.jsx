import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center p-20 w-full animate-in fade-in duration-700">
            <div className="relative w-20 h-20 mb-8">
                <motion.div
                    className="absolute inset-0 border-4 border-slate-100 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
                <motion.div
                    className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Initialising Component</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Fetching latest data...</p>
            </div>
        </div>
    );
};

export const Skeleton = ({ height = "h-12", width = "w-full", className = "" }) => (
    <div className={`${height} ${width} bg-slate-100 rounded-2xl animate-pulse ${className}`} />
);

export default Loader;
