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
      badgeTitle: "Today's Prize",
      badgePrize: "MacBook Air M3",
      badgeValue: "$2,500",
      titlePart1: "Win",
      titleHighlight: "Amazing Prizes",
      titlePart2: "Every Day",
      subtitle: "Join our raffles, pick your lucky tickets, and watch the live draws. Fair, transparent, and exciting.",
      createRaffle: "Create Private Room",
      findDraw: "Find a Draw",
      playNow: "Play Now",
      viewRooms: "View Rooms",
    },
    home: {
      activeLotteries: "Active Lotteries",
      activeLotteriesDesc: "Choose your entry point and join the next draw. Provably fair results guaranteed by blockchain.",
      features: [
        { title: "Escrow Logic", desc: "All bets are locked in secure smart-escrows until draw is finalized.", icon: "ShieldCheck" },
        { title: "Fair Draw", desc: "Verifiable random number generation ensures complete transparency.", icon: "Dices" },
        { title: "Instant Pay", desc: "Winnings are credited to your wallet milleseconds after the result.", icon: "Zap" }
      ],
      statsLabelActive: "Active Raffles",
      statsLabelValue: "Total Prize Value",
      statsLabelWinners: "Winners Picked",
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
      badgeTitle: "Prix du Jour",
      badgePrize: "MacBook Air M3",
      badgeValue: "2 500 $",
      titlePart1: "Gagnez des",
      titleHighlight: "Prix Incroyables",
      titlePart2: "Chaque Jour",
      subtitle: "Rejoignez nos tirages, choisissez vos tickets et regardez les tirages en direct. Équitable, transparent et passionnant.",
      createRaffle: "Créer un Salon Privé",
      findDraw: "Trouver un Tirage",
      playNow: "Jouer Maintenant",
      viewRooms: "Voir les Salles",
    },
    home: {
      activeLotteries: "Loteries Actives",
      activeLotteriesDesc: "Choisissez votre porte d'entrée et rejoignez le prochain tirage. Résultats équitables garantis par la blockchain.",
      features: [
        { title: "Logique Séquestre", desc: "Tous les paris sont bloqués dans des escrows intelligents jusqu'à la fin du tirage.", icon: "ShieldCheck" },
        { title: "Tirage Équitable", desc: "Génération de nombres aléatoires vérifiable assurant une transparence totale.", icon: "Dices" },
        { title: "Paiement Instantané", desc: "Gains crédités sur votre portefeuille en quelques millisecondes.", icon: "Zap" }
      ],
      statsLabelActive: "Tirages Actifs",
      statsLabelValue: "Valeur Totale des Prix",
      statsLabelWinners: "Gagnants Sélectionnés",
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

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {!mounted ? (
        <div style={{ visibility: "hidden" }}>{children}</div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
