"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, Shield, Percent, DollarSign, 
  MessageSquare, Globe, Save, RefreshCw, 
  Trash2, Plus, Bell, Lock, Activity
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getGlobalSettingsAction, updateGlobalSettingsAction } from "@/app/actions";

export default function GlobalSettings() {
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [settings, setSettings] = useState({
      platformCommission: 20,
      referralReward: 5,
      minWithdrawal: 10,
      maintenanceMode: false,
      newRegistrations: true,
      emailVerification: true,
      supportEmail: "support@bitlot.io"
  });

  useEffect(() => {
     getGlobalSettingsAction().then(res => {
         if (res.success && res.settings) {
             setSettings(res.settings);
         }
         setIsInitializing(false);
     });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res = await updateGlobalSettingsAction(settings);
    setLoading(false);
    
    if (res.error) {
        toast.error(res.error);
    } else {
        toast.success("Platform settings updated successfully!");
    }
  };

  const sections = [
    {
      title: "Core Mechanics",
      icon: Activity,
      fields: [
        { key: "platformCommission", label: "Platform Commission (House Edge)", value: settings.platformCommission, type: "number", suffix: "%" },
        { key: "referralReward", label: "Referral Reward (Level 1)", value: settings.referralReward, type: "number", suffix: "%" },
        { key: "minWithdrawal", label: "Min. Withdrawal Amount", value: settings.minWithdrawal, type: "number", suffix: "$" },
      ]
    },
    {
      title: "Security & Access",
      icon: Lock,
      fields: [
        { key: "maintenanceMode", label: "Maintenance Mode", value: settings.maintenanceMode, type: "toggle" },
        { key: "newRegistrations", label: "New Registrations", value: settings.newRegistrations, type: "toggle" },
        { key: "emailVerification", label: "Email Verification Force", value: settings.emailVerification, type: "toggle" },
      ]
    },
    {
      title: "Communications",
      icon: Bell,
      fields: [
        { key: "supportEmail", label: "Support Contact", value: settings.supportEmail, type: "email" },
      ]
    }
  ];

  const updateSetting = (key: string, value: any) => {
      setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-black/5">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight flex items-center gap-4">
             Global Controls
          </h1>
          <p className="font-bold text-text-muted">Configure platform-wide parameters, security protocols, and financial engines.</p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={handleSave} className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-gold transition-all shadow-xl shadow-black/10 group">
               {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               Save Changes
            </button>
            <button className="p-4 bg-white border border-black/5 rounded-2xl text-red-500 hover:bg-red-50 hover:border-red-500/20 transition-all">
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {sections.map((section, idx) => (
            <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-black/5 rounded-[48px] p-10 shadow-premium flex flex-col gap-8 group"
            >
                <div className="flex items-center gap-4 pb-6 border-b border-black/5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-primary-gold/10 group-hover:text-primary-gold">
                        <section.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tight">{section.title}</h3>
                </div>

                 <div className="flex flex-col gap-8">
                   {isInitializing ? (
                       <div className="py-10 text-center text-xs font-black text-zinc-300 uppercase tracking-widest"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Syncing...</div>
                   ) : section.fields.map((field, fIdx) => (
                       <div key={fIdx} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <label className="flex flex-col">
                             <span className="text-xs font-black text-text-main uppercase tracking-widest">{field.label}</span>
                             <span className="text-[10px] font-bold text-text-muted mt-1">Platform-wide setting</span>
                          </label>
                          <div className="flex items-center gap-3">
                             {field.type === 'toggle' ? (
                                <button 
                                  onClick={() => updateSetting(field.key, !field.value)}
                                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${field.value ? 'bg-emerald-500' : 'bg-red-500 shadow-inner'}`}
                                >
                                   <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${field.value ? 'left-7' : 'left-1'}`} />
                                </button>
                             ) : (
                                <div className="flex items-center bg-zinc-50 border border-black/5 rounded-xl px-4 py-3 group-hover:bg-white group-hover:border-primary-gold/30 transition-all w-full md:w-64">
                                   <input 
                                     type={field.type === 'number' ? 'number' : 'text'}
                                     value={(field.value as string | number)}
                                     onChange={(e) => updateSetting(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                     className="bg-transparent border-none outline-none font-bold text-sm text-text-main w-full"
                                   />
                                   {(field as any).suffix && <span className="ml-2 font-black text-xs text-zinc-400">{(field as any).suffix}</span>}
                                </div>
                             )}
                          </div>
                       </div>
                   ))}
                 </div>
            </motion.div>
        ))}

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[48px] p-12 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-black/30 group">
             <div className="flex flex-col gap-6 relative z-10">
                 <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-primary-gold shadow-xl rotate-3">
                    <Shield className="w-10 h-10" />
                 </div>
                 <h3 className="text-3xl font-[950] tracking-tighter uppercase leading-none mt-4">System Master Key</h3>
                 <p className="font-bold text-white/50 text-sm max-w-xs">Access or update sensitive platform parameters requires elevation.</p>
             </div>
             <button className="relative z-10 mt-10 w-full py-5 bg-white text-zinc-900 rounded-2xl font-black uppercase text-xs hover:bg-primary-gold transition-all shadow-xl group-hover:scale-105 origin-center">
                Elevate Privileges
             </button>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        </div>
      </div>
    </div>
  );
}
