"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { createPrivateRoomAction, updatePrivateRoomAction, deletePrivateRoomAction } from "@/app/actions";

interface ManageRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room?: any; // null if creating a new room, else the room data
    onSuccess: () => void;
}

export function ManageRoomModal({ isOpen, onClose, room, onSuccess }: ManageRoomModalProps) {
    const isEdit = !!room;
    
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        let res;

        if (isEdit) {
            res = await updatePrivateRoomAction(room.id, formData);
        } else {
            res = await createPrivateRoomAction(formData);
        }

        setLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            onSuccess();
            onClose();
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this room?")) return;
        setActionLoading(true);
        setError(null);

        const res = await deletePrivateRoomAction(room.id);
        setActionLoading(false);

        if (res.error) {
            setError(res.error);
        } else {
            onSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-[32px] w-full max-w-lg p-8 relative shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-all"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>

                    <div className="flex flex-col gap-2 mb-8">
                        <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight">
                            {isEdit ? "Manage Room" : "Create New Room"}
                        </h2>
                        <p className="font-bold text-sm text-text-muted">
                            {isEdit ? "Update your room settings or delete it." : "Host a private lottery room for your community."}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-500 font-bold text-sm rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted">Room Title</label>
                            <input
                                name="title"
                                type="text"
                                defaultValue={room?.title || ""}
                                required
                                className="w-full px-5 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary-gold"
                                placeholder="E.g., Crypto Whales Weekly"
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-text-muted">Ticket Price ($)</label>
                                <input
                                    name="bet_amount"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    defaultValue={room?.price || 10}
                                    required
                                    className="w-full px-5 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary-gold"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-text-muted">Max Tickets</label>
                                <input
                                    name="max_tickets"
                                    type="number"
                                    min="2"
                                    defaultValue={room?.maxTickets || 100}
                                    required
                                    className="w-full px-5 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary-gold"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted">Duration (Minutes)</label>
                            <select
                                name="duration_minutes"
                                required
                                defaultValue={room ? Math.max(30, Math.floor((new Date(room.endsAt).getTime() - new Date(room.createdAt).getTime()) / 60000)) : 60}
                                className="w-full px-5 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary-gold appearance-none"
                            >
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                                <option value="120">2 Hours</option>
                                <option value="300">5 Hours</option>
                                <option value="1440">24 Hours</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={loading || actionLoading}
                                className="w-full bg-primary-gold text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-primary-gold/20 flex items-center justify-center disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEdit ? "Save Changes" : "Create Room"}
                            </button>

                            {isEdit && room?.currentTicketCount === 0 && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading || actionLoading}
                                    className="w-full bg-red-50 text-red-500 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all flex items-center justify-center"
                                >
                                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Delete Room
                                </button>
                            )}

                            {isEdit && room?.currentTicketCount > 0 && (
                                <p className="text-[10px] text-center font-bold text-text-muted uppercase">
                                    Tickets have been sold. Modification and deletion are locked.
                                </p>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
