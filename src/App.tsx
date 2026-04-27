import React, { useState, useEffect } from 'react';
import { 
  Footprints, Flame, Map, Clock, Heart, 
  Activity, User, Settings, Bell, Search, 
  Plus, RefreshCw, LogOut, Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard } from './components/MetricCard';
import { ActivityChart, IntensityChart, LiveHeartRateChart } from './components/Charts';
import socket from './lib/socket';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data initialization
const INITIAL_SUMMARY = {
  steps: 8432,
  calories: 420,
  distance: 6.2,
  heartRate: 72,
  activeMinutes: 45
};

const INITIAL_GOALS = [
  { type: 'steps', target: 10000, period: 'daily' },
  { type: 'calories', target: 2000, period: 'daily' },
  { type: 'distance', target: 10, period: 'daily' },
];

const INITIAL_CHART_DATA = [
  { time: '08:00', total: 400 },
  { time: '10:00', total: 1200 },
  { time: '12:00', total: 900 },
  { time: '14:00', total: 1500 },
  { time: '16:00', total: 2100 },
  { time: '18:00', total: 1800 },
  { time: '20:00', total: 800 },
];

export default function App() {
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [chartData, setChartData] = useState(INITIAL_CHART_DATA);
  const [heartRateStream, setHeartRateStream] = useState<any[]>([]);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [user, setUser] = useState({ name: '', email: '' });
  const [isLogged, setIsLogged] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'goals' | 'settings'>('dashboard');

  useEffect(() => {
    // Initial fetch (if logged in)
    if (isLogged) {
      // In a real app, we'd fetch actual data and goals from /api/fitness/summary and /api/fitness/goals
      socket.connect();
      socket.on('fitness_update', (data) => {
        if (data.type === 'real_time') {
          const freshHeartRate = Math.round(data.data.heartRate);
          setSummary(prev => ({
            ...prev,
            heartRate: freshHeartRate,
            steps: prev.steps + data.data.steps,
            calories: prev.calories + data.data.calories
          }));

          setHeartRateStream(prev => {
            const next = [...prev, { time: new Date().toLocaleTimeString(), value: freshHeartRate }];
            return next.slice(-30); // Keep last 30 data points
          });
        }
      });
    }
    return () => {
      socket.disconnect();
    };
  }, [isLogged]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 2000);
  };

  const updateGoal = (type: string, target: number) => {
    setGoals(prev => prev.map(g => g.type === type ? { ...g, target } : g));
  };

  const getProgress = (type: string, value: number) => {
    const goal = goals.find(g => g.type === type);
    if (!goal) return 0;
    return Math.min(100, Math.round((value / goal.target) * 100));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAuth = () => {
    setIsLogged(!isLogged);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/20 overflow-x-hidden relative">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-zinc-950/80 border-r border-zinc-800/50 backdrop-blur-md z-50 flex flex-col items-center md:items-stretch py-10 transition-all">
        <div className="px-8 mb-16 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Activity size={24} />
          </div>
          <span className="hidden md:block font-black text-2xl tracking-tighter italic uppercase text-white">FitEdge</span>
        </div>

        <nav className="flex-1 px-4 space-y-4">
          {[
            { icon: Activity, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
            { icon: Footprints, label: 'Goals', active: currentView === 'goals', onClick: () => setCurrentView('goals') },
            { icon: User, label: 'Settings', active: currentView === 'settings', onClick: () => setCurrentView('settings') },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group",
                item.active ? 'bg-zinc-900 border border-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50'
              )}
            >
              <item.icon size={20} className={item.active ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'} />
              <span className="hidden md:block font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <button 
            onClick={handleAuth}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-zinc-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
          >
            <LogOut size={20} />
            <span className="hidden md:block font-bold text-sm tracking-wide">{isLogged ? 'Sign Out' : 'Sign In'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 md:ml-64 p-6 md:p-12 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white">
              {currentView === 'dashboard' ? 'Morning,' : currentView === 'goals' ? 'Set Your' : 'Profile'} 
              <span className="font-black italic ml-2">
                {currentView === 'dashboard' ? (user.name || 'User') : currentView === 'goals' ? 'Objectives' : 'Settings'}
              </span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Tuesday, October 24 • <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Syncing Live</span>
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center bg-zinc-900/50 border border-zinc-800 rounded-3xl px-5 py-3 w-64 backdrop-blur-md">
              <Search size={18} className="text-zinc-600 mr-3" />
              <input type="text" placeholder="Search Biometrics" className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-zinc-700 font-medium" />
            </div>
            
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-zinc-100 px-6 py-3.5 rounded-3xl shadow-xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 font-bold text-xs uppercase tracking-widest"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
              <span>Update Data</span>
            </button>
          </div>
        </header>

        {currentView === 'goals' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {goals.map((goal, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-emerald-400">
                    {goal.type === 'steps' && <Footprints size={24} />}
                    {goal.type === 'calories' && <Flame size={24} />}
                    {goal.type === 'distance' && <Map size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white capitalize">{goal.type} Goal</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Daily Protocol</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Target Value</label>
                  <input 
                    type="number" 
                    value={goal.target}
                    onChange={(e) => updateGoal(goal.type, parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white font-black text-xl focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <div className="flex justify-between items-center text-xs pt-4">
                    <span className="text-zinc-500 font-bold">Current Progress</span>
                    <span className="text-emerald-400 font-bold">{goal.type === 'steps' ? summary.steps : goal.type === 'calories' ? summary.calories : summary.distance} {goal.type === 'steps' ? '' : goal.type === 'calories' ? 'kcal' : 'km'}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : currentView === 'settings' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl bg-zinc-900/40 border border-zinc-800 p-10 rounded-[2.5rem] backdrop-blur-xl"
          >
            <div className="flex items-center gap-8 mb-12">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-emerald-500 to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-[1.9rem] bg-zinc-900 flex items-center justify-center text-white text-3xl font-black italic">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{user.name}</h3>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Biometric Hash: #FT-8291</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Full Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white font-bold focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white font-bold focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-400 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-800 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setUser({ name: '', email: '' })}
                  className="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all text-[10px]"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3.5 bg-emerald-500 text-zinc-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 text-[10px]"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <>
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricCard 
                title="Total Steps" 
                value={summary.steps.toLocaleString()} 
                unit="steps" 
                icon={Footprints} 
                trend={12} 
                color="emerald" 
                progress={getProgress('steps', summary.steps)}
              />
              <MetricCard 
                title="Calories Burned" 
                value={summary.calories} 
                unit="kcal" 
                icon={Flame} 
                trend={-4} 
                color="orange" 
                progress={getProgress('calories', summary.calories)}
              />
              <MetricCard 
                title="Active Distance" 
                value={summary.distance} 
                unit="km" 
                icon={Map} 
                trend={18} 
                color="blue" 
                progress={getProgress('distance', summary.distance)}
              />
              <MetricCard 
                title="Heart Rate" 
                value={summary.heartRate} 
                unit="bpm" 
                icon={Heart} 
                color="red" 
                description="RESTING • 2 MINS AGO"
              />
            </div>

            {/* Real-time Biometric Pulse */}
            <div className="mb-10">
              <LiveHeartRateChart data={heartRateStream} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
              <ActivityChart data={chartData} />
              <IntensityChart data={chartData} />
            </div>

            {/* Recent Activities Section */}
            <div className="mt-12 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black italic tracking-tight text-white">Biological Logs</h3>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-colors">Archive Access</button>
              </div>

              <div className="space-y-8">
                {[
                  { type: 'Running', name: 'Evening Protocol', date: 'Today, 18:30', duration: '45m', dist: '5.2km', cals: '380', icon: Map, color: 'emerald' },
                  { type: 'Strength', name: 'Neuro-Muscular Load', date: 'Yesterday, 09:15', duration: '1h 10m', dist: '-', cals: '420', icon: Activity, color: 'blue' },
                  { type: 'Cycling', name: 'Orbital Commute', date: '25 Apr, 08:00', duration: '25m', dist: '4.8km', cals: '150', icon: RefreshCw, color: 'purple' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-6 group cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all border border-zinc-800 bg-zinc-800/20 text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20">
                      <activity.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white tracking-wide">{activity.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{activity.date}</p>
                    </div>
                    <div className="flex items-center gap-12 text-center">
                      <div className="hidden sm:block">
                        <p className="text-sm font-black text-white">{activity.duration}</p>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">TIME</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-black text-white">{activity.dist}</p>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">DIST</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-400">+{activity.cals}</p>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">KCAL</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer info from design */}
        <div className="mt-12 flex flex-col lg:flex-row justify-between items-center gap-8 bg-zinc-900/40 border border-zinc-800 p-10 rounded-[2.5rem] backdrop-blur-md">
          <div className="flex flex-col gap-6 w-full lg:w-1/2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Intelligent Insights</h3>
            <div className="flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50">
                <span className="text-2xl">🌙</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">Optimal Sleep Achieved</p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Your recovery is at 94%. Today is a great day for a high-intensity session based on your current HRV and fatigue levels.</p>
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-800 flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50">
                <span className="text-2xl">💧</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">Hydration Alert</p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">You're 600ml behind your daily water goal. Proper hydration can boost your active performance by up to 15% today.</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 bg-zinc-950/40 p-8 rounded-[2rem] border border-zinc-800/80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Goals Analysis</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black">82% OVERALL</span>
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-zinc-400">
                  <span>Weight Management</span>
                  <span className="text-white">2.4kg / 5kg</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[48%] shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-zinc-400">
                  <span>Hypertrophy Phase</span>
                  <span className="text-white">68% PROGRESS</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[68%] shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 flex justify-between items-center text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-black pb-12">
          <div className="flex gap-10">
            <span>Core v2.4.0</span>
            <span className="text-emerald-500/50">Cloud Sync: Live</span>
          </div>
          <div className="flex gap-8">
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">Protocol</span>
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">Systems</span>
            <span className="stroke-zinc-800 hover:text-rose-500 transition-colors cursor-pointer capitalize">Logs</span>
          </div>
        </footer>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-12 right-12 bg-zinc-900 border border-zinc-800 text-white px-8 py-5 rounded-[2rem] shadow-2xl z-[100] flex items-center gap-5 backdrop-blur-md"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Bell size={24} />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight capitalize">System Synced</p>
              <p className="text-xs text-zinc-500 mt-1 font-medium italic">Fitness metrics aligned via Cloud Fit.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLogged && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-zinc-900 w-full max-w-lg rounded-[3rem] p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-zinc-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <h2 className="text-4xl font-black mb-4 tracking-tighter italic">Connect to <span className="text-emerald-500 uppercase not-italic">FitEdge</span></h2>
            <p className="text-zinc-500 mb-10 text-sm leading-relaxed font-medium">Initialize your biometric synchronization and start tracking your biological performance in real-time through intelligent cloud architecture.</p>
            
            <div className="space-y-5">
              <button 
                onClick={handleAuth}
                className="w-full flex items-center justify-center gap-4 bg-emerald-500 text-zinc-950 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 text-xs"
              >
                Access Command Center
              </button>
              <button className="w-full flex items-center justify-center gap-4 bg-zinc-800 text-zinc-100 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all active:scale-95 text-xs border border-zinc-700">
                <Github size={20} />
                Network Auth via Github
              </button>
            </div>
            
            <p className="text-center text-[10px] text-zinc-700 uppercase tracking-[0.2em] font-black mt-10">Secured via end-to-end proprietary encryption</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
