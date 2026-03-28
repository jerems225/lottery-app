"use client";
import React from "react";
import Link from "next/link";
import { Newsletter } from "./Newsletter";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-white mt-auto">
      <Newsletter />
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 border-t border-black/5 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-20">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl font-black gold-text-gradient tracking-tighter uppercase leading-none">
                BitLOT
              </span>
              <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase mt-1">
                {t("hero", "title")}
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs font-semibold">
              {t("footer", "description")}
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: "fab fa-twitter", href: "#" },
                { icon: "fab fa-telegram-plane", href: "#" },
                { icon: "fab fa-discord", href: "#" },
                { icon: "fab fa-instagram", href: "#" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-light hover:bg-primary-gold hover:text-white transition-all group"
                >
                  <i className={social.icon + " opacity-70 group-hover:opacity-100 text-lg"} />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col shrink-0 lg:pl-12">
            <h4 className="text-[16px] font-black tracking-tight text-text-main uppercase mb-6">
              {t("footer", "navigation")}
            </h4>
            <div className="flex flex-col gap-3 font-semibold text-sm">
              {["Home", "Rooms", "Affiliation"].map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="text-text-muted hover:text-primary-gold hover:translate-x-1 transition-all"
                >
                  {t("nav", item)}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col shrink-0 lg:pl-12">
            <h4 className="text-[16px] font-black tracking-tight text-text-main uppercase mb-6">
               {t("footer", "support")}
            </h4>
            <div className="flex flex-col gap-3 font-semibold text-sm">
              {["FAQ", "Contact Us", "Help Center", "Bug Bounty"].map((item) => (
                <Link
                  key={item}
                  href={item === "FAQ" ? "/faq" : "#"}
                  className="text-text-muted hover:text-primary-gold hover:translate-x-1 transition-all"
                >
                  {t("nav", item)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-black/5 gap-6">
          <p className="text-xs font-bold text-text-light">
            &copy; 2026 BitLOT. {t("footer", "rights")}
          </p>
          <div className="flex items-center gap-8 font-bold text-xs text-text-light">
            {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item) => (
              <Link key={item} href="#" className="hover:text-primary-gold transition-all">
                {t("nav", item)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
