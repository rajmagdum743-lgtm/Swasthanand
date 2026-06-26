import { Search, ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import React, { useState } from 'react';
import ProfileModal from '../auth/ProfileModal';
import { Link } from 'react-router-dom';
import { AccountDropdown } from '../navbar/AccountDropdown';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenDealerLogin: () => void;
  onOpenAdminLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenLogin, onOpenRegister, onOpenDealerLogin, onOpenAdminLogin }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [profileOpen, setProfileOpen] = useState<{ isOpen: boolean; tab: 'info' | 'addresses' | 'cart' | 'orders' }>({ isOpen: false, tab: 'info' });

  return (
    <>
      <header className="glass-morphism fixed top-0 w-full z-50 px-2 md:px-6 py-2 flex items-center justify-between min-h-[80px] md:min-h-[90px]">
        <Link to="/" className="flex items-center gap-2 md:gap-3 hover:opacity-95 transition-all group shrink-0">
          <div className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:scale-105 duration-300">
            <img 
              src="/logo.png" 
              alt="Swasthanand Logo" 
              className="h-full w-auto object-contain scale-150"
            />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">Swasthanand</span>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 pl-0.5">Authentic & Pure</span>
          </div>
        </Link>

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

        <div className="flex items-center gap-1 md:gap-3">
          {!isAuthenticated && (
            <button className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors hidden lg:block">
              <Search size={20} />
            </button>
          )}
          <button 
            onClick={onOpenCart}
            className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors relative mr-1"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-4 border-l border-slate-200">
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
                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 rounded-full"
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
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <AccountDropdown
              onOpenLogin={onOpenLogin}
              onOpenRegister={onOpenRegister}
              onOpenDealerLogin={onOpenDealerLogin}
              onOpenAdminLogin={onOpenAdminLogin}
            />
          )}
        </div>
      </header>
      <ProfileModal isOpen={profileOpen.isOpen} onClose={() => setProfileOpen({ ...profileOpen, isOpen: false })} initialTab={profileOpen.tab} />
    </>
  );
};

export default Header;
