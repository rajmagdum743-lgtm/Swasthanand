import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { Package, Search, Plus, Minus, Loader2, CheckCircle2, AlertCircle, RefreshCw, TrendingUp, ArrowUpRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product { id: string; name: string; sku: string; price: number; category: string; stock: number; image: string; description: string; benefitsDescription: string; batchId: string; origin: string; harvestDate: string; weatherTemp: string; growthQuality: string; organicMatter: string; nitrogen: string; zeroPesticides: string; certificateUrl: string; tags: string[]; }

const DealerInventory: React.FC = () => {
  const { warehouse } = useOutletContext<{ warehouse: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.map((p: any) => ({ ...p, stock: p.stock ?? 100 })));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleStockAdjust = async (productId: string, increment: boolean, amount = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStock = increment ? product.stock + amount : Math.max(0, product.stock - amount);
    if (newStock === product.stock) return;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    setSyncStatus('syncing'); setUpdatingId(productId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, stock: newStock })
      });
      if (!res.ok) throw new Error('Sync failed');
      setSyncStatus('success'); setTimeout(() => setSyncStatus('idle'), 2000);
    } catch {
      setSyncStatus('error');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: product.stock } : p));
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally { setUpdatingId(null); }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = products.filter(p =>
    (categoryFilter === 'All' || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const stats = {
    total: products.length,
    low: products.filter(p => p.stock < 15).length,
    optimal: products.filter(p => p.stock >= 15).length,
    outOfStock: products.filter(p => p.stock === 0).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Stock Management</span>
          </div>
          <h2 className="text-2xl font-black text-white">Inventory Control</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time adjustments sync instantly with backend database</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {syncStatus === 'syncing' && <motion.span key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400 border border-amber-500/25" style={{ background: 'rgba(245,158,11,0.08)' }}><Loader2 size={12} className="animate-spin" /> Syncing...</motion.span>}
            {syncStatus === 'success' && <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-emerald-500/25" style={{ background: 'rgba(16,185,129,0.08)' }}><CheckCircle2 size={12} /> Synced!</motion.span>}
            {syncStatus === 'error' && <motion.span key="err" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 border border-rose-500/25" style={{ background: 'rgba(239,68,68,0.08)' }}><AlertCircle size={12} /> Rolled Back</motion.span>}
            {syncStatus === 'idle' && <motion.button key="idle" onClick={fetchProducts} className="p-2.5 rounded-xl border border-white/8 text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}><RefreshCw size={16} /></motion.button>}
          </AnimatePresence>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white border border-white/8 hover:border-emerald-500/25 transition-all" style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.4), rgba(16,185,129,0.15))' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', val: stats.total, color: 'text-white', icon: Package },
          { label: 'Optimal Stock', val: stats.optimal, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Low Stock', val: stats.low, color: 'text-amber-400', icon: TrendingUp },
          { label: 'Out of Stock', val: stats.outOfStock, color: 'text-rose-400', icon: AlertCircle },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-4 rounded-2xl border border-white/6" style={{ background: 'rgba(10,18,14,0.85)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{s.label}</span>
                <Icon size={13} className={s.color} />
              </div>
              <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Search by name, SKU or category..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 rounded-xl text-sm font-semibold text-white border border-white/8 outline-none focus:border-emerald-500/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }} />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${categoryFilter === cat ? 'text-white border-emerald-500/30' : 'text-slate-400 border-white/6 hover:text-white hover:border-white/15'}`}
              style={categoryFilter === cat ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.5), rgba(16,185,129,0.15))' } : { background: 'rgba(255,255,255,0.03)' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/6 overflow-hidden" style={{ background: 'rgba(10,18,14,0.85)' }}>
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Live Stock Sheet — {warehouse}</span>
          <span className="text-xs font-bold text-slate-500">{filtered.length} items</span>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
            <p className="text-sm text-slate-500 font-bold">Loading inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Product', 'SKU / Batch', 'Category', 'Price', 'Stock Level', 'Adjust'].map(h => (
                    <th key={h} className="py-4 px-5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const sku = p.sku || `SW-${p.name.slice(0,3).toUpperCase()}`;
                  const isLow = p.stock < 15 && p.stock > 0;
                  const isEmpty = p.stock === 0;
                  const pct = Math.min(100, Math.round((p.stock / 200) * 100));
                  return (
                    <motion.tr key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-white/3 hover:bg-white/2 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/8 shrink-0">
                            <img src={p.image || '/images/placeholder.jpg'} alt={p.name} className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=80'; }} />
                          </div>
                          <div>
                            <span className="block text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors">{p.name}</span>
                            <span className="text-[9px] text-slate-500 font-medium">Batch: {p.batchId || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs font-bold text-slate-400">{sku}</td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-300 border border-white/8" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-bold text-white">₹{p.price?.toFixed(2)}</td>
                      <td className="py-4 px-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${isEmpty ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'}`}>{p.stock}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${isEmpty ? 'text-rose-400 border-rose-500/25 bg-rose-500/8' : isLow ? 'text-amber-400 border-amber-500/25 bg-amber-500/8' : 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8'}`}>
                              {isEmpty ? 'Empty' : isLow ? 'Low' : 'OK'}
                            </span>
                          </div>
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: isEmpty ? '#ef4444' : isLow ? '#f59e0b' : 'linear-gradient(90deg,#10B981,#34d399)' }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 border border-white/8 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <button onClick={() => handleStockAdjust(p.id, false)} disabled={p.stock <= 0 || updatingId === p.id}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30">
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-xs font-black text-white">{p.stock}</span>
                            <button onClick={() => handleStockAdjust(p.id, true)} disabled={updatingId === p.id}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-30">
                              <Plus size={13} />
                            </button>
                          </div>
                          {updatingId === p.id && <Loader2 size={12} className="animate-spin text-emerald-400" />}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-5 rounded-2xl border border-emerald-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.25), rgba(16,185,129,0.06))' }}>
        <div>
          <h4 className="font-extrabold text-white text-sm mb-0.5">Need bulk stock allocation?</h4>
          <p className="text-xs text-slate-500 font-medium">Stock changes sync instantly with customer-facing retail counts.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white border border-emerald-500/30 hover:bg-emerald-500/10 transition-all whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.5), rgba(16,185,129,0.2))' }}>
          Request Bulk Import <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DealerInventory;
