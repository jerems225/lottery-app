"use client";
import React, { useState, useEffect } from "react";
import { Ticket, Minus, Plus, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { buyTicketsAction } from "@/app/actions";

// Type matching Prisma Lottery with `_count` included
type LotteryDisplay = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  jackpot: number;
  endsAt: Date;
  status: string;
  isPrivate: boolean;
  maxTickets: number;
  maxTicketsPerUser: number;
  currentTicketCount: number;
  winnerId: string | null;
  winnerName?: string | null;
  _count?: { bets: number };
};

export const LotteryCard = ({ room }: { room: LotteryDisplay }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<{ d: string, h: string, m: string, s: string } | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  
  const [tickets, setTickets] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const targetDate = new Date(room.endsAt).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setIsEnded(true);
        setTimeLeft({ d: "00", h: "00", m: "00", s: "00" });
        clearInterval(interval);
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        d: d.toString().padStart(2, "0"),
        h: h.toString().padStart(2, "0"),
        m: m.toString().padStart(2, "0"),
        s: s.toString().padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.endsAt]);

  const handleBuy = async () => {
    if (!session) {
      toast.error("Please connect your account first.");
      router.push("/login");
      return;
    }

    if (tickets > room.maxTicketsPerUser) {
      toast.error(`Max ${room.maxTicketsPerUser} tickets per user.`);
      return;
    }

    setIsBuying(true);
    const toastId = toast.loading("Processing purchase...");
    
    try {
      const res: any = await buyTicketsAction(room.id, tickets);
      if (res?.error) {
        if (res.errorCode === "INSUFFICIENT_FUNDS") {
           toast.error(
             <span>Insufficient balance. <a href="/profile" className="underline font-bold">Recharge here</a>.</span>, 
             { id: toastId, duration: 5000 }
           );
        } else {
           toast.error(res.error, { id: toastId });
        }
      } else {
        toast.success(`Successfully bought ${tickets} tickets!`, { id: toastId });
        setTickets(1);
        router.refresh();
      }
    } catch (err) {
      toast.error("Network error. Try again.", { id: toastId });
    } finally {
      setIsBuying(false);
    }
  };

  const ticketsRemaining = Math.max(0, room.maxTickets - room.currentTicketCount);
  const isSoldOut = ticketsRemaining === 0;
  const isClosed = isEnded || room.status !== "ACTIVE" || isSoldOut;

  return (
    <motion.div 
      whileHover={{ y: isClosed ? 0 : -8, scale: isClosed ? 1 : 1.01 }}
      className={`flex flex-col bg-white rounded-[32px] overflow-hidden shadow-lg border border-black/5 transition-all w-[360px] shrink-0 relative ${!isClosed && "group hover:shadow-premium"}`}
    >
      {!isClosed && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-all duration-700 pointer-events-none z-10 skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      )}

      <div className="relative min-h-[240px] w-full bg-zinc-900 overflow-hidden flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-zinc-900/40" />
        
        <div className="relative z-10 flex flex-col items-center">
           <div className="bg-primary-gold text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block shadow-lg shadow-primary-gold/20">
             {room.isPrivate ? "Private Room" : "Public Draw"}
           </div>
           
           <h3 className="text-xl font-bold uppercase tracking-tight line-clamp-1 leading-tight opacity-80 mb-4">
             {room.title}
           </h3>

           <motion.div 
             animate={{ scale: [1, 1.05, 1] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white px-6 py-4 rounded-[28px] border border-white/20 shadow-2xl relative group overflow-hidden"
           >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none mb-2 opacity-90">Potential Max Win</span>
              <span className="text-3xl font-[1000] tracking-tighter leading-none block">
                {formatCurrency(room.maxTickets * room.price * 0.75)}
              </span>
           </motion.div>

           <div className="mt-4 text-[10px] font-black text-primary-gold uppercase tracking-[0.1em] bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
             Current Pot: {formatCurrency(room.jackpot)}
           </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 bg-white relative z-20">
        
        {/* State / Availability */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-bg-light rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary-gold/10 transition-all">
            <Ticket className="w-6 h-6 text-primary-gold" />
          </div>
          <span className="text-4xl font-[900] text-text-main leading-none uppercase">
            {isClosed ? "0" : ticketsRemaining.toLocaleString()}
          </span>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] mt-2">
            Tickets Remaining
          </span>
        </div>

        {/* Countdown Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Days", val: timeLeft?.d || "00" },
            { label: "Hrs", val: timeLeft?.h || "00" },
            { label: "Mins", val: timeLeft?.m || "00" },
            { label: "Secs", val: timeLeft?.s || "00" },
          ].map((item, i) => (
            <div key={i} className={`bg-zinc-50 border border-zinc-100 rounded-2xl p-3 flex flex-col items-center justify-center ${isClosed ? 'opacity-50' : ''}`}>
              <span className="text-xl font-black text-text-main font-mono leading-none">{item.val}</span>
              <span className="text-[8px] font-black text-text-light uppercase tracking-tighter mt-1">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Action Area */}
        <div className="mt-auto pt-6 border-t border-black/5 flex flex-col gap-5">
          {isClosed ? (
            <div className="flex flex-col items-center gap-4">
              {room.winnerId && room.winnerName ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary-gold/10 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary-gold" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-1">Prize Won (75%)</span>
                    <span className="text-2xl font-[950] text-emerald-600">{formatCurrency(room.jackpot * 0.75)}</span>
                  </div>
                </>
              ) : (
                <div className="bg-zinc-100 text-zinc-500 py-4 px-6 rounded-2xl text-center font-black uppercase text-sm w-full">
                  {isEnded ? "Drawing winner..." : "Sold Out"}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Ticket Input - show quantity picker only if maxTicketsPerUser > 1 */}
              {room.maxTicketsPerUser > 1 ? (
                <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-2xl border border-black/5">
                   <button 
                     onClick={() => setTickets(Math.max(1, tickets - 1))}
                     className="w-10 h-10 flex items-center justify-center bg-white border border-black/5 rounded-xl hover:bg-zinc-100 transition-all text-text-main active:scale-95"
                   >
                     <Minus className="w-4 h-4" />
                   </button>
                   <div className="flex flex-col items-center">
                     <span className="text-lg font-black font-mono leading-none">{tickets}</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Qty</span>
                   </div>
                   <button 
                     onClick={() => setTickets(Math.min(room.maxTicketsPerUser, tickets + 1))}
                     className="w-10 h-10 flex items-center justify-center bg-white border border-black/5 rounded-xl hover:bg-zinc-100 transition-all text-text-main active:scale-95"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
              ) : (
                <div className="bg-primary-gold/5 border border-primary-gold/10 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-black text-primary-gold uppercase tracking-widest">1 Entry per Player · Bet: {formatCurrency(room.price)}</span>
                </div>
              )}

              {/* Buy Button */}
              <button 
                onClick={handleBuy}
                disabled={isBuying}
                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-lg shadow-lg bg-text-main text-white hover:bg-primary-gold hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none group/btn"
              >
                <span>{isBuying ? "Processing..." : room.maxTicketsPerUser > 1 ? "Buy Tickets" : "Join Room"}</span>
                <span className="text-primary-gold group-hover/btn:text-white transition-colors">{formatCurrency(room.price * tickets)}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
