"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Filter, MoreHorizontal, 
  ShieldCheck, ShieldAlert, Edit2, Trash2, Mail,
  CheckCircle2, XCircle, Shield, Zap, ChevronDown,
  User as UserIcon, Loader2, Plus, X, Ban, Calendar, AlertTriangle
} from "lucide-react";
import { 
    getAllUsersAction, 
    updateUserRoleAction, 
    createNewUserAction, 
    updateUserDetailsAction, 
    deleteUserAction, 
    toggleUserBlockAction 
} from "@/app/actions";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const ROLE_CONFIG: Record<string, { color: string, icon: any, label: string, bg: string, border: string }> = {
  SUPERADMIN: { 
    color: "text-purple-600", 
    bg: "bg-purple-50", 
    border: "border-purple-200",
    icon: Zap, 
    label: "Super Admin" 
  },
  ADMIN: { 
    color: "text-amber-600", 
    bg: "bg-amber-50", 
    border: "border-amber-200",
    icon: ShieldCheck, 
    label: "Administrator" 
  },
  MANAGER: { 
    color: "text-blue-600", 
    bg: "bg-blue-50", 
    border: "border-blue-200",
    icon: Shield, 
    label: "Manager" 
  },
  USER: { 
    color: "text-zinc-600", 
    bg: "bg-zinc-50", 
    border: "border-zinc-200",
    icon: UserIcon, 
    label: "Player" 
  },
  AGENT: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: Users,
    label: "Agent"
  },
};

// --- Components ---

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-black/5"
            >
                <div className="p-8 border-b border-black/5 flex items-center justify-between bg-zinc-50/50">
                    <h3 className="text-xl font-black uppercase tracking-tight text-text-main">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-all">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

