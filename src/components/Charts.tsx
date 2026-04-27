import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface ChartProps {
  data: any[];
}

export const ActivityChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-xl h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Weekly Activity</h3>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Steps vs Target</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
          <defs>
            <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEmerald)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const IntensityChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] backdrop-blur-xl h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Biometric Intensity</h3>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Heart Rate Distribution</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip 
            cursor={{ fill: '#27272a', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
          />
          <Bar dataKey="total" radius={[8, 8, 8, 8]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.total > 1500 ? '#f43f5e' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LiveHeartRateChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-xl h-[300px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8">
        <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live Pulse</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-tight">Real-time Biometrics</h3>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Sensed via Neural Link</p>
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.3} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
              itemStyle={{ color: '#f43f5e', fontWeight: 700 }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#f43f5e', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPulse)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute bottom-6 left-8 flex items-baseline gap-2">
        <span className="text-2xl font-black text-white italic">
          {data.length > 0 ? data[data.length - 1].value : '--'}
        </span>
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">BPM Now</span>
      </div>
    </div>
  );
};
