"use client";
import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./Sidebar";
import { User, Bell, Search, Menu, X, ShieldCheck, Zap } from "lucide-react";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "@/app/actions/notification.actions";
import { getLatestBalanceAction } from "@/app/actions";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export function AdminLayoutWrapper({ 
    children, 
    session 
}: { 
    children: React.ReactNode; 
    session: any;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [balance, setBalance] = useState<number>(session.user.balance || 0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    
    const roleColor = session.user.role === "SUPERADMIN" ? "text-amber-600" : session.user.role === "ADMIN" ? "text-primary-gold" : "text-emerald-600";
    
    const fetchAdminData = async () => {
        const balRes = await getLatestBalanceAction();
        if (balRes.success && typeof balRes.balance === "number") {
            setBalance(balRes.balance);
        }
        const notifRes = await getNotificationsAction();
        if (notifRes.success && notifRes.notifications) {
            setNotifications(notifRes.notifications);
            setUnreadCount(notifRes.unreadCount || 0);
        }
    };

    useEffect(() => {
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 60000); // Reduced frequency (60s)
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await markAsReadAction(id);
        fetchAdminData();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsReadAction();
        fetchAdminData();
        setIsNotifOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-bg-light">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} role={session.user.role} />
            
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-zinc-50/50 relative">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-black/5 px-6 lg:px-16 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-3 bg-zinc-100 rounded-xl text-zinc-900 lg:hidden hover:bg-zinc-200 transition-all"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden sm:flex items-center gap-3 bg-zinc-100 border border-black/5 rounded-2xl px-5 py-3 w-64 xl:w-80 shadow-sm">
                            <Search className="w-5 h-5 text-zinc-400" />
                            <input 
                                type="text" 
                                placeholder="Search everything..." 
                                className="bg-transparent border-none outline-none font-bold text-xs text-text-main w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        {/* Live Balance */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            <span className="font-black text-sm text-emerald-600 tracking-tight">{formatCurrency(balance, "en")}</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="hidden sm:flex p-3 rounded-2xl bg-zinc-100 text-zinc-500 hover:text-primary-gold relative transition-all shadow-sm"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 flex w-3 h-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full w-3 h-3 bg-amber-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-3 w-80 bg-white border border-black/10 rounded-[24px] shadow-2xl z-50 overflow-hidden flex flex-col"
                                        >
                                            <div className="flex items-center justify-between p-4 border-b border-black/5 bg-zinc-50/50">
                                                <span className="font-black text-xs uppercase tracking-widest text-text-main">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-primary-gold hover:underline">
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-col max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center flex flex-col items-center gap-2">
                                                        <Bell className="w-8 h-8 text-zinc-200" />
                                                        <span className="text-xs font-bold text-zinc-400">All caught up!</span>
                                                    </div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <button 
                                                            key={n.id}
                                                            onClick={async () => {
                                                                if (!n.isRead) await handleMarkAsRead(n.id);
                                                            }}
                                                            className={`p-4 border-b border-black/5 flex flex-col items-start gap-1 text-left transition-all hover:bg-zinc-50 ${!n.isRead ? 'bg-primary-gold/5' : ''}`}
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <span className="text-[11px] font-black uppercase tracking-widest text-text-main">{n.title}</span>
                                                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-gold" />}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-text-muted leading-tight mt-1">{n.message}</p>
                                                            <span className="text-[9px] font-black text-zinc-400 mt-2">{new Date(n.createdAt).toLocaleString()}</span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <div className="flex items-center gap-3 lg:gap-4 lg:pl-6 lg:border-l lg:border-black/5 group cursor-pointer">
                            <div className="hidden xs:flex flex-col text-right">
                                <span className="text-xs font-black text-text-main uppercase tracking-[0.05em] line-clamp-1">{session.user.name}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${roleColor}`}>{session.user.role}</span>
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-primary-gold shadow-lg overflow-hidden border-2 border-zinc-200 relative">
                                {session.user.image ? (
                                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 lg:w-6 lg:h-6" />
                                )}
                                {session.user.isVerified && (
                                    <div className="absolute top-0 right-0 p-0.5 bg-white rounded-bl-lg shadow-sm">
                                        <ShieldCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-emerald-500 fill-emerald-50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <section className="p-6 lg:p-10 flex flex-col gap-10">
                    {children}
                </section>
            </main>
        </div>
    );
}
