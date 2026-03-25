"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { WalletProvider } from "@/lib/hooks/useWallet";
import { Toaster } from "react-hot-toast";

/**
 * Root client-side providers wrapper.
 * Combines all context providers in the correct nesting order.
 * This component MUST be "use client" since providers rely on React hooks.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SessionProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
        <Toaster position="bottom-right" />
      </SessionProvider>
    </LanguageProvider>
  );
}
