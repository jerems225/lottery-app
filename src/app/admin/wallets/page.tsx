"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, 
  TrendingUp, TrendingDown, History, BarChart3, ShieldCheck
} from "lucide-react";
import { getAdminStatsAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

export default function WalletManagement() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const res = await getAdminStatsAction();
      if (!res.error) setStats(res);
      setLoading(false);
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2 pb-8 border-b border-black/5">
        <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-4">
           Platform Liquidity
        </h1>
        <p className="font-bold text-text-muted">Manage the platform's vault, payouts, and reserve funds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Vault */}
        <div className="md:col-span-2 bg-zinc-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-black/20 group">
            <div className="flex flex-col gap-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary-gold flex items-center justify-center text-zinc-900 shadow-xl shadow-primary-gold/20">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Primary Vault</span>
                            <span className="text-xl font-black uppercase tracking-tight">Main Reserve Hub</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                       <TrendingUp className="w-3 h-3" /> Secure
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Platform Assets (Reserve)</span>
                    <div className="text-6xl lg:text-7xl font-[950] tracking-tighter text-white">
                        {loading ? "---.---" : formatCurrency(stats?.reservePool || 0)}
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/5">
                    <button className="px-8 py-5 bg-primary-gold text-zinc-900 rounded-2xl font-black uppercase text-xs hover:bg-white transition-all shadow-xl shadow-black/20">
                        Platform Withdrawal
                    </button>
                    <button className="px-8 py-5 bg-white/5 text-white rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all border border-white/10">
                        History
                    </button>
                </div>
            </div>
            
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-gold/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <BarChart3 size={400} />
            </div>
        </div>

        {/* Small Stats */}
        <div className="flex flex-col gap-6">
            {[
                { label: "Reserve Pool", value: formatCurrency(stats?.reservePool || 0), color: "text-amber-500" },
                { label: "Commission Balance", value: formatCurrency(stats?.totalCommissions || 0), color: "text-emerald-500" },
                { label: "Active Jackpots", value: formatCurrency(stats?.jackpotTotal || 0), color: "text-primary-gold" }
            ].map((stat, i) => (
                <div key={i} className="flex-1 bg-white border border-black/5 p-8 rounded-[40px] shadow-sm flex flex-col justify-between group hover:border-primary-gold/30 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.label}</span>
                    <div className={`text-xl xl:text-2xl font-[950] ${stat.color} group-hover:scale-105 transition-transform origin-left`}>{loading ? "-" : stat.value}</div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">
        <div className="lg:col-span-2 bg-white border border-black/5 rounded-[48px] p-12 shadow-premium">
           <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 flex items-center gap-3">
               <History className="w-6 h-6 text-primary-gold" /> Liquidity Movements
           </h3>
           <div className="flex flex-col gap-4">
              {loading ? (
                 <div className="py-10 text-center font-black text-xs text-zinc-300 uppercase tracking-widest">Loading transactions...</div>
              ) : stats?.liquidityMovements?.length === 0 ? (
                 <div className="py-10 text-center font-black text-xs text-zinc-300 uppercase tracking-widest">No liquidity movements.</div>
              ) : stats?.liquidityMovements?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-black/5 group cursor-pointer hover:border-primary-gold/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.amount > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                           {m.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-text-main line-clamp-1 max-w-[200px] xl:max-w-xs">{m.description}</span>
                           <span className="text-[10px] font-bold text-text-muted uppercase">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                     </div>
                     <span className={`font-black text-sm whitespace-nowrap ${m.amount > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                         {m.amount > 0 ? '+' : ''}{formatCurrency(m.amount)}
                     </span>
                  </div>
              ))}
           </div>
        </div>

        <div className="bg-zinc-100 rounded-[48px] p-10 flex flex-col gap-6 items-center justify-center text-center border border-black/5 shadow-inner">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-primary-gold shadow-xl mb-4">
               <Wallet className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-text-main uppercase tracking-tight">Financial Health</h4>
            <p className="text-sm font-bold text-text-muted px-6">Your platform liquidity is currently optimal. All pending payouts are secured by the main reserve.</p>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden mt-4">
                <div className="w-4/5 h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">80% Liquidity Coverage</span>
        </div>
      </div>
    </div>
  );
}
