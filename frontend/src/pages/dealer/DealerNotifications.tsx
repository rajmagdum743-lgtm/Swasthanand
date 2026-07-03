import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Bell, ShoppingBag, AlertTriangle, Info, Truck, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: string;
  type: 'order' | 'low_stock' | 'expiry' | 'system' | 'update';
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  actionLink?: string;
  actionLabel?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', type: 'order', title: 'New Retailer Order Received', desc: 'Pune Wholefoods Co-Op placed a new B2B shipment request #ORD-4720 worth ₹8,900.', time: '2 mins ago', isRead: false, actionLink: '/dealer/orders', actionLabel: 'View Order' },
  { id: '2', type: 'low_stock', title: 'Low Stock Alert (Amla Candy)', desc: 'Sweet Amla Candy stock level is at 2 units, which is below the minimum threshold of 10.', time: '15 mins ago', isRead: false, actionLink: '/dealer/inventory', actionLabel: 'Update Stock' },
  { id: '3', type: 'expiry', title: 'Product Expiring Soon', desc: 'Traditional Organic Ghee Batch GT-302 is expiring in 15 days. Please prioritize fulfillment.', time: '1 hour ago', isRead: false, actionLink: '/dealer/inventory', actionLabel: 'View Details' },
  { id: '4', type: 'update', title: 'Shipment Dispatch Success', desc: 'B2B order #ORD-5819 has been successfully dispatched to Kolhapur Organic Mart.', time: '3 hours ago', isRead: true, actionLink: '/dealer/orders', actionLabel: 'Track Delivery' },
  { id: '5', type: 'system', title: 'Cold-chain Temperature Warning', desc: 'Cold Storage Room B detected a brief 2-degree temperature rise. Log verified stable now.', time: '5 hours ago', isRead: true },
  { id: '6', type: 'system', title: 'Weekly Maintenance Schedule', desc: 'Main power backup systems will undergo routine testing on Sunday between 1:00 AM and 3:00 AM.', time: '1 day ago', isRead: true }
];

const DealerNotifications: React.FC = () => {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'warnings' | 'system'>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order': return <ShoppingBag size={14} className="text-blue-500" />;
      case 'low_stock': return <AlertTriangle size={14} className="text-rose-500" />;
      case 'expiry': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'system': return <Info size={14} className="text-slate-500 dark:text-slate-400" />;
      case 'update': return <Truck size={14} className="text-emerald-500" />;
      default: return <Bell size={14} className="text-slate-500" />;
    }
  };

  const getBgColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order': return 'bg-blue-500/10 border-blue-500/20';
      case 'low_stock': return 'bg-rose-500/10 border-rose-500/20';
      case 'expiry': return 'bg-amber-500/10 border-amber-500/20';
      case 'system': return 'bg-slate-500/10 border-slate-500/20';
      case 'update': return 'bg-emerald-500/10 border-emerald-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'warnings') return ['low_stock', 'expiry'].includes(n.type);
    if (activeTab === 'system') return n.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-emerald-500" />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Alert Center
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Stay updated with order requests, inventory alarms, and depot news.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Check size={14} strokeWidth={2.5} /> Mark All Read
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className={`flex gap-1 p-1 border rounded-xl w-fit ${isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white'}`}>
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'warnings', label: 'Stock Warnings' },
          { key: 'system', label: 'System News' },
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.key 
                ? 'text-emerald-700 bg-emerald-50 dark:text-white dark:bg-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className={`p-16 rounded-2xl border text-center ${cardClass}`}>
              <Check size={28} className="text-slate-400 mx-auto mb-2" />
              <h4 className="font-black text-xs uppercase tracking-wider mb-1">Clear Inbox</h4>
              <p className="text-[10px] text-slate-500">You don't have any notifications under this filter.</p>
            </div>
          ) : filtered.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${cardClass} ${
                !n.isRead ? 'ring-2 ring-emerald-500/10' : ''
              }`}
            >
              {/* Type Badge Icon */}
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${getBgColor(n.type)}`}>
                {getIcon(n.type)}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3 mb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-xs font-black leading-tight ${n.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">{n.desc}</p>
                
                {/* Embedded CTA Buttons */}
                {n.actionLink && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={n.actionLink}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg text-center"
                    >
                      {n.actionLabel || 'View'}
                    </Link>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`px-3 py-1.5 border text-[9px] font-black uppercase tracking-wider rounded-lg text-center cursor-pointer ${
                          isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(n.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/5 transition-all self-center cursor-pointer shrink-0"
                title="Delete notification"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DealerNotifications;
