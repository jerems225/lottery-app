"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2, Trophy, Users, Search, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLotteryParticipantsAction, resolveLotteryManuallyAction } from "@/app/actions/admin.actions";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface ManualDrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    room: any;
}

export function ManualDrawModal({ isOpen, onClose, onSuccess, room }: ManualDrawModalProps) {
    const [loading, setLoading] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && room) {
            loadParticipants();
        } else {
            setParticipants([]);
            setSelectedWinner(null);
            setSearch("");
        }
    }, [isOpen, room]);

    const loadParticipants = async () => {
        setFetching(true);
        const res = await getLotteryParticipantsAction(room.id);
        if (res.success && res.participants) {
            setParticipants(res.participants);
        } else {
            toast.error(res.error || "Failed to load participants");
        }
        setFetching(false);
    };

    const handleConfirmDraw = async () => {
        if (!selectedWinner) return;
        if (!confirm("Are you sure you want to end this lottery and declare this winner? This action is irreversible.")) return;

        setLoading(true);
        try {
            const res = await resolveLotteryManuallyAction(room.id, selectedWinner);
            if (res.success) {
                toast.success("Manual draw completed successfully!");
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || "Failed to resolve lottery");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-black/5"
                >
                    {/* Header */}
                    <div className="p-10 border-b border-black/5 flex items-center justify-between bg-zinc-50/50">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                < Trophy className="w-6 h-6 text-primary-gold" />
                                <h2 className="text-2xl font-[1000] text-text-main uppercase tracking-tighter">
                                    Manual Draw Resolution
                                </h2>
                            </div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                Picking winner for: <span className="text-text-main">{room.title}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-zinc-200 rounded-full transition-all bg-white shadow-sm">
                            <X className="w-6 h-6 text-zinc-400" />
                        </button>
                    </div>

                    <div className="p-10 flex flex-col gap-8">
                        {/* Summary Card */}
                        <div className="flex items-center justify-between p-6 bg-zinc-900 rounded-[32px] text-white">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prize Pool (75%)</span>
                                <span className="text-3xl font-[1000] text-primary-gold tracking-tighter">
                                    {formatCurrency(room.jackpot * 0.75)}
                                </span>
                            </div>
                            <div className="text-right flex flex-col gap-1">
                                <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <Users className="w-3 h-3" />
                                    {room._count?.bets || room.bets?.length || 0} Participants
                                </div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">Total Pot: {formatCurrency(room.jackpot)}</span>
                            </div>
                        </div>

                        {/* Search & Participant List */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Select Winner</h3>
                                <div className="flex items-center bg-zinc-100 rounded-xl px-4 py-2 border border-black/5">
                                    <Search className="w-4 h-4 text-zinc-400 mr-2" />
                                    <input 
                                        type="text" 
                                        placeholder="Search participant..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-transparent border-none outline-none text-[10px] font-bold text-text-main w-32"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {fetching ? (
                                    <div className="py-20 flex flex-col items-center gap-4 text-zinc-300 uppercase font-black text-[10px] tracking-[4px]">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
                                        Loading Participants...
                                    </div>
                                ) : filteredParticipants.length === 0 ? (
                                    <div className="py-10 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                        No participants found
                                    </div>
                                ) : (
                                    filteredParticipants.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedWinner(p.id)}
                                            className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                                                selectedWinner === p.id 
                                                ? 'bg-primary-gold/10 border-primary-gold shadow-lg shadow-primary-gold/10' 
                                                : 'bg-white border-black/5 hover:border-zinc-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                                                    selectedWinner === p.id ? 'bg-primary-gold text-white' : 'bg-zinc-100 text-zinc-400'
                                                }`}>
                                                    {p.name?.slice(0, 2).toUpperCase() || "??"}
                                                </div>
                                                <div className="text-left flex flex-col">
                                                    <span className="text-[11px] font-[950] uppercase text-text-main tracking-tight leading-none mb-1">{p.name}</span>
                                                    <span className="text-[9px] font-bold text-text-muted uppercase leading-none">{p.email}</span>
                                                </div>
                                            </div>
                                            {selectedWinner === p.id && (
                                                <div className="bg-primary-gold text-white p-1 rounded-full">
                                                    <Trophy className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mt-2">
                             <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-[24px]">
                                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
                                    Confirming will instantly distribute <span className="font-black underline">{formatCurrency(room.jackpot * 0.75)}</span> to the chosen winner and <span className="font-black underline">{formatCurrency(room.jackpot * 0.05)}</span> to the creator.
                                </p>
                             </div>

                             <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] text-text-muted hover:bg-zinc-100 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={loading || !selectedWinner}
                                    onClick={handleConfirmDraw}
                                    className="flex-[2] bg-zinc-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                                    Finalize Draw & Pay Winner
                                </button>
                             </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
