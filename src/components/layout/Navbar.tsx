"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Wallet, Menu, X, ChevronDown, User, LogOut, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatNumber } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { NotificationBell } from "./NotificationBell";

export const Navbar = () => {
  const { locale, setLocale, t } = useLanguage();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-lg border-b border-black/5 animate-fadeInUp">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="flex flex-col">
            <span className="text-2xl font-black gold-text-gradient tracking-tighter uppercase leading-none">
              BitLOT
            </span>
            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase mt-1">
              Bitcoin Lottery Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["Home", "Rooms", "Affiliation", "FAQ"].map((item) => {
            const href = item === "Home" ? "/" : `/${item.toLowerCase()}`;
            const isActive = pathname === href;
            return (
              <Link
                key={item}
                href={href}
                className={cn(
                  "text-[13px] font-semibold transition-all relative group py-2 uppercase tracking-widest",
                  isActive ? "text-primary-gold" : "text-zinc-600 hover:text-primary-gold"
                )}
              >
                {t("nav", item)}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-primary-gold transition-all rounded-full",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              {/* Notifications */}
              <NotificationBell />

              {/* User Balance */}
              <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2 gap-3 mr-2 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-emerald-600 font-black text-xs">$</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">{t("nav", "Balance")}</span>
                  <span className="text-sm font-black text-text-main leading-none">
                    {formatNumber(session.user.balance || 0, locale)}
                  </span>
                </div>
              </div>

              <Link 
                href="/profile"
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 text-text-muted hover:text-primary-gold hover:bg-primary-gold/10 transition-all overflow-hidden relative"
                title="Profile"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {session.user.isVerified && (
                  <div className="absolute top-0 right-0 p-0.5 bg-white rounded-bl-lg">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 fill-emerald-50" />
                  </div>
                )}
              </Link>

              <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
              title={t("nav", "Sign Out")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <Link href="/login?callbackUrl=/rooms" className="wallet-btn flex items-center gap-2 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-primary-gold hover:-translate-y-0.5 active:scale-95 transition-all">
            <Wallet className="w-4 h-4" />
            <span>{t("nav", "Connect")}</span>
          </Link>
        )}
        
        {/* Lang Switcher Mock */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-3 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-bold hover:bg-zinc-50 transition-all shadow-sm"
          >
            <span className="text-base leading-none">{locale === "en" ? "🇺🇸" : "🇫🇷"}</span>
            <ChevronDown className={cn("w-3 h-3 transition-all opacity-50", isLangOpen && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {isLangOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 bg-white border border-black/5 rounded-2xl shadow-xl p-2 w-32 overflow-hidden"
              >
                <button onClick={() => { setLocale("en"); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-bg-light rounded-xl transition-all flex items-center gap-2">
                  <span>🇺🇸</span> English
                </button>
                <button onClick={() => { setLocale("fr"); setIsLangOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-bg-light rounded-xl transition-all flex items-center gap-2">
                  <span>🇫🇷</span> Français
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Actions & Toggle */}
      <div className="flex md:hidden items-center gap-3">
        {session && (
          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 gap-2 shadow-sm">
             <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-[950] text-[9px]">$</span>
             </div>
             <span className="text-[11px] font-[900] text-text-main tracking-tight uppercase">
               {session.user.balance > 1000000 
                 ? `${(session.user.balance / 1000000).toFixed(1)}M` 
                 : session.user.balance > 1000 
                   ? `${Math.floor(session.user.balance / 1000)}K` 
                   : formatNumber(session.user.balance || 0, locale)}
             </span>
          </div>
        )}

          <Link href={session ? "/profile" : "/login?callbackUrl=/rooms"} className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-primary-gold transition-all active:scale-90 overflow-hidden relative">
             {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
                <User className="w-5 h-5" />
             )}
             {session?.user?.isVerified && (
               <div className="absolute top-0 right-0 p-0.5 bg-white rounded-bl-lg">
                 <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 fill-emerald-50" />
               </div>
             )}
          </Link>

          <button 
            className="w-10 h-10 flex items-center justify-center text-zinc-900 bg-white" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col gap-8 h-screen w-full"
          >
             {/* Mobile Profile Header */}
            <div className="flex items-center gap-4 p-6 bg-zinc-50 rounded-[32px] border border-black/5">
               <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-primary-gold shadow-lg overflow-hidden relative">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7" />
                  )}
                  {session?.user?.isVerified && (
                    <div className="absolute top-0 right-0 p-1 bg-white rounded-bl-xl border border-zinc-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50 shadow-sm" />
                    </div>
                  )}
               </div>
               <div className="flex flex-col">
                  {session ? (
                    <>
                      <span className="text-sm font-black text-text-muted uppercase tracking-widest leading-none mb-1">{t("nav", "Welcome")}</span>
                      <span className="text-lg font-[900] text-text-main line-clamp-1">{session.user?.name || session.user?.email}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-black text-text-muted uppercase tracking-widest">{t("nav", "Guest Mode")}</span>
                      <Link href="/login" onClick={() => setIsOpen(false)} className="text-primary-gold font-black underline">{t("nav", "Sign in to play")}</Link>
                    </>
                  )}
               </div>
            </div>

            <nav className="flex flex-col gap-4">
              {["Home", "Rooms", "Affiliation", "FAQ"].map((item) => {
                const href = item === "Home" ? "/" : `/${item.toLowerCase()}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={item}
                    href={href}
                    className={cn(
                      "text-2xl font-[900] uppercase tracking-tighter transition-all",
                      isActive ? "text-primary-gold" : "text-text-main hover:text-primary-gold"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {t("nav", item)}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pb-10 flex flex-col gap-4">
              {session ? (
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="bg-zinc-900 text-white w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl"
                >
                   {t("nav", "Sign Out")}
                </button>
              ) : (
                <Link 
                  href="/login?callbackUrl=/rooms"
                  onClick={() => setIsOpen(false)}
                  className="bg-primary-gold text-white text-center w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl"
                >
                   {t("nav", "Login / Register")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
