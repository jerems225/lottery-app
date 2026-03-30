"use client";
import React from "react";
import Link from "next/link";
import { Trophy, Plus, TrendingUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FloatingParticles = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: Math.random() * 0.4 + 0.1, 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: [null, "-20%", "20%"],
            opacity: [null, 0.8, 0.2]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-1 h-1 bg-primary-gold rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[15%]"
      >
        <Trophy size={120} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[20%] right-[10%]"
      >
        <Trophy size={80} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[30%] left-[5%]"
      >
        <Trophy size={60} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[20%] right-[20%]"
      >
        <Trophy size={100} />
      </motion.div>
    </div>
  );
};

export const Hero = () => {
  const { t } = useLanguage();
  const [prizeIndex, setPrizeIndex] = React.useState(0);
  const [headlineIndex, setHeadlineIndex] = React.useState(0);

  const prizes = [
    { name: "$2,500 Cash", value: "$2,500" },
    { name: "0.15 BTC Payout", value: "$10,200" },
    { name: "5,000 USDT Jackpot", value: "$5,000" },
    { name: t("hero", "badgePrize"), value: "$1,499" },
    { name: "0.05 BTC Instant", value: "$3,400" },
  ];

  const headlines = [
    { highlight: t("hero", "titleHighlight"), part1: t("hero", "titlePart1"), part2: t("hero", "titlePart2") },
    { highlight: "Bitcoin Jackpots", part1: "Win", part2: "Every Day" },
    { highlight: "Instant Payouts", part1: "Win", part2: "Every Day" },
    { highlight: "Huge Raffles", part1: "Win", part2: "Every Day" },
  ];

  React.useEffect(() => {
    const prizeTimer = setInterval(() => {
      setPrizeIndex((prev) => (prev + 1) % prizes.length);
    }, 4000);
    const headlineTimer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => {
      clearInterval(prizeTimer);
      clearInterval(headlineTimer);
    };
  }, [prizes.length, headlines.length]);

  const slideUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const slideLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const slideRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] bg-[#0b1120] flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0b1120_100%)] opacity-60 z-0" />
      <FloatingIcons />
      <FloatingParticles />
      
      {/* Mesh Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-gold/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* Prize Badge with Automatic Slider */}
        <motion.div 
          variants={slideUp}
          className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-full px-2 py-2 pr-6 mb-12 shadow-2xl h-16 min-w-[300px]"
        >
          <div className="bg-slate-800 p-2.5 rounded-full shadow-inner flex-shrink-0">
            <Trophy className="w-6 h-6 text-primary-gold" />
          </div>
          
          <div className="flex items-center gap-3 w-full overflow-hidden">
             <div className="flex flex-col items-start leading-none flex-grow">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{t("hero", "badgeTitle")}</span>
                
                <div className="relative h-4 w-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={prizes[prizeIndex].name}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                      className="absolute inset-0 text-sm font-black text-white uppercase tracking-tight whitespace-nowrap"
                    >
                      {prizes[prizeIndex].name}
                    </motion.div>
                  </AnimatePresence>
                </div>
             </div>

             <div className="w-px h-6 bg-white/10 flex-shrink-0" />

             <div className="relative h-6 min-w-[80px] text-right">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={prizes[prizeIndex].value}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="absolute inset-0 text-[#f59e0b] font-black text-lg"
                  >
                    {prizes[prizeIndex].value}
                  </motion.span>
                </AnimatePresence>
             </div>
          </div>
        </motion.div>

        {/* Hero Title with Dynamic Headlines */}
        <motion.h1 
          variants={slideLeft}
          className="text-5xl md:text-8xl font-[900] tracking-tighter leading-[1.1] text-white mb-8 max-w-4xl min-h-[2.2em] md:min-h-[1.1em]"
        >
          {headlines[headlineIndex].part1} <br className="md:hidden" />
          <span className="relative inline-block mx-2 text-[#f59e0b] overflow-hidden align-middle">
            <AnimatePresence mode="wait">
              <motion.span
                key={headlines[headlineIndex].highlight}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {headlines[headlineIndex].highlight}
              </motion.span>
            </AnimatePresence>
          </span> <br className="md:hidden" />
          {headlines[headlineIndex].part2}
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          variants={slideRight}
          className="text-lg md:text-xl font-medium text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {t("hero", "subtitle")}
        </motion.p>

        {/* Buttons Action */}
        <motion.div 
          variants={slideUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24"
        >
          <Link href="/rooms" className="group flex items-center justify-center gap-3 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 px-8 py-4 rounded-xl font-black text-lg transition-all shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 active:scale-95 no-underline">
            <div className="bg-slate-950/20 p-1 rounded-md">
              <Plus className="w-5 h-5" />
            </div>
            {t("hero", "createRaffle")}
          </Link>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-white/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Link href="#lotteries" className="relative flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-xl font-black text-lg transition-all transform hover:-translate-y-1 active:scale-95 no-underline">
              <Search className="w-5 h-5 opacity-60" />
              {t("hero", "findDraw")}
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={slideUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 p-8 rounded-[32px] flex flex-col items-center group hover:bg-slate-800/40 transition-colors">
            <div className="bg-[#f59e0b]/10 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-[#f59e0b]" />
            </div>
            <span className="text-4xl font-black text-white mb-2">3</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("home", "statsLabelActive")}</span>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 p-8 rounded-[32px] flex flex-col items-center group hover:bg-slate-800/40 transition-colors">
            <div className="bg-primary-gold/10 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-primary-gold" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white">$98 049</span>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("home", "statsLabelValue")}</span>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 p-8 rounded-[32px] flex flex-col items-center group hover:bg-slate-800/40 transition-colors">
            <div className="bg-blue-500/10 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-4xl font-black text-white mb-2">2</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("home", "statsLabelWinners")}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
