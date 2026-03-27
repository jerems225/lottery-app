"use client";
import React, { useEffect, useState } from "react";
import { User, ShieldCheck, Wallet, ArrowLeft, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AgentRequestsList } from "@/components/profile/AgentRequestsList";
import { formatCurrency } from "@/lib/utils";
import { getLatestBalanceAction } from "@/app/actions/auth.actions";
import { agentRequestRechargeAction } from "@/app/actions/finance.actions";
import { toast } from "react-hot-toast";

export default function AgentDashboard() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState<number>(0);
    const [isRecharging, setIsRecharging] = useState(false);
    const [rechargeAmt, setRechargeAmt] = useState("");
    const [proofRef, setProofRef] = useState("");

    useEffect(() => {
        if (session?.user?.balance !== undefined) {
             setBalance(session.user.balance);
        }
        // Fetch fresh balance periodically
        const fetchBal = async () => {
             const res = await getLatestBalanceAction();
             if (res.success && res.balance !== undefined) setBalance(res.balance);
        };
        fetchBal();
        const interval = setInterval(fetchBal, 10000);
        return () => clearInterval(interval);
    }, [session]);

    const handleAgentRechargeApply = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(rechargeAmt);
        if (!amt || amt <= 0) return toast.error("Invalid amount");
        if (!proofRef) return toast.error("Please provide a transaction reference");
        
        setIsRecharging(true);
        const res = await agentRequestRechargeAction(amt, proofRef);
        setIsRecharging(false);
        if (res && "error" in res && res.error) toast.error(res.error as string);
        else {
            toast.success("Recharge request submitted to Admin!");
            setRechargeAmt("");
            setProofRef("");
        }
    };

    if (!session?.user) return null;

    return (
        <div className="min-h-screen bg-zinc-50 pb-20 font-sans">
            {/* Header */}
            <header className="bg-zinc-900 border-b border-black/10 pt-8 sm:pt-16 pb-24 sm:pb-32 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                       <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                           <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-primary-gold shadow-lg border-2 border-primary-gold/20 shrink-0 relative overflow-hidden">
                               {session.user.image ? <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 sm:w-10 sm:h-10 relative z-10" />}
                           </div>
                           <div className="flex flex-col text-white">
                               <span className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight line-clamp-1">{session.user.name || "Agent"}</span>
                               <span className="text-[10px] sm:text-xs font-black text-primary-gold uppercase tracking-widest flex items-center gap-2 mt-1 sm:mt-0">
                                   <ShieldCheck className="w-4 h-4" /> Official Agent Portal
                               </span>
                           </div>
                       </div>
                       <Link href="/profile" className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                           <User className="w-4 h-4" /> Go to Profile
                       </Link>
                   </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
                <div className="flex flex-col gap-6 sm:gap-8">
                    {/* Stat Cards & Recharge */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Liquidity Display */}
                        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[40px] shadow-premium border border-black/5 flex flex-col justify-between relative overflow-hidden group">
                            <div className="flex flex-col gap-2 relative z-10">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-muted">Available Liquidity</span>
                                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-600 tracking-tighter">{formatCurrency(balance)}</span>
                            </div>
                            <div className="mt-8 pt-6 border-t border-black/5 relative z-10 flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Agent Status</span>
                                <span className="text-sm font-bold text-zinc-700">Account Active & Authorized for TX Processing</span>
                            </div>
                            <Wallet className="w-48 h-48 absolute -right-10 -bottom-10 text-emerald-500/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        {/* Top-Up Widget */}
                        <div className="bg-zinc-900 text-white p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[40px] shadow-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary-gold/10 rounded-full blur-[60px] sm:blur-[80px] group-hover:bg-primary-gold/20 transition-colors duration-700" />
                            
                            <div className="flex flex-col gap-2 relative z-10 mb-6 sm:mb-8">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary-gold">System Top-Up</span>
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Need more funds?</h3>
                                <p className="text-xs font-bold text-zinc-400 leading-relaxed max-w-sm">
                                    Send mobile money or crypto to the SuperAdmin, then submit your transaction reference below to get your digital balance credited.
                                </p>
                            </div>

                            <form onSubmit={handleAgentRechargeApply} className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <div className="flex flex-col gap-3 flex-1">
                                    <input 
                                        type="number" 
                                        placeholder="Amount ($)" 
                                        value={rechargeAmt}
                                        onChange={e => setRechargeAmt(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 font-black text-xs sm:text-sm outline-none focus:border-primary-gold/50 transition-colors placeholder:text-zinc-500 hover:bg-white/10"
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Tx Hash / Phone Ref" 
                                        value={proofRef}
                                        onChange={e => setProofRef(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 font-bold text-xs sm:text-sm outline-none focus:border-primary-gold/50 transition-colors placeholder:text-zinc-500 hover:bg-white/10"
                                        required
                                    />
                                </div>
                                <button disabled={isRecharging} className="bg-primary-gold text-white px-8 py-4 rounded-2xl font-black text-[11px] sm:text-[12px] uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl shadow-primary-gold/20 disabled:opacity-50 shrink-0 flex items-center justify-center sm:h-[116px] h-[56px]">
                                    {isRecharging ? <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : "Apply"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Operational Hub */}
                    <div className="bg-white rounded-3xl sm:rounded-[40px] shadow-sm border border-black/5 overflow-hidden">
                        <AgentRequestsList />
                    </div>
                    
                    <div className="flex justify-center mt-6">
                        <Link href="/" className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-text-muted uppercase tracking-widest hover:text-primary-gold transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
