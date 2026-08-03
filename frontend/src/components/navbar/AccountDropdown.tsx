import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountDropdownProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenDealerLogin: () => void;
  onOpenAdminLogin?: () => void;
  buttonText?: string;
}

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenDealerLogin,
  onOpenAdminLogin,
  buttonText = 'Login / Register'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Configuration of items for extensibility (Future Ready)
  const menuItems = [
    {
      label: 'Register',
      icon: <UserPlus size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />,
      onClick: () => {
        setIsOpen(false);
        onOpenRegister();
      },
      hoverBg: 'hover:bg-emerald-50 hover:text-emerald-700'
    },
    {
      label: 'User Login',
      icon: <LogIn size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />,
      onClick: () => {
        setIsOpen(false);
        onOpenLogin();
      },
      hoverBg: 'hover:bg-emerald-50 hover:text-emerald-700'
    },
    {
      label: 'Dealer Login',
      icon: <ShieldAlert size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />,
      onClick: () => {
        setIsOpen(false);
        onOpenDealerLogin();
      },
      hoverBg: 'hover:bg-amber-50 hover:text-amber-800'
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white text-slate-800 border-2 border-emerald-500 rounded-full font-bold text-xs md:text-sm shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all select-none cursor-pointer"
      >
        <User size={16} className="text-emerald-600" />
        <span>{buttonText}</span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            aria-label="Account Options"
            className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 focus:outline-none"
          >
            <div className="flex flex-col gap-0.5 px-1.5">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  role="menuitem"
                  className={`group flex items-center gap-3 w-full px-3.5 py-2.5 text-left text-xs md:text-sm font-semibold text-slate-700 rounded-xl transition-all ${item.hoverBg} cursor-pointer`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
