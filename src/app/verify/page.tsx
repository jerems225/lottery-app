"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, ShieldCheck, ArrowRight, Loader2, Edit3 } from "lucide-react";
import { verifyCodeAction, resendVerificationCodeAction } from "@/app/actions/auth.actions";
import { toast } from "react-hot-toast";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(false);

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

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      setShowEmailInput(true);
      return;
    }
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    const res = await verifyCodeAction(email, code);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Account verified successfully! You can now participate.");
      sessionStorage.removeItem("bitlot_pending_email");
      router.push("/login");
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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none z-0">
           <ShieldCheck className="w-[800px] h-[800px] absolute -top-20 -right-20 rotate-12 text-zinc-900" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[48px] shadow-2xl p-10 lg:p-12 text-center overflow-hidden">
             <div className="w-20 h-20 bg-primary-gold/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-primary-gold blur-2xl opacity-10 animate-pulse"></div>
                <Mail className="w-10 h-10 text-primary-gold relative z-10" />
             </div>

             <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight mb-3">Almost There</h1>
             
             {showEmailInput ? (
                <div className="space-y-4 mb-10">
                   <p className="text-xs font-black text-text-muted uppercase tracking-widest">Enter your registration email</p>
                   <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-bg-light border border-black/5 rounded-[20px] py-4 px-6 text-center font-bold outline-none focus:border-primary-gold transition-all"
                   />
                </div>
             ) : (
                <p className="text-sm font-bold text-text-muted mb-10 leading-relaxed flex items-center justify-center gap-2">
                  Verify the code sent to <span className="text-text-main">{email}</span>
                  <button onClick={() => setShowEmailInput(true)} className="p-1 hover:text-primary-gold transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </p>
             )}

             <form onSubmit={handleVerify} className="flex flex-col gap-6">
                <div className="flex justify-center gap-2">
                   <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000 000"
                      className="w-full bg-bg-light border border-black/5 rounded-[28px] py-7 text-center font-black text-5xl tracking-[0.2em] outline-none focus:border-primary-gold shadow-inner transition-all font-mono"
                      required
                      autoFocus
                   />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-zinc-900 text-white py-6 rounded-[28px] font-black uppercase tracking-widest text-sm shadow-xl shadow-black/10 hover:bg-primary-gold hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>Confirm Code <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
             </form>

             <div className="mt-12 pt-8 border-t border-black/5 flex flex-col gap-6">
                <button 
                  type="button"
                  onClick={handleResend}
                  disabled={resending || timer > 0}
                  className="text-xs font-black text-primary-gold uppercase tracking-widest hover:underline disabled:opacity-50 decoration-2 underline-offset-4"
                >
                   {timer > 0 ? `Retry allowed in ${timer}s` : "I didn't receive any code"}
                </button>

                 <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => {
                            sessionStorage.removeItem("bitlot_pending_email");
                            router.push("/rooms");
                        }}
                        className="w-full text-[10px] font-[900] text-primary-gold uppercase tracking-[0.2em] hover:text-primary-gold/70 transition-colors bg-primary-gold/5 py-4 rounded-2xl border border-primary-gold/10"
                    >
                        Skip for now &rarr;
                    </button>
                    <p className="text-[9px] font-bold text-text-muted/60 lowercase italic">
                        you can verify your account later from your profile settings
                    </p>
                 </div>

                 <button 
                    onClick={() => router.push("/login")}
                    className="text-[10px] font-[600] text-text-muted uppercase tracking-[0.2em] hover:text-text-main transition-colors mt-2"
                 >
                    Back to Login
                 </button>
             </div>
          </div>

          <p className="text-center mt-8 text-xs font-bold text-text-muted/50 uppercase tracking-[0.1em]">
             Secured by BitLOT Verification System
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
