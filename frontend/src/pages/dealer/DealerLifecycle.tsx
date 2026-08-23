import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { Activity, ShieldCheck, Lock, CheckCircle2, Info, Loader2, AlertCircle, RefreshCw, Truck, ShoppingCart, RotateCcw, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  category?: string;
  stock?: number;
  image?: string;
  description?: string;
  origin?: string;
  batchId?: string;
  status?: string; // Product.LifecycleState enum from DB
  dealershipNodeId?: string;
}

interface StageDefinition {
  key: string;
  label: string;
  operator: string;
  description: string;
}

// 8 Sequential happy-path pipeline stages
const PIPELINE_STAGES: StageDefinition[] = [
  { key: 'MANUFACTURED', label: 'Manufactured & Harvested', operator: 'Farm Producer', description: 'Harvested directly from organic co-op farms.' },
  { key: 'QC_PENDING', label: 'QC Inspection Pending', operator: 'Quality Control Lab', description: 'Submitted for pesticide and chemical testing.' },
  { key: 'QC_PASSED', label: 'Quality Inspection Passed', operator: 'Quality Control Lab', description: 'Tested & certified 100% pesticide-free organic.' },
  { key: 'WAREHOUSE', label: 'Received at Central Warehouse', operator: 'Logistics Hub Manager', description: 'Stored and sorted at central cold-storage facility.' },
  { key: 'DEALER_ALLOCATED', label: 'Received by Dealer', operator: 'Your Warehouse (Dealer)', description: 'Allocated and checked in your dealership node.' },
  { key: 'IN_TRANSIT', label: 'In Transit / Shipping', operator: 'Delivery & Logistics', description: 'Dispatched and en route to retail customer/store.' },
  { key: 'DELIVERED', label: 'Delivered to Destination', operator: 'Delivery & Logistics', description: 'Successfully delivered to retail destination.' },
  { key: 'SOLD', label: 'Sold to Customer', operator: 'Retail POS / Dealer', description: 'Purchased by end customer and completed.' }
];

interface ActionOption {
  event: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  variant: 'emerald' | 'amber' | 'rose' | 'indigo';
}

