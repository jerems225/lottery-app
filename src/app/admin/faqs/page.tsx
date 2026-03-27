"use client";
import React, { useState, useEffect } from "react";
import { 
  HelpCircle, Plus, Search, Trash2, Edit2, 
  Menu, Info, Filter, RefreshCw
} from "lucide-react";
import { getFaqsAction, deleteFaqAction } from "@/app/actions/faq.actions";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaqModal } from "@/components/admin/FaqModal";

export default function FaqManagement() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<any>(null);

  const loadFaqs = async () => {
    setLoading(true);
    const res = await getFaqsAction();
    if (res.success && Array.isArray(res.faqs)) {
      setFaqs(res.faqs);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteFaqAction(id);
    if (res.success) {
      toast.success("FAQ removed");
      loadFaqs();
    } else {
      toast.error(res.error || "Failed to remove FAQ");
    }
  };

  const filteredFaqs = faqs.filter((f) => 
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/5">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-4">
             FAQ Management
          </h1>
          <p className="font-bold text-text-muted">Manage platform frequently asked questions by category and order.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-black/5 rounded-2xl px-6 py-4 w-80 shadow-sm">
                <Search className="w-5 h-5 text-zinc-400 mr-3" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text" 
                    placeholder="Search questions..." 
                    className="bg-transparent border-none outline-none font-bold text-sm text-text-main w-full"
                />
            </div>
            <button 
              onClick={() => { setSelectedFaq(null); setIsModalOpen(true); }}
              className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-primary-gold hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
            >
                <Plus className="w-4 h-4" /> Add FAQ
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
             <div className="col-span-full py-20 flex flex-col items-center gap-4">
                 <RefreshCw className="w-8 h-8 text-primary-gold animate-spin" />
                 <span className="font-black text-[10px] uppercase tracking-[4px] text-text-muted">Refreshing Knowledge Base...</span>
             </div>
        ) : filteredFaqs.length === 0 ? (
            <div className="col-span-full py-20 text-center font-black text-zinc-300 uppercase text-xs tracking-[5px]">
                No FAQs found.
            </div>
        ) : (
          filteredFaqs.map((faq, i) => (
            <motion.div 
              key={faq.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border border-black/5 rounded-[32px] p-6 shadow-premium hover:border-primary-gold/30 transition-all flex items-center justify-between group"
            >
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-primary-gold/10 group-hover:text-primary-gold transition-colors">
                     <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 rounded-lg text-text-muted">
                           {faq.category}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-900 text-white rounded-lg">
                           Order: {faq.order}
                        </span>
                     </div>
                     <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{faq.question}</h3>
                     <p className="text-sm text-text-muted font-bold line-clamp-1 max-w-2xl">{faq.answer}</p>
                  </div>
               </div>

               <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => { setSelectedFaq(faq); setIsModalOpen(true); }}
                    className="p-3 bg-zinc-100 rounded-xl text-zinc-400 hover:text-text-main transition-all"
                  >
                     <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(faq.id)}
                    className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      <FaqModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadFaqs} 
        faq={selectedFaq} 
      />
    </div>
  );
}
