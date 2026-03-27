"use client";
import React, { useState, useEffect } from "react";
import { getUserPaymentRequestsAction, cancelPaymentRequestAction } from "@/app/actions/finance.actions";
import { toast } from "react-hot-toast";
import { DollarSign, X, Check, Clock, Wallet, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PaymentRequestsList = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const loadRequests = async () => {
        setLoading(true);
        const res = await getUserPaymentRequestsAction();
        if (res.success) setRequests(res.requests);
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleCancel = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Cancel this request?")) return;
        toast.loading("Cancelling request...");
        const res = await cancelPaymentRequestAction(id);
        toast.dismiss();
        if (res && "error" in res && res.error) {
            toast.error(res.error);
        } else {
            toast.success("Request cancelled successfully");
            loadRequests();
            if (selectedRequest?.id === id) {
                setSelectedRequest(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <div className="w-8 h-8 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <Wallet className="w-12 h-12 text-zinc-200 mb-4" />
                <span className="font-black text-xl text-text-main uppercase">No Requests Found</span>
                <span className="font-bold text-text-muted text-sm mt-2">You haven't made any deposit or withdrawal requests yet.</span>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {requests.map((req, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={req.id} 
                        onClick={() => setSelectedRequest(req)}
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-zinc-50 border border-black/5 rounded-2xl gap-6 cursor-pointer hover:bg-zinc-100 hover:border-black/10 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 ${req.type === 'WITHDRAWAL' ? 'bg-zinc-900 text-white' : 'bg-primary-gold/10 text-primary-gold'}`}>
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-base uppercase">{req.type}</span>
                                    <span className={`font-black text-lg ${req.type === 'WITHDRAWAL' ? 'text-zinc-900' : 'text-emerald-600'}`}>
                                        ${req.amount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        req.status === 'CANCELLED' ? 'bg-zinc-200 text-zinc-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {req.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {req.status === "PENDING" && (
                                <button 
                                    onClick={(e) => handleCancel(req.id, e)}
                                    className="px-5 py-3 rounded-xl border border-red-200 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2 bg-white w-fit"
                                >
                                    <X className="w-4 h-4" /> Cancel Request
                                </button>
                            )}
                            <div className="p-3 rounded-full bg-white border border-black/5 text-zinc-400 group-hover:text-primary-gold transition-colors md:flex hidden">
                                <Info className="w-5 h-5" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedRequest(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] w-full max-w-md p-8 relative shadow-2xl flex flex-col gap-6"
                        >
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-all"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>

                            <div className="flex flex-col gap-2 pr-8">
                                <h2 className="text-2xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-3">
                                    <Wallet className="w-6 h-6 text-primary-gold" /> Transaction Details
                                </h2>
                                <p className="font-bold text-sm text-text-muted">
                                    Review the specifics of your request.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 bg-zinc-50 rounded-2xl p-5 border border-black/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Type</span>
                                    <span className="font-black text-sm uppercase">{selectedRequest.type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Amount</span>
                                    <span className={`font-black text-lg ${selectedRequest.type === 'WITHDRAWAL' ? 'text-zinc-900' : 'text-emerald-600'}`}>
                                        ${selectedRequest.amount}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Status</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                        selectedRequest.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedRequest.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        selectedRequest.status === 'CANCELLED' ? 'bg-zinc-200 text-zinc-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {selectedRequest.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Date</span>
                                    <span className="font-bold text-sm text-text-muted">
                                        {new Date(selectedRequest.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                {selectedRequest.paymentMethod && (
                                    <div className="flex justify-between items-center pt-2 border-t border-black/5 mt-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Method</span>
                                        <span className="font-bold text-sm">{selectedRequest.paymentMethod}</span>
                                    </div>
                                )}

                                {selectedRequest.phoneNumber && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Phone Number</span>
                                        <span className="font-bold text-sm">{selectedRequest.phoneNumber}</span>
                                    </div>
                                )}
                            </div>

                            {selectedRequest.proofUrl && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Proof Image</span>
                                    <div className="rounded-xl border border-black/5 overflow-hidden bg-zinc-50 max-h-48 flex justify-center">
                                        <img 
                                            src={selectedRequest.proofUrl} 
                                            alt="Payment Proof" 
                                            className="w-full h-auto object-contain max-h-48"
                                            onClick={() => window.open(selectedRequest.proofUrl, '_blank')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-text-muted text-center italic">Click image to open in new tab</span>
                                </div>
                            )}

                            {selectedRequest.status === "PENDING" && (
                                <button 
                                    onClick={() => handleCancel(selectedRequest.id)}
                                    className="w-full py-4 rounded-xl border border-red-200 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 bg-white mt-2"
                                >
                                    <X className="w-4 h-4" /> Cancel Request
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
