import React from 'react';
import {
  adminStats,
  dealerPerformanceList,
  systemAlerts,
  orderTrendsData,
  inventoryDistributionData
} from '../../data/adminDashboardData';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  AlertCircle,
  Building2,
  Package,
  Sparkles,
  BarChart3,
  ListFilter,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const AdminDashboard: React.FC = () => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* Hero Header Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl translate-x-20 -translate-y-20" />
          <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl translate-y-16" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 text-teal-300">
              <Sparkles size={10} /> Node Control Active
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-none text-white">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Control Console</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl font-medium">
              Administrative management panel. Monitor real-time payment transactions, agricultural ledger updates, geofenced warehouse parameters, and platform health metrics.
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="text-center px-5 py-4 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-md">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Gateway Latency</span>
              <span className="text-2xl font-black text-white flex items-center gap-1.5 justify-center">
                12ms <ShieldCheck className="text-teal-400" size={18} />
              </span>
            </div>
            <div className="text-center px-5 py-4 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-md">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">LEDGER HEIGHT</span>
              <span className="text-2xl font-black text-white flex items-center gap-1.5 justify-center">
                #84,102 <Activity className="text-teal-400 animate-pulse" size={16} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {adminStats.map((stat, i) => {
          const isUp = stat.trend === 'up';
          const isDown = stat.trend === 'down';
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group cursor-default"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</span>
                  {isUp && <TrendingUp size={16} className="text-emerald-500 bg-emerald-50 p-0.5 rounded" />}
                  {isDown && <TrendingDown size={16} className="text-rose-500 bg-rose-50 p-0.5 rounded" />}
                  {!isUp && !isDown && <Activity size={16} className="text-slate-400 bg-slate-50 p-0.5 rounded" />}
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1.5">{stat.value}</h3>
              </div>
              <p className={`text-[10px] font-bold ${
                isUp ? 'text-emerald-600' : isDown ? 'text-rose-500' : 'text-slate-400'
              }`}>{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics & Distribution Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue & Order Trends (2 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 size={15} className="text-teal-600" /> Revenue & Order Trends
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">B2B and direct consumer platform checkout analytics</p>
            </div>
            <button className="flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <ListFilter size={11} /> Weekly Filter
            </button>
          </div>

          <div className="flex-1 flex items-end justify-between h-44 gap-4 px-2">
            {orderTrendsData.map((d, index) => {
              const maxVal = 320000;
              const pct = (d.revenue / maxVal) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                  <div className="w-full relative flex justify-center">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                      ₹{(d.revenue / 1000).toFixed(0)}k ({d.orders} ord)
                    </div>
                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: index * 0.05, duration: 0.6 }}
                      className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-teal-600 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-300 shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{d.date}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Inventory Distribution */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-5">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Package size={15} className="text-teal-600" /> Catalog Distribution
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Categorized analysis of items listed in the system</p>
          </div>

          <div className="space-y-4">
            {inventoryDistributionData.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{item.category}</span>
                  <span className="text-slate-400 font-medium">{item.count} items ({item.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: i * 0.05 + 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dealer Performance & Alerts widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Dealer Performance List (2 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 size={15} className="text-teal-600" /> B2B Dealer Nodes Performance
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Active warehouse hubs sorted by total order distribution</p>
            </div>
            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-black rounded-lg border border-teal-100">
              5 Active Nodes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-black">Dealer Center</th>
                  <th className="pb-3 font-black text-center">Orders</th>
                  <th className="pb-3 font-black text-right">Revenue</th>
                  <th className="pb-3 font-black text-center">Node Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {dealerPerformanceList.map((d, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3">
                      <p className="font-extrabold text-slate-800 uppercase">{d.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{d.location}</p>
                    </td>
                    <td className="py-3 text-center text-slate-500">{d.orders} dispatches</td>
                    <td className="py-3 text-right text-teal-600 font-extrabold">{d.revenue}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        d.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        d.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Alerts */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-rose-500" /> Platform Security & Alerts
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-time log events triggered from telemetry gateways</p>
          </div>

          <div className="space-y-3 flex-1 mb-4">
            {systemAlerts.map((alert, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                <AlertCircle size={16} className={`shrink-0 mt-0.5 ${
                  alert.severity === 'high' ? 'text-rose-500' : alert.severity === 'medium' ? 'text-amber-500' : 'text-slate-400'
                }`} />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">{alert.source}</span>
                    <span className="text-[8px] font-medium text-slate-400 shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 leading-snug">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-black uppercase tracking-widest border border-slate-200 rounded-xl transition-all">
            Clear Security Log
          </button>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default AdminDashboard;
