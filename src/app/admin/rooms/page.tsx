"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, Search, Filter, Trash2, Edit2, 
  ExternalLink, DollarSign, Users, Calendar, PlusCircle, RefreshCw
} from "lucide-react";
import { getAllLotteriesAction, deleteLotteryAction } from "@/app/actions/admin.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { RoomModal } from "@/components/admin/RoomModal";
import { ManualDrawModal } from "@/components/admin/ManualDrawModal";
import { Trophy } from "lucide-react";

export default function PublicRoomManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Manual Draw State
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [roomToDraw, setRoomToDraw] = useState<any>(null);

  const loadRooms = async () => {
    setLoading(true);
    const res = await getAllLotteriesAction(false); // isPrivate: false
    if (res.success && Array.isArray(res.lotteries)) {
        setRooms(res.lotteries);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the room and all associated data if no bets exist.")) return;
    const res = await deleteLotteryAction(id);
    if (res.success) {
       toast.success("Room deleted");
       loadRooms();
    } else {
       toast.error(res.error || "Failed to delete");
    }
  };

  const filteredRooms = rooms.filter((r) => 
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/5">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-4">
             Official Draw Hub
          </h1>
          <p className="font-bold text-text-muted">Manage official platform lotteries, winners, and public prize pools.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-black/5 rounded-2xl px-6 py-4 w-80 shadow-sm">
                <Search className="w-5 h-5 text-zinc-400 mr-3" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text" 
                    placeholder="Search drawings..." 
                    className="bg-transparent border-none outline-none font-bold text-sm text-text-main w-full"
                />
            </div>
            <button 
                onClick={() => { setSelectedRoom(null); setIsModalOpen(true); }}
                className="bg-zinc-900 text-white flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-gold transition-all shadow-xl shadow-black/10"
            >
               <PlusCircle className="w-5 h-5" />
               New Room
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-20 flex flex-col items-center gap-4">
                 <RefreshCw className="w-8 h-8 text-primary-gold animate-spin" />
                 <span className="font-black text-[10px] uppercase tracking-[4px] text-text-muted">Synchronizing Drawings...</span>
             </div>
        ) : filteredRooms.length === 0 ? (
            <div className="col-span-full py-20 text-center font-black text-zinc-300 uppercase text-xs tracking-[5px]">
                No public drawings found.
            </div>
        ) : filteredRooms.map((room, i) => (
           <motion.div 
             key={room.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="bg-white border border-black/5 rounded-[40px] p-8 shadow-premium flex flex-col gap-6 group hover:border-primary-gold/40 transition-all relative overflow-hidden"
           >
              <div className="flex items-center justify-between relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-primary-gold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Crown className="w-7 h-7" />
                 </div>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${room.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                    {room.status} {room.isAutoResolution && "• AUTO"}
                 </div>
              </div>

              {/* Resolution Area */}
              <div className="flex flex-col gap-3 p-5 rounded-[24px] border border-black/5 bg-zinc-50 relative z-20 overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                        Resolution: <span className={room.isAutoResolution ? "text-primary-gold" : "text-text-main"}>{room.isAutoResolution ? "AUTOMATIC" : "MANUAL"}</span>
                    </span>
                    {room.isResolved && (
                        <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">RESOLVED</span>
                    )}
                </div>

                {room.status === 'ACTIVE' && !room.isResolved && (
                    <>
                        {new Date(room.endsAt) < new Date() ? (
                            <button 
                                onClick={() => { setRoomToDraw(room); setIsDrawModalOpen(true); }}
                                className="flex items-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-700 transition-all text-white rounded-[20px] shadow-lg shadow-emerald-600/20 w-full justify-center group/draw"
                            >
                                <Trophy className="w-4 h-4 text-white animate-bounce" />
                                <span className="text-[11px] font-[1000] uppercase tracking-tighter">Conduct Draw & Pick Winner</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-zinc-200/50 text-zinc-400 rounded-[20px] w-full justify-center cursor-not-allowed">
                                <Trophy className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Draw Available Soon</span>
                            </div>
                        )}
                    </>
                )}
              </div>

              <div className="flex flex-col gap-2 relative z-10 p-2">
                 <h3 className="text-xl font-[900] text-text-main line-clamp-1 uppercase tracking-tight">{room.title}</h3>
                 <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <DollarSign className="w-3 h-3 text-emerald-500" /> TKT Price: {formatCurrency(room.price)}
                 </div>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 relative z-10">
                 <div className="p-4 bg-zinc-50 rounded-2xl flex flex-col gap-1 border border-black/5">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Current Pot</span>
                    <span className="text-lg font-black text-emerald-600 leading-none">{formatCurrency(room.jackpot)}</span>
                    <span className="text-[8px] font-bold text-text-muted/60 mt-1 uppercase tracking-tight">Max Prize: {formatCurrency(room.maxTickets * room.price * 0.75)}</span>
                 </div>
                 <div className="p-4 bg-zinc-50 rounded-2xl flex flex-col gap-1 border border-black/5">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Total Sales</span>
                    <span className="text-lg font-black text-text-main leading-none">{room.currentTicketCount}</span>
                    <span className="text-[8px] font-bold text-text-muted/60 mt-1 uppercase tracking-tight">Of {room.maxTickets} tickets</span>
                 </div>
                 <div className="col-span-2 xl:col-span-1 p-4 bg-primary-gold/5 rounded-2xl flex flex-col gap-1 border border-primary-gold/20">
                    <span className="text-[9px] font-black text-primary-gold uppercase tracking-widest leading-none mb-1">Potential Gain</span>
                    <span className="text-lg font-black text-zinc-900 leading-none">{formatCurrency(room.currentTicketCount * room.price * ((room.adminCommission || 20) / 100))}</span>
                    <span className="text-[8px] font-bold text-text-muted/60 mt-1 uppercase tracking-tight">Max: {formatCurrency(room.maxTickets * room.price * ((room.adminCommission || 20) / 100))}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-black/5 mt-auto relative z-10">
                 <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-widest">
                    <Calendar className="w-3 h-3 text-zinc-400" /> {new Date(room.endsAt).toLocaleDateString()}
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { setSelectedRoom(room); setIsModalOpen(true); }}
                        className="p-3 bg-zinc-100 rounded-xl text-zinc-400 hover:text-text-main transition-all"
                    >
                       <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(room.id)}
                      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary-gold/5 transition-colors" />
           </motion.div>
        ))}
      </div>

      <RoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadRooms} 
        room={selectedRoom} 
      />

      {roomToDraw && (
          <ManualDrawModal
            isOpen={isDrawModalOpen}
            onClose={() => setIsDrawModalOpen(false)}
            onSuccess={loadRooms}
            room={roomToDraw}
          />
      )}
    </div>
  );
}
