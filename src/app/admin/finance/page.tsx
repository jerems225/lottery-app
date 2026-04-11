"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Search, DollarSign, Wallet, Phone, RefreshCcw } from "lucide-react";
import { 
    getAllUserRequestsAction, 
    processUserRequestAction,
    getAllAgentRechargeRequestsAction,
    processAgentRechargeAction,
    agentRequestRechargeAction,
    searchAgentsAction,
    adminDirectRechargeAction
} from "@/app/actions/finance.actions";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { formatNumber } from "@/lib/utils";

export default function FinanceAdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"users" | "agents">("users");
    const [userReqs, setUserReqs] = useState<any[]>([]);
    const [agentReqs, setAgentReqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isRecharging, setIsRecharging] = useState(false);
    const [rechargeAmt, setRechargeAmt] = useState("");
    const [proofRef, setProofRef] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [directAmt, setDirectAmt] = useState("");
    const [isDirectLoading, setIsDirectLoading] = useState(false);

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

    const loadData = async () => {
        setLoading(true);
        if (activeTab === "users") {
            const res = await getAllUserRequestsAction();
            if (res.success) setUserReqs(res.requests);
        } else {
            const res = await getAllAgentRechargeRequestsAction();
            if (res.success) setAgentReqs(res.requests);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleProcessUser = async (id: string, st: "APPROVED" | "REJECTED") => {
        toast.loading("Processing...");
        const res = await processUserRequestAction(id, st);
        toast.dismiss();
        if (res && "error" in res && res.error) toast.error(res.error as string);
        else {
            toast.success(`Request ${st.toLowerCase()}!`);
            loadData();
        }
    };

    const handleProcessAgent = async (id: string, st: "APPROVED" | "REJECTED") => {
        toast.loading("Processing...");
        const res = await processAgentRechargeAction(id, st);
        toast.dismiss();
        if (res && "error" in res && res.error) toast.error(res.error as string);
        else {
            toast.success(`Agent Recharge ${st.toLowerCase()}!`);
            loadData();
        }
    };

    const handleAgentRechargeApply = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(rechargeAmt);
        if (!amt || amt <= 0) return toast.error("Invalid amount");
        if (!proofRef) return toast.error("Please provide a transaction reference");
        
        setIsRecharging(true);
        const res = await agentRequestRechargeAction(amt, proofRef);
        setIsRecharging(false);
        if (res && "error" in res && res.error) toast.error(res.error as string);
        else {
            toast.success("Recharge request submitted to Admin!");
            setRechargeAmt("");
            setProofRef("");
        }
    };

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-black/5">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-4">
                        Finance & Agents
                    </h1>
                    <p className="font-bold text-text-muted">Manage deposits, withdrawals, and agent liquidity.</p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl md:w-fit shadow-inner">
                    <button 
                        onClick={() => setActiveTab("users")}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "users" ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        User Requests
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab("agents")}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "agents" ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Agent Recharges
                        </button>
                    )}
                </div>
            </div>

            {/* If Agent, show block to request recharge from Admin */}
            {!isAdmin && session?.user?.role === "AGENT" && activeTab === "users" && (
                <div className="p-8 bg-zinc-900 text-white rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/20 blur-[80px] rounded-full" />
                    <div className="flex flex-col gap-2 relative z-10 max-w-md">
                        <span className="text-xs font-black uppercase tracking-widest text-primary-gold">Agent Liquidity</span>
                        <h3 className="text-2xl font-black">Need more balance?</h3>
                        <p className="text-sm font-bold text-zinc-400">Request a top-up from an Admin by providing your payment proof reference.</p>
                    </div>
                    <form onSubmit={handleAgentRechargeApply} className="flex gap-4 w-full md:w-auto relative z-10 flex-wrap">
                        <input 
                            type="number" 
                            placeholder="Amount ($)" 
                            value={rechargeAmt}
                            onChange={e => setRechargeAmt(e.target.value)}
                            className="bg-zinc-800 text-white border border-zinc-700 rounded-2xl px-5 py-4 w-32 font-black text-sm outline-none focus:border-primary-gold"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Tx Hash / Phone Ref" 
                            value={proofRef}
                            onChange={e => setProofRef(e.target.value)}
                            className="bg-zinc-800 text-white border border-zinc-700 rounded-2xl px-5 py-4 flex-1 min-w-[150px] font-bold text-sm outline-none focus:border-primary-gold"
                            required
                        />
                        <button disabled={isRecharging} className="bg-primary-gold text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl disabled:opacity-50 shrink-0">
                            Apply
                        </button>
                    </form>
                </div>
            )}

            {/* If Admin and tab is "agents", show Direct Recharge Form */}
            {isAdmin && activeTab === "agents" && (
                <div className="p-8 bg-zinc-50 border border-black/5 rounded-[32px] flex flex-col gap-6 relative overflow-visible">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-primary-gold">Manual Recharge</span>
                        <h3 className="text-2xl font-black">Recharge an Agent directly</h3>
                        <p className="text-sm font-bold text-zinc-500">Search for an agent and add digital balance to their account.</p>
                    </div>

                    <div className="flex flex-col gap-4 relative">
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="relative flex-1 min-w-[200px] max-w-sm">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by Name or Email..." 
                                    value={searchQuery}
                                    onChange={async (e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.length > 2) {
                                            const res = await searchAgentsAction(e.target.value);
                                            if (res.success) setSearchResults(res.agents);
                                        } else {
                                            setSearchResults([]);
                                        }
                                    }}
                                    className="w-full bg-white border border-black/10 rounded-2xl pl-12 pr-5 py-4 font-bold text-sm outline-none focus:border-primary-gold shadow-inner"
                                />
                                {searchResults.length > 0 && !selectedAgent && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-black/10 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                        {searchResults.map(ag => (
                                            <button 
                                                key={ag.id}
                                                onClick={() => {
                                                    setSelectedAgent(ag);
                                                    setSearchQuery("");
                                                    setSearchResults([]);
                                                }}
                                                className="w-full text-left p-4 hover:bg-zinc-50 border-b border-black/5 last:border-0 flex items-center justify-between"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-text-main">{ag.name || "Unknown"}</span>
                                                    <span className="text-xs font-bold text-text-muted">{ag.email}</span>
                                                </div>
                                                <span className="text-xs font-black text-primary-gold uppercase tracking-widest">Select</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedAgent && (
                            <div className="p-5 bg-white border border-primary-gold/30 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 max-w-xl">
                                <div className="flex-1 flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Selected Agent</span>
                                    <span className="font-black text-lg text-text-main">{selectedAgent.name}</span>
                                    <span className="text-xs font-bold text-text-muted">{selectedAgent.email}</span>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 px-2 py-0.5 bg-emerald-50 w-fit rounded-md border border-emerald-100">
                                    Balance: ${formatNumber(selectedAgent.balance)}
                                    </span>
                                </div>
                                <form 
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const curAmt = parseFloat(directAmt);
                                        if(!curAmt || curAmt <= 0) return toast.error("Invalid amount");
                                        setIsDirectLoading(true);
                                        const res = await adminDirectRechargeAction(selectedAgent.id, curAmt);
                                        setIsDirectLoading(false);
                                        if (res && "error" in res && res.error) toast.error(res.error as string);
                                        else {
                                            toast.success("Agent successfully recharged!");
                                            setSelectedAgent(null);
                                            setDirectAmt("");
                                            loadData(); 
                                        }
                                    }}
                                    className="flex gap-3 w-full md:w-auto"
                                >
                                    <input 
                                        type="number" 
                                        placeholder="Amount ($)" 
                                        value={directAmt}
                                        onChange={e => setDirectAmt(e.target.value)}
                                        className="bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 w-28 font-black text-sm outline-none focus:border-primary-gold"
                                        required
                                    />
                                    <button disabled={isDirectLoading} className="bg-primary-gold text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-xl disabled:opacity-50 min-w-[100px]">
                                        Confirm
                                    </button>
                                    <button type="button" onClick={() => setSelectedAgent(null)} className="px-3 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-all">
                                        <X className="w-4 h-4 text-zinc-600" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white border border-black/5 rounded-[40px] shadow-premium overflow-hidden min-h-[400px]">
                <div className="flex items-center justify-between p-6 border-b border-black/5">
                    <span className="font-black text-lg uppercase">{activeTab === "users" ? "User Requests History" : "Agent Recharges History"}</span>
                    <button onClick={loadData} className="px-4 py-2 hover:bg-zinc-100 rounded-xl transition-all flex items-center gap-2">
                        <RefreshCcw className={`w-4 h-4 text-text-muted ${loading ? "animate-spin" : ""}`} />
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Refresh</span>
                    </button>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="w-8 h-8 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (activeTab === "users" ? userReqs : agentReqs).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <Wallet className="w-12 h-12 text-zinc-200 mb-4" />
                            <span className="font-black text-xl text-text-main uppercase">All caught up!</span>
                            <span className="font-bold text-text-muted text-sm mt-2">No pending requests at the moment.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {(activeTab === "users" ? userReqs : agentReqs).map(req => (
                                <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-zinc-50 border border-black/5 rounded-2xl gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${req.type === 'WITHDRAWAL' ? 'bg-zinc-900 text-white' : 'bg-primary-gold/10 text-primary-gold'}`}>
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-base uppercase">{req.type}</span>
                                                <span className={`font-black text-lg ${req.type === 'WITHDRAWAL' ? 'text-zinc-900' : 'text-emerald-600'}`}>${formatNumber(req.amount)}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                                                <span className="text-xs font-black text-text-muted uppercase tracking-widest">
                                                    User: <span className="text-zinc-700">{req.user?.name || req.user?.email}</span>
                                                </span>
                                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                    Bal: ${formatNumber(req.user?.balance ?? 0)}
                                                </span>
                                                {req.paymentMethod && (
                                                    <span className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                                                        <Wallet className="w-3 h-3" /> {req.paymentMethod}
                                                    </span>
                                                )}
                                                {req.phoneNumber && (
                                                    <span className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {req.phoneNumber}
                                                    </span>
                                                )}
                                                {req.proofUrl && (
                                                    <span className="text-xs font-black text-text-muted uppercase tracking-widest">
                                                        Ref: <span className="text-zinc-700">{req.proofUrl}</span>
                                                    </span>
                                                )}
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    req.status === 'CANCELLED' ? 'bg-zinc-200 text-zinc-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400 mt-1">{new Date(req.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4 md:mt-0 items-center justify-end">
                                        {req.status === "PENDING" ? (
                                            <>
                                                <button 
                                                    onClick={() => activeTab === "users" ? handleProcessUser(req.id, "REJECTED") : handleProcessAgent(req.id, "REJECTED")}
                                                    className="px-5 py-3 rounded-xl border border-red-200 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2 bg-white"
                                                >
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                                <button 
                                                    onClick={() => activeTab === "users" ? handleProcessUser(req.id, "APPROVED") : handleProcessAgent(req.id, "APPROVED")}
                                                    className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Processed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
