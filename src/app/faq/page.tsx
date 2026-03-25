"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronRight, Search, Zap, Shield, Wallet, Users } from "lucide-react";

const FAQ_DATA = [
  {
    category: "General",
    icon: Zap,
    questions: [
      { q: "What is BitLOT?", a: "BitLOT is a decentralized Bitcoin lottery platform that uses provably fair blockchain technology to ensure complete transparency and security for every draw." },
      { q: "How do I start playing?", a: "To start playing, simply connect your Web3 wallet (like MetaMask), ensure you have enough balance, and join any active public lottery or a private community room." },
      { q: "Are the draws really fair?", a: "Yes. Every draw is conducted using an on-chain Random Number Generator (RNG), allowing anyone to verify the result directly on the blockchain." }
    ]
  },
  {
    category: "Security",
    icon: Shield,
    questions: [
      { q: "Is my Bitcoin safe on BitLOT?", a: "We use a secure escrow system. Your funds are only locked during the duration of the lottery you join and are automatically distributed via smart logic once the winner is determined." },
      { q: "Do I need to undergo KYC?", a: "BitLOT is a privacy-first platform. No personal identity verification is required to participate in standard draws." }
    ]
  },
  {
    category: "Payments & Fees",
    icon: Wallet,
    questions: [
      { q: "Which cryptocurrencies are supported?", a: "Currently, BitLOT primarily supports Bitcoin (BTC) and major stablecoins like USDT/USDC for ticket purchases." },
      { q: "How long do payouts take?", a: "Payouts are automated. Once a draw is finalized, winnings are credited to your site balance or wallet within seconds." },
      { q: "What are the platform fees?", a: "We take a small 15-20% fee on public draws to maintain the infrastructure and reward affiliate partners. Community rooms have lower fees." }
    ]
  },
  {
    category: "Rooms & Affiliation",
    icon: Users,
    questions: [
      { q: "Can I create my own lottery room?", a: "Yes! Any registered user with a minimum balance can create a Private Community Room, set their own entry fee, and invite friends." },
      { q: "How does the affiliate program work?", a: "When you refer a friend, you earn a 2% commission on every bet they place, for life. Commissions are paid instantly." }
    ]
  }
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-black/5 rounded-[32px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 text-left group"
      >
        <span className="text-lg font-black text-text-main tracking-tight uppercase leading-snug group-hover:text-primary-gold transition-colors">
          {q}
        </span>
        <div className={`w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center transition-all ${isOpen ? 'rotate-90 bg-primary-gold text-white' : ''}`}>
           <ChevronRight className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-0 text-text-muted font-bold leading-relaxed border-t border-black/5 bg-zinc-50/30">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = FAQ_DATA.filter(cat => 
    activeCategory === "All" || cat.category === activeCategory
  ).map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const categoriesWithAll = [{ category: "All", icon: HelpCircle }, ...FAQ_DATA];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* FAQ Hero */}
        <section className="bg-bg-light py-24 border-b border-black/5 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
             <HelpCircle className="w-[800px] h-[800px] absolute -top-40 -left-40" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-8xl font-[950] text-text-main tracking-tighter uppercase mb-6 leading-none">
                Frequently Asked <br/><span className="gold-text-gradient">Questions</span>
              </h1>
              <p className="text-xl font-bold text-text-muted max-w-2xl mx-auto mb-12">
                Everything you need to know about the platform, security, and the future of Bitcoin lotteries.
              </p>

              <div className="max-w-md mx-auto relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-primary-gold transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your question..."
                  className="w-full bg-white border border-black/5 rounded-full py-5 pl-14 pr-8 text-sm font-bold shadow-lg shadow-black/5 outline-none focus:ring-4 focus:ring-primary-gold/10 focus:border-primary-gold transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Navigation (Desktop) */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <aside className="lg:sticky lg:top-32 h-fit flex flex-col gap-3">
                 <h3 className="text-[10px] font-[950] text-text-muted uppercase tracking-[0.3em] mb-4">Categories</h3>
                 {categoriesWithAll.map((cat, i) => (
                   <button 
                     key={i}
                     onClick={() => setActiveCategory(cat.category)}
                     className={`flex items-center gap-4 p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeCategory === cat.category ? 'bg-primary-gold text-white shadow-xl shadow-primary-gold/20' : 'bg-white border border-black/5 text-zinc-500 hover:bg-zinc-50 hover:translate-x-1'}`}
                   >
                     <cat.icon className="w-5 h-5" />
                     {cat.category}
                   </button>
                 ))}
                 
                 <div className="mt-12 p-8 bg-zinc-900 rounded-[32px] text-white">
                    <h4 className="text-lg font-black uppercase mb-3">Still need help?</h4>
                    <p className="text-zinc-400 text-[13px] font-bold mb-6">Our 24/7 support is here to guide you.</p>
                    <button className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all">
                       Contact Support
                    </button>
                 </div>
              </aside>

              <div className="lg:col-span-3 min-h-[400px]">
                 <AnimatePresence mode="wait">
                    {filteredCategories.length > 0 ? (
                      <motion.div 
                        key={activeCategory + searchQuery}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-16"
                      >
                        {filteredCategories.map((cat, i) => (
                          <div key={i} className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 mb-2">
                               <div className="w-10 h-10 bg-primary-gold/10 rounded-xl flex items-center justify-center text-primary-gold">
                                  <cat.icon className="w-5 h-5" />
                               </div>
                               <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight">{cat.category} Questions</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                               {cat.questions.map((q, j) => (
                                 <FAQItem key={j} q={q.q} a={q.a} />
                               ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                         <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-text-light mb-6">
                            <Search className="w-10 h-10" />
                         </div>
                         <h3 className="text-2xl font-black text-text-main mb-2">No results found</h3>
                         <p className="text-text-muted font-bold">Try searching for something else or browse categories.</p>
                      </div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
