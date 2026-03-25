"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Ticket, History, Crown, Users, Settings, 
  Wallet, ChevronRight, LogOut, Copy, Check, DollarSign 
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getUserDashboardDataAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Tab = "profile" | "tickets" | "transactions" | "rooms" | "affiliates" | "preferences";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [copied, setCopied] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.id) {
      getUserDashboardDataAction().then(res => {
        if (!res.error) setDashboardData(res);
      });
    }
  }, [session]);

  // Fallback while loading session
  if (!session || !dashboardData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const TABS = [
    { id: "profile", label: "Overview", icon: User },
    { id: "tickets", label: "My Tickets", icon: Ticket },
    { id: "transactions", label: "History", icon: History },
    { id: "rooms", label: "My Rooms", icon: Crown },
    { id: "affiliates", label: "Affiliates", icon: Users },
    { id: "preferences", label: "Preferences", icon: Settings },
  ] as const;

  const copyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-12 lg:py-20 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar Menu */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white border border-black/5 rounded-[32px] p-6 shadow-premium sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-primary-gold shadow-lg">
                <User className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-text-main line-clamp-1">{session.user?.name || "Player"}</span>
                <span className="text-xs font-bold text-text-muted">{session.user?.email}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                      isActive 
                        ? "bg-zinc-900 text-white shadow-xl shadow-black/10" 
                        : "text-text-muted hover:bg-zinc-50 hover:text-text-main"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? "text-primary-gold" : ""}`} />
                      {tab.label}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-black/5">
              <button className="flex items-center gap-3 w-full px-4 py-4 font-black text-sm uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-black/5 rounded-[40px] p-8 lg:p-12 shadow-sm min-h-[600px]"
            >
              
              {/* === PROFILE TAB === */}
              {activeTab === "profile" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">Account Overview</h1>
                    <p className="font-bold text-text-muted">Manage your personal details and wallet addresses.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-50 border border-black/5 rounded-[24px]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Balance</span>
                      <div className="text-3xl font-[950] mt-1 text-emerald-600">${session.user.balance?.toLocaleString() || "0.00"}</div>
                      <div className="flex gap-3 mt-6">
                        <button className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-primary-gold transition-all">Deposit</button>
                        <button className="flex-1 bg-white border border-black/5 text-zinc-900 py-3 rounded-xl font-black uppercase text-xs hover:border-black/20 transition-all">Withdraw</button>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-zinc-50 border border-black/5 rounded-[24px] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Security</span>
                        <div className="text-lg font-[900] mt-1 flex items-center gap-2">
                          <Check className="w-5 h-5 text-emerald-500" /> Password Secured
                        </div>
                      </div>
                      <button className="w-full bg-white border border-black/5 text-zinc-900 py-3 mt-6 rounded-xl font-black uppercase text-xs hover:bg-zinc-100 transition-all">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <h3 className="text-xl font-black text-text-main uppercase">Linked Wallets</h3>
                    <div className="flex items-center justify-between p-5 border border-black/5 rounded-[20px]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F6851B]/10 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-[#F6851B]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm uppercase">MetaMask</span>
                          <span className="font-bold text-xs text-text-muted">0x...</span>
                        </div>
                      </div>
                      <button className="text-xs font-black uppercase tracking-widest text-primary-gold hover:underline">Connect</button>
                    </div>
                  </div>
                </div>
              )}

              {/* === TICKETS TAB === */}
              {activeTab === "tickets" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">My Tickets</h1>
                    <p className="font-bold text-text-muted">History of your lottery participations and results.</p>
                  </div>
                  
                  {dashboardData.tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <Ticket className="w-8 h-8 text-zinc-300" />
                      </div>
                      <span className="font-black text-lg text-text-main uppercase">No active tickets</span>
                      <p className="font-bold text-sm text-text-muted mt-2 max-w-sm">Join a lottery room to view your tickets and track the live draw.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.tickets.map((t: any) => (
                         <div key={t.id} className="p-5 border border-black/5 rounded-[24px] bg-zinc-50 flex flex-col justify-between">
                           <div className="flex justify-between items-start mb-4">
                             <span className="font-black text-lg uppercase leading-none">{t.lottery.title}</span>
                             <span className="bg-primary-gold/10 text-primary-gold px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{t.status}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                             <span className="text-sm font-bold text-text-muted">Tickets Owned: {t.ticketsCount}</span>
                             <span className="text-sm font-bold text-emerald-600">Cost: {formatCurrency(t.amount)}</span>
                           </div>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* === TRANSACTIONS TAB === */}
              {activeTab === "transactions" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">Transaction History</h1>
                    <p className="font-bold text-text-muted">Your deposits, withdrawals, and winnings.</p>
                  </div>
                  {dashboardData.transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <History className="w-8 h-8 text-zinc-300" />
                      </div>
                      <span className="font-black text-lg text-text-main uppercase">No transactions yet</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                       {dashboardData.transactions.map((tx: any) => (
                         <div key={tx.id} className="flex items-center justify-between p-4 border border-black/5 rounded-[20px] bg-white hover:bg-zinc-50 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                                 <DollarSign className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-black text-sm uppercase">{tx.type}</span>
                                 <span className="font-bold text-xs text-text-muted">{new Date(tx.date).toLocaleDateString()} &middot; {tx.description}</span>
                              </div>
                            </div>
                            <span className={`font-black text-lg ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                            </span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}

              {/* === ROOMS TAB === */}
              {activeTab === "rooms" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">My Hosted Rooms</h1>
                    <p className="font-bold text-text-muted">Manage the lotteries you created for your community.</p>
                  </div>
                  
                  {dashboardData.hostedRooms.length === 0 ? (
                    <div className="p-8 border border-dashed border-zinc-300 rounded-[32px] flex flex-col items-center justify-center text-center">
                      <Crown className="w-12 h-12 text-primary-gold mb-4" />
                      <span className="font-black text-lg text-text-main uppercase mb-2">Host your own lottery</span>
                      <p className="font-bold text-sm text-text-muted max-w-sm mb-6">Create a private or public room, define the rules, and earn a commission on the prize pool.</p>
                      <Link href="/rooms" className="bg-primary-gold text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-primary-gold/20">
                        Create New Room
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.hostedRooms.map((room: any) => (
                        <div key={room.id} className="p-6 border border-black/5 rounded-[24px] bg-zinc-50 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <span className="font-black text-lg uppercase">{room.title}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${room.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-200 text-zinc-500'}`}>
                              {room.status}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-bold text-text-muted">
                              <span>Tickets Sold:</span>
                              <span className="text-text-main">{room.currentTicketCount} / {room.maxTickets}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-text-muted">
                              <span>Jackpot Pool:</span>
                              <span className="text-emerald-600">{formatCurrency(room.jackpot)}</span>
                            </div>
                          </div>
                          <Link href={`/rooms/${room.id}`} className="mt-2 text-center py-3 bg-white border border-black/5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all">
                            Manage Room
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* === AFFILIATES TAB === */}
              {activeTab === "affiliates" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">Affiliate Program</h1>
                    <p className="font-bold text-text-muted">Invite friends and earn up to 5% commission on their played tickets forever.</p>
                  </div>

                  <div className="bg-zinc-900 border border-black/5 rounded-[32px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/20 blur-[80px] rounded-full" />
                    <div className="relative z-10 flex flex-col gap-6">
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Your Referral Link</span>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl py-4 px-5 font-bold text-sm text-zinc-300 font-mono truncate">
                          {typeof window !== 'undefined' ? window.location.origin : ''}/ref/{session.user.id}
                        </div>
                        <button 
                          onClick={() => copyRef(`${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${session.user.id}`)}
                          className="shrink-0 w-14 h-14 bg-white text-zinc-900 rounded-2xl flex items-center justify-center hover:bg-primary-gold hover:text-white transition-all shadow-lg"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { l: "Total Referrals", v: dashboardData.referrals.length.toString() },
                      { l: "Active Friends", v: dashboardData.referrals.filter((u: any) => u.balance > 0).length.toString() },
                      { l: "Total Earnings", v: "$0.00" }, // Mocked for now until commission logic is in DB
                      { l: "Commission Rate", v: "5%" },
                    ].map((s, i) => (
                      <div key={i} className="bg-zinc-50 border border-black/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{s.l}</span>
                        <span className="text-xl font-black text-text-main">{s.v}</span>
                      </div>
                    ))}
                  </div>

                  {dashboardData.referrals.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-black text-text-main uppercase tracking-widest">My Referrals</h3>
                      <div className="flex flex-col gap-2">
                        {dashboardData.referrals.map((ref: any) => (
                          <div key={ref.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-black text-[10px] text-text-muted">
                                {ref.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-xs">{ref.name || 'Anonymous'}</span>
                                <span className="text-[10px] font-bold text-text-muted">Joined {new Date(ref.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === PREFERENCES TAB === */}
              {activeTab === "preferences" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">Preferences</h1>
                    <p className="font-bold text-text-muted">Customize your experience on the platform.</p>
                  </div>

                  <div className="flex flex-col gap-6 max-w-xl">
                    <div className="flex flex-col gap-4">
                      <span className="text-sm font-black text-text-main uppercase tracking-widest">Language</span>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setLocale("en")}
                          className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-3 ${locale === "en" ? "border-primary-gold bg-primary-gold/5" : "border-black/5 hover:border-black/20"}`}
                        >
                          <span className="text-2xl">🇺🇸</span> English
                        </button>
                        <button 
                          onClick={() => setLocale("fr")}
                          className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-3 ${locale === "fr" ? "border-primary-gold bg-primary-gold/5" : "border-black/5 hover:border-black/20"}`}
                        >
                          <span className="text-2xl">🇫🇷</span> Français
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-6">
                      <span className="text-sm font-black text-text-main uppercase tracking-widest">Notifications</span>
                      {[
                        { id: "draws", label: "Draws & Results", desc: "Get notified when a room you participated in announces results." },
                        { id: "payouts", label: "Payouts & Transfers", desc: "Receive alerts for successful deposits and withdrawals." },
                        { id: "marketing", label: "News & Promos", desc: "Occasional updates about special lotteries and brand news." }
                      ].map(notif => (
                        <div key={notif.id} className="flex items-center justify-between p-5 border border-black/5 rounded-[20px] bg-zinc-50">
                          <div className="flex flex-col mr-6">
                            <span className="font-black text-sm uppercase">{notif.label}</span>
                            <span className="font-bold text-xs text-text-muted mt-1">{notif.desc}</span>
                          </div>
                          {/* Mock Toggle */}
                          <div className="w-12 h-6 bg-emerald-500 rounded-full shrink-0 relative cursor-pointer">
                            <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </div>
  );
}
