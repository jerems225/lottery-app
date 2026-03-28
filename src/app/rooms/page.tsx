"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LotteryCard } from "@/components/lottery/LotteryCard";
import { Users, DollarSign, Plus, Info, Lock, Clock, Ticket, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPrivateRoomAction, getActiveRoomsAction } from "@/app/actions";
import { getLiveTicketsAction } from "@/app/actions/lottery.actions";
import { toast } from "react-hot-toast";
import { LiveTicketingFeed } from "@/components/lottery/LiveTicketingFeed";
import { RoomWinnerModal } from "@/components/lottery/RoomWinnerModal";

const DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
  { label: "5h", value: 300 },
];

export default function RoomsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  
  // Winner Modal State
  const [winnerToNotify, setWinnerToNotify] = useState<{ winner: string; room: any } | null>(null);
  
  const fetchRoomData = React.useCallback(async (isPolling = false) => {
      const [roomsData, ticketsData] = await Promise.all([
          getActiveRoomsAction(),
          getLiveTicketsAction()
      ]);
      
      if (ticketsData.success) {
          setLiveTickets(ticketsData.tickets);
      }
      
      setRooms(prevRooms => {
          if (!prevRooms || prevRooms.length === 0) return roomsData;
          
          // Check for new winners across all rooms
          roomsData.forEach(newRoom => {
              const oldRoom = prevRooms.find(r => r.id === newRoom.id);
              if (oldRoom && oldRoom.status !== "COMPLETED" && newRoom.status === "COMPLETED" && newRoom.winnerName) {
                  // A room just completed while we were watching!
                  setWinnerToNotify({ winner: newRoom.winnerName, room: newRoom });
              }
          });
          
          return roomsData;
      });
  }, []);

  useEffect(() => {
    fetchRoomData();
    // Realtime polling removed locally as per request. Updates occur on navigation or manual refresh.
  }, [fetchRoomData]);

  function handleOpenModal() {
    if (!session?.user) {
      toast.error("You must be logged in to create a room.");
      router.push("/login");
      return;
    }
    setShowModal(true);
  }

  async function handleCreateRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("duration_minutes", selectedDuration.toString());

    const toastId = toast.loading("Creating your private room...");
    const res: any = await createPrivateRoomAction(formData);
    setIsLoading(false);

    if (res?.error) {
      if (res.errorCode === "INSUFFICIENT_FUNDS") {
        toast.error(
          <span>Insufficient balance. <a href="/profile" className="underline font-bold">Recharge here</a>.</span>,
          { id: toastId, duration: 5000 }
        );
      } else {
        toast.error(res.error, { id: toastId });
      }
    } else {
      toast.success("🎉 Private room created successfully!", { id: toastId, duration: 3000 });
      setShowModal(false);
      if (res.room) {
        setRooms(prev => [{ ...res.room, winnerName: null, _count: { bets: 0 }, creator: { name: session?.user?.name } }, ...prev]);
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-20 px-6 lg:px-10 max-w-7xl mx-auto w-full relative overflow-hidden">
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none z-0">
           <Users className="w-[800px] h-[800px] absolute -top-20 -right-20 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="text-left max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-[900] text-text-main tracking-tighter uppercase mb-6 leading-[0.9]">
              Community <br/><span className="gold-text-gradient">Lottery Rooms</span>
            </h1>
            <p className="text-text-muted text-lg font-bold leading-relaxed max-w-xl">
              Create or join public and private rooms. Set ticket prices, invite your friends, and let the system pick the winner when time runs out.
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenModal}
            className="flex items-center gap-3 bg-zinc-900 text-white px-10 py-6 rounded-[32px] font-black hover:bg-primary-gold shadow-2xl shadow-black/10 transition-all uppercase tracking-widest text-sm"
          >
            <Plus className="w-5 h-5" />
            Create Room
          </motion.button>
        </div>

        {/* Stats from DB */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
           {[
             { label: "Total Rooms", val: rooms.length.toString(), icon: Plus },
             { label: "Active Rooms", val: rooms.filter((r: any) => r.status === "ACTIVE").length.toString(), icon: Lock },
             { label: "Total Jackpot", val: `$${rooms.reduce((sum: number, r: any) => sum + r.jackpot, 0).toLocaleString()}`, icon: DollarSign },
             { label: "Tickets Sold", val: rooms.reduce((sum: number, r: any) => sum + r.currentTicketCount, 0).toLocaleString(), icon: Users },
           ].map((s, i) => (
             <div key={i} className="bg-white border border-black/5 p-8 rounded-[32px] shadow-sm hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-bg-light rounded-xl flex items-center justify-center mb-4 text-primary-gold">
                   <s.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{s.label}</span>
                   <span className="text-2xl font-[900] text-text-main tracking-tight">{s.val}</span>
                </div>
             </div>
           ))}
        </div>

        <div className="flex items-center justify-between mb-10">
           <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">Active Community Rooms</h2>
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-text-muted uppercase tracking-widest">
                {rooms.filter((r: any) => r.status === "ACTIVE").length} Rooms Online
              </span>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
            {/* Rooms Grid */}
            <div className="flex-1 shrink-0">
                {rooms.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-[40px] border border-dashed border-zinc-300">
                    <Info className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <h4 className="text-xl font-black text-zinc-400 uppercase tracking-widest">No active rooms found</h4>
                    <p className="text-zinc-400 font-bold mt-2">Create the first one to start winning together!</p>
                  </div>
                ) : (
                  <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory gap-6 scrollbar-hide md:grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 md:overflow-visible">
                    {rooms.map(room => (
                       <div key={room.id} className="snap-center shrink-0">
                           <LotteryCard room={room} />
                       </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Live Feed Sidebar */}
            <div className="w-full lg:w-[320px] shrink-0 sticky top-32 self-start hidden lg:block">
                <LiveTicketingFeed tickets={liveTickets} />
            </div>
            {/* Mobile feed at the bottom */}
            <div className="w-full lg:hidden block mt-10">
                <LiveTicketingFeed tickets={liveTickets} />
            </div>
        </div>
      </main>

      {/* Winner Modal generated by real-time updates */}
      <RoomWinnerModal 
          winner={winnerToNotify?.winner} 
          room={winnerToNotify?.room} 
          onClose={() => setWinnerToNotify(null)} 
      />

      {/* Create Room Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-md overflow-y-auto" onClick={() => setShowModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 md:p-10 lg:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-lg my-auto border border-black/5"
            >
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-text-main uppercase">New Private Room</h2>
                  <p className="text-text-muted font-bold mt-1 md:mt-2 text-xs md:text-sm">Configure your community lottery</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-light hover:bg-zinc-100 transition-all">
                  <Plus className="w-6 h-6 rotate-45 text-text-muted" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="flex flex-col gap-5 md:gap-6">
                {/* Room Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-[0.1em]">Room Name</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input 
                      name="title"
                      type="text" 
                      defaultValue="My Private Lottery"
                      maxLength={50}
                      required
                      className="w-full bg-bg-light border border-black/5 rounded-2xl py-3 md:py-4 pl-12 pr-6 font-bold text-sm outline-none focus:border-primary-gold transition-all"
                    />
                  </div>
                </div>

                {/* Ticket Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-[0.1em]">Ticket Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input 
                      name="bet_amount"
                      type="number" 
                      defaultValue={10}
                      min={1}
                      required
                      className="w-full bg-bg-light border border-black/5 rounded-2xl py-3 md:py-4 pl-12 pr-6 font-black text-lg outline-none focus:border-primary-gold transition-all"
                    />
                  </div>
                </div>

                {/* Max Tickets */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-[0.1em]">Max Tickets</label>
                  <div className="relative">
                    <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                    <input 
                      name="max_tickets"
                      type="number" 
                      defaultValue={20}
                      min={2}
                      required
                      className="w-full bg-bg-light border border-black/5 rounded-2xl py-3 md:py-4 pl-12 pr-6 font-black text-lg outline-none focus:border-primary-gold transition-all"
                    />
                  </div>
                </div>

                {/* Duration Selector */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-[0.1em] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Close Purchases After
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedDuration(opt.value)}
                        className={`py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                          selectedDuration === opt.value
                            ? "border-primary-gold bg-primary-gold/5 text-primary-gold"
                            : "border-black/5 bg-bg-light text-text-muted hover:border-black/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Rules */}
                <div className="p-4 bg-primary-gold/5 border border-primary-gold/10 rounded-2xl border-dashed">
                  <span className="text-[10px] font-black text-primary-gold uppercase mb-2 block tracking-widest">Revenue Split</span>
                  <div className="flex justify-between text-[11px] font-bold text-text-muted">
                    <span>🎟️ Winner Take:</span>
                    <span className="text-text-main">75%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-text-muted mt-1">
                    <span>👤 Creator Share:</span>
                    <span className="text-text-main">5%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-text-muted mt-1">
                    <span>🏢 Platform Fee:</span>
                    <span className="text-text-main">20%</span>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-text-main text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-xl shadow-black/10 hover:bg-primary-gold transition-all mt-2 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "🚀 Launch Private Room"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
