"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Wallet, ChevronRight, Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { registerUserAction, forgotPasswordAction, resetPasswordAction, verifyResetCodeAction } from "@/app/actions";
import { OTPInput } from "@/components/ui/OTPInput";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [view, setView] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [resetCode, setResetCode] = useState("");



  // Check for tab=register in URL
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "register") setView("register");
    }
  }, []);

  async function handleVerifyCode(code: string) {
      setLoading(true);
      const res = await verifyResetCodeAction(resetEmail, code);
      if (res.error) {
          toast.error(res.error);
          setIsCodeVerified(false);
      } else {
          setResetCode(code);
          setIsCodeVerified(true);
      }
      setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (view === "login") {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Welcome back!");
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl") || "/rooms";
        router.push(callbackUrl);
      }
    } else if (view === "register") {
      // Handle referral cookie if present
      const cookies = document.cookie.split("; ");
      const refCookie = cookies.find(c => c.startsWith("bitlot_ref="));
      if (refCookie) {
        const refId = refCookie.split("=")[1];
        formData.append("referredById", refId);
      }

      const res = await registerUserAction(formData);
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Account created! Welcome to BitLOT.");
        // Save email for verification page
        if (typeof window !== "undefined") {
           sessionStorage.setItem("bitlot_pending_email", email);
        }
        // Auto-login and redirect to verify step
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/verify",
        });
      }
    } else if (view === "forgot") {
      const res = await forgotPasswordAction(email);
      if (res.error) {
        toast.error(res.error);
      } else {
        setResetEmail(email);
        toast.success("Reset code sent to your email!");
        setView("reset");
        setIsCodeVerified(false);
      }
    } else if (view === "reset") {
      if (!isCodeVerified) {
          toast.error("Please verify your code first.");
          setLoading(false);
          return;
      }
      formData.append("email", resetEmail);
      formData.append("code", resetCode);
      const res = await resetPasswordAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password reset successfully! You can now login.");
        setView("login");
        setIsCodeVerified(false);
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 lg:p-10 relative overflow-hidden py-24">
         {/* Decorative backgrounds like FAQ */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none z-0">
           <User className="w-[800px] h-[800px] absolute -top-20 -left-20 rotate-12" />
         </div>

         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative z-10 w-full max-w-lg"
         >
           <div className="bg-white border border-black/5 rounded-[48px] shadow-premium overflow-hidden">
               {/* Header Tabs (Only show for login/register) */}
               {(view === "login" || view === "register") && (
                 <div className="flex bg-bg-light p-2 rounded-[32px] m-6">
                    <button 
                      onClick={() => setView("login")}
                      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${view === 'login' ? 'bg-white text-text-main shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                    >
                      Sign In
                    </button>
                    <button 
                       onClick={() => setView("register")}
                       className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${view === 'register' ? 'bg-white text-text-main shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                    >
                      Register
                    </button>
                 </div>
               )}

               <div className="px-10 pb-12">
                  <div className="text-center mb-10 pt-8">
                     <h1 className="text-3xl font-[950] text-text-main uppercase tracking-tight mb-2">
                        {view === "login" && "Welcome Back"}
                        {view === "register" && "Create Account"}
                        {view === "forgot" && "Reset Password"}
                        {view === "reset" && (isCodeVerified ? "Set Password" : "Verification")}
                     </h1>
                     <p className="text-sm font-bold text-text-muted">
                        {view === "login" && "Join the gold-tier lottery experience."}
                        {view === "register" && "Start your winning journey today."}
                        {view === "forgot" && "Enter your email to receive a reset code."}
                        {view === "reset" && (isCodeVerified ? "Code accepted. Enter your new password below." : `Enter the code sent to ${resetEmail}`)}
                     </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                     {view === "register" && (
                       <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                          <div className="relative">
                             <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                             <input 
                               name="name"
                               type="text" 
                               placeholder="John Doe"
                               className="w-full bg-bg-light border border-black/5 rounded-[24px] py-4 pl-14 pr-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                             />
                          </div>
                       </div>
                    )}

                     {(view === "login" || view === "register" || view === "forgot") && (
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                           <div className="relative">
                              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                              <input 
                                name="email"
                                type="email" 
                                placeholder="name@example.com"
                                className="w-full bg-bg-light border border-black/5 rounded-[24px] py-4 pl-14 pr-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                required
                                defaultValue=""
                              />
                           </div>
                        </div>
                     )}

                      {view === "reset" && (
                         <div className="flex flex-col gap-6">
                            {!isCodeVerified ? (
                                <>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> 6-Digit Security Code
                                    </label>
                                    <OTPInput 
                                        length={6}
                                        onComplete={handleVerifyCode}
                                        disabled={loading}
                                    />
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Identity Verified</span>
                                            <span className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Reset code is valid</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                                            <input 
                                                name="password"
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="••••••••"
                                                className="w-full bg-bg-light border border-black/5 rounded-[24px] py-4 pl-14 pr-14 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                                required
                                                autoFocus
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-main transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                         </div>
                      )}

                     {(view === "login" || view === "register") && (
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Password</label>
                           <div className="relative">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                              <input 
                                name="password"
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                className="w-full bg-bg-light border border-black/5 rounded-[24px] py-4 pl-14 pr-14 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                                required
                              />
                               <button 
                                 type="button" 
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute right-5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-main transition-colors"
                               >
                                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                               </button>
                            </div>
                            {view === "login" && (
                              <button 
                                type="button"
                                onClick={() => setView("forgot")}
                                className="text-[10px] font-black uppercase text-primary-gold hover:underline text-right mt-1 w-fit self-end"
                              >
                                Forgot password?
                              </button>
                            )}
                         </div>
                      )}

                     <div className="flex flex-col gap-3 mt-4">
                        {(view !== "reset" || isCodeVerified) && (
                           <button 
                             disabled={loading}
                             className="w-full bg-zinc-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-black/10 hover:bg-primary-gold transition-all disabled:opacity-50"
                           >
                             {loading ? "Processing..." : 
                              view === "login" ? "Login Now" : 
                              view === "register" ? "Create Account" : 
                              view === "forgot" ? "Send Code" : "Update Password"}
                           </button>
                        )}

                        {(view === "forgot" || view === "reset") && (
                           <button 
                             type="button"
                             onClick={() => {
                                 setView("login");
                                 setIsCodeVerified(false);
                             }}
                             className="w-full text-text-muted py-2 font-black uppercase tracking-widest text-[10px] hover:text-text-main transition-all"
                           >
                              Back to Login
                           </button>
                        )}
                     </div>
                  </form>

                 <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-black/5" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black text-text-light bg-white px-4 tracking-widest">
                       Or connect with
                    </div>
                 </div>

                 <button className="w-full bg-white border border-black/5 py-4 rounded-[24px] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all shadow-sm">
                    <Wallet className="w-5 h-5 text-primary-gold" />
                    MetaMask Wallet
                 </button>
              </div>
           </div>

           <p className="mt-8 text-center text-xs font-bold text-text-muted">
              By continuing, you agree to BitLOT's <span className="text-text-main underline cursor-pointer">Terms of Service</span>.
           </p>
         </motion.div>
      </main>

      <Footer />
    </div>
  );
}
