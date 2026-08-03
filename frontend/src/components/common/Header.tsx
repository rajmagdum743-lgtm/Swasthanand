import { Search, ShoppingCart, User as UserIcon, LogOut, Menu, X, Compass, Sprout, Sparkles, HelpCircle, PhoneCall, ShieldAlert, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import React, { useState } from 'react';
import ProfileModal from '../auth/ProfileModal';
import { Link } from 'react-router-dom';
import { AccountDropdown } from '../navbar/AccountDropdown';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenDealerLogin: () => void;
  onOpenAdminLogin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenLogin, onOpenRegister, onOpenDealerLogin }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [profileOpen, setProfileOpen] = useState<{ isOpen: boolean; tab: 'info' | 'addresses' | 'cart' | 'orders' }>({ isOpen: false, tab: 'info' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="glass-morphism fixed top-0 w-full z-50 px-3 md:px-6 py-2 flex items-center justify-between min-h-[72px] md:min-h-[90px]">
        <Link to="/" className="flex items-center gap-2 md:gap-3 hover:opacity-95 transition-all group shrink-0">
          <div className="w-12 h-12 md:w-20 md:h-20 flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105 duration-300">
            <img 
              src="/logo.png" 
              alt="Swasthanand Logo" 
              className="h-full w-auto object-contain scale-150"
            />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-lg md:text-3xl font-black tracking-tight text-slate-900 leading-none">Swasthanand</span>
            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 pl-0.5">Authentic & Pure</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden xl:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
          <Link to="/" className="hover:text-emerald-600 transition-all relative group">
            Marketplace
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/traceability" className="hover:text-emerald-600 transition-all relative group">
            Traceability
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/contact" className="hover:text-emerald-600 transition-all relative group">
            Contact Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          {isAuthenticated && (user?.role === 'DEALER' || user?.role === 'ADMIN') && (
            <Link to={user?.role === 'ADMIN' ? "/admin/dashboard" : "/dealer/dashboard"} className="text-amber-600 hover:text-amber-700 font-extrabold transition-all relative group flex items-center gap-1">
              {user?.role === 'ADMIN' ? "Admin Panel" : "Dealer Portal"}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          {!isAuthenticated && (
            <button className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors hidden lg:block">
              <Search size={20} />
            </button>
          )}
          <button 
            onClick={onOpenCart}
            className="p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors relative mr-0.5 md:mr-1 active:scale-95"
            title="Basket"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 md:gap-2 pl-1 md:pl-4 border-l border-slate-200">
              {isAuthenticated && (user?.role === 'DEALER' || user?.role === 'ADMIN') && (
                <Link 
                  to={user?.role === 'ADMIN' ? "/admin/dashboard" : "/dealer/dashboard"} 
                  className="p-1 md:p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-all flex items-center"
                  title={user?.role === 'ADMIN' ? "Admin Panel" : "Dealer Portal"}
                >
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-100 rounded text-amber-800">
                    {user?.role === 'ADMIN' ? "Admin" : "Dealer"}
                  </span>
                </Link>
              )}
              <button
                onClick={() => setProfileOpen({ isOpen: true, tab: 'info' })}
                className="p-2 text-slate-500 hover:text-emerald-500 transition-colors bg-slate-50 rounded-full active:scale-95"
                title="My Account"
              >
                <UserIcon size={22} />
              </button>

              <div 
                className="hidden xl:flex flex-col items-end cursor-pointer group"
                onClick={() => setProfileOpen({ isOpen: true, tab: 'info' })}
              >
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">My Account</span>
                <span className="text-xs font-black text-slate-800">{user?.name || 'User'}</span>
              </div>

              <button 
                onClick={logout}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors hidden sm:block"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:block">
              <AccountDropdown
                onOpenLogin={onOpenLogin}
                onOpenRegister={onOpenRegister}
                onOpenDealerLogin={onOpenDealerLogin}
              />
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/80 rounded-2xl transition-all active:scale-95 border border-slate-200/80 ml-1"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-[90] xl:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-[95] shadow-2xl xl:hidden flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Mobile Drawer Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden p-1 flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                      <img src="/logo.png" alt="Swasthanand" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="font-black text-base text-slate-900 block leading-tight">Swasthanand</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Navigation</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <div className="p-4 space-y-1.5">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Explore Pages</span>
                  
                  <Link 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all border border-transparent hover:border-emerald-100"
                  >
                    <Compass size={18} className="text-emerald-600" />
                    Marketplace
                  </Link>

                  <Link 
                    to="/traceability" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all border border-transparent hover:border-emerald-100"
                  >
                    <Sprout size={18} className="text-emerald-600" />
                    Traceability Portal
                  </Link>

                  <Link 
                    to="/contact" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all border border-transparent hover:border-emerald-100"
                  >
                    <PhoneCall size={18} className="text-emerald-600" />
                    Contact Us
                  </Link>

                  {isAuthenticated && (user?.role === 'DEALER' || user?.role === 'ADMIN') && (
                    <Link 
                      to={user?.role === 'ADMIN' ? "/admin/dashboard" : "/dealer/dashboard"} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black text-amber-700 bg-amber-50/80 border border-amber-200 mt-2"
                    >
                      <ShieldAlert size={18} className="text-amber-600" />
                      {user?.role === 'ADMIN' ? "Admin Executive Panel" : "B2B Dealer Portal"}
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                        <UserIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Logged in as</p>
                        <p className="text-xs font-black text-slate-800 truncate">{user?.name || 'Authorized User'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); setProfileOpen({ isOpen: true, tab: 'info' }); }}
                        className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all text-center"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                        className="py-2.5 px-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all text-center"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }}
                      className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 active:scale-98 transition-all"
                    >
                      <LogIn size={16} /> Sign In
                    </button>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); onOpenRegister(); }}
                      className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
                    >
                      <UserPlus size={16} /> Register New Account
                    </button>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); onOpenDealerLogin(); }}
                      className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
                    >
                      Dealer Access
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProfileModal isOpen={profileOpen.isOpen} onClose={() => setProfileOpen({ ...profileOpen, isOpen: false })} initialTab={profileOpen.tab} />
    </>
  );
};

export default Header;

