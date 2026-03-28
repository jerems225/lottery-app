"use client";
import React, { useState } from "react";
import { Wallet, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { parseEther } from "viem";
import { initiateCryptoRechargeAction, verifyCryptoTransactionAction } from "@/app/actions";

const CHAINS = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", networkId: 1, color: "bg-blue-500", icon: "💎" },
  { id: "bsc", name: "BNB Smart Chain", symbol: "BNB", networkId: 56, color: "bg-yellow-500", icon: "🟡" },
  { id: "polygon", name: "Polygon", symbol: "POL", networkId: 137, color: "bg-purple-500", icon: "🟣" },
];

export const CryptoDeposit = () => {
    const [amount, setAmount] = useState("");
    const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "loading" | "success">("input");

    const handleRecharge = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return toast.error("Please enter a valid amount.");
        }

        const ethereum = (window as any).ethereum;
        if (typeof window === "undefined" || !ethereum) {
            return toast.error("MetaMask is not detected. Please install the extension.");
        }

        try {
            setLoading(true);
            setStep("loading");

            // 1. Request Account
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            // 2. Ensure Correct Chain
            const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);

            if (chainId !== selectedChain.networkId) {
                try {
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${selectedChain.networkId.toString(16)}` }],
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        toast.error(`Please add ${selectedChain.name} to your MetaMask first.`);
                    }
                    setLoading(false);
                    setStep("input");
                    return toast.error(`Please switch your MetaMask to ${selectedChain.name}`);
                }
            }

            // 3. Send Transaction
            // Treasury address (matches default in crypto.actions.ts)
            const treasury = "0x9876543210abcdef9876543210abcdef98765432"; 
            
            // Amount in Wei (hex)
            const valueHex = `0x${parseEther(amount).toString(16)}`;

            const txHash = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: account,
                        to: treasury,
                        value: valueHex,
                    },
                ],
            });

            toast.success("Transaction sent! Verifying on-chain...");

            // 4. Register PENDING in our DB for traceability
            const initRes = await initiateCryptoRechargeAction({
                amount: Number(amount),
                blockchain: selectedChain.id,
                currency: selectedChain.symbol,
                txHash: txHash
            });

            if (initRes.error) {
                setLoading(false);
                setStep("input");
                return toast.error(initRes.error);
            }

            // 5. Automated Server Verification Polling
            let attempts = 0;
            const maxAttempts = 15;
            
            const pollVerification = async () => {
                const verifyRes = await verifyCryptoTransactionAction(initRes.requestId!);
                if (verifyRes.success) {
                    setStep("success");
                    setLoading(false);
                    toast.success("Deposit confirmed! Your balance is updated.");
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(pollVerification, 5000); // Check every 5s
                } else {
                    setLoading(false);
                    setStep("input");
                    toast.error("Verification is taking longer than usual. Don't worry, it will be added once confirmed.");
                }
            };

            setTimeout(pollVerification, 5000);

        } catch (error: any) {
            console.error(error);
            setLoading(false);
            setStep("input");
            toast.error(error.message || "Operation cancelled.");
        }
    };

    return (
        <div className="bg-white border border-black/5 rounded-[40px] p-8 shadow-premium relative overflow-hidden">
            <AnimatePresence mode="wait">
                {step === "input" && (
                    <motion.div 
                        key="input"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-gold/10 rounded-2xl flex items-center justify-center text-primary-gold">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-text-main">Automated Recharge</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Select your blockchain and confirm with MetaMask</p>
                            </div>
                        </div>

                        {/* Chain Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {CHAINS.map((chain) => (
                                <button
                                    key={chain.id}
                                    onClick={() => setSelectedChain(chain)}
                                    className={`flex items-center gap-3 p-4 rounded-3xl border transition-all ${selectedChain.id === chain.id ? 'border-primary-gold bg-primary-gold/5 shadow-premium-sm' : 'border-black/5 bg-zinc-50 hover:bg-zinc-100'}`}
                                >
                                    <span className="text-xl">{chain.icon}</span>
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-none mb-1">{chain.name}</span>
                                        <span className="text-xs font-black text-text-main">{chain.symbol}</span>
                                    </div>
                                    {selectedChain.id === chain.id && <div className="ml-auto w-2 h-2 rounded-full bg-primary-gold animate-pulse" />}
                                </button>
                            ))}
                        </div>

                        {/* Amount Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Deposit Amount ({selectedChain.symbol})</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-xs text-primary-gold shadow-sm border border-black/5">
                                    {selectedChain.icon}
                                </div>
                                <input 
                                    type="number"
                                    step="0.0001"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-zinc-50 border border-black/5 rounded-[32px] py-6 pl-18 pr-20 font-[950] text-2xl outline-none focus:border-primary-gold transition-all"
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-primary-gold/50 uppercase">
                                    {selectedChain.symbol}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleRecharge}
                            disabled={loading || !amount}
                            className="w-full bg-zinc-900 text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/10 hover:bg-primary-gold hover:text-zinc-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            Pay with MetaMask <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {step === "loading" && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 gap-8"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[40px] border-4 border-zinc-100 border-t-primary-gold animate-spin" />
                            <Loader2 className="w-10 h-10 text-primary-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-text-main">Network Verification</h3>
                            <p className="text-sm font-bold text-text-muted max-w-[280px] mx-auto mt-2">
                                We are auditing the <b>{selectedChain.name}</b> ledger for your hash. This usually takes 15-30 seconds.
                            </p>
                        </div>
                    </motion.div>
                )}

                {step === "success" && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 gap-8 text-center"
                    >
                        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-[950] text-text-main uppercase tracking-tight leading-none mb-3">Recharge Verified</h3>
                            <p className="text-sm font-bold text-text-muted max-w-[320px] mx-auto">
                                The funds have been secured and added to your balance. Good luck in the drawings!
                            </p>
                        </div>
                        <button 
                            onClick={() => { setStep("input"); setAmount(""); }}
                            className="px-10 py-5 bg-zinc-900 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-black/10"
                        >
                            Make Another Deposit
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
