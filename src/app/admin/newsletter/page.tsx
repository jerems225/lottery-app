"use client";
import React, { useState, useEffect } from "react";
import { 
    Mail, Users, Bell, Send, MailSearch, 
    Trash2, CheckCircle2, XCircle, Search, Filter, 
    ChevronRight, Zap, Target
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
    getSubscribersAction, 
    toggleSubscriberStatusAction, 
    sendBulkEmailAction,
    sendTargetedNotificationAction
} from "@/app/actions/newsletter.actions";

export default function NewsletterAdminPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    
    // Targeted Notif State
    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [notifCriteria, setNotifCriteria] = useState({
        minBalance: "",
        role: "USER",
        isVerified: "all"
    });
    const [isSendingNotif, setIsSendingNotif] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        const res = await getSubscribersAction();
        if (res.success) setSubscribers(res.subscribers);
        setLoading(false);
    };

    const handleToggleStatus = async (id: string) => {
        const res = await toggleSubscriberStatusAction(id);
        if (res.success) {
            toast.success("Subscriber status updated.");
            fetchSubscribers();
        } else {
            toast.error(res.error || "Failed reset status");
        }
    };

    const handleSendBulkEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject || !emailBody) return toast.error("Please fill all fields.");

        setIsSendingEmail(true);
        const toastId = toast.loading("Sending bulk emails...");
        const res = await sendBulkEmailAction(emailSubject, emailBody);
        setIsSendingEmail(false);

        if (res.error) {
            toast.error(res.error, { id: toastId });
        } else {
            toast.success(`Broadcasting complete! Sent to ${res.count} subscribers.`, { id: toastId });
            setEmailSubject("");
            setEmailBody("");
        }
    };

    const handleSendTargetedNotif = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifTitle || !notifMessage) return toast.error("Please fill all fields.");

        setIsSendingNotif(true);
        const toastId = toast.loading("Sending targeted notifications...");
        const res = await sendTargetedNotificationAction(notifCriteria, notifTitle, notifMessage);
        setIsSendingNotif(false);

        if (res.error) {
            toast.error(res.error, { id: toastId });
        } else {
            toast.success(`Success! Sent to ${res.count} matched users.`, { id: toastId });
            setNotifTitle("");
            setNotifMessage("");
        }
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight">Communications Hub</h1>
                <p className="font-bold text-text-muted">Broadcast newsletters and send targeted notifications to your user base.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 1. Bulk Email Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col gap-8"
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-primary-gold/10 rounded-2xl flex items-center justify-center text-primary-gold border border-primary-gold/20">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Email Newsletter</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Broadcasting to {subscribers.filter(s => s.isActive).length} Active Subscribers</p>
                        </div>
                    </div>

                    <form onSubmit={handleSendBulkEmail} className="flex flex-col gap-6 relative z-10">
                        <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Campaign Subject</label>
                             <input 
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Enter subject header..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                             />
                        </div>
                        <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">HTML Content</label>
                             <textarea 
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                placeholder="Write your announcement or news (HTML supported)..."
                                className="w-full bg-white/5 border border-white/5 rounded-[32px] p-6 font-bold text-sm outline-none focus:border-primary-gold transition-all min-h-[200px]"
                             />
                        </div>
                        <button 
                            disabled={isSendingEmail || subscribers.length === 0}
                            className="bg-primary-gold text-zinc-900 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-gold/10 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSendingEmail ? "Transmitting..." : "Send Global Broadcast"}
                        </button>
                    </form>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                </motion.div>

                {/* 2. Targeted Notifications Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-black/5 rounded-[40px] p-10 shadow-premium flex flex-col gap-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-900">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-text-main">Targeted App-Alerts</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Push in-app notifications based on criteria</p>
                        </div>
                    </div>

                    <form onSubmit={handleSendTargetedNotif} className="flex flex-col gap-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Min Balance</label>
                                <input 
                                    type="number"
                                    value={notifCriteria.minBalance}
                                    onChange={(e) => setNotifCriteria({...notifCriteria, minBalance: e.target.value})}
                                    placeholder="0"
                                    className="w-full bg-zinc-50 border border-black/5 rounded-xl py-3 px-4 font-bold text-xs"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Target Role</label>
                                <select 
                                    value={notifCriteria.role}
                                    onChange={(e) => setNotifCriteria({...notifCriteria, role: e.target.value})}
                                    className="w-full bg-zinc-50 border border-black/5 rounded-xl py-3 px-4 font-bold text-xs outline-none"
                                >
                                    <option value="USER">Standard User</option>
                                    <option value="AGENT">Agent</option>
                                    <option value="ADMIN">Admin Panel</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Verified Only</label>
                                <select 
                                    value={notifCriteria.isVerified}
                                    onChange={(e) => setNotifCriteria({...notifCriteria, isVerified: e.target.value})}
                                    className="w-full bg-zinc-50 border border-black/5 rounded-xl py-3 px-4 font-bold text-xs outline-none"
                                >
                                    <option value="all">Everyone</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Notif Title</label>
                             <input 
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                placeholder="Breaking Jackpot news..."
                                className="w-full bg-zinc-50 border border-black/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                             />
                        </div>
                        <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Message</label>
                             <textarea 
                                value={notifMessage}
                                onChange={(e) => setNotifMessage(e.target.value)}
                                placeholder="The actual message they see on their bell..."
                                className="w-full bg-zinc-50 border border-black/5 rounded-[24px] p-6 font-bold text-sm outline-none focus:border-primary-gold transition-all min-h-[100px]"
                             />
                        </div>
                        <button 
                            disabled={isSendingNotif}
                            className="bg-zinc-900 text-white w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                             {isSendingNotif ? "Broadcasting..." : "Send Targeted Notif"}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Subscriber List */}
            <div className="bg-white border border-black/5 rounded-[40px] p-8 lg:p-12 shadow-premium">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-text-main">Subscription List</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total database of {subscribers.length} Emails</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-black/5">
                            <tr>
                                <th className="text-left py-6 px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email Address</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                <th className="text-left py-6 px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Joined Date</th>
                                <th className="text-right py-6 px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center font-black text-text-muted uppercase text-xs tracking-widest">Hydrating subscriber list...</td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center font-black text-text-muted uppercase text-xs tracking-widest">No subscribers found yet.</td>
                                </tr>
                            ) : subscribers.map((sub) => (
                                <tr key={sub.id} className="border-b border-black/5 hover:bg-zinc-50/50 transition-all">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm text-text-main">{sub.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        {sub.isActive ? (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full w-fit">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-full w-fit">
                                                <XCircle className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Unsubscribed</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-6 px-4 text-xs font-bold text-text-muted">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <button 
                                            onClick={() => handleToggleStatus(sub.id)}
                                            className={`p-3 rounded-xl transition-all ${sub.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}
                                            title={sub.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {sub.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
