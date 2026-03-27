import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";

interface RoomBettorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: any; // Room with included bets & user data
}

export function RoomBettorsModal({ isOpen, onClose, room }: RoomBettorsModalProps) {
    if (!isOpen || !room) return null;

    // Aggregate tickets per user (since one user can buy tickets multiple times)
    const bettorsMap = new Map<string, { name: string, email: string, tickets: number }>();
    room.bets.forEach((bet: any) => {
        const uid = bet.userId;
        const exists = bettorsMap.get(uid);
        if (exists) {
            bettorsMap.set(uid, { ...exists, tickets: exists.tickets + bet.ticketsCount });
        } else {
            bettorsMap.set(uid, {
                name: bet.user.name || "Anonymous",
                email: bet.user.email || "Hidden",
                tickets: bet.ticketsCount
            });
        }
    });

    const bettors = Array.from(bettorsMap.values());

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
                    className="bg-white rounded-[32px] w-full max-w-lg p-8 relative shadow-2xl max-h-[80vh] flex flex-col"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-all"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>

                    <div className="flex flex-col gap-2 mb-8 shrink-0">
                        <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-3">
                            <Users className="w-6 h-6 text-primary-gold" /> Bettors List
                        </h2>
                        <p className="font-bold text-sm text-text-muted">
                            {room.title}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                        {bettors.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <span className="text-sm font-bold text-text-muted uppercase">No tickets sold yet.</span>
                            </div>
                        ) : (
                            bettors.map((b, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-gold/10 text-primary-gold flex items-center justify-center font-black">
                                            {b.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm text-text-main uppercase">{b.name}</span>
                                            <span className="font-bold text-[10px] text-text-muted">{b.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-black uppercase text-primary-gold">{b.tickets} Ticket(s)</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
