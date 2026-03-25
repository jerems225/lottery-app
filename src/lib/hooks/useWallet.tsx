"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

type WalletContextType = {
  user: User | null;
  balance: number;
  connect: () => void;
  disconnect: () => void;
  refreshBalance: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Initial mock login
    const mockUser: User = {
      id: "user_1",
      email: "john@example.com",
      name: "John Doe",
      walletBalance: 235000,
      referralCode: "REF123",
      isValidated: true,
    };
    setUser(mockUser);
    setBalance(mockUser.walletBalance);
  }, []);

  const connect = () => {
    console.log("Connecting wallet...");
  };

  const disconnect = () => {
    setUser(null);
    setBalance(0);
  };

  const refreshBalance = () => {
    // In real app, fetch from API
    if (user) setBalance(user.walletBalance);
  };

  return (
    <WalletContext.Provider value={{ user, balance, connect, disconnect, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
