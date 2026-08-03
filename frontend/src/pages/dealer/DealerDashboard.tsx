import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { API_BASE_URL } from '../../config/api';
import {
  Package,
  Clock,
  CheckCircle2,
  Warehouse,
  Truck,
  Scan,
  X,
  Play,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  user: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

const DealerDashboard: React.FC = () => {
  const { warehouse, nodeId, isDarkMode } = useOutletContext<{ warehouse?: string; nodeId?: string; isDarkMode?: boolean }>() || {};
  const { products, loading: productsLoading } = useProducts() as any;

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
    } catch (err) {
      console.warn('Webcam stream not available:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const openScanner = () => {
    setScannerOpen(true);
    setScanResult(null);
    startCamera();
  };

  const closeScanner = () => {
    setScannerOpen(false);
    stopCamera();
  };

  useEffect(() => {
    if (isScanning && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isScanning, stream]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
  }, [nodeId]);

  // Scoped dealer products
  const dealerProducts = products.filter((p: any) => p.dealerId || p.dealershipNodeId === nodeId);
  const lowStockProducts = dealerProducts.filter((p: any) => (p.stock ?? 100) < 15);
  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'TRANSIT', 'SHIPPED'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');

  // Expiry data comes from real backend only
  const expiringProducts: any[] = [];

  const stats = [
    { title: 'My Products', value: `${dealerProducts.length} Items`, desc: 'Active catalog listings', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'My Inventory', value: `${dealerProducts.reduce((acc: number, p: any) => acc + (p.stock ?? 0), 0)} Units`, desc: 'Total items in warehouse', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'My B2B Orders', value: `${pendingOrders.length} Pending`, desc: 'Incoming purchase requests', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Catalog Approvals', value: `${dealerProducts.filter((p: any) => p.status === 'QC_PASSED').length} Approved`, desc: `${dealerProducts.filter((p: any) => p.status === 'DEALER_ALLOCATED').length} pending review`, color: 'text-teal-500', bg: 'bg-teal-500/10' }
  ];

  const quickActions = [
    { label: 'Verify Stock', icon: Scan, onClick: openScanner, bg: 'from-emerald-500 to-teal-600', text: 'Scan items using camera / SKU' },
    { label: 'My Catalog', icon: Package, link: '/dealer/inventory', bg: 'from-blue-500 to-indigo-600', text: 'Check stock levels and details' },
    { label: 'Propose New Product', icon: Plus, link: '/dealer/inventory?propose=true', bg: 'from-amber-500 to-orange-600', text: 'Submit new item for approval', hidden: true },
    { label: 'B2B Procurement', icon: Truck, link: '/dealer/orders', bg: 'from-purple-500 to-pink-600', text: 'Accept and process B2B orders' }
  ];

  const recentActivities: { type: string; text: string; time: string; date: string }[] = [];

  // Simulating barcode/QR scanning
  const triggerMockScan = (product: any) => {
    setIsScanning(true);
    setScanResult(null);
    // Play a mock beep using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.log('Beep audio error:', e);
    }

    setTimeout(() => {
      stopCamera();
      setScanResult({
        ...product,
        mfgDate: product.harvestDate || '2026-03-12',
        expiryDate: '2026-12-15',
        qcStatus: 'PASSED',
        stage: 'Dealer Allocated'
      });
    }, 1200);
  };

  const cardClass = isDarkMode
    ? 'bg-[#0c1410] border border-white/5 shadow-xl text-white'
    : 'bg-white border border-slate-100 shadow-sm text-slate-800';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className={`p-6 md:p-8 rounded-3xl relative overflow-hidden ${isDarkMode ? 'bg-[#0b1b12] border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-20 -translate-y-20" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
              }`}>
              <Warehouse size={11} /> {warehouse}
            </span>
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Warehouse Dashboard
            </h2>
            <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} max-w-2xl`}>
              Manage inventory levels, approve incoming distributor shipments, and trace crop origins.
              Click card buttons below for fast updates without navigating menus.
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className={`text-center px-4 py-3 rounded-2xl border ${isDarkMode ? 'border-white/8 bg-white/3' : 'border-slate-200 bg-white'}`}>
              <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Today's Orders</span>
              <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {orders.filter(o => {
                  const today = new Date().toDateString();
                  return new Date(o.createdAt).toDateString() === today;
                }).length} Orders
              </span>
            </div>
            <div className={`text-center px-4 py-3 rounded-2xl border ${isDarkMode ? 'border-white/8 bg-white/3' : 'border-slate-200 bg-white'}`}>
              <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Stock Alerts</span>
              <span className={`text-lg font-black text-rose-500`}>
                {lowStockProducts.length} Items Low
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="space-y-3">
        <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.filter((action) => !action.hidden).map((action, i) => {
            const Icon = action.icon;
            return action.link ? (
              <Link
                key={i}
                to={action.link}
                className={`group p-5 rounded-2xl relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 shadow-md bg-gradient-to-br ${action.bg} text-white`}
              >
                <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform`}>
                  <Icon size={80} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-sm font-black tracking-tight">{action.label}</h4>
                <p className="text-[10px] text-white/80 font-medium mt-1 leading-snug">{action.text}</p>
              </Link>
            ) : (
              <button
                key={i}
                onClick={action.onClick}
                className={`group p-5 text-left rounded-2xl relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 shadow-md bg-gradient-to-br ${action.bg} text-white cursor-pointer`}
              >
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Icon size={80} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-white" />
                </div>
                <h4 className="text-sm font-black tracking-tight">{action.label}</h4>
                <p className="text-[10px] text-white/80 font-medium mt-1 leading-snug">{action.text}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl ${cardClass}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</span>
              <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Package size={12} className={stat.color} />
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[10px] text-slate-400 font-bold">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Lower Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* B2B Procurement Orders */}
        <div className={`p-5 rounded-2xl lg:col-span-2 ${cardClass}`}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} className="text-emerald-500" /> B2B Procurement
              </h3>
              <p className="text-[9px] text-slate-400 font-bold">Active purchase requests from Swasthanand Central Platform</p>
            </div>
            <Link
              to="/dealer/orders"
              className="text-[9px] font-black text-emerald-500 hover:underline uppercase tracking-wider"
            >
              Process Requests
            </Link>
          </div>

          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold">Loading requests...</div>
            ) : pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold">No active procurement requests.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 font-black">Request ID</th>
                    <th className="pb-2 font-black">Destination</th>
                    <th className="pb-2 text-right font-black">Supply Value</th>
                    <th className="pb-2 text-center font-black">Procurement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {pendingOrders.slice(0, 4).map((ord) => {
                    const statusLabels: Record<string, string> = {
                      PENDING: 'Request Received',
                      CONFIRMED: 'Accepted by Dealer',
                      TRANSIT: 'Product Packed',
                      SHIPPED: 'Dispatched',
                      DELIVERED: 'Delivered'
                    };
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                        <td className="py-3 font-mono text-[10px]">{ord.id.slice(0, 12)}</td>
                        <td className="py-3">Swasthanand Pune Warehouse</td>
                        <td className="py-3 text-right text-emerald-500">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {statusLabels[ord.status] || ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Product Approval Status Tracker */}
        <div className={`p-5 rounded-2xl ${cardClass}`}>
          <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-blue-500">
              <CheckCircle2 size={14} /> Product Proposals
            </h3>
            <p className="text-[9px] text-slate-400 font-bold">Admin review & approval tracker</p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {dealerProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No proposals submitted.</div>
            ) : (
              dealerProducts.map((item: any, i: number) => {
                const isApproved = item.status === 'QC_PASSED';
                const isPending = item.status === 'DEALER_ALLOCATED';
                return (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold truncate">{item.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">B2B Price: ₹{item.price}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                      isApproved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500/25 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : isPending
                        ? 'bg-amber-50 text-amber-700 border-amber-500/25 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-700 border-rose-500/25 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>
                      {isApproved ? 'Approved' : isPending ? 'Pending' : 'Expired/Rejected'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className={`p-5 rounded-2xl lg:col-span-3 ${cardClass}`}>
          <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-500" /> Recent Activity
            </h3>
            <p className="text-[9px] text-slate-400 font-bold">Recent changes log</p>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-extrabold">{act.text}</p>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SCANNER MODAL (SIMULATOR) */}
      <AnimatePresence>
        {scannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 relative ${isDarkMode ? 'bg-[#0b140f] text-white border border-white/10' : 'bg-white text-slate-800 border border-slate-200'
                }`}
            >
              <button
                onClick={closeScanner}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                  <Scan size={18} className="text-emerald-500" /> Barcode Scanner Simulator
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Verify batch numbers or SKU origins instantly.</p>
              </div>

              {/* Scanning Screen */}
              <div className="aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-4 mb-4">
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Laser Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-md shadow-red-500/50 animate-bounce z-10" style={{ top: '50%' }} />
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-400 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-lg border border-emerald-500/20 z-10 animate-pulse">
                      Reading Barcode...
                    </p>
                  </>
                ) : scanResult ? (
                  <div className="text-center space-y-1 z-10 text-white bg-black/60 p-4 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-500 mx-auto" size={36} />
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-400">Scan Complete</p>
                    <p className="text-sm font-extrabold">{scanResult.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {scanResult.sku || `SW-${scanResult.id.slice(0, 6).toUpperCase()}`}</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 space-y-2 z-10">
                    <Scan className="mx-auto text-slate-500 animate-pulse" size={40} />
                    <p className="text-xs font-bold">Align product barcode or select a demo item below</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      Re-open Camera
                    </button>
                  </div>
                )}

                {/* Camera View Overlay details */}
                <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-500 uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20 z-10">
                  CAMERA: {isScanning ? 'ONLINE' : 'STANDBY'}
                </div>
                <div className="absolute top-2 right-2 text-[8px] font-mono text-emerald-500 uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20 z-10">
                  FPS: {isScanning ? '60' : '0'}
                </div>
              </div>

              {/* Demo Scan Options */}
              {!isScanning && (
                <div className="space-y-3">
                  <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Demo Product to Scan</span>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {productsLoading ? (
                      <div className="col-span-2 text-center text-xs text-slate-400">Loading products...</div>
                    ) : products.length === 0 ? (
                      <div className="col-span-2 text-center text-xs text-slate-400">No products available.</div>
                    ) : (
                      products.slice(0, 4).map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => triggerMockScan(p)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-black transition-colors ${isDarkMode
                              ? 'border-white/5 bg-white/3 hover:bg-white/5 hover:border-emerald-500/30 text-white'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                            }`}
                        >
                          <Play size={10} className="text-emerald-500" />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Scan Results Details */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border space-y-3 ${isDarkMode ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/50'
                    }`}
                >
                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Harvest/Mfg Date</span>
                      <span>{scanResult.mfgDate}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Expiry Date</span>
                      <span>{scanResult.expiryDate}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">QC Health Status</span>
                      <span className="text-emerald-500">{scanResult.qcStatus}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Current Stage</span>
                      <span>{scanResult.stage}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/dealer/traceability?batchId=${scanResult.batchId}`}
                      onClick={() => setScannerOpen(false)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl text-center"
                    >
                      View Origin Timeline
                    </Link>
                    <Link
                      to={`/dealer/lifecycle?batchId=${scanResult.batchId}`}
                      onClick={() => setScannerOpen(false)}
                      className={`flex-1 py-2 border text-xs font-black uppercase tracking-wider rounded-xl text-center ${isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      Update Stage
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealerDashboard;
