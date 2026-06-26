import React from 'react';
import { ClipboardList, BarChart3, TrendingUp, Download, Eye, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DealerReports: React.FC = () => {
  const reports = [
    { title: 'Warehouse Stock Audit', date: 'June 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'Cold-chain Temperature Logs', date: 'May 2026', size: '8.1 MB', type: 'CSV' },
    { title: 'B2B Dispatch & Freight Report', date: 'Q2 2026 Summary', size: '1.8 MB', type: 'PDF' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-white">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList size={14} className="text-emerald-400" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Analytics Logs</span>
        </div>
        <h2 className="text-2xl font-black text-white">Warehouse Reports</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Download or review warehouse occupancy audits and supply schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {reports.map((r, i) => (
          <div key={i} className="p-5 rounded-2xl border border-white/6 flex flex-col justify-between space-y-4 hover:border-white/10 transition-colors"
            style={{ background: 'rgba(10, 18, 14, 0.85)' }}>
            <div>
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 self-start inline-block mb-3">
                {r.type}
              </span>
              <h3 className="font-extrabold text-white text-sm leading-snug">{r.title}</h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-1">
                <Calendar size={11} />
                <span>Issued: {r.date}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-bold text-slate-400">
              <span>Size: {r.size}</span>
              <div className="flex gap-1.5">
                <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-all"><Eye size={13} /></button>
                <button className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-emerald-500/10 transition-all"><Download size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DealerReports;
