"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Ticket, History, Crown, Users, Settings, 
  Wallet, ChevronRight, LogOut, Copy, Check, DollarSign,
  ShieldCheck, ShieldAlert, BarChart3
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getUserDashboardDataAction, verifyCodeAction, resendVerificationCodeAction, updateUserAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ManageRoomModal } from "@/components/lottery/ManageRoomModal";
import { RoomBettorsModal } from "@/components/lottery/RoomBettorsModal";
import { UpdatePasswordModal } from "@/components/profile/UpdatePasswordModal";
import { UploadAvatarModal } from "@/components/profile/UploadAvatarModal";
import { WalletModal } from "@/components/profile/WalletModal";
import { PaymentRequestsList } from "@/components/profile/PaymentRequestsList";
import { AgentRequestsList } from "@/components/profile/AgentRequestsList";

type Tab = "profile" | "tickets" | "transactions" | "rooms" | "affiliates" | "preferences" | "requests" | "agent_requests";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { t, locale, setLocale } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [copied, setCopied] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<any>(null);

  const [isBettorsModalOpen, setIsBettorsModalOpen] = useState(false);
  const [roomForBettors, setRoomForBettors] = useState<any>(null);

  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<"deposit" | "withdraw">("deposit");

  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [vError, setVError] = useState<string | null>(null);
  const [vSuccess, setVSuccess] = useState<string | null>(null);

  const loadDashboard = () => {
    if (session?.user?.id) {
      getUserDashboardDataAction().then(res => {
        if (!res.error) setDashboardData(res);
      });
    }
  };

  useEffect(() => {
    loadDashboard();
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

  const handleVerify = async () => {
    if (!verificationCode) return;
    setVerifying(true);
    setVError(null);
    setVSuccess(null);
    const res = await verifyCodeAction(session.user?.email as string, verificationCode);
    setVerifying(false);
    if (res.error) {
      setVError(res.error);
    } else {
      setVSuccess("Email verified successfully!");
      loadDashboard();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setVError(null);
    setVSuccess(null);
    const res = await resendVerificationCodeAction(session.user?.email as string);
    setResending(false);
    if (res.error) {
      setVError(res.error);
    } else {
      setVSuccess("New verification code sent!");
    }
  };

  const TABS = [
    { id: "profile", label: "Overview", icon: User },
    { id: "tickets", label: "My Tickets", icon: Ticket },
    { id: "transactions", label: "Ledger History", icon: History },
    { id: "requests", label: "Requests Logs", icon: Wallet },
    { id: "rooms", label: "My Rooms", icon: Crown },
    { id: "affiliates", label: "Affiliates", icon: Users },
    ...(session?.user?.role && ["AGENT", "MANAGER", "ADMIN", "SUPERADMIN"].includes(session.user.role) ? [{ id: "agent_requests", label: "Client Requests", icon: Users }] : []),
    { id: "preferences", label: "Preferences", icon: Settings },
  ];

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
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-primary-gold shadow-lg overflow-hidden">
                {dashboardData.user?.image ? (
                  <img src={dashboardData.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-text-main line-clamp-1">{session.user?.name || "Player"}</span>
                  {dashboardData.user?.isVerified ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <span className="text-xs font-bold text-text-muted">{session.user?.email}</span>
                <div className={`mt-1 text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full w-fit ${dashboardData.user?.isVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {dashboardData.user?.isVerified ? 'Verified Account' : 'Unverified'}
                </div>
              </div>
            </div>

            {dashboardData.user?.blockedUntil && new Date(dashboardData.user.blockedUntil) > new Date() && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-amber-700">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Account Suspended</span>
                    </div>
                    <p className="text-[10px] font-bold text-amber-600 leading-tight">
                        Your account is currently restricted. Playing and recharging are disabled until 
                        {new Date(dashboardData.user.blockedUntil).toLocaleDateString()}.
                    </p>
                    {dashboardData.user.blockReason && (
                        <p className="text-[9px] font-black italic text-amber-500 mt-1 opacity-80">
                            Reason: "{dashboardData.user.blockReason}"
                        </p>
                    )}
                </div>
            )}

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

            {/* Admin Panel Access */}
            {session?.user?.role && ["AGENT", "MANAGER", "ADMIN", "SUPERADMIN"].includes(session.user.role) && (
              <Link 
                href="/admin"
                className="mt-6 flex items-center justify-between px-6 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.15em] bg-zinc-900 text-primary-gold hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 border border-primary-gold/20 group no-underline"
              >
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col">
                     <span>Admin Panel</span>
                     <span className="text-[8px] opacity-70">Control Center</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            
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
                    <div className="flex items-center gap-4">
                      <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">Account Overview</h1>
                      {dashboardData.user?.isVerified && (
                        <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-text-muted">Manage your personal details and wallet addresses.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-50 border border-black/5 rounded-[24px]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Balance</span>
                      <div className="text-3xl font-[950] mt-1 text-emerald-600">${dashboardData.user?.balance?.toLocaleString() || "0.00"}</div>
                      <div className="flex gap-3 mt-6">
                        <button 
                          onClick={() => { setWalletTab("deposit"); setIsWalletModalOpen(true); }}
                          className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-primary-gold transition-all"
                        >
                          Deposit
                        </button>
                        <button 
                          onClick={() => { setWalletTab("withdraw"); setIsWalletModalOpen(true); }}
                          className="flex-1 bg-white border border-black/5 text-zinc-900 py-3 rounded-xl font-black uppercase text-xs hover:border-black/20 transition-all"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-zinc-50 border border-black/5 rounded-[24px] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Security</span>
                        <div className="text-lg font-[900] mt-1 flex items-center gap-2">
                          <Check className="w-5 h-5 text-emerald-500" /> Password Secured
                        </div>
                      </div>
                      <button onClick={() => setIsUpdatePasswordOpen(true)} className="w-full bg-white border border-black/5 text-zinc-900 py-3 mt-6 rounded-xl font-black uppercase text-xs hover:bg-zinc-100 transition-all">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {dashboardData.user && !dashboardData.user.isVerified && (
                    <div className="p-8 bg-amber-50 border border-amber-200 rounded-[32px] flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-black text-amber-800 uppercase">Verify Your Email</h3>
                        <p className="text-sm font-bold text-amber-700">Participating in lotteries and creating rooms requires a verified account.</p>
                      </div>

                      {vError && <p className="text-xs font-bold text-red-500">{vError}</p>}
                      {vSuccess && <p className="text-xs font-bold text-emerald-600">{vSuccess}</p>}

                      <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                          type="text" 
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="flex-1 px-5 py-3 rounded-xl border border-amber-200 bg-white font-bold text-sm focus:outline-none focus:border-amber-400"
                        />
                        <button 
                          onClick={handleVerify}
                          disabled={verifying}
                          className="bg-amber-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
                        >
                          {verifying ? "Verifying..." : "Verify Now"}
                        </button>
                      </div>

                      <button 
                        onClick={handleResend}
                        disabled={resending}
                        className="text-xs font-black uppercase tracking-widest text-amber-600 hover:underline text-left w-fit disabled:opacity-50"
                      >
                        {resending ? "Sending..." : "Resend Code"}
                      </button>
                    </div>
                  )}

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
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary-gold mb-1">REF: {t.reference}</span>
                               <span className="font-black text-lg uppercase leading-none">{t.lottery.title}</span>
                             </div>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'WINNER' ? 'bg-emerald-500/10 text-emerald-600' : t.status === 'LOSER' ? 'bg-red-500/10 text-red-600' : 'bg-primary-gold/10 text-primary-gold'}`}>{t.status}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                             <span className="text-xs font-bold text-text-muted">Room Status: {t.lottery.status}</span>
                             <span className="text-xs font-bold text-emerald-600 uppercase">Possible Gain: {formatCurrency(t.lottery.jackpot)}</span>
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
                                 <span className="font-bold text-xs text-text-muted">{new Date(tx.createdAt).toLocaleDateString()} &middot; {tx.description}</span>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 mb-4">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">My Hosted Rooms</h1>
                      <p className="font-bold text-text-muted">Manage the lotteries you created for your community.</p>
                    </div>
                    {dashboardData.hostedRooms.length > 0 && (
                      <button 
                        onClick={() => { setRoomToEdit(null); setIsRoomModalOpen(true); }}
                        className="bg-primary-gold text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-primary-gold/20 shrink-0"
                      >
                        Create Room
                      </button>
                    )}
                  </div>
                  
                  {dashboardData.hostedRooms.length === 0 ? (
                    <div className="p-8 border border-dashed border-zinc-300 rounded-[32px] flex flex-col items-center justify-center text-center">
                      <Crown className="w-12 h-12 text-primary-gold mb-4" />
                      <span className="font-black text-lg text-text-main uppercase mb-2">Host your own lottery</span>
                      <p className="font-bold text-sm text-text-muted max-w-sm mb-6">Create a private or public room, define the rules, and earn a commission on the prize pool.</p>
                      <button 
                         onClick={() => { setRoomToEdit(null); setIsRoomModalOpen(true); }}
                         className="bg-primary-gold text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-primary-gold/20"
                      >
                        Create New Room
                      </button>
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
                          <div className="flex gap-2 w-full mt-2">
                            <button onClick={() => { setRoomToEdit(room); setIsRoomModalOpen(true); }} className="flex-1 text-center py-3 bg-white border border-black/5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all">
                              Manage Settings
                            </button>
                            <button onClick={() => { setRoomForBettors(room); setIsBettorsModalOpen(true); }} className="flex-1 text-center py-3 bg-zinc-900 border border-black/5 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-gold hover:border-primary-gold transition-all">
                              View Bettors
                            </button>
                          </div>
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

              {/* === REQUESTS TAB === */}
              {activeTab === "requests" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight">Requests History & Logs</h1>
                       <button onClick={() => { setWalletTab("deposit"); setIsWalletModalOpen(true); }} className="px-5 py-3 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-primary-gold hover:-translate-y-1 transition-all">
                           New Request
                       </button>
                    </div>
                    <p className="font-bold text-text-muted">Track your pending or processed deposits and withdrawals.</p>
                  </div>
                  <PaymentRequestsList />
                </div>
              )}

              {/* === AGENT REQUESTS TAB === */}
              {activeTab === "agent_requests" && (
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight text-emerald-600">Client Requests</h1>
                    </div>
                    <p className="font-bold text-text-muted">Manage deposits and withdrawals for users. Processing deposits will deduct from your balance.</p>
                  </div>
                  <AgentRequestsList onSuccess={loadDashboard} />
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
                    <div className="flex flex-col gap-4 p-2">
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

                    <div className="flex flex-col gap-6 mt-8 p-8 border border-black/5 rounded-[32px] bg-zinc-50/50">
                      <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Personal Info</h3>
                      
                      <div className="flex flex-col gap-4">
                        <span className="text-xs font-black text-text-muted uppercase tracking-widest">Profile Picture</span>
                        <div className="flex items-center gap-6">
                           <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-primary-gold shadow-xl overflow-hidden border-4 border-white">
                              {dashboardData.user?.image ? (
                                <img src={dashboardData.user.image} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-10 h-10" />
                              )}
                           </div>
                           <button 
                              onClick={() => setIsAvatarModalOpen(true)}
                              className="px-6 py-3 bg-white border border-black/5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-sm"
                           >
                              Change Image
                           </button>
                        </div>
                      </div>

                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const name = formData.get("name") as string;
                          const res = await updateUserAction(formData);
                          if (res.error) toast.error(res.error);
                          else {
                            await update({ name });
                            toast.success("Profile updated!");
                            loadDashboard();
                          }
                        }}
                        className="flex flex-col gap-5 mt-2"
                      >
                         <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                              name="name"
                              type="text" 
                              defaultValue={dashboardData.user?.name || ""}
                              className="w-full bg-white border border-black/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                              required
                            />
                         </div>
                         <button className="w-fit px-10 bg-zinc-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-primary-gold transition-all shadow-lg mt-2">
                            Save Changes
                         </button>
                      </form>
                    </div>

                    <div className="flex flex-col gap-4 mt-10 p-2">
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

      <ManageRoomModal 
        isOpen={isRoomModalOpen} 
        onClose={() => setIsRoomModalOpen(false)} 
        room={roomToEdit} 
        onSuccess={loadDashboard} 
      />
      <RoomBettorsModal
        isOpen={isBettorsModalOpen}
        onClose={() => setIsBettorsModalOpen(false)}
        room={roomForBettors}
      />
      <UpdatePasswordModal 
        isOpen={isUpdatePasswordOpen} 
        onClose={() => setIsUpdatePasswordOpen(false)} 
      />
      <UploadAvatarModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
        onSuccess={loadDashboard}
      />
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        initialTab={walletTab}
        onSuccess={loadDashboard}
      />
      <Footer />
    </div>
  );
}
