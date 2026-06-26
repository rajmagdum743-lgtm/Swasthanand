import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackageCheck,
  TrendingUp,
  Search,
  MapPin,
  LogOut,
  Home,
  Warehouse,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Bell,
  Settings,
  Zap,
  Activity,
  Shield
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const DealerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Satara Agri-Coop Center');
  const [warehouseDropOpen, setWarehouseDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const warehouses = [
    'Satara Agri-Coop Center',
    'Pune Hub & Cold Storage',
    'Mumbai B2B Distribution Point',
    'Sangli Farmers Union Warehouse'
  ];

  const menuItems = [
    { path: '/dealer', label: 'Dashboard', icon: LayoutDashboard, badge: null, desc: 'Overview & analytics' },
    { path: '/dealer/inventory', label: 'Inventory', icon: PackageCheck, badge: '3', desc: 'Stock management' },
    { path: '/dealer/orders', label: 'Orders', icon: TrendingUp, badge: '2', desc: 'Distributor orders' },
    { path: '/dealer/trace', label: 'Batch Trace', icon: Search, badge: null, desc: 'Product lifecycle' }
  ];

  const notifications = [
    { title: 'Low Stock Alert', desc: 'Moringa Powder below threshold', time: '2m ago', color: 'bg-rose-500' },
    { title: 'Order Confirmed', desc: 'B2B-ORD-5819 accepted by Kolhapur', time: '15m ago', color: 'bg-emerald-500' },
    { title: 'New Shipment', desc: 'Batch BT-2024-A arriving tomorrow', time: '1h ago', color: 'bg-blue-500' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1f17 50%, #0a0f1a 100%)' }}>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex md:w-72 flex-col justify-between shrink-0 relative z-20 border-r border-white/5"
        style={{ background: 'rgba(10, 20, 15, 0.95)', backdropFilter: 'blur(20px)' }}>

        {/* Animated background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -left-8 w-40 h-40 bg-emerald-600/8 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Branding */}
          <div className="px-6 py-7 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-emerald-500/20"
                style={{ background: 'linear-gradient(135deg, #0B4F35 0%, #10B981 100%)' }}>
                <img src="/logo.png" alt="Swasthanand" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h2 className="font-black text-base tracking-tight leading-none text-white">Dealer Console</h2>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-400/70">B2B Portal v2.0</span>
              </div>
            </div>
          </div>

          {/* Warehouse Selector */}
          <div className="px-4 py-4 border-b border-white/5">
            <label className="block text-[9px] font-black text-emerald-400/70 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
              <Warehouse size={9} /> Active Site
            </label>
            <div className="relative">
              <button
                onClick={() => setWarehouseDropOpen(!warehouseDropOpen)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white border border-white/8 hover:border-emerald-500/30 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate text-left">{selectedWarehouse}</span>
                </div>
                <ChevronDown size={12} className={`shrink-0 text-emerald-400 transition-transform ${warehouseDropOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {warehouseDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute top-full mt-2 left-0 right-0 rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl"
                    style={{ background: 'rgba(10,20,15,0.98)', backdropFilter: 'blur(20px)' }}>
                    {warehouses.map(w => (
                      <button key={w} onClick={() => { setSelectedWarehouse(w); setWarehouseDropOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-emerald-500/10 ${selectedWarehouse === w ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {w}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-5 space-y-1">
            <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-2 mb-3">Navigation</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/dealer' && currentPath.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}
                  className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 group overflow-hidden ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/4'
                  }`}>
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl border border-emerald-500/30"
                      style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.6) 0%, rgba(16,185,129,0.2) 100%)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'
                  }`}>
                    <Icon size={17} />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <span className="block text-sm font-extrabold leading-tight">{item.label}</span>
                    <span className="block text-[9px] font-medium text-slate-500 group-hover:text-slate-400 transition-colors">{item.desc}</span>
                  </div>
                  {item.badge && (
                    <span className="relative z-10 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[9px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status Card */}
          <div className="mx-4 mb-4 p-4 rounded-2xl border border-emerald-500/15"
            style={{ background: 'linear-gradient(135deg, rgba(11,79,53,0.3) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.12em]">System Health</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-bold">LIVE</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'API Latency', val: '42ms', color: 'bg-emerald-500' },
                { label: 'Batch Health', val: '98.4%', color: 'bg-emerald-500' },
                { label: 'QC Pass Rate', val: '99.1%', color: 'bg-blue-500' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-bold">{m.label}</span>
                  <span className="text-[9px] text-white font-black">{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="relative z-10 p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-emerald-400/70 uppercase tracking-[0.12em]">Authorized Dealer</p>
              <p className="text-xs font-extrabold text-white truncate">{user?.name || 'Swasthanand Dealer'}</p>
            </div>
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield size={12} className="text-emerald-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 border border-white/8 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Home size={12} /> Shop
            </Link>
            <button onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 border border-rose-500/15 hover:bg-rose-500/10 transition-all"
              style={{ background: 'rgba(239,68,68,0.05)' }}>
              <LogOut size={12} /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 relative z-30"
        style={{ background: 'rgba(10,20,15,0.98)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-emerald-500/30"
            style={{ background: 'linear-gradient(135deg, #0B4F35, #10B981)' }}>
            <img src="/logo.png" alt="Swasthanand" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-black text-base text-white">Dealer Console</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-white/10 text-white" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-10 md:hidden" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-20 p-5 flex flex-col justify-between shadow-2xl md:hidden border-r border-white/8"
              style={{ background: 'rgba(8,16,12,0.98)', backdropFilter: 'blur(24px)' }}>
              <div>
                <div className="flex justify-between items-center pb-5 border-b border-white/8 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg,#0B4F35,#10B981)' }}>
                      <img src="/logo.png" alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <span className="font-black text-white">Dealer Portal</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg bg-white/5"><X size={16} className="text-white" /></button>
                </div>
                <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full mb-4 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none">
                  {warehouses.map(w => <option key={w} value={w} className="bg-slate-900">{w}</option>)}
                </select>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || (item.path !== '/dealer' && currentPath.startsWith(item.path));
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive ? 'text-white border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                        }`}
                        style={isActive ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.5), rgba(16,185,129,0.15))' } : {}}>
                        <Icon size={18} className={isActive ? 'text-emerald-400' : ''} />
                        {item.label}
                        {item.badge && <span className="ml-auto text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-4 border-t border-white/8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center"><UserIcon size={14} className="text-emerald-400" /></div>
                  <div>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Dealer</p>
                    <p className="text-xs font-black text-white">{user?.name || 'Swasthanand'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/8 rounded-xl text-xs font-bold text-white"><Home size={12} /> Shop</Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400"><LogOut size={12} /> Exit</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">

        {/* Top Header Bar */}
        <header className="hidden md:flex justify-between items-center px-8 py-4 border-b border-white/5 relative z-10 shrink-0"
          style={{ background: 'rgba(10,18,14,0.90)', backdropFilter: 'blur(20px)' }}>

          {/* Page Title Area */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">B2B Dashboard</span>
            </div>
            <h1 className="text-xl font-black text-white">Welcome back, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#10B981,#34d399)' }}>{user?.name || 'Partner'}</span></h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Warehouse indicator */}
            <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-white/8 text-slate-300"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              <span className="text-slate-400 hidden lg:inline">Site:</span>
              <span className="font-extrabold text-white">{selectedWarehouse}</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-72 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                    style={{ background: 'rgba(10,20,15,0.98)', backdropFilter: 'blur(20px)' }}>
                    <div className="p-4 border-b border-white/5">
                      <span className="text-xs font-black text-white">Notifications</span>
                    </div>
                    {notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 hover:bg-white/3 transition-colors border-b border-white/3 last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${n.color}`} />
                        <div>
                          <p className="text-xs font-black text-white">{n.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{n.desc}</p>
                          <p className="text-[9px] text-slate-500 font-bold mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings */}
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Settings size={16} />
            </button>

            {/* Status Pill */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/20"
              style={{ background: 'rgba(16,185,129,0.08)' }}>
              <Zap size={12} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400">LIVE</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 md:p-7 overflow-y-auto custom-scrollbar"
          style={{ background: 'linear-gradient(160deg, rgba(11,79,53,0.04) 0%, transparent 50%)' }}>
          <Outlet context={{ warehouse: selectedWarehouse }} />
        </main>
      </div>
    </div>
  );
};

export default DealerLayout;
