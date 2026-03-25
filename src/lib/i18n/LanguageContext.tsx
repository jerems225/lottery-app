"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "en" | "fr";

const dictionaries = {
  en: {
    nav: {
      "Home": "Home",
      "Rooms": "Rooms",
      "Affiliation": "Affiliation",
      "FAQ": "FAQ",
      "Connect": "Connect",
      "Balance": "Balance",
      "Sign Out": "Sign Out",
      "Welcome": "Welcome",
      "Guest Mode": "Guest Mode",
      "Sign in to play": "Sign in to play",
      "Login / Register": "Login / Register",
    },
    hero: {
      title: "Bitcoin Lottery",
      subtitle: "The world's most transparent and secure Bitcoin lottery platform. Provably fair, community-driven, and built on blockchain technology.",
      playNow: "Play Now",
      viewRooms: "View Rooms",
    },
    home: {
      activeLotteries: "Active Lotteries",
      activeLotteriesDesc: "Choose your entry point and join the next draw. Provably fair results guaranteed by blockchain.",
      features: [
        { title: "Escrow Logic", desc: "All bets are locked in secure smart-escrows until draw is finalized.", icon: "fa-shield-halved" },
        { title: "Fair Draw", desc: "Verifiable random number generation ensures complete transparency.", icon: "fa-dice" },
        { title: "Instant Pay", desc: "Winnings are credited to your wallet milleseconds after the result.", icon: "fa-bolt-lightning" }
      ],
      stats: {
        activePlayers: "Active Players",
        payouts: "Total Payouts",
        uptime: "Uptime",
        liveActivity: "Live Activity",
        latestWin: "Alex just won 0.05 BTC in Room #4928"
      }
    },
    footer: {
      description: "The world's most transparent and secure Bitcoin lottery platform. Provably fair, community-driven, and built on blockchain technology.",
      navigation: "Navigation",
      support: "Support",
      rights: "All rights reserved.",
    }
  },
  fr: {
    nav: {
      "Home": "Accueil",
      "Rooms": "Salles",
      "Affiliation": "Affiliation",
      "FAQ": "FAQ",
      "Connect": "S'identifier",
      "Balance": "Solde",
      "Sign Out": "Se Déconnecter",
      "Welcome": "Bienvenue",
      "Guest Mode": "Mode Invité",
      "Sign in to play": "Connectez-vous pour jouer",
      "Login / Register": "Connexion / Inscription",
    },
    hero: {
      title: "Loterie Bitcoin",
      subtitle: "La plateforme de loterie Bitcoin la plus transparente et sécurisée au monde. Équitable, axée sur la communauté et construite sur la technologie blockchain.",
      playNow: "Jouer Maintenant",
      viewRooms: "Voir les Salles",
    },
    home: {
      activeLotteries: "Loteries Actives",
      activeLotteriesDesc: "Choisissez votre porte d'entrée et rejoignez le prochain tirage. Résultats équitables garantis par la blockchain.",
      features: [
        { title: "Logique Séquestre", desc: "Tous les paris sont bloqués dans des escrows intelligents jusqu'à la fin du tirage.", icon: "fa-shield-halved" },
        { title: "Tirage Équitable", desc: "Génération de nombres aléatoires vérifiable assurant une transparence totale.", icon: "fa-dice" },
        { title: "Paiement Instantané", desc: "Gains crédités sur votre portefeuille en quelques millisecondes.", icon: "fa-bolt-lightning" }
      ],
      stats: {
        activePlayers: "Joueurs Actifs",
        payouts: "Gains Totaux",
        uptime: "Disponibilité",
        liveActivity: "Activité en Direct",
        latestWin: "Alex vient de gagner 0.05 BTC (Salle #4928)"
      }
    },
    footer: {
      description: "La plateforme de loterie Bitcoin la plus transparente et sécurisée au monde. Équitable, axée sur la communauté et construite sur la technologie blockchain.",
      navigation: "Navigation",
      support: "Assistance",
      rights: "Tous droits réservés.",
    }
  }
};

type Section = keyof typeof dictionaries["en"];

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (section: Section, key: string, fallback?: string) => any;
}

const LanguageContext = createContext<LanguageContextProps>({} as any);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bitlot_locale") as Locale;
    if (saved && (saved === "en" || saved === "fr")) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("bitlot_locale", newLocale);
  };

  const t = (section: Section, key: string, fallback?: string): any => {
    try {
      // @ts-ignore
      const value = dictionaries[locale][section][key];
      return value || fallback || key;
    } catch {
      return fallback || key;
    }
  };

  // Prevent hydration flash
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ locale: "en", setLocale, t }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
