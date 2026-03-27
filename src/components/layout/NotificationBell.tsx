"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell, Trophy, Timer, DollarSign, X, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "@/app/actions/notification.actions";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-hot-toast";

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        const res = await getNotificationsAction();
        if (res.success && res.notifications) {
            setNotifications(res.notifications);
            setUnreadCount(res.unreadCount || 0);

            // Handle Toast for new notifications if the dropdown was closed
            if (!isOpen && res.unreadCount > unreadCount) {
                const latest = res.notifications[0];
                if (!latest.isRead) {
                    toast(latest.title, {
                        icon: '🔔',
                        style: {
                            borderRadius: '20px',
                            background: '#000',
                            color: '#fff',
                            fontWeight: '900',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                        },
                    });
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markRead = async (id: string) => {
        const res = await markAsReadAction(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllRead = async () => {
        const res = await markAllAsReadAction();
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "ROOM_CLOSED": return <Timer className="w-4 h-4 text-amber-500" />;
            case "WINNER_SELECTED": return <Trophy className="w-4 h-4 text-emerald-500" />;
            case "RECHARGE": return <DollarSign className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4 text-zinc-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-2xl transition-all relative",
                    isOpen ? "bg-primary-gold text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-4 w-80 bg-white border border-black/5 rounded-[32px] shadow-2xl z-[60] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-zinc-900 text-white flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-widest text-primary-gold leading-none">Notifications</span>
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">{unreadCount} unread alerts</span>
                            </div>
                            <button 
                                onClick={markAllRead}
                                className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full"
                            >
                                <Check className="w-3 h-3" /> Mark All
                            </button>
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-10 text-center font-black text-xs uppercase tracking-widest text-zinc-300">Searching updates...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-200">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-300">All clear for now</span>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id}
                                            onClick={() => markRead(notif.id)}
                                            className={cn(
                                                "p-4 border-b border-black/5 flex gap-4 hover:bg-zinc-50 transition-all cursor-pointer relative group",
                                                !notif.isRead && "bg-emerald-50/30"
                                            )}
                                        >
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-[1000] text-text-main line-clamp-1 uppercase tracking-tight">{notif.title}</span>
                                                    {!notif.isRead && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />}
                                                </div>
                                                <p className="text-[11px] font-bold text-text-muted leading-tight line-clamp-2">{notif.message}</p>
                                                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mt-1">
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            
                                            {notif.link && (
                                                <Link 
                                                    href={notif.link}
                                                    onClick={() => setIsOpen(false)}
                                                    className="absolute inset-0 opacity-0 z-10"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Link */}
                        <Link 
                            href="/profile" 
                            onClick={() => setIsOpen(false)}
                            className="p-4 bg-zinc-50 text-center border-t border-black/5 flex items-center justify-center gap-2 group"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary-gold transition-all">View All Activity</span>
                            <Eye className="w-3 h-3 text-zinc-300 group-hover:text-primary-gold transition-all" />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
