import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  color?: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'emerald';
  description?: string;
  progress?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, unit, icon: Icon, trend, color = 'blue', description, progress 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-[2rem] backdrop-blur-xl flex flex-col justify-between group transition-all hover:bg-zinc-900/60"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "p-2 rounded-xl transition-colors",
          color === 'blue' && "bg-blue-500/10 text-blue-500",
          color === 'orange' && "bg-orange-500/10 text-orange-500",
          color === 'red' && "bg-rose-500/10 text-rose-500",
          color === 'green' && "bg-green-500/10 text-green-500",
          color === 'purple' && "bg-purple-500/10 text-purple-500",
          color === 'emerald' && "bg-emerald-500/10 text-emerald-500"
        )}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
            trend >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
          {unit && <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{unit}</span>}
        </div>
        
        {progress !== undefined ? (
          <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full shadow-[0_0_8px]",
                color === 'blue' && "bg-blue-500 shadow-blue-500/20",
                color === 'orange' && "bg-orange-500 shadow-orange-500/20",
                color === 'red' && "bg-rose-500 shadow-rose-500/20",
                color === 'green' && "bg-green-500 shadow-green-500/20",
                color === 'purple' && "bg-purple-500 shadow-purple-500/20",
                color === 'emerald' && "bg-emerald-500 shadow-emerald-500/20"
              )}
            />
          </div>
        ) : description && (
          <p className="text-[10px] text-zinc-500 mt-2 font-medium tracking-wide">{description}</p>
        )}
      </div>
    </motion.div>
  );
};
