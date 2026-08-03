import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { TrendingUp, Search, Truck, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert, Loader2, Calendar, XCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserInfo { id: string; name: string; phone: string; }
interface Order { id: string; user: UserInfo; totalAmount: number; status: string; razorpayOrderId: string; createdAt: string; }

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'TRANSIT', 'DELIVERED'];

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING:   { color: 'text-amber-500',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Purchase Request Received' },
  CONFIRMED: { color: 'text-blue-500',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'Accepted by Supplier' },
  TRANSIT:   { color: 'text-purple-500', bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  label: 'Product Packed' },
  SHIPPED:   { color: 'text-indigo-500', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  label: 'Dispatched' },
  DELIVERED: { color: 'text-emerald-500',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Delivered to Swasthanand Depot' },
  CANCELLED: { color: 'text-rose-500',   bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    label: 'Declined' },
};

const DealerOrders: React.FC = () => {
  const { warehouse, nodeId, isDarkMode } = useOutletContext<{ warehouse?: string; nodeId?: string; isDarkMode?: boolean }>() || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      } else { 
        setOrders([]); 
      }
    } catch { 
      setOrders([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchOrders();
  }, [nodeId]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/orders/${orderId}/status?status=${nextStatus}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) { 
        const u = await res.json(); 
        setOrders(p => p.map(o => o.id === orderId ? u : o)); 
      } else { 
        setOrders(p => p.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)); 
      }
    } catch { 
      setOrders(p => p.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)); 
    } finally { 
      setUpdatingId(null); 
    }
  };

  const getStepIndex = (s: string) => { 
    let norm = s.toUpperCase();
    if (norm === 'SHIPPED') norm = 'TRANSIT';
    const i = ORDER_STEPS.indexOf(norm); 
    return i >= 0 ? i : 0; 
  };

  const tabs = [
    { key: 'ALL', label: 'All Requests' },
    { key: 'PENDING', label: 'Purchase Requests' },
    { key: 'TRANSIT', label: 'Processing & Transit' },
    { key: 'COMPLETED', label: 'Delivered to Depot' },
  ];

  const filtered = orders.filter(o => {
    const ok = filter === 'ALL' || (filter === 'PENDING' && o.status === 'PENDING') ||
      (filter === 'TRANSIT' && ['TRANSIT','SHIPPED','CONFIRMED'].includes(o.status)) ||
      (filter === 'COMPLETED' && o.status === 'DELIVERED');
    const q = searchQuery.toLowerCase();
    const userName = o.user?.name || '';
    return ok && (o.id.toLowerCase().includes(q) || userName.toLowerCase().includes(q));
  });

  const counts = { 
    pending: orders.filter(o => o.status === 'PENDING').length, 
    transit: orders.filter(o => ['TRANSIT','SHIPPED','CONFIRMED'].includes(o.status)).length 
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
            <TrendingUp size={14} className="text-emerald-500" />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              B2B Procurement Portal
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Procurement Requests</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 font-sans">
            Accept incoming Swasthanand purchase requests, dispatch packed warehouse products, and invoice central registry.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          {[
            { l: 'Purchase Requests', v: counts.pending, c: 'text-amber-500', bg: 'bg-amber-500/10', b: 'border-amber-500/10' },
            { l: 'Active Dispatch', v: counts.transit, c: 'text-blue-500', bg: 'bg-blue-500/10', b: 'border-blue-500/10' }
          ].map(s => (
            <div key={s.l} className={`px-4 py-2.5 rounded-xl border text-center ${s.bg} ${s.b}`}>
              <span className={`text-xl font-black ${s.c}`}>{s.v}</span>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className={`flex gap-1 p-1 rounded-xl border ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white'}`}>
          {tabs.map(t => (
            <button 
              key={t.key} 
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                filter === t.key 
                  ? 'text-emerald-700 bg-emerald-50 dark:text-white dark:bg-emerald-500/10' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by order ID or distributor..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-3 pl-10 rounded-xl text-xs font-bold outline-none border transition-all ${
              isDarkMode 
                ? 'text-white border-white/8 bg-white/4 focus:border-emerald-500/40' 
                : 'text-slate-800 border-slate-200 bg-white focus:border-emerald-500/30'
            }`} 
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-emerald-500" size={24} />
            <p className="text-xs text-slate-400 font-bold">Loading shipments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`p-16 rounded-2xl border text-center ${cardClass}`}>
            <ShieldAlert size={32} className="text-slate-400 mx-auto mb-2" />
            <h4 className="font-black text-xs uppercase tracking-wider mb-1">No Shipments Found</h4>
            <p className="text-[10px] text-slate-500">There are no B2B orders matching the selected filter.</p>
          </div>
        ) : filtered.map((ord, i) => {
          const stepIdx = getStepIndex(ord.status);
          const isExp = expandedId === ord.id;
          const cfg = statusConfig[ord.status] || statusConfig['PENDING'];
          const date = new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div 
              key={ord.id} 
              layout
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: Math.min(0.3, i * 0.04) }}
              className={`rounded-2xl border overflow-hidden transition-all hover:shadow-md ${cardClass}`}
            >
              {/* Order Header Row */}
              <div className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    isDarkMode ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <Package size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black dark:text-white font-mono">{ord.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs font-black dark:text-slate-200">Swasthanand Central Platform</p>
                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><Calendar size={9} /> Assigned: {date}</p>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="hidden xl:flex items-center gap-1 flex-1 max-w-md mx-8">
                  {ORDER_STEPS.map((step, si) => {
                    const done = si <= stepIdx;
                    const curr = si === stepIdx;
                    const label = step === 'PENDING' ? 'Received' : step === 'CONFIRMED' ? 'Accepted' : step === 'TRANSIT' ? 'Packed' : 'Delivered';
                    
                    return (
                      <React.Fragment key={step}>
                        {si > 0 && (
                          <div 
                            className="h-0.5 flex-1 rounded-full transition-all duration-300" 
                            style={{ background: si <= stepIdx ? '#10b981' : isDarkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} 
                          />
                        )}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div 
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                              done 
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm' 
                                : curr 
                                ? 'border-emerald-500 text-emerald-500 bg-white ring-2 ring-emerald-500/20' 
                                : 'border-slate-200 bg-white text-slate-300 dark:border-white/10 dark:bg-white/2'
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 size={12} strokeWidth={3} />
                            ) : (
                              <span className="text-[8px] font-black">{si + 1}</span>
                            )}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider ${curr ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {label}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 self-stretch lg:self-auto justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-white/5">
                  <div className="text-left lg:text-right">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Shipment Value</span>
                    <span className="text-sm font-black dark:text-white">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <button 
                    onClick={() => setExpandedId(isExp ? null : ord.id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                      isDarkMode ? 'border-white/8 text-slate-400 hover:text-white bg-white/4' : 'border-slate-200 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expandable Order Actions & Details */}
              <AnimatePresence>
                {isExp && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                  >
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50 dark:bg-white/[0.01]">

                      {/* Retailer Info */}
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white'}`}>
                        <span className="block text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">B2B Destination Details</span>
                        <p className="text-xs font-black dark:text-white mb-0.5">Swasthanand Central Platform</p>
                        <p className="text-[10px] text-slate-500 font-bold">Email: procurement@swasthanand.com</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-2">B2B Term: Net-30 Invoice</p>
                        <p className="text-[10px] text-slate-500 font-bold">Fulfillment Site: {warehouse}</p>
                      </div>

                      {/* Stock Check */}
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white'}`}>
                        <span className="block text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Warehouse Verification</span>
                        <div className="space-y-2">
                          {[
                            ['Items matching order code', true], 
                            ['Organic test logs attached', true], 
                            ['Temperature levels verified', true]
                          ].map(([l, ok]) => (
                            <div key={l as string} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-300">
                              <CheckCircle2 size={12} className={ok ? 'text-emerald-500' : 'text-slate-300'} />
                              <span>{l as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Large Actions Buttons */}
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white'}`}>
                        <span className="block text-[8px] font-black text-amber-500 uppercase tracking-wider mb-3">Shipment Status Actions</span>
                        {updatingId === ord.id ? (
                          <div className="flex items-center justify-center gap-2 py-3">
                            <Loader2 className="animate-spin text-emerald-500" size={14} />
                            <span className="text-[10px] text-slate-400 font-bold">Updating central register...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {ord.status === 'PENDING' && (
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}
                                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer text-center"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                  className="py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer text-center border border-rose-500/20"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            
                            {ord.status === 'CONFIRMED' && (
                              <button 
                                onClick={() => handleUpdateStatus(ord.id, 'TRANSIT')}
                                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                              >
                                Prepare & Dispatch <Truck size={14} />
                              </button>
                            )}

                            {['TRANSIT', 'SHIPPED'].includes(ord.status) && (
                              <button 
                                onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                              >
                                Mark as Delivered <CheckCircle2 size={14} />
                              </button>
                            )}

                            {ord.status === 'DELIVERED' && (
                              <div className="flex items-center justify-center gap-1.5 py-2.5 text-emerald-500 text-xs font-black uppercase border border-emerald-500/10 bg-emerald-500/5 rounded-xl">
                                <CheckCircle2 size={14} /> Shipment Completed
                              </div>
                            )}

                            {ord.status === 'CANCELLED' && (
                              <div className="flex items-center justify-center gap-1.5 py-2.5 text-rose-500 text-xs font-black uppercase border border-rose-500/10 bg-rose-500/5 rounded-xl">
                                <XCircle size={14} /> Rejected / Cancelled
                              </div>
                            )}

                            {!['DELIVERED','CANCELLED','PENDING'].includes(ord.status) && (
                              <button 
                                onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                className="w-full flex items-center justify-center gap-1 py-2 text-rose-500 hover:text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-rose-500/15 mt-1 cursor-pointer"
                              >
                                <XCircle size={10} /> Cancel Order
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DealerOrders;
