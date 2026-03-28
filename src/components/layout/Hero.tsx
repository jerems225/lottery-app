"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-6 lg:px-20 py-20 lg:py-40 text-center overflow-hidden min-h-[90vh] flex flex-col justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none z-0">
         <Trophy className="w-[800px] h-[800px] absolute -top-20 -right-20 rotate-12" />
      </div>

      {/* Dynamic Animated Flowing Background (Mesh Gradient Feel) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, -50, 0], y: [0, 100, -100, 0], scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary-gold opacity-[0.07] blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 100, 0], y: [0, -50, 50, 0], scale: [1, 1.3, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] rounded-full bg-dark-gold opacity-[0.05] blur-[130px]" 
        />
        <motion.div 
          animate={{ x: [0, 80, -80, 0], y: [0, 80, -80, 0], scale: [1, 1.1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute top-[40%] left-[40%] w-[450px] h-[450px] rounded-full bg-accent-gold opacity-[0.04] blur-[110px]" 
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(48px,12vw,140px)] font-[950] tracking-tighter leading-[0.85] mb-8 bg-gradient-to-br from-zinc-900 via-primary-gold to-zinc-800 bg-[length:200%_auto] bg-clip-text text-transparent animate-[textShimmer_5s_linear_infinite,titleGlow_6s_ease-in-out_infinite]"
        >
          {t("hero", "title")}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl font-semibold text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          {t("hero", "subtitle")}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="#lotteries" className="bg-gradient-to-br from-primary-gold to-dark-gold text-white px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-primary-gold/25 animate-[pulseGold_2s_infinite] hover:-translate-y-1 transition-all inline-flex items-center justify-center">
            {t("hero", "playNow")}
          </Link>
          <Link href="/rooms" className="flex items-center justify-center gap-2 px-10 py-5 rounded-full border border-black/5 bg-white font-black text-lg text-text-main shadow-lg hover:border-primary-gold hover:text-primary-gold transition-all">
            {t("hero", "viewRooms")}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative group max-w-4xl mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-primary-gold/20 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-all" />
          
          <div className="relative bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white/80 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop" 
              alt="Crypto Future" 
              className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Floating Elements */}
          <motion.img 
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src="https://cdn-icons-png.flaticon.com/512/825/825540.png " 
            className="absolute -top-10 -left-10 w-24 h-24 hidden md:block object-contain"
          />
          <motion.img 
            animate={{ y: [0, -30, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            src="https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png" 
            className="absolute -bottom-10 -right-10 w-28 h-28 hidden md:block object-contain"
          />

          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-10 glass-panel p-6 rounded-3xl flex items-center gap-4 bg-white/70 backdrop-blur-2xl shadow-2xl border border-white/40"
          >
            <div className="bg-primary-gold p-3 rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black text-text-muted uppercase tracking-widest">Latest Jackpot</span>
              <strong className="text-2xl font-black text-text-main animate-[glowText_2s_infinite_alternate]">14.5 BTC</strong>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
