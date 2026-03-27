"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock, CheckCircle2, XCircle, User as UserIcon, Loader2, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { getAllUserRequestsAction, processUserRequestAction } from "@/app/actions/finance.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";

export function AgentRequestsList({ onSuccess }: { onSuccess?: () => void }) {
    const { data: session, update } = useSession();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadRequests = async () => {
        setLoading(true);
        const res = await getAllUserRequestsAction();
        if (res.success && res.requests) {
            // Only show PENDING requests for agents to "prendre en charge", or we could show all.
            // Let's show all but paginate or highlight PENDING.
            setRequests(res.requests);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleProcess = async (id: string, status: "APPROVED" | "REJECTED") => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
        setProcessingId(id);
        const res = await processUserRequestAction(id, status);
        setProcessingId(null);
        if ('error' in res && res.error) {
            toast.error(String(res.error));
        } else {
            toast.success(`Request ${status.toLowerCase()}`);
            loadRequests();
            if (update) await update();
            if (onSuccess) onSuccess();
        }
    };

    // Filter to show PENDING first (excluding the agent's own requests)
    const pendingRequests = requests.filter(r => r.status === "PENDING" && r.userId !== session?.user?.id);
    const historyRequests = requests.filter(r => r.status !== "PENDING" && r.handledById === session?.user?.id).slice(0, 10); // Show max 10 recent history

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between mt-4">
                <span className="font-black text-sm uppercase tracking-widest text-text-muted">Pending User Requests</span>
                <button onClick={loadRequests} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all" title="Refresh">
                    <RefreshCw className={`w-4 h-4 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && requests.length === 0 ? (
                <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-300" /></div>
            ) : pendingRequests.length === 0 ? (
                <div className="p-10 border border-dashed border-zinc-300 rounded-[24px] text-center flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-zinc-300 mb-2" />
                    <span className="font-black text-text-muted uppercase tracking-widest text-xs">No pending requests</span>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1">Users are not currently requesting any recharges or withdrawals.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <AnimatePresence>
                        {pendingRequests.map(req => (
                            <motion.div 
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-primary-gold/30 bg-primary-gold/5 rounded-[24px] gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${req.type === "DEPOSIT" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs uppercase tracking-widest">{req.type}</span>
                                        <span className="text-[10px] font-bold text-text-muted mt-0.5"><UserIcon className="inline w-3 h-3 mr-1" />{req.user?.name || req.user?.email}</span>
                                        {req.paymentMethod && (
                                            <span className="text-[10px] font-bold text-primary-gold uppercase mt-1">via {req.paymentMethod}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-none border-black/5 pt-4 sm:pt-0">
                                    <span className="font-[950] text-2xl tracking-tighter mx-4">{formatCurrency(req.amount)}</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleProcess(req.id, "REJECTED")}
                                            disabled={processingId === req.id}
                                            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleProcess(req.id, "APPROVED")}
                                            disabled={processingId === req.id}
                                            className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {historyRequests.length > 0 && (
                <div className="mt-8 flex flex-col gap-4">
                     <span className="font-black text-sm uppercase tracking-widest text-text-muted">Recent History</span>
                     <div className="flex flex-col gap-3">
                        {historyRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-black/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-5 h-5 text-zinc-400" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xs uppercase text-text-main shrink-0">{req.type}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : req.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-zinc-200 text-zinc-500'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-text-muted mt-0.5">{req.user?.name || req.user?.email}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-sm">{formatCurrency(req.amount)}</span>
                                    <span className="text-[9px] font-bold text-zinc-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
}