const DealerLifecycle: React.FC = () => {
  const { isDarkMode } = useOutletContext<{ warehouse?: string; isDarkMode?: boolean }>() || {};
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDealerInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/inventory`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);

        // Retain current selection or match by URL batchId parameter
        const batchIdParam = searchParams.get('batchId');
        if (batchIdParam) {
          const matched = data.find(p => p.batchId === batchIdParam || p.id === batchIdParam);
          if (matched) setSelectedProduct(matched);
          else if (data.length > 0) setSelectedProduct(data[0]);
        } else if (selectedProduct) {
          const matched = data.find(p => p.id === selectedProduct.id);
          if (matched) setSelectedProduct(matched);
          else if (data.length > 0) setSelectedProduct(data[0]);
        } else if (data.length > 0) {
          setSelectedProduct(data[0]);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch dealer inventory:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealerInventory();
  }, [searchParams]);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleTriggerTransition = async (eventKey: string) => {
    if (!selectedProduct) return;

    setUpdatingStage(eventKey);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/products/${selectedProduct.id}/lifecycle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ event: eventKey })
      });

      if (res.ok) {
        const updatedProduct: Product = await res.json();
        setSelectedProduct(updatedProduct);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setSuccessMsg(`Lifecycle state successfully transitioned to: ${updatedProduct.status}`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || `Transition failed (HTTP ${res.status})`);
      }
    } catch (err) {
      console.error('Lifecycle transition error:', err);
      setErrorMsg('Network error while connecting to server.');
    } finally {
      setUpdatingStage(null);
    }
  };

  // Determine available Dealer actions based on backend state machine rules
  const getDealerActions = (status?: string): ActionOption[] => {
    switch (status) {
      case 'DEALER_ALLOCATED':
        return [
          { event: 'SHIP', label: 'Dispatch / Ship Item', icon: Truck, variant: 'emerald' },
          { event: 'PURCHASE', label: 'Mark as Sold', icon: ShoppingCart, variant: 'indigo' },
          { event: 'EXPIRE', label: 'Flag as Expired', icon: AlertTriangle, variant: 'rose' }
        ];
      case 'IN_TRANSIT':
        return [
          { event: 'DELIVER', label: 'Confirm Delivery', icon: CheckCircle2, variant: 'emerald' },
          { event: 'RETURN', label: 'Mark as Returned', icon: RotateCcw, variant: 'amber' },
          { event: 'EXPIRE', label: 'Flag as Expired', icon: AlertTriangle, variant: 'rose' }
        ];
      case 'DELIVERED':
        return [
          { event: 'PURCHASE', label: 'Mark as Sold', icon: ShoppingCart, variant: 'emerald' },
          { event: 'RETURN', label: 'Initiate Return', icon: RotateCcw, variant: 'amber' },
          { event: 'EXPIRE', label: 'Flag as Expired', icon: AlertTriangle, variant: 'rose' }
        ];
      case 'SOLD':
        return [
          { event: 'RETURN', label: 'Process Return', icon: RotateCcw, variant: 'amber' }
        ];
      case 'RETURNED':
        return [
          { event: 'SEND_TO_WAREHOUSE', label: 'Return to Central Warehouse', icon: RotateCcw, variant: 'indigo' },
          { event: 'DESTROY', label: 'Mark as Destroyed', icon: Trash2, variant: 'rose' }
        ];
      case 'EXPIRED':
        return [
          { event: 'DESTROY', label: 'Dispose / Destroy Batch', icon: Trash2, variant: 'rose' }
        ];
      default:
        return [];
    }
  };

  const currentStatus = selectedProduct?.status || 'MANUFACTURED';
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.key === currentStatus);
  const availableActions = getDealerActions(selectedProduct?.status);
  const isExceptionState = ['RETURNED', 'EXPIRED', 'DESTROYED'].includes(currentStatus);

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-emerald-500" />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Operations Flow
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Product Lifecycle State Machine</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 font-sans">
            Real-time PostgreSQL lifecycle tracking. Trigger authorized state transitions enforced by the backend state machine.
          </p>
        </div>

        <button
          onClick={fetchDealerInventory}
          className={`p-2.5 rounded-xl border transition-colors flex items-center gap-2 text-xs font-bold ${
            isDarkMode ? 'border-white/8 text-slate-400 hover:text-white bg-white/4' : 'border-slate-200 text-slate-600 hover:text-slate-800 bg-white'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-500' : ''} />
          Sync from DB
        </button>
      </div>

      {/* Select Product */}
      <div className={`p-5 rounded-2xl border ${cardClass}`}>
        <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
          Select Dealer Product Batch
        </span>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2 font-bold">
            <Loader2 size={14} className="animate-spin text-emerald-500" /> Loading allocated products...
          </div>
        ) : products.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold py-2">No products currently allocated to your dealership node.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {products.map((p) => {
              const isActive = selectedProduct?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'text-emerald-700 border-emerald-500/20 bg-emerald-50 dark:text-white dark:border-emerald-500/30'
                      : 'text-slate-500 border-slate-200 bg-white hover:text-slate-800 dark:text-slate-400 dark:border-white/5 dark:hover:text-white'
                  }`}
                  style={isActive && isDarkMode ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.4), rgba(16,185,129,0.15))' } : {}}
                >
                  <span>{p.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
                    {p.status || 'MANUFACTURED'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 size={16} className="shrink-0" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-2.5 text-xs font-bold text-rose-600 dark:text-rose-400"
          >
            <AlertCircle size={16} className="shrink-0" /> {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Tracker & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Dealer Actions Panel */}
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider dark:text-white">Authorized Dealer Actions</h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Current Status: <span className="text-emerald-500 font-mono font-black">{selectedProduct.status || 'MANUFACTURED'}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black text-emerald-500 border border-emerald-500/20 bg-emerald-500/5">
                  <ShieldCheck size={11} /> Backend Enforced
                </span>
              </div>

              {availableActions.length === 0 ? (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-xs text-slate-400 font-medium">
                  {['MANUFACTURED', 'QC_PENDING', 'QC_PASSED', 'WAREHOUSE'].includes(currentStatus) ? (
                    <p className="flex items-center gap-2">
                      <Lock size={14} className="text-amber-500 shrink-0" />
                      This item is currently in an upstream stage (<strong className="text-slate-700 dark:text-slate-200">{currentStatus}</strong>). Dealer transitions become available once allocated to your node.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      No further transitions available from terminal state <strong className="text-slate-700 dark:text-slate-200">{currentStatus}</strong>.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {availableActions.map(action => {
                    const Icon = action.icon;
                    const isSubmitting = updatingStage === action.event;
                    let btnColorClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
                    if (action.variant === 'amber') btnColorClass = 'bg-amber-600 hover:bg-amber-700 text-white';
                    if (action.variant === 'rose') btnColorClass = 'bg-rose-600 hover:bg-rose-700 text-white';
                    if (action.variant === 'indigo') btnColorClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';

                    return (
                      <button
                        key={action.event}
                        onClick={() => handleTriggerTransition(action.event)}
                        disabled={updatingStage !== null}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow-sm ${btnColorClass}`}
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Icon size={14} />
                        )}
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Exception Banner */}
            {isExceptionState && (
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                currentStatus === 'DESTROYED'
                  ? 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400'
                  : currentStatus === 'EXPIRED'
                  ? 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400'
                  : 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400'
              }`}>
                <AlertTriangle size={20} className="shrink-0" />
                <div className="text-xs">
                  <h4 className="font-black uppercase">{currentStatus} Status Active</h4>
                  <p className="font-medium text-[11px] opacity-90">
                    This batch is marked as <strong>{currentStatus}</strong> in PostgreSQL database records.
                  </p>
                </div>
              </div>
            )}

            {/* Timeline Tracker Card */}
            <div className={`rounded-2xl border p-5 ${cardClass}`}>
              <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-6 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
                <div>
                  <h3 className="text-xs font-black dark:text-white uppercase tracking-wider">Standard Lifecycle Pipeline</h3>
                  <p className="text-[9px] text-slate-400 font-bold">Batch Reference: {selectedProduct.batchId || selectedProduct.id}</p>
                </div>
              </div>

              <div className="relative pl-7 space-y-6 ml-3">
                {/* Vertical line tracker */}
                <div className="absolute left-0 top-3.5 bottom-3.5 w-0.5 bg-slate-100 dark:bg-white/5" />

                {PIPELINE_STAGES.map((stage, idx) => {
                  const isCurrent = currentStatus === stage.key;
                  const isPassed = currentStageIndex > -1 && idx < currentStageIndex;
                  const isFuture = currentStageIndex > -1 ? idx > currentStageIndex : true;

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
                          ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10' 
                          : 'border-slate-100 bg-slate-50/20 dark:border-white/3 dark:bg-white/[0.01]'
                      }`}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-xs font-black uppercase ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : isFuture ? 'text-slate-400' : 'dark:text-white'}`}>
                              {stage.label}
                            </h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Active Database Status
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold">Operator Role: {stage.operator}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mt-1">{stage.description}</p>
                        </div>

                        {/* Status Tag */}
                        <div className="shrink-0">
                          {isCurrent ? (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Active Now
                            </span>
                          ) : isPassed ? (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              Completed
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  <span>Current State:</span>
                  <span className="text-emerald-500 font-mono font-black">{selectedProduct.status || 'MANUFACTURED'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-slate-800 dark:text-white">{selectedProduct.category || 'Spices'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Farm Origin:</span>
                  <span className="text-slate-800 dark:text-white">{selectedProduct.origin || 'Maharashtra, India'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Stock:</span>
                  <span className="text-emerald-500">{selectedProduct.stock ?? 0} Units</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-amber-500/10 bg-amber-500/5 text-amber-600 dark:text-amber-400 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} /> Authorization & Verification
              </h4>
              <p className="text-xs font-medium leading-relaxed font-sans">
                Stage transitions are evaluated by the PostgreSQL state machine. Arbitrary jumping or bypass is strictly blocked by the backend API.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerLifecycle;
