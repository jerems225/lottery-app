"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, Crown, History, BarChart3, Settings, 
  Home, LogOut, ShieldCheck, DollarSign, Wallet, HelpCircle, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/admin" },
  { id: "users", label: "User Management", icon: Users, href: "/admin/users" },
  { id: "public-rooms", label: "Public Rooms", icon: Crown, href: "/admin/rooms" },
  { id: "private-rooms", label: "Private Rooms", icon: ShieldCheck, href: "/admin/private-rooms" },
  { id: "finance", label: "Recharges & Agents", icon: DollarSign, href: "/admin/finance" },
  { id: "transactions", label: "Transactions", icon: History, href: "/admin/transactions" },
  { id: "wallets", label: "Vault & Liquidity", icon: Wallet, href: "/admin/wallets" },
  { id: "faqs", label: "Manage FAQs", icon: HelpCircle, href: "/admin/faqs" },
  { id: "settings", label: "Global Settings", icon: Settings, href: "/admin/settings" },
  { id: "profile", label: "My Profile", icon: User, href: "/profile" },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  role?: string;
}

export function AdminSidebar({ isOpen, onClose, role }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 bg-zinc-900 border-r border-white/5 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shrink-0 overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="p-8 border-b border-white/5 flex flex-col gap-1">
          <Link href="/" className="flex flex-col">
              <span className="text-2xl font-black gold-text-gradient tracking-tighter uppercase leading-none">
                BitLOT
              </span>
              <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mt-1">
                Administration Central
              </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4 mb-2">Main Menu</span>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                  isActive 
                      ? "bg-primary-gold text-white shadow-xl shadow-primary-gold/20" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex flex-col gap-4">
          <Link 
              href="/" 
              className="flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-all bg-white/5"
          >
            <Home className="w-5 h-5" />
            Back to site
          </Link>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Exit Session
          </button>
        </div>
      </aside>
    </>
  );
}
