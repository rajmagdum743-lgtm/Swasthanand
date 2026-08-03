import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Bell, ShoppingBag, AlertTriangle, Info, Truck, Check, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

interface NotificationItem {
  id: string;
  type: 'order' | 'low_stock' | 'expiry' | 'system' | 'update';
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
  actionLink?: string;
  actionLabel?: string;
  isBackendAlert?: boolean;
}

interface BackendAlert {
  id: string;
  dealerId: string;
  subject: string;
  message: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

const DealerNotifications: React.FC = () => {
  const { isDarkMode } = useOutletContext<{ isDarkMode?: boolean }>() || {};
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'warnings' | 'system'>('all');
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/dealer/alerts`);
      if (res.ok) {
        const backendAlerts: BackendAlert[] = await res.json();
        if (backendAlerts && backendAlerts.length > 0) {
          const mappedAlerts: NotificationItem[] = backendAlerts.map(a => {
            let mappedType: NotificationItem['type'] = 'system';
            const mt = (a.messageType || '').toUpperCase();
            if (mt === 'WARNING') mappedType = 'expiry';
            else if (mt === 'IMPORTANT') mappedType = 'low_stock';
            else if (mt === 'SUCCESS') mappedType = 'update';

            const createdDate = a.createdAt ? new Date(a.createdAt) : new Date();

            return {
              id: a.id,
              type: mappedType,
              title: a.subject,
              desc: a.message,
              time: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + createdDate.toLocaleDateString(),
              isRead: a.isRead !== false,
              isBackendAlert: true
            };
          });

          setNotifications(mappedAlerts);
        } else {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.warn('Could not load dealer alerts from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`${API_BASE_URL}/api/dealer/alerts/${id}/read`, { method: 'PUT' });
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    notifications.filter(n => n.isBackendAlert && !n.isRead).forEach(async (n) => {
      try {
        await fetch(`${API_BASE_URL}/api/dealer/alerts/${n.id}/read`, { method: 'PUT' });
      } catch (e) {}
    });
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`${API_BASE_URL}/api/dealer/alerts/${id}`, { method: 'DELETE' });
    } catch (e) {}
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
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin & System Alerts</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Stay updated with official Admin instructions, order requests, and inventory alarms.</p>
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
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-emerald-500" size={24} />
              <p className="text-xs text-slate-400 font-bold">Checking for Admin alerts...</p>
            </div>
          ) : filtered.length === 0 ? (
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
                !n.isRead ? 'ring-2 ring-emerald-500/20 bg-emerald-500/5' : ''
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
                    {n.isBackendAlert && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800">
                        Official Admin Alert
                      </span>
                    )}
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">{n.desc}</p>
                
                {/* Embedded CTA Buttons or Mark Read Button */}
                <div className="mt-3 flex gap-2">
                  {n.actionLink && (
                    <Link
                      to={n.actionLink}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg text-center"
                    >
                      {n.actionLabel || 'View'}
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`px-3 py-1.5 border text-[9px] font-black uppercase tracking-wider rounded-lg text-center cursor-pointer transition-colors ${
                        isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
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
