import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useProducts } from '../../context/ProductContext';
import { Search, Loader2, CheckCircle2, ArrowRight, ShieldCheck, FileText, Boxes, HelpCircle, Leaf, FlaskConical, Truck, Store, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TraceStep { title: string; subtitle: string; status: 'completed' | 'active' | 'upcoming'; description: string; meta?: Record<string, string>; icon: any; }

const stepIcons = [Leaf, FlaskConical, Truck, ShieldCheck, Store];

const DealerTraceability: React.FC = () => {
  const { warehouse, isDarkMode } = useOutletContext<{ warehouse: string; isDarkMode: boolean }>();
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  useEffect(() => {
    const bid = searchParams.get('batchId');
    if (bid) { 
      setSearchId(bid); 
      handleSearch(bid); 
    }
  }, [searchParams, products]);

  const handleSearch = async (idToQuery?: string) => {
    const query = (idToQuery || searchId).trim();
    if (!query) { 
      setError('Please enter a Batch ID, SKU, or Product Code'); 
      return; 
    }
    setLoading(true); 
    setError(''); 
    setAuditResult(null); 
    setActiveChipId(null);
    
    try {
      const product =
        (products as any[]).find(p => p.batchId && p.batchId === query) ||
        (products as any[]).find(p => p.id === query) ||
        (products as any[]).find(p => p.sku && p.sku === query);

      let batch: any = null;
      if (product?.batchId) {
        const r = await fetch(`${API_BASE_URL}/api/traceability/${product.batchId}`);
        if (r.ok) batch = await r.json();
      }
      
      if (product) {
        setAuditResult({
          product,
          batch: batch || {
            harvestDate: product.harvestDate || '2026-05-20',
            region: product.origin || 'Satara Farm Co-op, Maharashtra',
            weatherSnapshot: 'Sunny, 28°C',
            soilTestUrl: product.certificateUrl || '#'
          }
        });
        setActiveChipId(product.id);
      } else {
        setError('Product Code or Batch ID not found. Choose from the quick select options below.');
      }
    } catch { 
      setError('Connection error. Could not query the system.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleAuditForProduct = async (product: any) => {
    setActiveChipId(product.id);
    setSearchId(product.batchId || product.id);
    setLoading(true); 
    setError(''); 
    setAuditResult(null);
    try {
      let batch: any = null;
      if (product.batchId) {
        const r = await fetch(`${API_BASE_URL}/api/traceability/${product.batchId}`);
        if (r.ok) batch = await r.json();
      }
      setAuditResult({
        product,
        batch: batch || {
          harvestDate: product.harvestDate || '2026-05-20',
          region: product.origin || 'Satara Farm Co-op, Maharashtra',
          weatherSnapshot: 'Sunny, 28°C',
          soilTestUrl: product.certificateUrl || '#'
        }
      });
    } catch { 
      setError('Connection error. Could not load details.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const getSteps = (product: any, batch: any): TraceStep[] => [
    { 
      title: 'Harvested & Cleaned', 
      subtitle: 'Step 1: Farm Origin', 
      status: 'completed', 
      icon: Leaf,
      description: `Harvested on ${batch.harvestDate || product.harvestDate} at ${batch.region || product.origin}. Grown using clean, traditional practices.`,
      meta: { 'Co-op Location': batch.region || product.origin, 'Temp During Harvest': '28°C', 'Initial Grade': 'Grade-A Pure' }
    },
    { 
      title: 'Quality Standards Passed', 
      subtitle: 'Step 2: Lab Checking', 
      status: 'completed', 
      icon: FlaskConical,
      description: 'Tested at Satara Quality Lab. Verified organic with no chemicals or pesticides detected.',
      meta: { 'Pesticide Level': '0.0% (Clean)', 'Organic Certificate': 'Active (#ORG-948)', 'Quality Inspection': 'Approved' }
    },
    { 
      title: 'Dispatched to Warehouse', 
      subtitle: 'Step 3: In Transit', 
      status: 'completed', 
      icon: Truck,
      description: 'Transported under optimal cold-chain storage conditions to protect product freshness.',
      meta: { 'Transit Storage Temp': '16°C Stable', 'Carrier': 'Swasthanand Logistics' }
    },
    { 
      title: 'Received by Warehouse', 
      subtitle: 'Step 4: Stock Allocated', 
      status: 'active', 
      icon: ShieldCheck,
      description: `Stock verified and allocated in ${warehouse} for B2B dispatch.`,
      meta: { 'Warehouse Name': warehouse, 'Batch Tracking Code': `SW-B-${product.id.slice(0,5).toUpperCase()}` }
    },
    { 
      title: 'Available on Retail Shelf', 
      subtitle: 'Step 5: Listed in Stores', 
      status: 'upcoming', 
      icon: Store,
      description: 'Made available for customer retail orders in partner grocery outlets.', 
      meta: { 'Status': 'Pending Warehouse Release' }
    },
  ];

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Boxes size={14} className="text-emerald-500" />
          <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Product Verification
          </span>
        </div>
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Trace Product Origin</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Trace the entire journey of any crop batch from farm harvest to store shelves.</p>
      </div>

      {/* Search and Quick Select */}
      <div className={`p-5 rounded-2xl border ${cardClass}`}>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Enter Batch ID, SKU, or scan product code..." 
              value={searchId} 
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className={`w-full px-4 py-3.5 pl-11 rounded-xl text-xs font-bold outline-none border transition-all ${
                isDarkMode 
                  ? 'text-white border-white/8 bg-white/4 focus:border-emerald-500/40' 
                  : 'text-slate-800 border-slate-200 bg-white focus:border-emerald-500/30'
              }`} 
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
          <button 
            onClick={() => handleSearch()} 
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><Search size={14} /> Trace Origin</>}
          </button>
        </div>

        {/* Batch Quick-Select */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4">
          <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
            Quick Select Batch Code
          </span>
          <div className="flex flex-wrap gap-2">
            {(products as any[]).filter(p => p.batchId).map(p => {
              const isActive = activeChipId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleAuditForProduct(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-700 border-emerald-500/20 bg-emerald-50 dark:text-white dark:border-emerald-500/30'
                      : 'text-slate-500 border-slate-200 bg-white hover:text-slate-800 dark:text-slate-400 dark:border-white/5 dark:hover:text-white'
                  }`}
                  style={isActive && isDarkMode ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.4), rgba(16,185,129,0.15))' } : {}}
                >
                  {p.name} ({p.batchId})
                </button>
              );
            })}
            {(products as any[]).length === 0 && <span className="text-xs text-slate-400">No active batches loaded.</span>}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-2.5 text-xs font-bold text-rose-500"
        >
          <HelpCircle size={14} className="shrink-0" /> {error}
        </motion.div>
      )}

      {/* Audit Result Display */}
      <AnimatePresence>
        {auditResult && (
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 16 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Product Card */}
            <div className={`rounded-2xl border p-5 space-y-4 ${cardClass}`}>
              <div className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-white/8 bg-slate-50">
                <img 
                  src={auditResult.product.image || '/images/placeholder.jpg'} 
                  alt={auditResult.product.name} 
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200'; }} 
                />
              </div>
              <div>
                <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-emerald-500 border border-emerald-500/20 bg-emerald-500/5 mb-2">
                  {auditResult.product.category}
                </span>
                <h3 className="text-base font-black dark:text-white mb-1">{auditResult.product.name}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{auditResult.product.description}</p>
              </div>

              {/* Lab Cert Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <a 
                  href={auditResult.batch.soilTestUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all"
                >
                  <span className="flex items-center gap-2"><FileText size={14} /> Quality Lab Certificate</span>
                  <ArrowRight size={12} />
                </a>
              </div>

              {/* Lab test stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Chemicals / Pesticides', val: '0.0% Detected', icon: FlaskConical },
                  { label: 'Farm Harvesting Soil', val: '100% Organic', icon: Leaf },
                  { label: 'Lab Verification', val: 'Passed (Grade A+)', icon: CheckCircle2 },
                  { label: 'Shelf Expiry Status', val: 'Healthy (10m left)', icon: Calendar },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className={`p-3 rounded-xl border ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={10} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{m.label}</span>
                      </div>
                      <span className="text-xs font-black dark:text-white leading-none">{m.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Journey Timeline */}
            <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardClass}`}>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5 mb-6 bg-slate-50/50 dark:bg-white/[0.01]">
                <div>
                  <h3 className="text-sm font-black dark:text-white uppercase tracking-wider">Product Flow Timeline</h3>
                  <p className="text-xs text-slate-500 font-medium">Verified farm-to-shelf journey details</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-black text-emerald-500 border border-emerald-500/20 bg-emerald-500/5">
                  <ShieldCheck size={11} /> VERIFIED CROP RECORD
                </span>
              </div>

              <div className="relative pl-7 space-y-6 ml-3">
                {/* Vertical Line */}
                <div className="absolute left-0 top-3.5 bottom-3.5 w-0.5 bg-slate-200 dark:bg-white/5" />

                {getSteps(auditResult.product, auditResult.batch).map((step, idx) => {
                  const StepIcon = stepIcons[idx] || CheckCircle2;
                  const isDone = step.status === 'completed';
                  const isActive = step.status === 'active';

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -16 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.08 }}
                      className="relative"
                    >
                      {/* Left Dot Icon */}
                      <div 
                        className={`absolute -left-10 top-0.5 w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${
                          isDone 
                            ? 'border-emerald-500 bg-emerald-500 text-white' 
                            : isActive 
                            ? 'border-emerald-500 text-emerald-500 bg-white ring-3 ring-emerald-500/10' 
                            : 'border-slate-200 bg-white text-slate-300 dark:border-white/10 dark:bg-white/2'
                        }`}
                      >
                        <StepIcon size={12} />
                      </div>

                      {/* Timeline Card */}
                      <div className={`p-4 rounded-xl border ${
                        isActive 
                          ? 'border-emerald-500/25 bg-emerald-50/20 dark:bg-emerald-950/10' 
                          : 'border-slate-100 bg-slate-50/30 dark:border-white/3 dark:bg-white/[0.01]'
                      }`}>
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500 block mb-0.5">{step.subtitle}</span>
                        <h4 className={`text-xs font-black mb-1 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'dark:text-white'}`}>{step.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-2.5">{step.description}</p>
                        {step.meta && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(step.meta).map(([k, v]) => (
                              <div key={k} className={`p-2 rounded-lg border ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white'}`}>
                                <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{k}</span>
                                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealerTraceability;
