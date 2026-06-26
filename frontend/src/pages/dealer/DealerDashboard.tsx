import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { API_BASE_URL } from '../../config/api';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Warehouse,
  Truck,
  Activity,
  Loader2
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

interface Order {
  id: string;
  user: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

const DealerDashboard: React.FC = () => {
  const { warehouse } = useOutletContext<{ warehouse: string }>();
  const { products, loading: productsLoading } = useProducts() as any;
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const lowStockProducts = products.filter((p: any) => (p.stock ?? 100) < 15);
  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'TRANSIT', 'SHIPPED'].includes(o.status));

  const stats = [
    { title: 'Allocated SKUs', value: String(products.length), change: 'Synchronized with catalog', trend: 'up' },
    { title: 'Low Stock Items', value: String(lowStockProducts.length), change: lowStockProducts.length > 0 ? 'Requires action' : 'Healthy supply', trend: lowStockProducts.length > 0 ? 'down' : 'stable' },
    { title: 'Active Dispatches', value: String(pendingOrders.length), change: 'Pending departure', trend: 'up' },
    { title: 'Node Efficiency', value: '98.6%', change: 'QC Verification optimal', trend: 'stable' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 text-white">

      {/* Warehouse Header Telemetry */}
      <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden bg-slate-950/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-x-20 -translate-y-20" />
          <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl translate-y-16" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Warehouse size={10} /> {warehouse}
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-none text-white">
              Warehouse <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">Operations Control</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl font-medium">
              Real-time telemetry and dispatch dashboard. Track geofenced shipment arrivals, soil pesticide certificates, and cold room logistics parameters.
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="text-center px-5 py-4 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-md">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Humidity Index</span>
              <span className="text-2xl font-black text-white flex items-center gap-1.5 justify-center">
                54% <CheckCircle2 className="text-emerald-400" size={16} />
              </span>
            </div>
            <div className="text-center px-5 py-4 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-md">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Warehouse Temp</span>
              <span className="text-2xl font-black text-white flex items-center gap-1.5 justify-center animate-pulse">
                16.4°C <Activity className="text-emerald-400" size={14} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const isUp = stat.trend === 'up';
          const isDown = stat.trend === 'down';
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between hover:border-white/10 transition-colors cursor-default"
              style={{ background: 'rgba(10, 18, 14, 0.85)' }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</span>
                  {isUp && <TrendingUp size={16} className="text-emerald-400 bg-emerald-500/10 p-0.5 rounded border border-emerald-500/20" />}
                  {isDown && <AlertTriangle size={16} className="text-rose-400 bg-rose-500/10 p-0.5 rounded border border-rose-500/20" />}
                  {!isUp && !isDown && <Boxes size={16} className="text-slate-400 bg-white/5 p-0.5 rounded border border-white/8" />}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{stat.value}</h3>
              </div>
              <p className={`text-[10px] font-bold ${
                isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-400'
              }`}>{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Allocated Inventory (2 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/5 p-5 flex flex-col justify-between"
          style={{ background: 'rgba(10, 18, 14, 0.85)' }}>
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Boxes size={15} className="text-emerald-400" /> Allocated Inventory Logs
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Assigned B2B agricultural products ready for shipment</p>
            </div>
            <Link to="/dealer/inventory" className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              Manage Catalog <ArrowRight size={11} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {productsLoading ? (
              <div className="p-10 text-center"><Loader2 className="animate-spin inline text-emerald-400 mr-2" />Loading stock list...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-black">Item Details</th>
                    <th className="pb-3 font-black text-center">Batch code</th>
                    <th className="pb-3 font-black text-right">Available Stock</th>
                    <th className="pb-3 font-black text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-bold text-slate-300">
                  {products.map((item: any, index: number) => {
                    const isLow = (item.stock ?? 100) < 15;
                    return (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3">
                          <p className="font-extrabold text-white uppercase">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium font-mono">{item.sku || `SW-${item.id.slice(0,4).toUpperCase()}`}</p>
                        </td>
                        <td className="py-3 text-center text-slate-500 font-mono text-[10px]">{item.batchId || 'N/A'}</td>
                        <td className="py-3 text-right">
                          <span className={`font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>{item.stock ?? 100} Units</span>
                          <span className="block text-[8px] text-slate-500 font-medium">Limit: 15</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isLow ? 'Restock' : 'Stable'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Stock Alerts Widget */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 p-5 flex flex-col justify-between"
          style={{ background: 'rgba(10, 18, 14, 0.85)' }}>
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle size={15} /> Active Stock Alarms
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Critical replenishment alerts for local distribution node</p>
          </div>

          <div className="space-y-3 flex-1 mb-4">
            {lowStockProducts.map((item: any, i: number) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl border border-rose-500/10 hover:bg-rose-500/5 transition-all"
                style={{ background: 'rgba(239, 68, 68, 0.02)' }}>
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">{item.sku || 'SKU'}</p>
                  <p className="text-xs font-black text-white leading-tight">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Stock at {item.stock ?? 100} units (Threshold: 15)</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs font-bold space-y-2">
                <ShieldCheck className="text-emerald-400 mx-auto" size={32} />
                <p>All stock levels are healthy.</p>
              </div>
            )}
          </div>

          <Link to="/dealer/inventory" className="w-full py-2.5 bg-white/3 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest border border-white/8 rounded-xl transition-all text-center">
            Initiate Replenishment Request
          </Link>
        </motion.div>
      </div>

      {/* Dispatches & Batch lifecycles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Dispatches (2 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/5 p-5"
          style={{ background: 'rgba(10, 18, 14, 0.85)' }}>
          <div className="pb-4 border-b border-white/5 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Truck size={15} className="text-emerald-400" /> Pending Dispatch Schedule
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Active trucks and delivery handshakes queued for departure</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">
              {pendingOrders.length} Scheduled
            </span>
          </div>

          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="p-10 text-center"><Loader2 className="animate-spin inline text-emerald-400 mr-2" />Loading dispatches...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-black">Destination / Client</th>
                    <th className="pb-3 font-black text-right">Value</th>
                    <th className="pb-3 font-black text-center">Dispatch Time</th>
                    <th className="pb-3 font-black text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-bold text-slate-300">
                  {pendingOrders.map((d, index) => {
                    const dateStr = new Date(d.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short'
                    });
                    return (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3">
                          <p className="font-extrabold text-white uppercase">{d.user?.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{d.id.slice(0,8)}...</p>
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-black">₹{d.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-center text-slate-400">
                          <span className="inline-flex items-center gap-1"><Clock size={11} className="text-slate-500" /> {dateStr}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {pendingOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                        No pending dispatches scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Batch Lifecycle Status */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 p-5 flex flex-col justify-between"
          style={{ background: 'rgba(10, 18, 14, 0.85)' }}>
          <div className="pb-4 border-b border-white/5 mb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={15} className="text-emerald-400" /> Active Batch Lifecycle
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Traceability flow tracking from farm harvest state</p>
          </div>

          <div className="space-y-4 flex-1">
            {products.slice(0, 3).map((item: any, i: number) => {
              const progresses = [80, 65, 95];
              const progress = progresses[i % 3];
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-white uppercase leading-none">{item.name}</span>
                    <span className="text-emerald-400 font-mono text-[9px]">{item.batchId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0">In Transit</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link to="/dealer/batches" className="w-full py-2.5 bg-white/3 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest border border-white/8 rounded-xl transition-all text-center mt-4 block">
            Open Ledger Tracer
          </Link>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default DealerDashboard;
