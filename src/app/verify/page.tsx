"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { verifyCodeAction, resendVerificationCodeAction } from "@/app/actions/auth.actions";
import { toast } from "react-hot-toast";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setEmail(e);
  }, [searchParams]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    const res = await verifyCodeAction(email, code);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Account verified successfully! You can now participate.");
      router.push("/login");
    }
  }

  async function handleResend() {
    if (!email) {
      toast.error("Email is missing");
      return;
    }
    setResending(true);
    const res = await resendVerificationCodeAction(email);
    setResending(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("A new code has been sent!");
      setTimer(60); // 1 minute cooldown
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none z-0">
           <ShieldCheck className="w-[800px] h-[800px] absolute -top-20 -right-20 rotate-12" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white border border-black/5 rounded-[48px] shadow-premium p-10 lg:p-12 text-center">
             <div className="w-20 h-20 bg-primary-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Mail className="w-10 h-10 text-primary-gold" />
             </div>

             <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight mb-3">Verification</h1>
             <p className="text-sm font-bold text-text-muted mb-10 leading-relaxed">
               We sent a 6-digit code to <span className="text-text-main">{email || "your email"}</span>. Enter it below to unlock all features.
             </p>

             <form onSubmit={handleVerify} className="flex flex-col gap-6">
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-bg-light border border-black/5 rounded-[24px] py-6 text-center font-black text-4xl tracking-[0.5em] outline-none focus:border-primary-gold transition-all font-mono"
                  required
                />

                <button 
                  disabled={loading}
                  className="w-full bg-zinc-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-black/10 hover:bg-primary-gold transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Verify Account <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
             </form>

             <div className="mt-10 flex flex-col gap-5 pt-5 border-t border-black/5">
                <button 
                  type="button"
                  onClick={handleResend}
                  disabled={resending || timer > 0}
                  className="text-xs font-black text-primary-gold uppercase tracking-widest hover:underline disabled:opacity-50 decoration-2 underline-offset-4"
                >
                  {timer > 0 ? `Resend code in ${timer}s` : "Resend Verification Code"}
                </button>

                <button 
                   onClick={() => router.push("/login")}
                   className="text-xs font-black text-text-muted uppercase tracking-widest hover:text-text-main transition-colors"
                >
                   Back to Login Page
                </button>
             </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
