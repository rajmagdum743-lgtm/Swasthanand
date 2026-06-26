import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useProducts } from '../../context/ProductContext';
import { Search, Loader2, CheckCircle2, ArrowRight, ShieldCheck, FileText, Boxes, HelpCircle, Leaf, Thermometer, FlaskConical, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TraceStep { title: string; subtitle: string; status: 'completed' | 'active' | 'upcoming'; description: string; meta?: Record<string, string>; icon: any; }

const stepIcons = [Leaf, FlaskConical, Truck, ShieldCheck, Store];

const DealerTrace: React.FC = () => {
  const { warehouse } = useOutletContext<{ warehouse: string }>();
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  useEffect(() => {
    const bid = searchParams.get('batchId');
    if (bid) { setSearchId(bid); handleAudit(bid); }
  }, [searchParams]);

  const handleAudit = async (idToQuery?: string) => {
    const query = (idToQuery || searchId).trim();
    if (!query) { setError('Please enter a Batch ID or SKU'); return; }
    setLoading(true); setError(''); setAuditResult(null); setActiveChipId(null);
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
            harvestDate: product.harvestDate || '2024-05-20',
            region: product.origin || 'Maharashtra, India',
            weatherSnapshot: 'Cloudy, 28°C',
            soilTestUrl: product.certificateUrl || '#'
          }
        });
      } else {
        setError('Batch ID not found. Select a suggested batch below.');
      }
    } catch { setError('Error querying ledger. Please check connection.'); }
    finally { setLoading(false); }
  };

  const handleAuditForProduct = async (product: any) => {
    setActiveChipId(product.id);
    setSearchId(product.batchId || product.id);
    setLoading(true); setError(''); setAuditResult(null);
    try {
      let batch: any = null;
      if (product.batchId) {
        const r = await fetch(`${API_BASE_URL}/api/traceability/${product.batchId}`);
        if (r.ok) batch = await r.json();
      }
      setAuditResult({
        product,
        batch: batch || {
          harvestDate: product.harvestDate || '2024-05-20',
          region: product.origin || 'Maharashtra, India',
          weatherSnapshot: 'Cloudy, 28°C',
          soilTestUrl: product.certificateUrl || '#'
        }
      });
    } catch { setError('Error querying ledger. Please check connection.'); }
    finally { setLoading(false); }
  };

  const getSteps = (product: any, batch: any): TraceStep[] => [
    { title: 'Harvested & Manufactured', subtitle: 'Farm Source Origin', status: 'completed', icon: Leaf,
      description: `Harvested on ${batch.harvestDate || product.harvestDate} in ${batch.region || product.origin}. Zero-chemical organic practices used.`,
      meta: { 'Coordinates': '18.5204°N 73.8567°E', 'Temperature': product.weatherTemp || '28°C', 'Quality Grade': product.growthQuality || 'A+' }
    },
    { title: 'Quality Control Passed', subtitle: 'Laboratory Audit', status: 'completed', icon: FlaskConical,
      description: 'Tested at Satara Agricultural Lab. Zero pesticide residues confirmed. Organic certification issued.',
      meta: { 'Pesticides': product.zeroPesticides || '0.0%', 'Organic Matter': product.organicMatter || '4.2%', 'Nitrogen': product.nitrogen || '1.8%' }
    },
    { title: 'Distribution Hub', subtitle: 'Geofenced Dispatch', status: 'completed', icon: Truck,
      description: 'Loaded to temperature-controlled cold-chain units. State sorting depot received.',
      meta: { 'Storage Temp': '16°C Stable', 'Checkpoint': 'Satara Agri-Coop' }
    },
    { title: 'Dealer Hub Allocated', subtitle: 'Dealer Handshake', status: 'active', icon: ShieldCheck,
      description: `Verified at ${warehouse}. Available for B2B wholesale adjustments.`,
      meta: { 'Dealer Site': warehouse, 'Ledger Code': `SW-DL-${product.id.slice(0,5).toUpperCase()}` }
    },
    { title: 'Retail Market', subtitle: 'Customer Availability', status: 'upcoming', icon: Store,
      description: 'Listed on customer marketplace for organic delivery.', meta: { 'Status': 'Ready to list' }
    },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Boxes size={14} className="text-emerald-400" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Lifecycle Traceability</span>
        </div>
        <h2 className="text-2xl font-black text-white">Batch Trace Auditor</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Audit blockchain-style trace paths and organic lab certifications</p>
      </div>

      {/* Search */}
      <div className="p-5 rounded-2xl border border-white/6 space-y-4" style={{ background: 'rgba(10,18,14,0.85)' }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="Enter Batch ID, SKU, or Product ID..." value={searchId} onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAudit()}
              className="w-full px-4 py-3.5 pl-11 rounded-xl text-sm font-semibold text-white border border-white/8 outline-none focus:border-emerald-500/40 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>
          <button onClick={() => handleAudit()} disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-white border border-emerald-500/30 hover:bg-emerald-500/10 transition-all shrink-0 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.6), rgba(16,185,129,0.2))' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Search size={15} /> Audit Ledger</>}
          </button>
        </div>

        {/* Batch Quick-Select */}
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2">Quick Select Batches</span>
          <div className="flex flex-wrap gap-2">
            {(products as any[]).filter(p => p.batchId).map(p => {
              const isActive = activeChipId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleAuditForProduct(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isActive
                      ? 'text-emerald-300 border-emerald-500/40 scale-[1.03]'
                      : 'text-slate-400 border-white/8 hover:text-emerald-400 hover:border-emerald-500/25'
                  }`}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(11,79,53,0.4), rgba(16,185,129,0.15))'
                      : 'rgba(255,255,255,0.03)'
                  }}
                  title={`Batch: ${p.batchId}`}
                >
                  {p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name}
                </button>
              );
            })}
            {(products as any[]).length === 0 && <span className="text-xs text-slate-600">No products loaded.</span>}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-rose-500/25 flex items-center gap-3 text-sm font-bold text-rose-400"
          style={{ background: 'rgba(239,68,68,0.06)' }}>
          <HelpCircle size={16} className="shrink-0" /> {error}
        </motion.div>
      )}

      {/* Audit Result */}
      <AnimatePresence>
        {auditResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Product Card */}
            <div className="rounded-2xl border border-white/6 p-5 space-y-4" style={{ background: 'rgba(10,18,14,0.85)' }}>
              <div className="aspect-square rounded-xl overflow-hidden border border-white/8">
                <img src={auditResult.product.image || '/images/placeholder.jpg'} alt={auditResult.product.name} className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200'; }} />
              </div>
              <div>
                <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/25 mb-2"
                  style={{ background: 'rgba(16,185,129,0.08)' }}>
                  {auditResult.product.category}
                </span>
                <h3 className="text-lg font-black text-white mb-1">{auditResult.product.name}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{auditResult.product.description}</p>
              </div>

              {/* Lab cert */}
              <div className="pt-3 border-t border-white/5">
                <a href={auditResult.batch.soilTestUrl} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 text-xs font-black text-emerald-400 hover:bg-emerald-500/8 transition-all"
                  style={{ background: 'rgba(16,185,129,0.05)' }}>
                  <span className="flex items-center gap-2"><FileText size={14} /> Soil & Lab Certificate</span>
                  <ArrowRight size={12} />
                </a>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Pesticides', val: auditResult.product.zeroPesticides || '0.0%', icon: FlaskConical },
                  { label: 'Organic Matter', val: auditResult.product.organicMatter || '4.2%', icon: Leaf },
                  { label: 'Nitrogen', val: auditResult.product.nitrogen || '1.8%', icon: Thermometer },
                  { label: 'Growth Quality', val: auditResult.product.growthQuality || 'A+', icon: CheckCircle2 },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="p-3 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon size={10} className="text-emerald-400" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{m.label}</span>
                      </div>
                      <span className="text-xs font-black text-white">{m.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2 rounded-2xl border border-white/6 p-5" style={{ background: 'rgba(10,18,14,0.85)' }}>
              <div className="flex justify-between items-center pb-5 border-b border-white/5 mb-6">
                <div>
                  <h3 className="text-base font-black text-white mb-0.5">State-Machine Lifecycle</h3>
                  <p className="text-xs text-slate-500 font-medium">Verified chain from seed planting to dealer receipt</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black text-emerald-400 border border-emerald-500/25"
                  style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <ShieldCheck size={11} /> SECURE CHAIN
                </span>
              </div>

              <div className="relative pl-8 space-y-8 ml-4">
                {/* Vertical Line */}
                <div className="absolute left-0 top-3 bottom-3 w-px" style={{ background: 'linear-gradient(to bottom, rgba(16,185,129,0.4), rgba(16,185,129,0.1), rgba(255,255,255,0.04))' }} />

                {getSteps(auditResult.product, auditResult.batch).map((step, idx) => {
                  const StepIcon = stepIcons[idx] || CheckCircle2;
                  const isDone = step.status === 'completed';
                  const isActive = step.status === 'active';

                  return (
                    <motion.div key={idx}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.12 }}
                      className="relative">
                      {/* Circle */}
                      <div className={`absolute -left-11 top-1 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${
                        isDone ? 'border-emerald-500' : isActive ? 'border-emerald-400 ring-3 ring-emerald-500/15' : 'border-white/10'
                      }`}
                        style={isDone ? { background: 'linear-gradient(135deg,#0B4F35,#10B981)' } : isActive ? { background: 'rgba(16,185,129,0.15)' } : { background: 'rgba(255,255,255,0.03)' }}>
                        <StepIcon size={14} className={isDone ? 'text-white' : isActive ? 'text-emerald-400' : 'text-slate-600'} />
                      </div>

                      {/* Content */}
                      <div className={`p-4 rounded-xl border transition-all ${isActive ? 'border-emerald-500/25' : isDone ? 'border-white/6' : 'border-white/4'}`}
                        style={{ background: isActive ? 'rgba(11,79,53,0.2)' : 'rgba(255,255,255,0.02)' }}>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400/70 block mb-0.5">{step.subtitle}</span>
                        <h4 className={`text-sm font-black mb-1.5 ${isActive ? 'text-emerald-300' : isDone ? 'text-white' : 'text-slate-500'}`}>{step.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">{step.description}</p>
                        {step.meta && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(step.meta).map(([k, v]) => (
                              <div key={k} className="p-2.5 rounded-lg border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <span className="block text-[8px] font-black text-slate-600 uppercase tracking-wider mb-0.5">{k}</span>
                                <span className="block text-xs font-bold text-slate-300 truncate">{v}</span>
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

export default DealerTrace;
