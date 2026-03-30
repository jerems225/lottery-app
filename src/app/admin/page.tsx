"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Crown, TrendingUp, TrendingDown,
  DollarSign, Activity, Wallet, ShieldCheck,
  ArrowUpRight, ArrowDownLeft, UserPlus, Trophy
} from "lucide-react";
import { getAdminStatsAction, getRecentActivityAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = React.useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    const [statsRes, activityRes] = await Promise.all([
      getAdminStatsAction(),
      getRecentActivityAction()
    ]);
    
    if (!statsRes.error) setStats(statsRes);
    if (activityRes.success && activityRes.liveFeed) setActivity(activityRes.liveFeed);
    if (!isPolling) setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "AGENT") {
       router.push("/admin/finance");
       return;
    }
  
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statCards = [
    { 
        label: "Total Players", 
        value: stats?.totalUsers || 0, 
        change: `+${stats?.newUsers24h || 0} today`, 
        up: true, 
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    { 
        label: "Active Rooms", 
        value: stats?.activeRooms || 0, 
        change: "Live now", 
        up: true, 
        icon: Crown,
        color: "text-amber-600",
        bg: "bg-amber-50"
    },
    { 
        label: "Total Volume", 
        value: formatCurrency(stats?.totalVolume || 0), 
        change: "All time", 
        up: true, 
        icon: Wallet,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
    { 
        label: "Platform Revenue", 
        value: formatCurrency(stats?.totalCommissions || 0), 
        change: "Fees & Comms", 
        up: true, 
        icon: DollarSign,
        color: "text-primary-gold",
        bg: "bg-zinc-100"
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Title & Date */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight">System Overview</h1>
          <p className="font-bold text-text-muted">Global platform performance and real-time ledger monitoring.</p>
        </div>
        <div className="hidden md:block px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
          Live Data Sync
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm flex flex-col gap-6 relative overflow-hidden group hover:border-primary-gold/30 transition-all"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {stat.change}
                </div>
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-[11px] font-[900] text-text-muted uppercase tracking-widest mb-1">{stat.label}</span>
                <span className="text-3xl font-[950] text-text-main line-clamp-1">
                    {loading ? "..." : stat.value}
                </span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary-gold/5 transition-colors" />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activity Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6 bg-white border border-black/5 p-8 lg:p-10 rounded-[40px] shadow-premium relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-text-main uppercase tracking-tight flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary-gold" /> Unified Live Feed
            </h3>
            <button onClick={() => fetchData(false)} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary-gold transition-all">
               Refresh Logs
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
             {loading ? (
                <div className="p-10 text-center font-black text-text-muted uppercase text-xs tracking-widest">Hydrating feed...</div>
             ) : activity.length === 0 ? (
                <div className="p-10 text-center font-black text-text-muted uppercase text-xs tracking-widest">No recent activity detected.</div>
             ) : activity.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-black/5 hover:border-black/10 transition-all cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          log.type === 'USER' ? 'bg-blue-50 text-blue-600' : 
                          log.type === 'TX' ? 'bg-emerald-50 text-emerald-600' : 
                          'bg-amber-50 text-amber-600'
                      }`}>
                          {log.type === 'USER' ? <UserPlus className="w-5 h-5" /> : 
                           log.type === 'TX' ? <DollarSign className="w-5 h-5" /> : 
                           <Trophy className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-text-main group-hover:text-primary-gold transition-colors">{log.text}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            By {log.user} • {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                   </div>
                   {log.amount && (
                       <div className={`font-black text-sm ${log.amount > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                          {log.amount > 0 ? '+' : ''}{formatCurrency(log.amount)}
                       </div>
                   )}
                </div>
             ))}
          </div>
        </div>

        {/* System Status / Health */}
        <div className="flex flex-col gap-6 bg-zinc-900 border border-black/5 p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 relative z-10">
                <ShieldCheck className="w-6 h-6 text-primary-gold" /> System Health
            </h3>
            
            <div className="flex flex-col gap-8 mt-8 relative z-10">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Database Load</span>
                        <span className="text-xs font-black text-emerald-400">Optimal (12ms)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[15%] h-full bg-emerald-500 rounded-full" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Sessions</span>
                        <span className="text-xs font-black text-primary-gold">24 Online</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[45%] h-full bg-primary-gold rounded-full" />
                    </div>
                </div>

                <div className="mt-10 p-6 bg-white/5 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase">Ledger Balanced</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase">All txs confirmed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        </div>
      </div>
    </div>
  );
}
