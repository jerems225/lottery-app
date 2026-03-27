"use client";
import React, { useState } from "react";
import { X, DollarSign, Smartphone, Landmark, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { requestDepositAction, requestWithdrawalAction } from "@/app/actions/finance.actions";
import { toast } from "react-hot-toast";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "deposit" | "withdraw";
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { id: "ORANGE_MONEY", label: "Orange Money", icon: Smartphone },
  { id: "MTN_MOMO", label: "MTN Mobile Money", icon: Smartphone },
  { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Landmark },
  { id: "CRYPTO", label: "Cryptocurrency", icon: DollarSign },
];

export const WalletModal = ({ isOpen, onClose, initialTab = "deposit", onSuccess }: WalletModalProps) => {
  const [tab, setTab] = useState<"deposit" | "withdraw">(initialTab);
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setAmount("");
      setPhone("");
      setMethod(PAYMENT_METHODS[0].id);
    }
  }, [isOpen, initialTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (!phone) {
      toast.error("Please provide payment details (e.g., phone number)");
      return;
    }

    setLoading(true);
    let res;
    if (tab === "deposit") {
      res = await requestDepositAction({ amount: val, paymentMethod: method, phoneNumber: phone });
    } else {
      res = await requestWithdrawalAction({ amount: val, paymentMethod: method, phoneNumber: phone });
    }
    setLoading(false);

    if (res && "error" in res && res.error) {
      toast.error(res.error as string);
    } else {
      toast.success(`Your ${tab} request has been submitted!`);
      onSuccess();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-black/5">
            <h2 className="text-xl font-black uppercase tracking-tight">Wallet Operations</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="flex bg-zinc-50 border-b border-black/5">
            <button 
              onClick={() => setTab("deposit")}
              className={`flex-1 py-4 font-black text-[11px] uppercase tracking-widest transition-all ${tab === "deposit" ? "text-primary-gold border-b-2 border-primary-gold" : "text-text-muted hover:bg-zinc-100 border-b-2 border-transparent"}`}
            >
              Deposit
            </button>
            <button 
               onClick={() => setTab("withdraw")}
               className={`flex-1 py-4 font-black text-[11px] uppercase tracking-widest transition-all ${tab === "withdraw" ? "text-primary-gold border-b-2 border-primary-gold" : "text-text-muted hover:bg-zinc-100 border-b-2 border-transparent"}`}
            >
              Withdraw
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Method</label>
               <div className="grid grid-cols-2 gap-3">
                 {PAYMENT_METHODS.map(m => {
                   const Icon = m.icon;
                   const isSelected = method === m.id;
                   return (
                     <div 
                       key={m.id}
                       onClick={() => setMethod(m.id)}
                       className={`p-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-2 transition-all ${isSelected ? "border-primary-gold bg-primary-gold/5" : "border-black/5 hover:border-black/10"}`}
                     >
                        <Icon className={`w-4 h-4 ${isSelected ? "text-primary-gold" : "text-text-muted"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-primary-gold" : "text-text-muted"}`}>{m.label}</span>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Amount (USD)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-lg font-black text-zinc-400">$</span>
                </div>
                <input
                  type="number"
                  min="5"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-6 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-black text-lg outline-none focus:border-primary-gold focus:bg-white transition-all text-text-main"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                 {method === "CRYPTO" ? "Wallet Address" : method === "BANK_TRANSFER" ? "IBAN / Account Number" : "Phone Number"}
               </label>
               <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={method === "CRYPTO" ? "0x..." : "+225 ..."}
                  className="w-full px-6 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm outline-none focus:border-primary-gold focus:bg-white transition-all text-text-main"
                  required
                />
            </div>
            
            <div className="mt-4">
               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary-gold hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-zinc-900"
               >
                 {loading ? "Processing..." : tab === "deposit" ? "Request Deposit" : "Request Withdrawal"}
               </button>
               {tab === "deposit" && (
                 <p className="text-[9px] font-bold text-text-muted text-center mt-3 mx-4 leading-relaxed">
                   By requesting a deposit, you agree to send the Exact amount via the selected method. An agent will verify and credit your account shortly.
                 </p>
               )}
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
