"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2, Calendar, DollarSign, Users, Type, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createLotteryAction, updateLotteryAction } from "@/app/actions/admin.actions";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    room?: any; // If provided, we are editing
}

export function RoomModal({ isOpen, onClose, onSuccess, room }: RoomModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "10",
        maxTickets: "100",
        maxTicketsPerUser: "10",
        endsAt: "",
        status: "ACTIVE",
        isAutoResolution: false
    });

    useEffect(() => {
        if (room) {
            setFormData({
                title: room.title || "",
                description: room.description || "",
                price: room.price.toString(),
                maxTickets: room.maxTickets.toString(),
                maxTicketsPerUser: (room.maxTicketsPerUser || 10).toString(),
                endsAt: new Date(room.endsAt).toISOString().slice(0, 16),
                status: room.status || "ACTIVE",
                isAutoResolution: room.isAutoResolution || false
            });
        } else {
            // Default for new room
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setFormData({
                title: "",
                description: "",
                price: "50",
                maxTickets: "500",
                maxTicketsPerUser: "20",
                endsAt: tomorrow.toISOString().slice(0, 16),
                status: "ACTIVE",
                isAutoResolution: false
            });
        }
    }, [room, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = room 
                ? await updateLotteryAction(room.id, formData)
                : await createLotteryAction(formData);

            if (res.success) {
                toast.success(room ? "Room updated" : "Room created");
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Action failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm shadow-2xl"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
                >
                    <div className="p-10 border-b border-black/5 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight">
                                {room ? "Edit Lottery Room" : "Create Public Room"}
                            </h2>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                                {room ? `Managing Room ID: ${room.id}` : "Setting up official platform draw"}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-zinc-100 rounded-full transition-all">
                            <X className="w-6 h-6 text-zinc-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-3 md:col-span-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Type className="w-3 h-3 text-primary-gold" /> Room Title
                                </label>
                                <input 
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    type="text" 
                                    placeholder="Bitcoin Mega Draw"
                                    className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-3 md:col-span-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3 text-primary-gold" /> Description
                                </label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe the lottery rewards and rules..."
                                    rows={3}
                                    className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-emerald-500" /> Ticket Price ($)
                                </label>
                                <input 
                                    required
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-blue-500" /> Draw End Date
                                </label>
                                <input 
                                    required
                                    type="datetime-local"
                                    value={formData.endsAt}
                                    onChange={(e) => setFormData({...formData, endsAt: e.target.value})}
                                    className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Users className="w-3 h-3 text-purple-500" /> Max Total Tickets
                                </label>
                                <input 
                                    required
                                    type="number"
                                    value={formData.maxTickets}
                                    onChange={(e) => setFormData({...formData, maxTickets: e.target.value})}
                                    className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Users className="w-3 h-3 text-orange-500" /> Max Tickets Per User
                                </label>
                                <input 
                                    required
                                    disabled={room?.isPrivate}
                                    type="number"
                                    value={room?.isPrivate ? "1" : formData.maxTicketsPerUser}
                                    onChange={(e) => setFormData({...formData, maxTicketsPerUser: e.target.value})}
                                    className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all disabled:opacity-50"
                                />
                                {room?.isPrivate && <span className="text-[8px] font-black text-primary-gold uppercase px-2 tracking-widest">Fixed to 1 for private rooms</span>}
                            </div>

                            {/* Potential Prize Preview */}
                            <div className="md:col-span-2 p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] flex flex-col gap-2 relative overflow-hidden group">
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Potential Max Prize (75%)</span>
                                    <span className="text-2xl font-[1000] text-emerald-700 tracking-tighter">
                                        {formatCurrency(parseFloat(formData.price || "0") * parseInt(formData.maxTickets || "0") * 0.75)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-emerald-600/60 uppercase tracking-tight relative z-10 border-t border-emerald-200 mt-2 pt-2">
                                    <span>Total Pot: {formatCurrency(parseFloat(formData.price || "0") * parseInt(formData.maxTickets || "0"))}</span>
                                    <span>Creator (5%): {formatCurrency(parseFloat(formData.price || "0") * parseInt(formData.maxTickets || "0") * 0.05)}</span>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-300/30 transition-all duration-700" />
                            </div>

                            {room && (
                                <div className="flex flex-col gap-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Room Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="bg-bg-light border border-black/5 rounded-[24px] py-4 px-6 font-black text-xs uppercase tracking-widest outline-none focus:border-primary-gold transition-all"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            )}

                             {/* Draw Resolution Mode */}
                             <div className="md:col-span-2 mt-2 p-8 bg-zinc-50 border border-black/5 rounded-[40px] flex items-center justify-between group">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-[950] text-text-main uppercase tracking-[0.2em] mb-1">Resolution Mode</span>
                                    <p className="text-[10px] font-bold text-text-muted uppercase leading-relaxed max-w-[320px]">
                                        {formData.isAutoResolution 
                                            ? "AUTOMATIC: Draw triggered instantly upon expiration." 
                                            : "MANUAL: Admin picks winner after expiration."}
                                    </p>
                                </div>
                                <div 
                                    onClick={() => setFormData({...formData, isAutoResolution: !formData.isAutoResolution})}
                                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 relative ${formData.isAutoResolution ? 'bg-primary-gold shadow-lg shadow-primary-gold/20' : 'bg-zinc-200'}`}
                                >
                                    <motion.div 
                                        animate={{ x: formData.isAutoResolution ? 24 : 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-sm"
                                    />
                                </div>
                             </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-black/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] text-text-muted hover:bg-zinc-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-[2] bg-zinc-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 hover:bg-primary-gold transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {room ? "Save Changes" : "Launch Public Room"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
