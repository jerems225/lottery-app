"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Share2, Users, Wallet, TrendingUp, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getUserDashboardDataAction } from "@/app/actions";
import { toast } from "react-hot-toast";

export default function AffiliationPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      getUserDashboardDataAction().then(res => {
        setData(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [session]);

  const copyLink = () => {
    if (!session?.user) return;
    const link = `${window.location.origin}/ref/${session.user.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const referralCount = data?.referrals?.length || 0;
  const activeReferrals = data?.referrals?.filter((u: any) => u.balance > 0).length || 0;

  return (
    <div className="flex flex-col min-h-screen font-outfit bg-bg-light">
      <Navbar />

      <main className="flex-1 py-24 px-6 lg:px-10 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Decorative Background Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none z-0">
           <TrendingUp className="w-[800px] h-[800px] absolute -top-20 -right-20 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-black text-text-main tracking-tight uppercase mb-6">
            Affiliate Program
          </h1>
          <p className="text-xl font-bold text-text-muted leading-relaxed">
            Invite your network to join BitLOT and earn commissions on their platform activity. Secure, transparent, and direct.
          </p>
        </div>

        {/* Hero Section Card */}
        <div className="glass-panel p-8 lg:p-16 rounded-[48px] shadow-premium bg-gradient-to-br from-white to-bg-light/50 border-white/60 mb-20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-gold via-secondary-gold to-primary-gold" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className="text-3xl font-black text-text-main uppercase mb-4 tracking-tight">Your Referral Link</h2>
              <p className="text-text-muted font-bold mb-8 leading-relaxed">
                BitLOT shares profits with the community. Every time an affiliate plays, you receive <span className="text-primary-gold font-black underline decoration-primary-gold/30">part of our fees</span> instantly.
              </p>
              
              {session?.user ? (
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 flex items-center bg-zinc-50 border border-black/5 rounded-2xl px-6 py-5 font-black text-text-main font-mono overflow-auto select-all truncate text-sm">
                    {window.location.origin}/ref/{session.user.id}
                  </div>
                  <button 
                    onClick={copyLink}
                    className="bg-text-main text-white px-8 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary-gold hover:-translate-y-1 transition-all shadow-xl shadow-black/10"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-zinc-100 rounded-2xl text-center border-2 border-dashed border-zinc-300">
                  <p className="font-black text-zinc-400 uppercase tracking-widest text-xs">Login to get your referral link</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-bg-light p-8 rounded-3xl border border-white flex flex-col items-center justify-center text-center hover:scale-105 transition-all">
                <span className="text-4xl font-black text-primary-gold mb-2">{referralCount}</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total Referrals</span>
              </div>
              <div className="bg-zinc-900 p-8 rounded-3xl border border-white flex flex-col items-center justify-center text-center hover:scale-105 transition-all text-white">
                <span className="text-4xl font-black text-white mb-2">{activeReferrals}</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Active Friends</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="mb-20">
           <h2 className="text-2xl font-black text-text-main uppercase tracking-tight mb-8">Recent Affiliate Activity</h2>
           <div className="bg-white border border-black/5 rounded-[32px] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-bg-light border-b border-black/5">
                       <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">User</th>
                       <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                       <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-black/5">
                    {data?.referrals?.length > 0 ? (
                      data.referrals.map((user: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50 transition-all font-bold text-sm">
                           <td className="px-8 py-6 text-text-main">{user.name || "Anonymous"}</td>
                           <td className="px-8 py-6 text-text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                           <td className="px-8 py-6 text-right">
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-text-muted font-bold text-sm italic">
                          {session ? "No referrals yet. Share your link to start earning!" : "Sign in to see your referrals"}
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="max-w-4xl mx-auto mb-20 text-center">
          <h2 className="text-3xl font-black text-text-main uppercase mb-10">Commission Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white border border-black/5 rounded-[32px] shadow-sm">
               <div className="text-4xl font-black text-primary-gold mb-2">2%</div>
               <span className="text-xs font-black uppercase text-text-muted tracking-widest">Direct Commission</span>
               <p className="text-[11px] font-bold text-text-muted mt-3">Earn 2% of every ticket value your friends purchase across all rooms.</p>
            </div>
            <div className="p-8 bg-zinc-900 border border-black/5 rounded-[32px] shadow-sm text-white">
               <div className="text-4xl font-black text-white mb-2">5%</div>
               <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Creator Reward</span>
               <p className="text-[11px] font-bold text-zinc-500 mt-3">Create private rooms and host games to receive 5% of the total prize pool automatically.</p>
            </div>
            <div className="p-8 bg-white border border-black/5 rounded-[32px] shadow-sm">
               <div className="text-4xl font-black text-primary-gold mb-2">∞</div>
               <span className="text-xs font-black uppercase text-text-muted tracking-widest">Lifetime Rewards</span>
               <p className="text-[11px] font-bold text-text-muted mt-3">Once a friend joins through your link, they are linked to you forever.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