function RoleSelector({ currentRole, userId, onUpdate, currentAdminRole, onOpenChange }: { 
  currentRole: string, 
  userId: string, 
  onUpdate: (role: string) => void,
  currentAdminRole: string,
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const availableRoles = ["USER", "AGENT", "MANAGER", "ADMIN", "SUPERADMIN"];
  
  const handleSelect = async (role: string) => {
    if (role === currentRole) {
      setIsOpen(false);
      return;
    }

    if (role === "SUPERADMIN" && currentAdminRole !== "SUPERADMIN") {
      toast.error("Only Superadmins can promote to SUPERADMIN");
      return;
    }

    setIsUpdating(true);
    await onUpdate(role);
    setIsUpdating(false);
    setIsOpen(false);
  };

  const currentConfig = ROLE_CONFIG[currentRole] || ROLE_CONFIG.USER;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2 bg-white border border-black/5 rounded-xl shadow-sm hover:border-black/10 transition-all",
          isUpdating && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2">
            <currentConfig.icon className={cn("w-4 h-4", currentConfig.color)} />
            <span className={cn("text-xs font-black uppercase tracking-widest", currentConfig.color)}>
                {currentConfig.label}
            </span>
        </div>
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
        ) : (
          <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-black/10 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {availableRoles.map((role) => {
                const config = ROLE_CONFIG[role];
                const isDisabled = role === "SUPERADMIN" && currentAdminRole !== "SUPERADMIN";
                const isSelected = role === currentRole;

                return (
                  <button
                    key={role}
                    disabled={isDisabled}
                    onClick={() => handleSelect(role)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left",
                      isSelected ? "bg-zinc-50" : "hover:bg-zinc-50",
                      isDisabled && "opacity-30 cursor-not-allowed grayscale"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg", config.bg)}>
                        <config.icon className={cn("w-3.5 h-3.5", config.color)} />
                    </div>
                    <div className="flex flex-col">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? config.color : "text-zinc-600")}>
                            {config.label}
                        </span>
                        {isSelected && (
                            <span className="text-[8px] font-bold text-zinc-400">Current Role</span>
                        )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


function UserRow({ user, currentAdminRole, onUpdateRole, onEdit, onDelete, onBlock }: { 
  user: any, 
  currentAdminRole: string, 
  onUpdateRole: (role: string) => void,
  onEdit: (u: any) => void,
  onDelete: (id: string) => void,
  onBlock: (u: any) => void
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isRestricted = user.blockedUntil && new Date(user.blockedUntil) > new Date();
  const isBlocked = isRestricted && user.isTotalBlock;
  const isSuspended = isRestricted && !user.isTotalBlock;

  return (
    <motion.tr 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className={cn(
        "hover:bg-zinc-50/50 transition-all group",
        isDropdownOpen ? "relative z-50 shadow-sm" : "relative z-0",
        isBlocked ? "bg-red-50/30" : isSuspended ? "bg-amber-50/30" : ""
      )}
    >
      <td className="px-10 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-primary-gold font-black uppercase overflow-hidden border-2 border-zinc-100 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
              {user.image ? <img src={user.image} className="w-full h-full object-cover" alt="" /> : user.name?.charAt(0) || 'U'}
           </div>
           <div className="flex flex-col">
              <span className={cn("font-black text-sm", isBlocked ? "text-red-600" : isSuspended ? "text-amber-600" : "text-text-main")}>
                {user.name || 'Anonymous'}
                {isBlocked && " (BLOCKED)"}
                {isSuspended && " (SUSPENDED)"}
              </span>
              <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5 mt-0.5">
                 <Mail className="w-3 h-3" /> {user.email}
              </span>
           </div>
        </div>
      </td>
      <td className="px-10 py-6 whitespace-nowrap min-w-[200px]">
         <RoleSelector 
            currentRole={user.role} 
            currentAdminRole={currentAdminRole}
            userId={user.id} 
            onUpdate={onUpdateRole}
            onOpenChange={setIsDropdownOpen}
         />
      </td>
      <td className="px-10 py-6 whitespace-nowrap">
          {isBlocked ? (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 w-fit">
                <Ban className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Access Blocked</span>
            </div>
          ) : isSuspended ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-600 w-fit">
               <AlertTriangle className="w-3.5 h-3.5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Suspended Account</span>
           </div>
          ) : user.isVerified ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Identity</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 w-fit">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Unverified</span>
            </div>
          )}
      </td>
      <td className="px-10 py-6 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="font-black text-sm text-emerald-600 tracking-tight">${user.balance.toFixed(2)}</span>
        </div>
      </td>
      <td className="px-10 py-6 whitespace-nowrap text-xs">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter bg-zinc-100 px-2 py-1 rounded-md">{new Date(user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </td>
      <td className="px-10 py-6 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
           {(currentAdminRole === "SUPERADMIN" || (currentAdminRole === "ADMIN" && user.role !== "SUPERADMIN" && user.role !== "ADMIN")) && (
             <>
                <button 
                  onClick={() => onBlock(user)}
                  title={isRestricted ? "Lift Restrictions" : "Restrict Access"}
                  className={cn(
                      "p-3 rounded-xl transition-all border",
                      isBlocked ? "bg-red-500 text-white border-red-600" : isSuspended ? "bg-amber-500 text-white border-amber-600" : "bg-white border-black/5 text-zinc-500 hover:text-red-500 hover:border-red-500/20"
                  )}
                >
                    <Ban className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onEdit(user)}
                  className="p-3 bg-white border border-black/5 shadow-sm rounded-xl text-zinc-500 hover:text-zinc-900 hover:border-black/10 transition-all"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
             </>
           )}
           
           {currentAdminRole === "SUPERADMIN" && (
             <button 
               onClick={() => onDelete(user.id)}
               className="p-3 bg-white border border-red-100 shadow-sm rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:grayscale"
             >
                <Trash2 className="w-4 h-4" />
             </button>
           )}

           {(currentAdminRole === "MANAGER") && (
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 italic px-4">Read Only</span>
           )}
        </div>
      </td>
    </motion.tr>
  );
}

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [blockingUser, setBlockingUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockDuration, setBlockDuration] = useState("7"); // days
  const [isTotalBlock, setIsTotalBlock] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getAllUsersAction();
    if (res.success && res.users) {
        setUsers(res.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRoleAction(userId, newRole);
    if (!res.error) {
       toast.success(`Role updated successfully`);
       loadUsers();
    } else {
       toast.error(res.error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await createNewUserAction(data);
    if (!res.error) {
        toast.success("User created successfully");
        setIsAddModalOpen(false);
        loadUsers();
    } else {
        toast.error(res.error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await updateUserDetailsAction(editingUser.id, data);
    if (!res.error) {
        toast.success("User updated successfully");
        setEditingUser(null);
        loadUsers();
    } else {
        toast.error(res.error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is permanent.")) return;
    
    const res = await deleteUserAction(id);
    if (!res.error) {
        toast.success("User deleted");
        loadUsers();
    } else {
        toast.error(res.error);
    }
  };

  const handleToggleBlock = async () => {
    const isCurrentlyRestricted = blockingUser.blockedUntil && new Date(blockingUser.blockedUntil) > new Date();
    
    let blockedUntil: Date | null = null;
    let reason: string | null = null;

    if (!isCurrentlyRestricted) {
        if (!blockReason) {
            toast.error("Please provide a reason for the block");
            return;
        }
        const date = new Date();
        date.setDate(date.getDate() + parseInt(blockDuration));
        blockedUntil = date;
        reason = blockReason;
    }

    const res = await toggleUserBlockAction(blockingUser.id, blockedUntil, reason, isTotalBlock);
    if (!res.error) {
        toast.success(isCurrentlyRestricted ? "Access restored" : (isTotalBlock ? "User BLOCKED & notified" : "User SUSPENDED & notified"));
        setBlockingUser(null);
        setBlockReason("");
        setIsTotalBlock(false);
        loadUsers();
    } else {
        toast.error(res.error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                         u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'role') return a.role.localeCompare(b.role);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const currentAdminRole = session?.user?.role || "USER";

  return (
    <div className="flex flex-col gap-10 pb-40">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-black/5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-zinc-900 rounded-2xl shadow-premium">
                <Users className="w-6 h-6 text-primary-gold" />
             </div>
             <h1 className="text-4xl font-[950] text-text-main uppercase tracking-tight">
                User Registry
             </h1>
          </div>
          <p className="font-bold text-text-muted">Manage roles, permissions, and account statuses for all platform users.</p>
        </div>
        
        <div className="grid grid-cols-1 md:flex md:items-center gap-4">
            <div className="flex items-center bg-white border border-black/5 rounded-2xl px-6 py-4 w-full md:w-64 xl:w-72 shadow-premium transition-all focus-within:ring-2 focus-within:ring-zinc-900/5 focus-within:border-black/20">
                <Search className="w-5 h-5 text-zinc-400 mr-3" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text" 
                    placeholder="Search users..." 
                    className="bg-transparent border-none outline-none font-bold text-sm text-text-main w-full placeholder:text-zinc-300"
                />
            </div>

            <div className="flex items-center bg-white border border-black/5 rounded-2xl px-4 py-4 shadow-premium group">
                <ShieldCheck className="w-4 h-4 text-zinc-400 mr-3" />
                <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-transparent outline-none font-black text-[10px] uppercase tracking-widest text-text-main pr-2 cursor-pointer"
                >
                    <option value="all">Filter: All Roles</option>
                    <option value="USER">Players</option>
                    <option value="AGENT">Agents</option>
                    <option value="MANAGER">Managers</option>
                    <option value="ADMIN">Admins</option>
                    <option value="SUPERADMIN">Super Admins</option>
                </select>
            </div>

            <div className="flex items-center bg-white border border-black/5 rounded-2xl px-4 py-4 shadow-premium group">
                <Filter className="w-4 h-4 text-zinc-400 mr-3" />
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent outline-none font-black text-[10px] uppercase tracking-widest text-text-main pr-2 cursor-pointer"
                >
                    <option value="date">Sort: Newest</option>
                    <option value="name">Sort: Name</option>
                    <option value="role">Sort: Role</option>
                </select>
            </div>

            {(currentAdminRole === "ADMIN" || currentAdminRole === "SUPERADMIN") && (
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-zinc-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            )}
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-[40px] shadow-premium">
        <div className="">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-black/5">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted rounded-tl-[40px]">User Profile</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">System Authority</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Account Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Balance</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Joined Date</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right rounded-tr-[40px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="p-40 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
                            <span className="font-black uppercase tracking-widest text-zinc-400 text-xs">Accessing Secure Registry...</span>
                        </div>
                    </td>
                 </tr>
              ) : sortedUsers.length === 0 ? (
                 <tr><td colSpan={6} className="p-20 text-center font-black text-text-muted">No users found match your criteria.</td></tr>
              ) : sortedUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  currentAdminRole={currentAdminRole}
                  onUpdateRole={(newRole: string) => handleRoleChange(user.id, newRole)}
                  onEdit={(u) => setEditingUser(u)}
                  onDelete={handleDeleteUser}
                  onBlock={(u) => setBlockingUser(u)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New User">
          <form onSubmit={handleCreateUser} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Full Name</label>
                  <input name="name" required type="text" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Email Address</label>
                  <input name="email" required type="email" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Initial Password</label>
                  <input name="password" required type="password" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Assigned Role</label>
                    <select name="role" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-black text-xs uppercase tracking-widest outline-none">
                        <option value="USER">Player</option>
                        <option value="AGENT">Agent</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Administrator</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Starting Balance ($)</label>
                    <input name="balance" type="number" step="0.01" defaultValue="0" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all" />
                </div>
              </div>
              <button type="submit" className="mt-4 bg-zinc-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-900/10 hover:bg-zinc-800 transition-all">
                  Create User Account
              </button>
          </form>
      </Modal>

      {/* Edit Modal */}
      <AnimatePresence>
      {editingUser && (
        <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Modify User Data">
            <form onSubmit={handleUpdateUser} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Full Name</label>
                    <input name="name" defaultValue={editingUser.name} required type="text" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Email Address</label>
                    <input name="email" defaultValue={editingUser.email} required type="email" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">System Balance ($)</label>
                    <input name="balance" defaultValue={editingUser.balance} type="number" step="0.01" className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none" />
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-black/5">
                    <input name="isVerified" id="verify" type="checkbox" defaultChecked={editingUser.isVerified} className="w-5 h-5 rounded-lg border-zinc-300 accent-zinc-900 cursor-pointer" />
                    <label htmlFor="verify" className="text-xs font-black uppercase tracking-widest text-text-main cursor-pointer">Identity Verified</label>
                </div>
                <button type="submit" className="mt-4 bg-zinc-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs shadow-xl transition-all">
                    Commit Changes
                </button>
            </form>
        </Modal>
      )}
      </AnimatePresence>

      {/* Block Modal */}
      <AnimatePresence>
      {blockingUser && (
        <Modal isOpen={!!blockingUser} onClose={() => setBlockingUser(null)} title={blockingUser.blockedUntil && new Date(blockingUser.blockedUntil) > new Date() ? "Unblock Account" : "Access Restriction"}>
            {blockingUser.blockedUntil && new Date(blockingUser.blockedUntil) > new Date() ? (
                <div className="flex flex-col gap-6 text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                        <p className="font-bold text-text-main">This user is currently restricted.</p>
                        <p className="text-sm text-text-muted mt-2 px-10">Restoring access will allow the user to play and transact again immediately.</p>
                    </div>
                    <button onClick={handleToggleBlock} className="bg-emerald-600 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs shadow-xl transition-all">
                        Lift Restrictions Now
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="p-5 bg-red-50 rounded-[32px] border border-red-100 flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <p className="text-xs font-black text-red-700 uppercase tracking-widest">Protocol Warning</p>
                            <p className="text-[11px] font-bold text-red-600/70 mt-1 leading-relaxed">
                                Restricting an account will limit user actions. An automated security notice will be sent to the user's email.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Restriction Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setIsTotalBlock(false)}
                                className={cn(
                                    "flex flex-col gap-2 p-4 rounded-2xl border transition-all text-left",
                                    !isTotalBlock ? "bg-amber-50 border-amber-200 ring-2 ring-amber-500/20" : "bg-zinc-50 border-black/5 hover:border-black/10"
                                )}
                            >
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", !isTotalBlock ? "text-amber-700" : "text-zinc-500")}>Suspension</span>
                                <span className="text-[9px] font-bold text-zinc-400 leading-tight">Can login/see profile. Cannot play or recharge.</span>
                            </button>
                            <button 
                                onClick={() => setIsTotalBlock(true)}
                                className={cn(
                                    "flex flex-col gap-2 p-4 rounded-2xl border transition-all text-left",
                                    isTotalBlock ? "bg-red-50 border-red-200 ring-2 ring-red-500/20" : "bg-zinc-50 border-black/5 hover:border-black/10"
                                )}
                            >
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", isTotalBlock ? "text-red-700" : "text-zinc-500")}>Total Block</span>
                                <span className="text-[9px] font-bold text-zinc-400 leading-tight">No login allowed. Immediate platform kick.</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Restriction Reason</label>
                        <textarea 
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Violation of terms, suspicious activity..."
                            className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-bold outline-none h-32 resize-none" 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Restriction Duration
                        </label>
                        <select 
                            value={blockDuration}
                            onChange={(e) => setBlockDuration(e.target.value)}
                            className="bg-zinc-50 border border-black/10 rounded-xl px-5 py-4 font-black text-xs uppercase tracking-widest outline-none"
                        >
                            <option value="1">24 Hours</option>
                            <option value="7">7 Days (Review period)</option>
                            <option value="30">30 Days (Probation)</option>
                            <option value="3650">Indefinite (Permaban)</option>
                        </select>
                    </div>
                    <button onClick={handleToggleBlock} className="mt-4 bg-red-600 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/10 transition-all">
                        Execute Access Restriction
                    </button>
                </div>
            )}
        </Modal>
      )}
      </AnimatePresence>
    </div>
  );
}



