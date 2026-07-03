import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  History, 
  Download,
  AlertTriangle,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product { 
  id: string; 
  name: string; 
  sku: string; 
  price: number; 
  category: string; 
  stock: number; 
  image: string; 
  description: string; 
  batchId: string; 
  origin: string; 
  harvestDate: string; 
}

const DealerInventory: React.FC = () => {
  const { warehouse, nodeId, isDarkMode } = useOutletContext<{ warehouse: string; nodeId: string; isDarkMode: boolean }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Product Proposal Modal States
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [proposalData, setProposalData] = useState({
    name: '',
    category: 'Spices',
    price: '',
    description: '',
    benefitsDescription: '',
    stock: '50',
    origin: 'Maharashtra, India',
    tagsInput: 'organic, immunity'
  });
  
  // Stock history modal states
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [mockHistory, setMockHistory] = useState<any[]>([]);

  const fetchProducts = async () => {
    if (!nodeId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        const nodeProducts = data.filter((p: any) => p.dealershipNodeId === nodeId || !p.dealershipNodeId);
        setProducts(nodeProducts.map((p: any) => ({ ...p, stock: p.stock ?? 100 })));
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (nodeId) {
      fetchProducts();
    }
  }, [nodeId]);

  useEffect(() => {
    if (searchParams.get('propose') === 'true') {
      setProposalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalData.name || !proposalData.price) {
      alert('Product Name and Supply Price are required.');
      return;
    }
    setProposalSubmitting(true);
    try {
      const payload = {
        name: proposalData.name,
        category: proposalData.category,
        price: parseFloat(proposalData.price),
        description: proposalData.description,
        benefitsDescription: proposalData.benefitsDescription,
        stock: parseInt(proposalData.stock) || 50,
        origin: proposalData.origin,
        tags: proposalData.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        dealershipNodeId: nodeId,
        status: 'DEALER_ALLOCATED', // Maps to "Pending Review"
        harvestDate: new Date().toISOString().split('T')[0],
        weatherTemp: '27°C',
        growthQuality: 'Excellent',
        organicMatter: '4.5%',
        nitrogen: '1.9%',
        zeroPesticides: 'Verified',
        image: '/images/products/default.jpg'
      };

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setProposalOpen(false);
        setProposalData({
          name: '',
          category: 'Spices',
          price: '',
          description: '',
          benefitsDescription: '',
          stock: '50',
          origin: 'Maharashtra, India',
          tagsInput: 'organic, immunity'
        });
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
        fetchProducts();
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setProposalSubmitting(false);
    }
  };

  const handleStockAdjust = async (productId: string, increment: boolean, amount = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newStock = increment ? product.stock + amount : Math.max(0, product.stock - amount);
    if (newStock === product.stock) return;
    
    // Optimistic Update
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    setSyncStatus('syncing'); 
    setUpdatingId(productId);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, stock: newStock })
      });
      if (!res.ok) throw new Error('Sync failed');
      setSyncStatus('success'); 
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch {
      setSyncStatus('error');
      // Rollback
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: product.stock } : p));
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally { 
      setUpdatingId(null); 
    }
  };

  const handleOpenHistory = (product: Product) => {
    setHistoryProduct(product);
    // Generate mock adjustments logs
    setMockHistory([
      { date: 'Today, 11:20 AM', change: '+20 Units', reason: 'Received supplier delivery', operator: 'Rahul K. (Warehouse Lead)' },
      { date: 'Yesterday, 04:45 PM', change: '-12 Units', reason: 'Order fulfillment #ORD-8392', operator: 'Amit S. (Staff)' },
      { date: '28 Jun 2026, 09:15 AM', change: '+5 Units', reason: 'Inventory recount correction', operator: 'Rahul K. (Warehouse Lead)' },
      { date: '24 Jun 2026, 02:30 PM', change: '-8 Units', reason: 'Order fulfillment #ORD-7391', operator: 'Amit S. (Staff)' }
    ]);
    setHistoryOpen(true);
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

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-emerald-500" />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Stock Management
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Warehouse Inventory</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Check product counts, view adjust history, or update stock.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {syncStatus === 'syncing' && (
              <motion.span 
                key="s" 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-500 border border-amber-500/20 bg-amber-500/5"
              >
                <Loader2 size={12} className="animate-spin" /> Syncing...
              </motion.span>
            )}
            {syncStatus === 'success' && (
              <motion.span 
                key="ok" 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-500 border border-emerald-500/20 bg-emerald-500/5"
              >
                <CheckCircle2 size={12} /> Stock Saved!
              </motion.span>
            )}
            {syncStatus === 'error' && (
              <motion.span 
                key="err" 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 border border-rose-500/20 bg-rose-500/5"
              >
                <AlertCircle size={12} /> Update Failed
              </motion.span>
            )}
            {syncStatus === 'idle' && (
              <motion.button 
                key="idle" 
                onClick={fetchProducts} 
                className={`p-2.5 rounded-xl border transition-colors ${
                  isDarkMode ? 'border-white/8 text-slate-400 hover:text-white bg-white/4' : 'border-slate-200 text-slate-600 hover:text-slate-800 bg-white'
                }`}
              >
                <RefreshCw size={14} />
              </motion.button>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setProposalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-100/50 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={13} /> Propose New Product
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${
            isDarkMode ? 'text-white border-white/8 bg-white/4' : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
          }`}>
            <Download size={13} /> Export Sheet
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', val: stats.total, color: 'text-slate-500 dark:text-slate-300', border: 'border-slate-200 dark:border-white/5', icon: Package },
          { label: 'Healthy Supply', val: stats.optimal, color: 'text-emerald-500', border: 'border-emerald-500/15 dark:border-emerald-500/10', icon: CheckCircle2 },
          { label: 'Low Stock alerts', val: stats.low, color: 'text-amber-500', border: 'border-amber-500/15 dark:border-amber-500/10', icon: TrendingUp },
          { label: 'Out of Stock', val: stats.outOfStock, color: 'text-rose-500', border: 'border-rose-500/15 dark:border-rose-500/10', icon: AlertCircle },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl border ${cardClass} ${s.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{s.label}</span>
                <Icon size={12} className={s.color} />
              </div>
              <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
            </div>
          );
        })}
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by product name, SKU or category..."
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-3 pl-11 rounded-xl text-xs font-bold outline-none border transition-all ${
              isDarkMode 
                ? 'text-white border-white/8 bg-white/4 focus:border-emerald-500/40' 
                : 'text-slate-800 border-slate-200 bg-white focus:border-emerald-500/30'
            }`} 
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                categoryFilter === cat 
                  ? 'text-emerald-700 border-emerald-500/20 bg-emerald-50 dark:text-white dark:border-emerald-500/30' 
                  : 'text-slate-500 border-slate-200 bg-white hover:text-slate-900 dark:text-slate-400 dark:border-white/5 dark:hover:text-white'
              }`}
              style={categoryFilter === cat && isDarkMode ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.5), rgba(16,185,129,0.15))' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className={`rounded-2xl overflow-hidden border ${cardClass}`}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Stock Sheet — {warehouse}</span>
          <span className="text-xs font-bold text-slate-400">{filtered.length} products listed</span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-emerald-500" size={24} />
            <p className="text-xs text-slate-400 font-bold">Loading warehouse products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 font-bold">No products found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-4 px-5 font-black">Item Name</th>
                  <th className="py-4 px-5 font-black">SKU / Batch</th>
                  <th className="py-4 px-5 font-black">Category</th>
                  <th className="py-4 px-5 font-black text-right">Selling Price</th>
                  <th className="py-4 px-5 font-black text-center">Approval Status</th>
                  <th className="py-4 px-5 font-black">Current Stock</th>
                  <th className="py-4 px-5 font-black">Adjust Stock</th>
                  <th className="py-4 px-5 font-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/3 text-xs font-bold text-slate-600 dark:text-slate-300">
                {filtered.map((p, idx) => {
                  const sku = p.sku || `SW-${p.name.slice(0,3).toUpperCase()}`;
                  const isLow = p.stock < 15 && p.stock > 0;
                  const isEmpty = p.stock === 0;
                  // Mock expiration warning (every 3rd item is marked as expiring soon for B2B demo)
                  const isExpiringSoon = idx % 3 === 0;
                  
                  return (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(0.3, idx * 0.03) }}
                      className="border-b border-slate-100 dark:border-white/3 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors"
                    >
                      {/* Name & Expiry */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 shrink-0">
                            <img 
                              src={p.image || '/images/placeholder.jpg'} 
                              alt={p.name} 
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=80'; }} 
                            />
                          </div>
                          <div>
                            <span className="block text-xs font-black text-slate-800 dark:text-white leading-tight">{p.name}</span>
                            {isExpiringSoon && (
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-1 rounded">
                                <AlertTriangle size={8} /> Expiring Soon
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU / Batch */}
                      <td className="py-4 px-5 font-mono text-[10px] text-slate-400">{sku}</td>

                      {/* Category */}
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                          isDarkMode ? 'border-white/8 bg-white/3 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}>
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-5 text-right font-black text-slate-800 dark:text-white">₹{p.price?.toFixed(2)}</td>

                      {/* Approval Status */}
                      <td className="py-4 px-5 text-center">
                        {p.status === 'QC_PASSED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20">
                            Approved
                          </span>
                        ) : p.status === 'DEALER_ALLOCATED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20">
                            Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-500/20">
                            Expired/Disapproved
                          </span>
                        )}
                      </td>

                      {/* Stock Badge */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black ${isEmpty ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-800 dark:text-white'}`}>
                              {p.stock} Units
                            </span>
                            <span className={`px-1 rounded text-[8px] font-black uppercase tracking-wider border ${
                              isEmpty 
                                ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' 
                                : isLow 
                                ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' 
                                : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                            }`}>
                              {isEmpty ? 'Empty' : isLow ? 'Low' : 'OK'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Big Click Counter Adjusters */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1">
                          <div className={`flex items-center border rounded-xl overflow-hidden ${
                            isDarkMode ? 'border-white/10 bg-white/2' : 'border-slate-200 bg-slate-50'
                          }`}>
                            <button 
                              onClick={() => handleStockAdjust(p.id, false)} 
                              disabled={p.stock <= 0 || updatingId === p.id}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all disabled:opacity-20 cursor-pointer"
                              title="Subtract 1 unit"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-black text-slate-800 dark:text-white">{p.stock}</span>
                            <button 
                              onClick={() => handleStockAdjust(p.id, true)} 
                              disabled={updatingId === p.id}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all disabled:opacity-20 cursor-pointer"
                              title="Add 1 unit"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          {updatingId === p.id && <Loader2 size={10} className="animate-spin text-emerald-500" />}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleOpenHistory(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'border-white/10 text-slate-300 bg-white/4 hover:bg-white/8 hover:text-white' 
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          <History size={10} /> History
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Alert bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
        isDarkMode ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'
      }`}>
        <div>
          <h4 className="font-extrabold text-xs dark:text-white mb-0.5">Need to request stock replenishment?</h4>
          <p className="text-[10px] text-slate-500">Low stock products triggers order forms sent automatically to suppliers.</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shrink-0">
          Request Replenishment
        </button>
      </div>

      {/* STOCK HISTORY MODAL */}
      <AnimatePresence>
        {historyOpen && historyProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl p-6 relative ${
                isDarkMode ? 'bg-[#0b140f] text-white border border-white/10' : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <button 
                onClick={() => setHistoryOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5"
              >
                <X size={16} />
              </button>

              <div className="mb-5">
                <span className="block text-[8px] text-emerald-500 font-black uppercase tracking-widest">Adjustment Logs</span>
                <h3 className="text-base font-black uppercase mt-0.5">{historyProduct.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono">SKU: {historyProduct.sku || `SW-${historyProduct.id.slice(0,6).toUpperCase()}`}</p>
              </div>

              {/* History Timeline */}
              <div className="space-y-4">
                {mockHistory.map((h, i) => {
                  const isPlus = h.change.startsWith('+');
                  return (
                    <div key={i} className="flex items-start gap-3 text-xs border-b border-slate-100 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isPlus 
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' 
                          : 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                      }`}>
                        {isPlus ? <Plus size={12} /> : <Minus size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`font-black ${isPlus ? 'text-emerald-500' : 'text-rose-500'}`}>{h.change}</span>
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">{h.date}</span>
                        </div>
                        <p className="font-extrabold text-slate-700 dark:text-slate-300 leading-snug">{h.reason}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Operator: {h.operator}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setHistoryOpen(false)}
                className={`w-full mt-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border text-center transition-colors ${
                  isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Close Logs
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT PROPOSAL MODAL */}
      <AnimatePresence>
        {proposalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 relative overflow-hidden ${
                isDarkMode ? 'bg-[#0b140f] text-white border border-white/10' : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <button 
                onClick={() => setProposalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <span className="block text-[8px] text-emerald-500 font-black uppercase tracking-widest">B2B Product Submission</span>
                <h3 className="text-base font-black uppercase mt-0.5">Submit Product Proposal</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold leading-normal mt-0.5">Propose a new item for Swasthanand admin quality check & pricing approval.</p>
              </div>

              <form onSubmit={handleProposeSubmit} className="space-y-4 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={proposalData.name}
                    onChange={e => setProposalData({ ...proposalData, name: e.target.value })}
                    placeholder="e.g. Organic Black Pepper"
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 focus:bg-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                    <select
                      value={proposalData.category}
                      onChange={e => setProposalData({ ...proposalData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 focus:bg-white p-3 rounded-xl outline-none"
                    >
                      <option value="Spices">Spices</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Supplements">Supplements</option>
                      <option value="Grains">Grains</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">B2B Supply Price (₹) *</label>
                    <input 
                      type="number" 
                      required
                      min="0.1"
                      step="0.01"
                      value={proposalData.price}
                      onChange={e => setProposalData({ ...proposalData, price: e.target.value })}
                      placeholder="e.g. 150.00"
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 focus:bg-white p-3 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Supply Qty</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={proposalData.stock}
                      onChange={e => setProposalData({ ...proposalData, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 focus:bg-white p-3 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Origin Coordinates/Location</label>
                    <input 
                      type="text" 
                      required
                      value={proposalData.origin}
                      onChange={e => setProposalData({ ...proposalData, origin: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 focus:bg-white p-3 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea 
                    value={proposalData.description}
                    onChange={e => setProposalData({ ...proposalData, description: e.target.value })}
                    placeholder="Describe product sourcing and standards..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 focus:bg-white p-3 rounded-xl outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setProposalOpen(false)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border text-center transition-colors ${
                      isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={proposalSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md cursor-pointer"
                  >
                    {proposalSubmitting ? <Loader2 className="animate-spin" size={12} /> : 'Submit Proposal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealerInventory;
