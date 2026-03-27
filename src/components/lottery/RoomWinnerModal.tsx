import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function RoomWinnerModal({ winner, room, onClose }: { winner?: string | null, room?: any, onClose: () => void }) {
    if (!winner || !room) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 50 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[40px] w-full max-w-sm p-10 relative overflow-hidden shadow-2xl text-center border-4 border-primary-gold/30"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-all z-20"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/10 via-transparent to-primary-gold/5 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <motion.div 
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-gold to-yellow-300 flex items-center justify-center shadow-2xl shadow-primary-gold/40 border-4 border-white"
                        >
                            <Trophy className="w-12 h-12 text-white" />
                        </motion.div>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-[10px] font-black uppercase text-primary-gold tracking-widest bg-primary-gold/10 px-3 py-1 rounded-full mx-auto">
                                DRAW COMPLETED
                            </h2>
                            <h3 className="text-2xl font-[950] text-text-main mt-2 leading-none uppercase">
                                WINNER SELECTED
                            </h3>
                            <p className="font-bold text-text-muted text-xs uppercase tracking-widest mt-1">
                                {room.title}
                            </p>
                        </div>

                        <div className="bg-zinc-50 border border-black/5 rounded-2xl w-full p-4 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-1">
                                Congratulations to
                            </span>
                            <span className="text-xl font-black text-text-main uppercase">
                                {winner}
                            </span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">
                                Winning Time
                            </span>
                            <span className="text-sm font-bold text-text-main">
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
