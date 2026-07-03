import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PackageCheck,
  TrendingUp,
  Search,
  Warehouse,
  LogOut,
  Home,
  Menu,
  X,
  User as UserIcon,
  Bell,
  Activity,
  Shield,
  MapPin,
  Sun,
  Moon,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

const DealerLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Satara Agri-Coop Center');
  const [nodeId, setNodeId] = useState('satara-coop-node-id');
  const [warehouseDropOpen, setWarehouseDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Light/Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dealer-theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('dealer-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch dealer node from backend
  useEffect(() => {
    if (user?.id && !user.id.startsWith('mock-')) {
      fetch(`${API_BASE_URL}/api/products/node/dealer/${user.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not found');
        })
        .then(node => {
          if (node && node.id) {
            setNodeId(node.id);
            setSelectedWarehouse(node.name);
          }
        })
        .catch(err => {
          console.warn('Could not load dealer node from backend, using defaults:', err);
        });
    }
  }, [user]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Security Gate
  if (!isAuthenticated || user?.role !== 'DEALER') {
    return <Navigate to="/" replace />;
  }

  const warehouses = [
    'Satara Agri-Coop Center',
    'Pune Hub & Cold Storage',
    'Mumbai B2B Distribution Point',
    'Sangli Farmers Union Warehouse'
  ];

  const menuItems = [
    { path: '/dealer/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, desc: 'Overview' },
    { path: '/dealer/inventory', label: 'My Catalog', icon: PackageCheck, badge: '3', desc: 'Manage Stock' },
    { path: '/dealer/orders', label: 'B2B Procurement', icon: TrendingUp, badge: '2', desc: 'Purchase Requests' },
    { path: '/dealer/traceability', label: 'Batch Traceability', icon: Search, badge: null, desc: 'Farm to Depot' },
    { path: '/dealer/lifecycle', label: 'Lifecycle Status', icon: Activity, badge: null, desc: 'Quality Stages' },
    { path: '/dealer/reports', label: 'Supply Reports', icon: ClipboardList, badge: null, desc: 'Sales & Stock Logs' },
    { path: '/dealer/notifications', label: 'Admin Alerts', icon: Bell, badge: '4', desc: 'Messages' },
    { path: '/dealer/profile', label: 'Supplier Profile', icon: UserIcon, badge: null, desc: 'Node Settings' }
  ];

  const notifications = [
    { title: 'New Order Received', desc: 'Order #ORD-8492 is pending approval', time: '2m ago', color: 'bg-amber-500' },
    { title: 'Low Stock Alert', desc: 'Moringa Powder is below 15 units', time: '15m ago', color: 'bg-rose-500' },
    { title: 'Product Expiring Soon', desc: 'Organic Honey HT-402 expires in 10 days', time: '1h ago', color: 'bg-amber-500' },
    { title: 'Shipment Dispatched', desc: 'Order #ORD-7391 has been sent to hub', time: '3h ago', color: 'bg-emerald-500' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentPath = location.pathname;

  return (
    <div 
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
        isDarkMode ? 'text-slate-100 bg-[#070b12]' : 'text-slate-800 bg-slate-50'
      }`}
      style={isDarkMode ? { background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1f17 50%, #0a0f1a 100%)' } : {}}
    >
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside 
        className={`hidden md:flex md:w-72 flex-col justify-between shrink-0 relative z-20 border-r transition-all duration-200 ${
          isDarkMode 
            ? 'border-white/5 bg-[#0b140f]/95 backdrop-blur-xl' 
            : 'border-slate-200 bg-white shadow-sm'
        }`}
      >
        {/* Animated background glow (only dark mode) */}
        {isDarkMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 -left-8 w-40 h-40 bg-emerald-600/8 rounded-full blur-2xl" />
          </div>
        )}

        <div className="relative z-10">
          {/* Branding */}
          <div className={`px-6 py-6 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #0B4F35 0%, #10B981 100%)' }}
              >
                <img src="/logo.png" alt="Swasthanand" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h2 className={`font-black text-base tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Supplier Panel
                </h2>
                <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                  B2B Supplier Portal
                </span>
              </div>
            </div>
          </div>

          {/* Warehouse Selector */}
          <div className={`px-4 py-4 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <label className={`block text-[9px] font-black uppercase tracking-[0.12em] mb-2 flex items-center gap-1.5 ${
              isDarkMode ? 'text-emerald-400/70' : 'text-emerald-700'
            }`}>
              <Warehouse size={10} /> Active Warehouse
            </label>
            <div className="relative">
              <div
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border ${
                  isDarkMode 
                    ? 'text-white border-white/8 bg-white/4' 
                    : 'text-slate-700 border-slate-200 bg-slate-50'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate text-left">{selectedWarehouse}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4 space-y-1">
            <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] px-3 mb-2">
              Menu
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/dealer/dashboard' && currentPath.startsWith(item.path));
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 group overflow-hidden ${
                    isActive 
                      ? 'text-emerald-600 dark:text-white' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/4'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeDealerNav" 
                      className={`absolute inset-0 rounded-xl border ${
                        isDarkMode 
                          ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-emerald-900/20' 
                          : 'border-emerald-500/15 bg-emerald-50/80'
                      }`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} 
                    />
                  )}
                  <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-emerald-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <span className="block text-xs font-black leading-tight">{item.label}</span>
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                      {item.desc}
                    </span>
                  </div>
                  {item.badge && (
                    <span 
                      className="relative z-10 min-w-4 h-4 px-1 flex items-center justify-center rounded-full text-[8px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className={`relative z-10 p-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDarkMode ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-emerald-500/20 text-emerald-600 bg-emerald-50'
              }`}
            >
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400/70 uppercase tracking-[0.12em]">Dealer Staff</p>
              <p className={`text-xs font-extrabold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {user?.name || 'Authorized Dealer'}
              </p>
            </div>
            <div className={`flex items-center justify-center w-6 h-6 rounded-lg ${isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
              <Shield size={12} className="text-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link 
              to="/" 
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[10px] font-black border transition-all ${
                isDarkMode 
                  ? 'text-slate-300 border-white/8 bg-white/3 hover:border-emerald-500/30 hover:text-emerald-400' 
                  : 'text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Home size={10} /> Portal Home
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[10px] font-black text-rose-500 border border-rose-500/15 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all bg-white/3"
            >
              <LogOut size={10} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div 
        className={`md:hidden flex items-center justify-between p-4 border-b relative z-30 transition-colors ${
          isDarkMode ? 'border-white/5 bg-[#080d16]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0B4F35, #10B981)' }}
          >
            <img src="/logo.png" alt="Swasthanand" className="w-5 h-5 object-contain" />
          </div>
          <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Supplier Panel</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Light/Dark toggle in mobile bar */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border ${
              isDarkMode ? 'border-white/10 text-white bg-white/5' : 'border-slate-200 text-slate-600 bg-slate-50'
            }`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border ${
              isDarkMode ? 'border-white/10 text-white bg-white/5' : 'border-slate-200 text-slate-600 bg-slate-50'
            }`}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-10 md:hidden" 
            />
            <motion.div
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-72 z-20 p-5 flex flex-col justify-between shadow-2xl md:hidden border-r ${
                isDarkMode ? 'border-white/8 bg-[#080d16] text-white' : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <div>
                <div className={`flex justify-between items-center pb-4 border-b mb-4 ${isDarkMode ? 'border-white/8' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg,#0B4F35,#10B981)' }}>
                      <img src="/logo.png" alt="" className="w-full h-full object-contain p-1.5" />
                    </div>
                    <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Supplier Panel</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <X size={14} />
                  </button>
                </div>
                <div 
                  className={`w-full mb-4 border rounded-xl px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate text-left">{selectedWarehouse}</span>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || (item.path !== '/dealer/dashboard' && currentPath.startsWith(item.path));
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all border ${
                          isActive 
                            ? 'text-emerald-700 border-emerald-500/20 bg-emerald-50 dark:text-white dark:border-emerald-500/30' 
                            : 'text-slate-500 border-transparent hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                        style={isActive && isDarkMode ? { background: 'linear-gradient(135deg, rgba(11,79,53,0.5), rgba(16,185,129,0.15))' } : {}}
                      >
                        <Icon size={16} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className={`pt-4 border-t ${isDarkMode ? 'border-white/8' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-emerald-50/15 border border-emerald-50/25' : 'bg-emerald-50 border border-emerald-100'}`}>
                    <UserIcon size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider">Dealer</p>
                    <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user?.name || 'Swasthanand'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-center gap-1 py-2 border rounded-xl text-[10px] font-black ${isDarkMode ? 'bg-white/5 border-white/8 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}><Home size={10} /> Home</Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-1 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500"><LogOut size={10} /> Exit</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Top Header Bar */}
        <header 
          className={`hidden md:flex justify-between items-center px-8 py-4 border-b relative z-10 shrink-0 transition-colors ${
            isDarkMode ? 'bg-[#090e18]/80 border-white/5 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity size={12} className="text-emerald-500" />
              <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                System Status Online
              </span>
            </div>
            <h1 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Welcome, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#10B981,#34d399)' }}>{user?.name || 'Dealer'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                isDarkMode 
                  ? 'border-white/8 text-slate-300 hover:text-white hover:border-emerald-500/30 bg-white/5' 
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Warehouse indicator */}
            <div className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border ${
              isDarkMode ? 'border-white/8 text-slate-300 bg-white/5' : 'border-slate-200 text-slate-700 bg-slate-50'
            }`}>
              <MapPin size={12} className="text-emerald-500 shrink-0" />
              <span className="text-slate-400 hidden lg:inline">Active Site:</span>
              <span className="font-extrabold">{selectedWarehouse}</span>
            </div>

            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'border-white/8 text-slate-400 hover:text-white hover:border-emerald-500/30 bg-white/5' 
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className={`absolute top-full right-0 mt-2 w-72 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                        isDarkMode ? 'border-white/10 bg-[#0b140f] backdrop-blur-xl' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Recent Alerts</span>
                        <Link 
                          to="/dealer/notifications" 
                          onClick={() => setNotifOpen(false)}
                          className="text-[9px] font-black text-emerald-500 uppercase hover:underline"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-white/3 max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.map((n, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'} truncate`}>{n.title}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{n.desc}</p>
                              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main 
          className={`flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar transition-colors ${
            isDarkMode ? 'bg-[#070b12]' : 'bg-slate-50/50'
          }`}
        >
          <Outlet context={{ warehouse: selectedWarehouse, nodeId, isDarkMode }} />
        </main>
      </div>
    </div>
  );
};

export default DealerLayout;
