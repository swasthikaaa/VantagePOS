import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Logo = ({ size = "normal", className = "" }) => {
    const isSmall = size === "small";
    const isLarge = size === "large";

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 
                ${isSmall ? 'w-10 h-10' : isLarge ? 'w-16 h-16' : 'w-12 h-12'}`}>
                <ShoppingBag className="text-white" size={isSmall ? 20 : isLarge ? 32 : 24} />
            </div>
            <div className="flex flex-col -space-y-1">
                <span className={`font-black text-slate-900 tracking-tighter uppercase 
                    ${isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-xl'}`}>
                    Vantage<span className="text-indigo-600">POS</span>
                </span>
                {!isSmall && (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-0.5">
                        Business Suite
                    </span>
                )}
            </div>
        </div>
    );
};

export default Logo;
