import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  Truck,
  BarChart3,
  Activity,
  Zap,
  ChevronRight,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 16 } }
};

const DealerDashboard: React.FC = () => {
  const { warehouse } = useOutletContext<{ warehouse: string }>();
  const { products } = useProducts();

  const lowStockProducts = (products as any[]).map((p, idx) => ({
    ...p,
    stock: (idx * 7 + 3) % 25 + 2
  })).filter(p => p.stock < 15);

  const kpiCards = [
    {
      title: 'Active Batches',
      value: `${products.length}`,
      unit: 'Batches',
      change: '+100% Certified',
      icon: Package,
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      border: 'border-emerald-500/15',
      chartData: [40, 55, 48, 70, 65, 80, 90]
    },
    {
      title: 'Pending Orders',
      value: '3',
      unit: 'Orders',
      change: '+1 Today',
      icon: Clock,
      color: 'amber',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/15',
      chartData: [20, 28, 22, 35, 28, 40, 30]
    },
    {
      title: 'In Transit',
      value: '2',
      unit: 'Shipments',
      change: 'En Route',
      icon: Truck,
      color: 'blue',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      border: 'border-blue-500/15',
      chartData: [15, 18, 22, 20, 25, 22, 28]
    },
    {
      title: 'Stock Alerts',
      value: `${lowStockProducts.length}`,
      unit: 'Low Items',
      change: 'Action Required',
      icon: AlertTriangle,
      color: 'rose',
      gradient: 'from-rose-500/20 to-rose-600/5',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      border: 'border-rose-500/15',
      chartData: [30, 25, 35, 28, 40, 32, 38]
    }
  ];

  const recentActivity = [
    { action: 'Stock adjusted', product: 'Pure A2 Vedic Ghee', detail: '+50 units', time: '2 min ago', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { action: 'Order confirmed', product: 'B2B-ORD-5819', detail: '₹18,450', time: '15 min ago', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { action: 'Alert triggered', product: 'Moringa Powder', detail: 'Low stock', time: '1h ago', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { action: 'Batch traced', product: 'Organic Turmeric', detail: 'Audit complete', time: '3h ago', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const pendingDispatches = [
    { orderId: 'ORD-9304', items: 'Pure A2 Vedic Ghee', qty: 25, dest: 'Kolhapur Organic Mart', time: 'In 2 hrs', status: 'qc', pct: 65 },
    { orderId: 'ORD-9289', items: 'Organic Turmeric Finger', qty: 100, dest: 'Karad Super Foods', time: 'Tomorrow', status: 'qc', pct: 40 },
    { orderId: 'ORD-9254', items: 'Moringa Powder', qty: 50, dest: 'Satara Wellness Retail', time: 'Completed', status: 'done', pct: 100 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-7">

      {/* ─── Hero Banner ─────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-7 md:p-9"
        style={{ background: 'linear-gradient(135deg, #0B4F35 0%, #064e3b 50%, #065f46 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl translate-x-20 -translate-y-20" />
          <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-300/8 rounded-full blur-2xl translate-y-16" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border border-emerald-400/20 text-emerald-300"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <Sparkles size={10} /> Live Telemetry Active
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Warehouse <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7, #34d399)' }}>Analytics</span>
            </h2>
            <p className="text-emerald-200/70 text-sm max-w-lg font-medium leading-relaxed">
              Geofenced view synced with <strong className="text-white underline decoration-emerald-400 decoration-2 underline-offset-4">{warehouse}</strong>.
              Showing automated QC logs, logistics data, and B2B distribution insights.
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="text-center px-6 py-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
              <span className="block text-[9px] font-black text-emerald-300 uppercase tracking-[0.15em] mb-2">Batch Health</span>
              <span className="text-3xl font-black text-white flex items-center gap-2 justify-center">
                98.4%
                <ShieldCheck className="text-emerald-400" size={24} />
              </span>
            </div>
            <div className="text-center px-6 py-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
              <span className="block text-[9px] font-black text-emerald-300 uppercase tracking-[0.15em] mb-2">QC Pass Rate</span>
              <span className="text-3xl font-black text-white flex items-center gap-2 justify-center">
                99.1%
                <Zap className="text-amber-400" size={24} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] cursor-default group ${stat.border}`}
              style={{ background: `linear-gradient(135deg, rgba(15,25,20,0.9), rgba(10,18,14,0.9))` }}>

              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg} border ${stat.border}`}>
                    <Icon className={stat.iconColor} size={20} />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                    <span>Details</span>
                    <ArrowUpRight size={10} />
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <span className="block text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">{stat.title}</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white leading-none">{stat.value}</span>
                    <span className="text-sm font-bold text-slate-400 mb-0.5">{stat.unit}</span>
                  </div>
                </div>

                {/* Mini sparkline */}
                <div className="flex items-end gap-0.5 h-7 mb-3">
                  {stat.chartData.map((h, ci) => (
                    <div key={ci} className={`flex-1 rounded-sm transition-all duration-300 ${stat.iconBg} opacity-50 group-hover:opacity-80`}
                      style={{ height: `${(h / 90) * 100}%` }} />
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  <TrendingUp size={12} className="text-emerald-400" />
                  <span className="text-slate-400">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Main Content Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Low Stock Alert Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: 'rgba(10,18,14,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <AlertTriangle size={15} className="text-rose-400" />
                <h3 className="text-sm font-black text-white">Fast-Depleting Stock Alerts</h3>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Inventory items below safe threshold levels</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-rose-400 border border-rose-500/25"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              {lowStockProducts.length} Alerts
            </span>
          </div>

          <div className="p-2">
            {lowStockProducts.map((p, idx) => {
              const pct = Math.round((p.stock / 25) * 100);
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/3 transition-colors group">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={p.image || "/images/placeholder.jpg"} alt={p.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=120'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-extrabold text-white text-sm truncate">{p.name}</h4>
                      <span className="text-xs font-black text-rose-400 shrink-0 ml-2">{p.stock} left</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: idx * 0.08 + 0.3, duration: 0.8 }}
                          style={{ background: pct < 30 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#f59e0b,#d97706)' }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-500 shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                </motion.div>
              );
            })}
            {lowStockProducts.length === 0 && (
              <div className="py-10 text-center">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">All stock levels are healthy!</p>
              </div>
            )}
          </div>

          <div className="px-6 pb-5">
            <Link to="/dealer/inventory"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/8 transition-all"
              style={{ background: 'rgba(16,185,129,0.05)' }}>
              Manage Inventory <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>

        {/* Pending Dispatches */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/6 flex flex-col"
          style={{ background: 'rgba(10,18,14,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-sm font-black text-white mb-0.5">Pending Dispatches</h3>
            <p className="text-[10px] text-slate-500 font-medium">Shipments ready for QC verification</p>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {pendingDispatches.map((ord, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl border border-white/6 hover:border-emerald-500/20 transition-all group cursor-default"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-extrabold text-white">{ord.orderId}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                    ord.status === 'done'
                      ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8'
                      : 'text-amber-400 border-amber-500/25 bg-amber-500/8'
                  }`}>
                    {ord.status === 'done' ? 'Complete' : 'Awaiting QC'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-300 mb-1 truncate">{ord.items} <span className="text-slate-500">(×{ord.qty})</span></p>
                <p className="text-[10px] text-slate-500 font-medium truncate mb-3">→ {ord.dest}</p>

                {/* Progress bar */}
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${ord.pct}%` }}
                    transition={{ delay: idx * 0.1 + 0.4, duration: 0.9 }}
                    style={{ background: ord.status === 'done' ? 'linear-gradient(90deg,#10B981,#34d399)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
                </div>

                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 mt-2">
                  <Clock size={10} />
                  <span>{ord.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <Link to="/dealer/orders"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white border border-white/8 hover:border-emerald-500/25 transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.4), rgba(16,185,129,0.15))' }}>
              Manage All Orders <ChevronRight size={15} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ─── Recent Activity Feed ─────────────────────────── */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/6"
        style={{ background: 'rgba(10,18,14,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity size={14} className="text-emerald-400" />
              <h3 className="text-sm font-black text-white">Recent Activity</h3>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Live audit trail of all dealer actions</p>
          </div>
          <button className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            View All <ArrowRight size={10} />
          </button>
        </div>
        <div className="divide-y divide-white/3">
          {recentActivity.map((act, i) => {
            const Icon = act.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.3 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.bg}`}>
                  <Icon size={16} className={act.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">{act.action} — <span className="font-semibold text-slate-300">{act.product}</span></p>
                  <p className="text-[10px] text-slate-500 font-medium">{act.detail}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-600 shrink-0">{act.time}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Quick Navigation Cards ───────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/dealer/inventory', label: 'Stock Management', desc: 'Adjust inventory levels', icon: Package, color: 'emerald', grad: 'from-emerald-900/40 to-emerald-800/10' },
          { to: '/dealer/orders', label: 'Order Center', desc: 'Accept & dispatch orders', icon: TrendingUp, color: 'amber', grad: 'from-amber-900/40 to-amber-800/10' },
          { to: '/dealer/trace', label: 'Batch Tracing', desc: 'Full lifecycle audit', icon: BarChart3, color: 'blue', grad: 'from-blue-900/40 to-blue-800/10' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <Link key={i} to={c.to}
              className={`relative overflow-hidden p-5 rounded-2xl border border-white/6 hover:border-${c.color}-500/25 transition-all group hover:scale-[1.02] duration-200 bg-gradient-to-br ${c.grad}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${c.color}-500/15 border border-${c.color}-500/20`}>
                  <Icon size={20} className={`text-${c.color}-400`} />
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-black text-white mb-1">{c.label}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{c.desc}</p>
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default DealerDashboard;
