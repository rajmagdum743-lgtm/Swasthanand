import React from 'react';
import { Settings, Shield, Key, Bell, Database, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">Control Panel</span>
        <h2 className="text-2xl font-black text-slate-800">Console Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Configure administrative credentials, geofencing limits, and backup preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6 max-w-3xl">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Shield size={16} className="text-teal-600" /> Authorization & Roles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Tokens TTL</label>
              <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none">
                <option>1 Hour (Default)</option>
                <option>6 Hours</option>
                <option>24 Hours</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Dealer Status</label>
              <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none">
                <option>Awaiting Verification</option>
                <option>Auto-Approved</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Database size={16} className="text-teal-600" /> Database Backup Parameters
          </h3>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-black text-slate-700">Auto-Backup Frequency</p>
              <p className="text-[10px] text-slate-400 font-medium">Backup schema and ledgers automatically to Swasthanand Cloud Storage</p>
            </div>
            <select className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-bold outline-none">
              <option>Daily at 02:00 AM</option>
              <option>Weekly on Sundays</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-100/50">
            <Save size={16} /> Save Configurations
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
