"use client";
import React from "react";
import { Send, Bell } from "lucide-react";
import { motion } from "framer-motion";

export const Newsletter = () => {
  return (
    <section className="relative py-24 px-6 lg:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-zinc-900 rounded-[48px] p-12 md:p-20 overflow-hidden shadow-2xl border border-white/5">
          {/* Decorative mesh background */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-gold/10 blur-[100px] rounded-full translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-accent-gold/5 blur-[80px] rounded-full -translate-x-1/2" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-3 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-gold/10 rounded-2xl flex items-center justify-center border border-primary-gold/20">
                  <Bell className="w-6 h-6 text-primary-gold animate-bounce" />
                </div>
                <span className="text-xs font-black text-primary-gold uppercase tracking-[0.3em]">Stay in the loop</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-[950] text-white tracking-tighter leading-[0.95] mb-6 uppercase">
                Never miss a <br/>
                <span className="gold-text-gradient">Jackpot Draw</span>
              </h2>
              <p className="text-zinc-400 font-bold text-lg max-w-xl leading-relaxed">
                Join 14,000+ players receiving early access to private rooms, exclusive bonuses, and real-time winner alerts.
              </p>
            </div>

            <div className="lg:col-span-2">
              <form className="flex flex-col gap-4">
                <div className="relative group">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-8 text-white font-bold text-lg outline-none focus:border-primary-gold focus:ring-4 focus:ring-primary-gold/10 transition-all placeholder:text-zinc-600 shadow-inner"
                  />
                </div>
                <button className="relative overflow-hidden group/btn bg-primary-gold text-white w-full py-6 rounded-[28px] font-black text-lg uppercase tracking-widest shadow-xl shadow-primary-gold/20 hover:-translate-y-1 active:scale-95 transition-all">
                  <span className="relative z-10 flex items-center justify-center gap-3 text-zinc-900">
                    Subscribe Now
                    <Send className="w-5 h-5" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-all duration-1000 pointer-events-none z-0 skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </button>
                <div className="flex items-center gap-2 justify-center mt-2 group cursor-help">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">No spam. Only gold. Unsubscribe anytime.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
