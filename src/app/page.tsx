"use client";
import React, { useRef, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";
import { LotteryCard } from "@/components/lottery/LotteryCard";
import { ChevronLeft, ChevronRight, ShieldCheck, Dices, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getActiveRoomsAction } from "@/app/actions";

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Dices,
  Zap
};

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const stats = t("home", "stats");
  
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    getActiveRoomsAction().then(res => setRooms(res));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <Hero />

        {/* Live Activity & Trust Badges */}
        <section className="bg-bg-white border-y border-black/5 py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="flex items-center gap-12">
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-main line-height-none tracking-tight">14.2K</span>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{stats?.activePlayers || "Active Players"}</span>
               </div>
               <div className="w-px h-10 bg-black/5 hidden md:block" />
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-main tracking-tight line-height-none">$4.5M+</span>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{stats?.payouts || "Total Payouts"}</span>
               </div>
               <div className="w-px h-10 bg-black/5 hidden md:block" />
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-main tracking-tight line-height-none">99.9%</span>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{stats?.uptime || "Uptime"}</span>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex -space-x-3 overflow-hidden">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                  ))}
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{stats?.liveActivity || "Live Activity"}</span>
                  </div>
                  <span className="text-xs font-bold text-text-muted">{stats?.latestWin || "Alex just won 0.05 BTC in Room #4928"}</span>
               </div>
            </div>
          </div>
        </section>

        {/* Active Lotteries Section */}
        <section id="lotteries" className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10 overflow-hidden">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="flex flex-col text-left">
              <h2 className="text-4xl md:text-6xl font-black text-text-main tracking-tight mb-4 uppercase">
                {t("home", "activeLotteries")}
              </h2>
              <p className="text-lg font-bold text-text-muted max-w-xl">
                {t("home", "activeLotteriesDesc")}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => scroll("left")}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-black/5 text-zinc-600 shadow-md hover:bg-zinc-900 hover:text-white transition-all group"
              >
                <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-all" />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-black/5 text-zinc-600 shadow-md hover:bg-zinc-900 hover:text-white transition-all group"
              >
                <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-all" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-10 overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory px-4 md:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {rooms.length === 0 ? (
              <div className="w-full text-center py-20 text-zinc-400 font-bold">
                No active lotteries at the moment.
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="snap-center">
                  <LotteryCard room={room} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Brand Features */}
        <section className="py-32 bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-gold/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {((t("home", "features") || []) as { title: string, desc: string, icon: string }[]).map((f, i) => {
                  const IconComp = ICON_MAP[f.icon] || ShieldCheck;
                  return (
                    <div key={i} className="flex flex-col items-start gap-6">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary-gold">
                        <IconComp size={32} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{f.title}</h3>
                        <p className="text-zinc-400 font-bold leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
