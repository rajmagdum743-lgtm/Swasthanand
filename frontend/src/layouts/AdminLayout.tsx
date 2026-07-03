import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Building2,
  TrendingUp,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  User as UserIcon,
  Bell,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Security Gate
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & metrics' },
    { path: '/admin/products', label: 'Products', icon: Package, desc: 'Inventory catalog' },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag, desc: 'All transactions' },
    { path: '/admin/dealers', label: 'Dealers', icon: Building2, desc: 'Warehouse nodes' },
    { path: '/admin/customers', label: 'Customers', icon: Users, desc: 'Consumer management' },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp, desc: 'Revenue & growth' },
    { path: '/admin/settings', label: 'Settings', icon: Settings, desc: 'Console parameters' }
  ];

  const notifications = [
    { title: 'Temperature Alert', desc: 'Kolhapur Cold Storage Room spiked to +4°C', time: '2 mins ago', severity: 'high' },
    { title: 'New Dealer Request', desc: 'Pune Node requested replenishment', time: '30 mins ago', severity: 'medium' },
    { title: 'System Backup', desc: 'Daily database backup successful', time: '4 hours ago', severity: 'low' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex md:w-72 flex-col justify-between shrink-0 relative z-20 border-r border-slate-200 bg-slate-900 text-white shadow-xl">
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Corporate Branding */}
          <div className="px-6 py-6 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-teal-500/20 bg-gradient-to-br from-teal-500 to-emerald-600">
                <img src="/logo.png" alt="Swasthanand" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight leading-none text-white">Admin Console</h2>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">Enterprise Shell</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-6 space-y-1 flex-1 overflow-y-auto">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3">Management</span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 group overflow-hidden ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminNav"
                      className="absolute inset-0 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-900/60 to-emerald-900/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                    isActive ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 group-hover:text-teal-400'
                  }`}>
                    <Icon size={17} />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <span className="block text-sm font-extrabold leading-tight">{item.label}</span>
                    <span className="block text-[9px] font-medium text-slate-500 group-hover:text-slate-400 transition-colors">{item.desc}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-teal-400/80 uppercase tracking-widest leading-none mb-1">Corporate Admin</p>
              <p className="text-xs font-black text-white truncate leading-none">{user?.name || 'Swasthanand Admin'}</p>
            </div>
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <Activity size={12} className="text-teal-400 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-800 hover:border-teal-500/30 hover:text-teal-400 transition-all bg-slate-900/50">
              <Home size={12} /> Portal
            </Link>
            <button onClick={handleLogout} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 border border-rose-500/15 hover:bg-rose-500/10 transition-all bg-slate-900/50">
              <LogOut size={12} /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white relative z-30 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-teal-500/30 bg-gradient-to-br from-teal-500 to-emerald-600">
            <img src="/logo.png" alt="Swasthanand" className="w-5 h-5 object-contain brightness-0 invert" />
          </div>
          <span className="font-extrabold text-base text-white">Admin Console</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl border border-slate-800 text-white bg-slate-900">
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
              className="fixed top-0 left-0 bottom-0 w-72 z-20 p-5 flex flex-col justify-between shadow-2xl md:hidden border-r border-slate-800 bg-slate-900 text-white"
            >
              <div>
                <div className="flex justify-between items-center pb-5 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
                      <img src="/logo.png" alt="" className="w-full h-full object-contain p-1 brightness-0 invert" />
                    </div>
                    <span className="font-extrabold text-white">Admin Portal</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg bg-slate-800"><X size={16} className="text-white" /></button>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path));
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive ? 'text-white border border-teal-500/30 bg-teal-900/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-teal-400' : ''} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center"><UserIcon size={14} className="text-teal-400" /></div>
                  <div>
                    <p className="text-[9px] text-teal-400 font-bold uppercase tracking-wider">Corporate Admin</p>
                    <p className="text-xs font-black text-white">{user?.name || 'Swasthanand'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"><Home size={12} /> Portal</Link>
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
        <header className="hidden md:flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white relative z-10 shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity size={14} className="text-teal-600" />
              <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Global Dashboard</span>
            </div>
            <h1 className="text-xl font-black text-slate-800">Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">{user?.name || 'Admin'}</span></h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Hub */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-teal-500/30 transition-all bg-slate-50">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">Console Alerts</span>
                      <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">3 Messages</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors">
                          <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                            n.severity === 'high' ? 'bg-red-500 animate-pulse' : n.severity === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{n.desc}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-700">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase">System Online</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
