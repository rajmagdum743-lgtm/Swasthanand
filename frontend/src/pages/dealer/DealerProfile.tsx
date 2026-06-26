import React from 'react';
import { User, Shield, MapPin, Building, Key, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const DealerProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-white max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-emerald-400" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Manager Profile</span>
        </div>
        <h2 className="text-2xl font-black text-white">Dealer Credentials</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage node administrator contact information and certificate keys</p>
      </div>

      <div className="rounded-2xl border border-white/6 p-6 space-y-6" style={{ background: 'rgba(10, 18, 14, 0.85)' }}>
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/30 flex items-center justify-center text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <User size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase">{user?.name || 'Authorized Dealer'}</h3>
            <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mt-1.5">
              <Shield size={10} /> Certified Node Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-white/6 space-y-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Registered Phone</span>
            <span className="text-sm font-bold text-white font-mono">{user?.phone || '9284939947'}</span>
          </div>
          <div className="p-4 rounded-xl border border-white/6 space-y-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Authorized Hubs</span>
            <span className="text-sm font-bold text-white">Satara Agri-Coop, Pune Hub</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/6 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Security Clearance</span>
          <div className="flex items-center gap-2.5">
            <Key size={16} className="text-emerald-400" />
            <div className="text-xs">
              <p className="font-extrabold text-white">Cryptographic Node Signature Valid</p>
              <p className="text-[10px] text-slate-500 font-medium">Clearance Level: B2B-Wholesale (Full Access)</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DealerProfile;
