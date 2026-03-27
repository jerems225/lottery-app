"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2, Type, AlignLeft, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createFaqAction, updateFaqAction } from "@/app/actions/faq.actions";
import { toast } from "react-hot-toast";

interface FaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    faq?: any;
}

export function FaqModal({ isOpen, onClose, onSuccess, faq }: FaqModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: "General",
        question: "",
        answer: "",
        order: "0"
    });

    useEffect(() => {
        if (faq) {
            setFormData({
                category: faq.category || "General",
                question: faq.question || "",
                answer: faq.answer || "",
                order: (faq.order || 0).toString()
            });
        } else {
            setFormData({
                category: "General",
                question: "",
                answer: "",
                order: "0"
            });
        }
    }, [faq, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = faq 
                ? await updateFaqAction(faq.id, { ...formData, order: parseInt(formData.order) })
                : await createFaqAction({ ...formData, order: parseInt(formData.order) });

            if (res.success) {
                toast.success(faq ? "FAQ updated" : "FAQ created");
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Action failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl relative"
                >
                    <div className="p-8 border-b border-black/5 flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-tight text-text-main">
                            {faq ? "Edit FAQ" : "Add New FAQ"}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Category</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="bg-zinc-50 border border-black/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                            >
                                <option value="General">General</option>
                                <option value="Security">Security</option>
                                <option value="Payments & Fees">Payments & Fees</option>
                                <option value="Rooms & Affiliation">Rooms & Affiliation</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Question</label>
                            <input 
                                required
                                value={formData.question}
                                onChange={(e) => setFormData({...formData, question: e.target.value})}
                                type="text"
                                placeholder="What is BitLOT?"
                                className="bg-zinc-50 border border-black/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Answer</label>
                            <textarea 
                                required
                                value={formData.answer}
                                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                                placeholder="Write the detailed answer here..."
                                rows={4}
                                className="bg-zinc-50 border border-black/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Display Order</label>
                            <input 
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({...formData, order: e.target.value})}
                                className="bg-zinc-50 border border-black/5 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                            />
                        </div>

                        <div className="flex gap-4 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:bg-zinc-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-gold transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                                {faq ? "Save Changes" : "Create FAQ"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
