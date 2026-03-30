"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getAndClearWinNotificationsAction } from "@/app/actions/lottery.actions";
import { getLatestBalanceAction } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Polling interval: 60 seconds (synced with notifications to balance load)
const SYNC_INTERVAL = 60000;

export function GlobalWinCelebrator() {
    const { data: session, update } = useSession();
    const [wins, setWins] = useState<any[]>([]);
    const isFetchingRef = useRef(false);
    const lastBalanceRef = useRef<number | undefined>(undefined);

    // Store the session user id in a ref to avoid re-creating the effect 
    const userIdRef = useRef(session?.user?.id);
    useEffect(() => {
        userIdRef.current = session?.user?.id;
    }, [session?.user?.id]);

    const checkData = useCallback(async () => {
        if (isFetchingRef.current || !userIdRef.current) return;
        isFetchingRef.current = true;

        try {
            const [winsRes, balanceRes] = await Promise.all([
                getAndClearWinNotificationsAction(),
                getLatestBalanceAction()
            ]);

            if (winsRes.success && winsRes.wins && winsRes.wins.length > 0) {
                setWins(winsRes.wins);
            }

            if (balanceRes.success && balanceRes.balance !== undefined && balanceRes.balance !== lastBalanceRef.current) {
                lastBalanceRef.current = balanceRes.balance;
                await update({ balance: balanceRes.balance });
            }
        } catch (err) {
            console.error("Sync error", err);
        } finally {
            isFetchingRef.current = false;
        }
    }, [update]);
    
    const checkDataRef = useRef(checkData);
    useEffect(() => {
        checkDataRef.current = checkData;
    });

    useEffect(() => {
        if (!userIdRef.current) return;
        
        // Initialize balance ref
        lastBalanceRef.current = session?.user?.balance; // Fixed initialization safely
        
        // Initial check only (no real-time polling)
        checkDataRef.current();
        
    }, [userIdRef.current]);
    
    const dismissFirst = () => {
        setWins(prev => prev.slice(1));
    };

    if (wins.length === 0) return null;
    
    // Grab the first unread win to show
    const currentWin = wins[0];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={dismissFirst}>
                
                {/* Simulated Confetti effect with Framer Motion */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ 
                            x: typeof window !== "undefined" ? window.innerWidth / 2 : 0, 
                            y: typeof window !== "undefined" ? window.innerHeight + 100 : 0,
                            scale: 0,
                            rotate: 0,
                        }}
                        animate={{ 
                            x: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerWidth : 1000), 
                            y: -Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                            scale: Math.random() * 1.5 + 0.5,
                            rotate: Math.random() * 360,
                            opacity: [1, 1, 0]
                        }}
                        transition={{ 
                            duration: Math.random() * 2 + 2, 
                            ease: "easeOut"
                        }}
                        className={`absolute w-3 h-3 ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-primary-gold'][Math.floor(Math.random() * 6)]}`}
                        style={{ borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
                    />
                ))}

                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[40px] w-full max-w-lg p-10 relative overflow-hidden shadow-[0_0_100px_rgba(252,211,77,0.4)] text-center border-4 border-primary-gold"
                >
                    <button
                        onClick={dismissFirst}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-all z-20"
                    >
                        <X className="w-6 h-6 text-zinc-500" />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-br from-primary-gold/20 via-transparent to-primary-gold/10 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center gap-6 mt-4">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary-gold to-yellow-300 flex items-center justify-center shadow-2xl shadow-primary-gold/50 border-4 border-white"
                        >
                            <Trophy className="w-16 h-16 text-white" />
                        </motion.div>

                        <div className="flex flex-col gap-2">
                            <h2 className="text-4xl font-[950] text-text-main leading-none uppercase tracking-tighter">
                                YOU WON!
                            </h2>
                            <p className="font-black text-primary-gold text-lg uppercase tracking-widest mt-1">
                                {currentWin.title}
                            </p>
                        </div>

                        <div className="bg-zinc-900 text-white rounded-[24px] w-full p-8 flex flex-col items-center relative overflow-hidden mt-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
                            <span className="text-xs uppercase font-black tracking-widest text-zinc-400 mb-2">
                                Prize Added to Wallet
                            </span>
                            <span className="text-xl font-bold text-center leading-snug">
                                {currentWin.message}
                            </span>
                        </div>
                        
                        <button 
                            onClick={dismissFirst}
                            className="w-full py-5 bg-primary-gold text-black rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all mt-2"
                        >
                            Awesome!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
