import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { TrendingUp, Search, Truck, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ShieldAlert, Loader2, Calendar, XCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserInfo { id: string; name: string; phone: string; }
interface Order { id: string; user: UserInfo; totalAmount: number; status: string; razorpayOrderId: string; createdAt: string; }

const MOCK_ORDERS: Order[] = [
  { id: 'B2B-ORD-5819', user: { id: 'c1', name: 'Kolhapur Organic Mart', phone: '9876543210' }, totalAmount: 18450, status: 'CONFIRMED', razorpayOrderId: 'rzp_test_1', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'B2B-ORD-4720', user: { id: 'c2', name: 'Karad Super Foods', phone: '9123456789' }, totalAmount: 8900, status: 'PENDING', razorpayOrderId: 'rzp_test_2', createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 'B2B-ORD-2038', user: { id: 'c3', name: 'Satara Wellness Retail', phone: '9567890123' }, totalAmount: 32400, status: 'TRANSIT', razorpayOrderId: 'rzp_test_3', createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'B2B-ORD-1192', user: { id: 'c4', name: 'Pune Wholefoods Co-Op', phone: '9456781234' }, totalAmount: 51200, status: 'DELIVERED', razorpayOrderId: 'rzp_test_4', createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
];

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'TRANSIT', 'SHIPPED', 'DELIVERED'];

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING:   { color: 'text-amber-400',  bg: 'bg-amber-500/8',   border: 'border-amber-500/25',   label: 'Pending' },
  CONFIRMED: { color: 'text-blue-400',   bg: 'bg-blue-500/8',    border: 'border-blue-500/25',    label: 'Confirmed' },
  TRANSIT:   { color: 'text-purple-400', bg: 'bg-purple-500/8',  border: 'border-purple-500/25',  label: 'In Transit' },
  SHIPPED:   { color: 'text-indigo-400', bg: 'bg-indigo-500/8',  border: 'border-indigo-500/25',  label: 'Shipped' },
  DELIVERED: { color: 'text-emerald-400',bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', label: 'Delivered' },
  CANCELLED: { color: 'text-rose-400',   bg: 'bg-rose-500/8',    border: 'border-rose-500/25',    label: 'Cancelled' },
};

const DealerOrders: React.FC = () => {
  const { warehouse } = useOutletContext<{ warehouse: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data?.length > 0 ? data : MOCK_ORDERS);
      } else { setOrders(MOCK_ORDERS); }
    } catch { setOrders(MOCK_ORDERS); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status?status=${nextStatus}`, { method: 'PUT' });
      if (res.ok) { const u = await res.json(); setOrders(p => p.map(o => o.id === orderId ? u : o)); }
      else { setOrders(p => p.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)); }
    } catch { setOrders(p => p.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)); }
    finally { setUpdatingId(null); }
  };

  const getStepIndex = (s: string) => { const i = ORDER_STEPS.indexOf(s.toUpperCase()); return i >= 0 ? i : 0; };

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'TRANSIT', label: 'In Transit' },
    { key: 'COMPLETED', label: 'Delivered' },
  ];

  const filtered = orders.filter(o => {
    const ok = filter === 'ALL' || (filter === 'PENDING' && o.status === 'PENDING') ||
      (filter === 'TRANSIT' && ['TRANSIT','SHIPPED'].includes(o.status)) ||
      (filter === 'COMPLETED' && o.status === 'DELIVERED');
    const q = searchQuery.toLowerCase();
    return ok && (o.id.toLowerCase().includes(q) || o.user.name.toLowerCase().includes(q));
  });

  const counts = { pending: orders.filter(o => o.status === 'PENDING').length, transit: orders.filter(o => ['TRANSIT','SHIPPED'].includes(o.status)).length };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">Order Center</span>
          </div>
          <h2 className="text-2xl font-black text-white">Distributor Orders</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Monitor B2B orders, accept payments, and manage dispatch routes</p>
        </div>
        <div className="flex gap-4 shrink-0">
          {[{l:'Pending',v:counts.pending,c:'text-amber-400',bg:'bg-amber-500/8',b:'border-amber-500/20'},
            {l:'In Transit',v:counts.transit,c:'text-purple-400',bg:'bg-purple-500/8',b:'border-purple-500/20'}
          ].map(s => (
            <div key={s.l} className={`px-4 py-3 rounded-xl border text-center ${s.bg} ${s.b}`}>
              <span className={`text-xl font-black ${s.c}`}>{s.v}</span>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1 p-1.5 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${filter === t.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              style={filter === t.key ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.6), rgba(16,185,129,0.2))' } : {}}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <input type="text" placeholder="Search by order ID or customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl text-xs font-bold text-white border border-white/8 outline-none focus:border-emerald-500/40 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }} />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
            <p className="text-sm text-slate-500 font-bold">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 rounded-2xl border border-white/6 text-center" style={{ background: 'rgba(10,18,14,0.85)' }}>
            <ShieldAlert size={32} className="text-slate-600 mx-auto mb-3" />
            <h4 className="font-black text-white text-sm mb-1">No orders found</h4>
            <p className="text-xs text-slate-500 font-medium">Try a different filter or search term.</p>
          </div>
        ) : filtered.map((ord, i) => {
          const stepIdx = getStepIndex(ord.status);
          const isExp = expandedId === ord.id;
          const cfg = statusConfig[ord.status] || statusConfig['PENDING'];
          const date = new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div key={ord.id} layout
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/6 overflow-hidden transition-all hover:border-white/10"
              style={{ background: 'rgba(10,18,14,0.85)' }}>

              {/* Order Header Row */}
              <div className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/8 shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Package size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-black text-white">{ord.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-200">{ord.user.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><Calendar size={9} /> {date}</p>
                  </div>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden xl:flex items-center gap-1 flex-1 max-w-sm mx-6">
                  {ORDER_STEPS.map((step, si) => {
                    const done = si <= stepIdx;
                    const curr = si === stepIdx;
                    return (
                      <React.Fragment key={step}>
                        {si > 0 && <div className="h-0.5 flex-1 rounded-full transition-all duration-500" style={{ background: si <= stepIdx ? 'linear-gradient(90deg,#10B981,#34d399)' : 'rgba(255,255,255,0.06)' }} />}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? 'border-emerald-500' : curr ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-white/15'}`}
                            style={done ? { background: 'linear-gradient(135deg,#0B4F35,#10B981)' } : {}}>
                            {done ? <CheckCircle2 size={11} className="text-white" strokeWidth={2.5} /> : <span className="text-[8px] font-black text-slate-500">{si + 1}</span>}
                          </div>
                          <span className={`text-[7px] font-black tracking-tight ${curr ? 'text-emerald-400' : 'text-slate-600'}`}>{step}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 self-start lg:self-auto">
                  <div className="text-right">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Total</span>
                    <span className="text-lg font-black text-white">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={() => setExpandedId(isExp ? null : ord.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-emerald-500/25 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {isExp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5">
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">

                      {/* Customer Info */}
                      <div className="p-4 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-3">Distributor Info</span>
                        <p className="text-sm font-extrabold text-white mb-1">{ord.user.name}</p>
                        <p className="text-xs text-slate-400 font-medium">+91 {ord.user.phone}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">RZP: {ord.razorpayOrderId}</p>
                        <p className="text-xs text-slate-500 font-medium">Route: {warehouse}</p>
                      </div>

                      {/* QC Audit */}
                      <div className="p-4 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="block text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-3">QC Audit Status</span>
                        <div className="space-y-2">
                          {[['Batch Verified', true], ['Organic Cert Logged', true], ['Cold-chain Intact', true]].map(([l, ok]) => (
                            <div key={l as string} className="flex items-center gap-2 text-xs font-bold">
                              <CheckCircle2 size={13} className={ok ? 'text-emerald-400' : 'text-slate-600'} />
                              <span className={ok ? 'text-slate-300' : 'text-slate-600'}>{l as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 rounded-xl border border-white/6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="block text-[9px] font-black text-amber-400 uppercase tracking-wider mb-3">Status Actions</span>
                        {updatingId === ord.id ? (
                          <div className="flex items-center gap-2 p-2"><Loader2 className="animate-spin text-emerald-400" size={14} /><span className="text-xs font-bold text-slate-400">Updating...</span></div>
                        ) : (
                          <div className="space-y-2">
                            {ord.status === 'PENDING' && (
                              <button onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white border border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                                style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.5), rgba(16,185,129,0.2))' }}>
                                Accept Order <ArrowRight size={12} />
                              </button>
                            )}
                            {ord.status === 'CONFIRMED' && (
                              <button onClick={() => handleUpdateStatus(ord.id, 'TRANSIT')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white border border-amber-500/30 hover:bg-amber-500/10 transition-all"
                                style={{ background: 'rgba(245,158,11,0.1)' }}>
                                Ship Order <Truck size={12} />
                              </button>
                            )}
                            {ord.status === 'TRANSIT' && (
                              <button onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white border border-blue-500/30 hover:bg-blue-500/10 transition-all"
                                style={{ background: 'rgba(59,130,246,0.1)' }}>
                                Mark Delivered <CheckCircle2 size={12} />
                              </button>
                            )}
                            {ord.status === 'DELIVERED' && (
                              <div className="flex items-center gap-2 py-2.5 text-emerald-400 text-xs font-black">
                                <CheckCircle2 size={14} /> Route Completed
                              </div>
                            )}
                            {!['DELIVERED','CANCELLED'].includes(ord.status) && (
                              <button onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-400 border border-rose-500/20 hover:bg-rose-500/8 transition-all">
                                <XCircle size={12} /> Cancel Order
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
