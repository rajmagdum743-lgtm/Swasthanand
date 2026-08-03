import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Building2,
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
import PasswordInput from '../components/common/PasswordInput';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please enter mobile number and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const u = await login(phone, password);
      if (!u || u.role !== 'ADMIN') {
        setError('This account does not have Admin privileges.');
      } else {
        localStorage.setItem('admin_authenticated_session', 'true');
        if (onSuccess) onSuccess();
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex flex-col items-center justify-center p-6 text-white selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md bg-[#0c1410] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 mb-3">
            <img src="/logo.png" alt="Swasthanand" className="w-10 h-10 object-contain brightness-0 invert" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Admin Console</h2>
          <p className="text-xs text-slate-400 font-medium">Executive administrators only. Input authorized credentials.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Console'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to Swasthanand Store
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [notifPos, setNotifPos] = useState({ top: 0, right: 0 });
  const [sessionActive, setSessionActive] = useState(() => {
    return localStorage.getItem('admin_authenticated_session') === 'true';
  });

  const updateNotifPos = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setNotifPos({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  };

  const toggleNotif = () => {
    if (!notifOpen) {
      updateNotifPos();
    }
    setNotifOpen(prev => !prev);
  };

  useEffect(() => {
    if (notifOpen) {
      window.addEventListener('resize', updateNotifPos);
      window.addEventListener('scroll', updateNotifPos, true);
      return () => {
        window.removeEventListener('resize', updateNotifPos);
        window.removeEventListener('scroll', updateNotifPos, true);
      };
    }
  }, [notifOpen]);

  // Security Gate: Show AdminLoginForm if not authenticated or not an admin
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <AdminLoginForm onSuccess={() => setSessionActive(true)} />;
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & metrics' },
    { path: '/admin/products', label: 'Products', icon: Package, desc: 'Inventory catalog' },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag, desc: 'All transactions' },
    { path: '/admin/dealers', label: 'Dealers', icon: Building2, desc: 'Warehouse nodes' },
    { path: '/admin/customers', label: 'Customers', icon: Users, desc: 'Consumer management' }
  ];

  const notifications = [
    { title: 'Temperature Alert', desc: 'Kolhapur Cold Storage Room spiked to +4°C', time: '2 mins ago', severity: 'high' },
    { title: 'New Dealer Request', desc: 'Pune Node requested replenishment', time: '30 mins ago', severity: 'medium' },
    { title: 'System Backup', desc: 'Daily database backup successful', time: '4 hours ago', severity: 'low' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated_session');
    setSessionActive(false);
    logout();
    navigate('/admin');
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
