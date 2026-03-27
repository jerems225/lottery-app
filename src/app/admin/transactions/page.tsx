"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Search, Filter, ArrowUpRight, ArrowDownLeft, 
  DollarSign, Clock, User as UserIcon, CheckCircle2, XCircle
} from "lucide-react";
import { getAllTransactionsAction, getCommissionsAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";

type Mode = "transactions" | "commissions";

export default function OrderManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<Mode>("transactions");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const loadData = async () => {
    setLoading(true);
    const res: any = mode === "transactions" 
        ? await getAllTransactionsAction() 
        : await getCommissionsAction();
        
    if (res.success) {
        setItems(mode === "transactions" ? res.transactions : res.commissions);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [mode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredItems = items.filter((item) => {
      const searchStr = search.toLowerCase();
      if (mode === "transactions") {
          return item.user?.name?.toLowerCase().includes(searchStr) || 
                 item.description?.toLowerCase().includes(searchStr) ||
                 item.type?.toLowerCase().includes(searchStr);
      } else {
          return item.user?.name?.toLowerCase().includes(searchStr) || 
                 item.fromUser?.name?.toLowerCase().includes(searchStr);
      }
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-black/5">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-4">
             Financial Ledger
          </h1>
          <p className="font-bold text-text-muted">Oversee platform revenue, payouts, and user transaction history.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl md:w-fit shadow-inner">
            <button 
                onClick={() => setMode("transactions")}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === "transactions" ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Transactions
            </button>
            <button 
                onClick={() => setMode("commissions")}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === "commissions" ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Commissions
            </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center bg-white border border-black/5 rounded-2xl px-6 py-4 shadow-sm">
            <Search className="w-5 h-5 text-zinc-400 mr-3" />
            <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text" 
                placeholder={mode === "transactions" ? "Search transactions..." : "Search commissions..."}
                className="bg-transparent border-none outline-none font-bold text-sm text-text-main w-full"
            />
          </div>
          <button onClick={loadData} className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-gold transition-all shadow-xl shadow-black/10">
             Refresh List
          </button>
      </div>

      <div className="bg-white border border-black/5 rounded-[40px] shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-black/5">
                {mode === "transactions" ? (
                  <>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Type</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">User</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Description</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Amount</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Recipient</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">From Contributor</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Reward</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Settled Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center font-black text-text-muted uppercase text-xs tracking-widest">Auditing Ledger...</td></tr>
              ) : paginatedItems.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center font-black text-text-muted uppercase text-xs tracking-widest">No matching records found.</td></tr>
              ) : paginatedItems.map((item, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  key={item.id} 
                  className="hover:bg-zinc-50 transition-all group"
                >
                  {mode === "transactions" ? (
                    <>
                      <td className="px-10 py-6 whitespace-nowrap border-r border-black/5">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${item.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                               {item.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-main line-clamp-1">{item.type}</span>
                         </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                         <div className="flex flex-col min-w-[120px]">
                            <span className="font-black text-sm text-text-main line-clamp-1">{item.user?.name || 'Anonymous'}</span>
                            <span className="text-[10px] font-bold text-text-muted line-clamp-1">{item.user?.email}</span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-sm font-bold text-text-muted max-w-xs truncate">{item.description}</td>
                      <td className="px-10 py-6 whitespace-nowrap">
                         <span className={`font-black text-sm ${item.amount > 0 ? 'text-emerald-600' : 'text-zinc-900 font-black'}`}>
                            {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)}
                         </span>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap text-right">
                         <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-text-main uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] font-bold text-text-muted uppercase">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-10 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-primary-gold font-black text-xs">
                               {item.user?.name?.charAt(0)}
                            </div>
                            <span className="font-black text-sm text-text-main">{item.user?.name}</span>
                         </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                         <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{item.fromUser?.name}</span>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                         <span className="font-black text-sm text-emerald-600">+{formatCurrency(item.amount)}</span>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap text-right">
                         <span className="text-[10px] font-black text-text-muted uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {totalPages > 1 && (
            <div className="p-6 border-t border-black/5 bg-zinc-50/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-3 bg-white border border-black/5 rounded-xl text-zinc-600 hover:text-zinc-900 transition-all disabled:opacity-50 disabled:bg-transparent"
                    >
                        <ArrowDownLeft className="w-4 h-4" />
                    </button>
                    <button 
                         disabled={currentPage === totalPages}
                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                         className="p-3 bg-white border border-black/5 rounded-xl text-zinc-600 hover:text-zinc-900 transition-all disabled:opacity-50 disabled:bg-transparent"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
