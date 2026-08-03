import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Activity, ShieldCheck, Lock, Unlock, CheckCircle2, ArrowRight, Info, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LifecycleStage {
  key: string;
  label: string;
  operator: string;
  isAuthorized: boolean; // Dealer can update this stage
  description: string;
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  { key: 'MANUFACTURED', label: 'Manufactured & Harvested', operator: 'Farm Producer', isAuthorized: false, description: 'Harvested directly from farms and certified organic.' },
  { key: 'QUALITY_CHECK', label: 'Quality Inspection Passed', operator: 'Pesticide Testing Lab', isAuthorized: false, description: 'Tested for pesticides and chemical purity.' },
  { key: 'WAREHOUSE', label: 'Received at Central Warehouse', operator: 'Logistics Hub Manager', isAuthorized: false, description: 'Stored and sorted at regional cold chambers.' },
  { key: 'DEALER_ALLOCATED', label: 'Received by Dealer', operator: 'Your Warehouse (Dealer)', isAuthorized: true, description: 'Allocated and checked in your local node inventory.' },
  { key: 'AVAILABLE', label: 'Available on Retail Shelf', operator: 'Your Warehouse (Dealer)', isAuthorized: true, description: 'Released from store rooms and ready for retail purchase.' },
  { key: 'SOLD', label: 'Sold to Final Customer', operator: 'Your Warehouse (Dealer)', isAuthorized: true, description: 'Purchased by a customer and completed.' }
];

const DealerLifecycle: React.FC = () => {
  const { warehouse, isDarkMode } = useOutletContext<{ warehouse?: string; isDarkMode?: boolean }>() || {};
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Track stage state mock for chosen products
  const [currentStageIndex, setCurrentStageIndex] = useState(3); // default: Dealer Allocated
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const bid = searchParams.get('batchId');
    if (bid && products.length > 0) {
      const prod = products.find((p: any) => p.batchId === bid || p.id === bid);
      if (prod && prod.id !== selectedProduct?.id) {
        setSelectedProduct(prod);
        const stageMap: Record<number, number> = { 0: 3, 1: 4, 2: 5 };
        const index = stageMap[prod.name.length % 3] || 3;
        setCurrentStageIndex(index);
      }
    } else if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
      setCurrentStageIndex(3);
    }
  }, [searchParams, products, selectedProduct]);

  const handleSelectProduct = (prod: any) => {
    setSelectedProduct(prod);
    setSuccessMsg('');
    const stageMap: Record<number, number> = { 0: 3, 1: 4, 2: 5 };
    const index = stageMap[prod.name.length % 3] || 3;
    setCurrentStageIndex(index);
  };

  const handleUpdateStage = (stageIndex: number) => {
    const stage = LIFECYCLE_STAGES[stageIndex];
    if (!stage.isAuthorized) return;

    setUpdatingStage(stage.key);
    
    setTimeout(() => {
      setCurrentStageIndex(stageIndex);
      setUpdatingStage(null);
      setSuccessMsg(`Lifecycle stage successfully updated to: ${stage.label}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1000);
  };

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity size={14} className="text-emerald-500" />
          <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Operations Flow
          </span>
        </div>
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Product Lifecycle</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5 font-sans">
          Track supply stages and check in items. You can only update stages allocated to Dealer operations.
        </p>
      </div>

      {/* Select Product */}
      <div className={`p-5 rounded-2xl border ${cardClass}`}>
        <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
          Select Product Batch
        </span>
        <div className="flex flex-wrap gap-2">
          {products.map((p: any) => {
            const isActive = selectedProduct?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 border-emerald-500/20 bg-emerald-50 dark:text-white dark:border-emerald-500/30'
                    : 'text-slate-500 border-slate-200 bg-white hover:text-slate-800 dark:text-slate-400 dark:border-white/5 dark:hover:text-white'
                }`}
                style={isActive && isDarkMode ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.4), rgba(16,185,129,0.15))' } : {}}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 size={14} className="shrink-0" /> {successMsg}
        </motion.div>
      )}

      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Tracker */}
          <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardClass}`}>
            <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-6 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-black dark:text-white uppercase tracking-wider">Lifecycle Tracking Timeline</h3>
                <p className="text-[9px] text-slate-400 font-bold">Flow Status for Batch: {selectedProduct.batchId || 'N/A'}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black text-emerald-500 border border-emerald-500/20 bg-emerald-500/5">
                <ShieldCheck size={11} /> Secured Record
              </span>
            </div>

            <div className="relative pl-7 space-y-6 ml-3">
              {/* Vertical line tracker */}
              <div className="absolute left-0 top-3.5 bottom-3.5 w-0.5 bg-slate-100 dark:bg-white/5" />

              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isFuture = idx > currentStageIndex;
                
                return (
                  <div key={stage.key} className="relative">
                    {/* Circle icon marker */}
                    <div 
                      className={`absolute -left-10 top-1 w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${
                        isPassed 
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm' 
                          : isCurrent 
                          ? 'border-emerald-500 text-emerald-500 bg-white ring-3 ring-emerald-500/10' 
                          : 'border-slate-200 bg-slate-50 text-slate-300 dark:border-white/10 dark:bg-[#070b12]'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 size={12} strokeWidth={3} />
                      ) : (
                        <span className="text-[9px] font-black">{idx + 1}</span>
                      )}
                    </div>

                    {/* Timeline Item Content */}
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isCurrent 
                        ? 'border-emerald-500/25 bg-emerald-50/20 dark:bg-emerald-950/10' 
                        : 'border-slate-100 bg-slate-50/20 dark:border-white/3 dark:bg-white/[0.01]'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-black uppercase ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : isFuture ? 'text-slate-400' : 'dark:text-white'}`}>
                            {stage.label}
                          </h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">Operator: {stage.operator}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mt-1">{stage.description}</p>
                      </div>

                      {/* Authorized Stage Update Button */}
                      <div className="shrink-0">
                        {stage.isAuthorized ? (
                          isCurrent ? (
                            <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Checked In Here
                            </div>
                          ) : isPassed ? (
                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              Completed <ArrowRight size={10} />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpdateStage(idx)}
                              disabled={updatingStage !== null || idx !== currentStageIndex + 1}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1"
                            >
                              {updatingStage === stage.key ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Unlock size={10} />
                              )}
                              Update to Stage
                            </button>
                          )
                        ) : (
                          <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/5">
                            <Lock size={9} /> Locked Stage
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Card */}
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-white/8 bg-slate-50 mb-4">
                <img 
                  src={selectedProduct.image || '/images/placeholder.jpg'} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200'; }} 
                />
              </div>
              <h3 className="text-base font-black dark:text-white uppercase leading-snug">{selectedProduct.name}</h3>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">SKU: {selectedProduct.sku || `SW-${selectedProduct.id.slice(0,6).toUpperCase()}`}</p>
              
              <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4 space-y-2.5 text-xs text-slate-500 dark:text-slate-300 font-bold">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-slate-800 dark:text-white">{selectedProduct.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Farm Origin:</span>
                  <span className="text-slate-800 dark:text-white">{selectedProduct.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Stock:</span>
                  <span className="text-emerald-500">{selectedProduct.stock ?? 100} Units</span>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border border-amber-500/10 bg-amber-500/5 text-amber-600 dark:text-amber-400 space-y-2`}>
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} /> Authorization Policy
              </h4>
              <p className="text-xs font-medium leading-relaxed font-sans">
                Dealers are authorized to update product stages starting from <strong>Received by Dealer</strong>.
                Pre-received states (Harvested, QC passed, Logistics Hub) are strictly locked to protect trace records.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerLifecycle;
