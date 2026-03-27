"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/app/actions";
import { toast } from "react-hot-toast";

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpdatePasswordModal({ isOpen, onClose }: UpdatePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const res = await updatePasswordAction(formData);
        
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Password updated successfully!");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-[32px] w-full max-w-md p-8 relative shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-all"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>

                    <div className="flex flex-col gap-2 mb-8">
                        <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-3">
                            <Lock className="w-6 h-6 text-primary-gold" /> Security
                        </h2>
                        <p className="font-bold text-sm text-text-muted">
                            Update your account password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted">Current Password</label>
                            <div className="relative">
                                <input
                                    name="currentPassword"
                                    type={showCur ? "text" : "password"}
                                    required
                                    className="w-full px-5 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary-gold"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted">New Password</label>
                            <div className="relative">
                                <input
                                    name="newPassword"
                                    type={showNew ? "text" : "password"}
                                    required
                                    minLength={8}
                                    className="w-full px-5 py-4 bg-zinc-50 border border-black/5 rounded-2xl font-bold text-sm focus:outline-none focus:border-primary-gold"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary-gold transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Update Password
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
