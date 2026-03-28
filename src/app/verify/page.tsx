"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, ChevronRight, Loader2, Edit3, Zap, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { verifyCodeAction, resendVerificationCodeAction } from "@/app/actions/auth.actions";
import { toast } from "react-hot-toast";
import { OTPInput } from "@/components/ui/OTPInput";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Read email from storage to avoid clear value in URL
    const storedEmail = sessionStorage.getItem("bitlot_pending_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setShowEmailInput(true);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  async function handleVerify(fullCode: string) {
    if (!email) {
      toast.error("Please enter your email");
      setShowEmailInput(true);
      return;
    }

    if (fullCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    const res = await verifyCodeAction(email, fullCode);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      setSuccess(true);
      sessionStorage.removeItem("bitlot_pending_email");
      setTimeout(() => {
          router.push("/rooms");
      }, 2000);
    }
  }

  async function handleResend() {
    if (!email) {
      toast.error("Email is missing");
      setShowEmailInput(true);
      return;
    }
    setResending(true);
    const res = await resendVerificationCodeAction(email);
    setResending(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("A new code has been sent!");
      setTimer(60);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-24 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary-gold rounded-full blur-[180px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-emerald-500 rounded-full blur-[180px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-xl"
        >
          <div className="bg-white border border-black/5 rounded-[64px] shadow-premium p-10 lg:p-20 text-center overflow-hidden relative">
             
             <AnimatePresence mode="wait">
                {success ? (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center py-10"
                    >
                        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight mb-4">Identity Secured</h1>
                        <p className="font-bold text-text-muted max-w-[300px] mx-auto">
                            Your account is now fully verified. Redirecting you to the platform...
                        </p>
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mt-10" />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="verify"
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div className="w-24 h-24 bg-primary-gold/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 relative">
                            <div className="absolute inset-0 bg-primary-gold blur-3xl opacity-20"></div>
                            <ShieldCheck className="w-12 h-12 text-primary-gold relative z-10" />
                        </div>

                        <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight mb-4 leading-none">Security Access</h1>
                        
                        {showEmailInput ? (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4 mb-10"
                            >
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Correction Information</p>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-primary-gold transition-colors" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-zinc-50 border border-black/5 rounded-[32px] py-6 pl-16 pr-8 font-black text-lg outline-none focus:border-primary-gold transition-all shadow-inner placeholder:opacity-30"
                                    />
                                    <button 
                                        onClick={() => setShowEmailInput(false)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-primary-gold"
                                    >
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="mb-12 flex flex-col items-center gap-2">
                                <p className="text-sm font-bold text-text-muted leading-relaxed max-w-[320px] mx-auto">
                                    We've dispatched a 6-digit cryptographic security code to your registered email:
                                </p>
                                <div className="flex items-center gap-4 px-6 py-3 bg-zinc-50 border border-black/5 rounded-[24px] mt-4 hover:bg-zinc-100 transition-colors">
                                    <span className="text-sm font-black text-text-main tracking-tight uppercase">{email}</span>
                                    <button 
                                        onClick={() => setShowEmailInput(true)} 
                                        className="p-2 text-text-muted hover:text-primary-gold hover:bg-white rounded-xl transition-all shadow-premium border border-transparent hover:border-black/5"
                                        title="Edit email"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-12">
                            <div className="relative">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] absolute -top-8 left-1/2 -translate-x-1/2 opacity-60">
                                    Verify Code Below
                                </label>
                                <div className={loading ? "opacity-50 pointer-events-none" : ""}>
                                    <OTPInput length={6} onComplete={handleVerify} disabled={loading} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between pt-10 border-t border-black/5">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">No receipt?</span>
                                        <button 
                                            type="button"
                                            onClick={handleResend}
                                            disabled={resending || timer > 0}
                                            className="text-xs font-black text-primary-gold uppercase tracking-[0.15em] hover:text-zinc-900 disabled:text-text-muted/40 transition-colors flex items-center gap-2"
                                        >
                                            {resending ? (
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            ) : timer > 0 ? (
                                                <span className="flex items-center gap-2">
                                                    Resend in <b>{timer}s</b>
                                                </span>
                                            ) : (
                                                <>Dispatch New Code <RefreshCw className="w-3.5 h-3.5" /></>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => router.push("/login")}
                                            className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-gold transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-8 mt-4">
                                    <button 
                                        onClick={() => {
                                            sessionStorage.removeItem("bitlot_pending_email");
                                            router.push("/rooms");
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black text-text-muted/40 uppercase tracking-widest hover:text-primary-gold transition-colors"
                                    >
                                        <Zap className="w-3.5 h-3.5" /> Quick Skip (Guest)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="mt-12 text-[10px] font-bold text-text-muted/40 leading-relaxed italic px-10">
                            Encryption Protocol: bitlot-v2-sha256. Secure session active.
                        </p>
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
