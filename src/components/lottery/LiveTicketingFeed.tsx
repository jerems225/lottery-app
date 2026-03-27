"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket } from "lucide-react";

export function LiveTicketingFeed({ tickets }: { tickets: any[] }) {
    if (!tickets || tickets.length === 0) return null;

    return (
        <div className="w-full bg-white border border-black/5 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
            <h3 className="text-sm font-[950] text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Purchases
            </h3>
            
            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {tickets.map(ticket => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-3 p-3 bg-zinc-50 border border-black/5 rounded-2xl"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-gold/10 flex items-center justify-center text-primary-gold shrink-0">
                                <Ticket className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-text-main truncate">
                                    <span className="font-black">{ticket.userName}</span> bought <span className="font-black text-primary-gold">{ticket.ticketsCount} tickets</span>
                                </p>
                                <p className="text-[9px] font-black uppercase text-text-muted truncate">
                                    in {ticket.roomName}
                                </p>
                            </div>
                            <div className="text-[9px] font-bold text-zinc-400 shrink-0 capitalize">
                                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
    );
}
