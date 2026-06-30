import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Phone, ShieldCheck, Trash2, X, Loader2, Check, Star } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  label: string;
  pincode: string;
  state: string;
  district: string;
  village: string;
  landMark?: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  isApproved?: boolean;
  addresses: Address[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const AdminDealers: React.FC = () => {
  const [dealers, setDealers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [villages, setVillages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: 'admin123',
    pincode: '',
    state: '',
    district: '',
    village: '',
    landMark: ''
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchDealers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (res.ok) {
        const users: User[] = await res.json();
        // Filter out dealers only
        const dealerUsers = users.filter(u => u.role === 'DEALER');
        setDealers(dealerUsers);
      } else {
        if (res.status === 401 || res.status === 403) {
          setErrorMsg('Session expired or unauthorized. Please exit/logout and log in again.');
        } else {
          setErrorMsg(`Error loading dealers: HTTP status ${res.status}`);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // PIN code lookup
  useEffect(() => {
    if (formData.pincode.length === 6) {
      setPinLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
        .then(res => res.json())
        .then(data => {
          setPinLoading(false);
          if (data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            const first = postOffices[0];
            setFormData(prev => ({
              ...prev,
              state: first.State,
              district: first.District,
              village: first.Name
            }));
            setVillages(postOffices.map((po: any) => po.Name));
          }
        })
        .catch(() => setPinLoading(false));
    }
  }, [formData.pincode]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      phone: '',
      password: 'admin123',
      pincode: '',
      state: '',
      district: '',
      village: '',
      landMark: ''
    });
    setVillages([]);
    setIsModalOpen(true);
  };

  const handleDeleteDealer = async (dealerId: string, name: string) => {
    if (window.confirm(`Are you sure you want to de-register and delete dealer "${name}"?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${dealerId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          triggerNotification('Dealer de-registered successfully');
          setDealers(prev => prev.filter(d => d.id !== dealerId));
        } else {
          triggerNotification('Failed to de-register dealer', 'error');
        }
      } catch (err) {
        triggerNotification('Error connecting to backend', 'error');
      }
    }
  };

  const handleApproveDealer = async (dealerId: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${dealerId}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        triggerNotification(`Dealer "${name}" approved successfully`);
        fetchDealers();
      } else {
        triggerNotification('Failed to approve dealer', 'error');
      }
    } catch (err) {
      triggerNotification('Error connecting to backend', 'error');
    }
  };

  const handleRejectDealer = async (dealerId: string, name: string) => {
    if (window.confirm(`Are you sure you want to reject the registration request for "${name}"?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${dealerId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          triggerNotification('Dealer request rejected successfully');
          fetchDealers();
        } else {
          triggerNotification('Failed to reject dealer request', 'error');
        }
      } catch (err) {
        triggerNotification('Error connecting to backend', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'DEALER'
        })
      });

      if (res.ok) {
        triggerNotification('New Dealer registered successfully!');
        setIsModalOpen(false);
        fetchDealers();
      } else {
        const errData = await res.json();
        triggerNotification(errData.message || 'Registration failed', 'error');
      }
    } catch (err) {
      triggerNotification('Connection error. Is backend running?', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDealers = dealers.filter(d => d.isApproved !== false && (d as any).approved !== false);
  const pendingDealers = dealers.filter(d => d.isApproved === false || (d as any).approved === false);

  const filteredDealers = (activeTab === 'active' ? activeDealers : pendingDealers).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.phone.includes(search) || 
    d.addresses.some(a => a.village.toLowerCase().includes(search.toLowerCase()) || a.district.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-black uppercase tracking-wider ${
              notification.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {notification.type === 'error' ? <ShieldCheck size={16} className="text-rose-500" /> : <Check size={16} />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">Wholesale Logistics</span>
          <h2 className="text-2xl font-black text-slate-800">Dealers & Node Registry</h2>
          <p className="text-xs text-slate-500 font-medium">Manage B2B warehouse licenses, distribution quotas, and geofenced locations</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-100/50 active:scale-95 transition-transform"
        >
          <Plus size={16} /> Register New Node
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Active ({activeDealers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Pending ({pendingDealers.length})
          {pendingDealers.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border border-white animate-bounce">
              {pendingDealers.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by dealer name, phone or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 pl-10 rounded-xl text-xs font-bold transition-all focus:outline-none"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p className="text-xs text-slate-400 font-bold">Loading active nodes...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-16 text-center shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-150 flex items-center justify-center mx-auto text-rose-500">
            <ShieldCheck size={24} className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-rose-800 uppercase tracking-wider">Access Disallowed</h3>
            <p className="text-xs text-rose-500 font-bold leading-relaxed mt-1.5">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={fetchDealers}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm mx-auto block"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDealers.map((dealer) => {
            const defaultAddr = dealer.addresses.find(a => a.isDefault) || dealer.addresses[0];
            return (
              <motion.div 
                key={dealer.id} 
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Health indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${(dealer.isApproved === false || (dealer as any).approved === false) ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                <div className="flex justify-between items-start pt-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                    <Building2 size={20} />
                  </div>
                  {(dealer.isApproved === false || (dealer as any).approved === false) ? (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                      Pending Approval
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Active Node
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800 uppercase text-sm leading-tight mb-1">{dealer.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <MapPin size={11} className="text-slate-400" />
                    <span>
                      {defaultAddr ? `${defaultAddr.village}, ${defaultAddr.district}, ${defaultAddr.state} (${defaultAddr.pincode})` : 'Location Undefined'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-1">
                    <Phone size={11} className="text-slate-400" />
                    <span>+91 {dealer.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-center">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Rating</span>
                    <span className="block text-xs font-black text-amber-500 flex items-center justify-center gap-0.5">
                      4.8 <Star size={10} fill="currentColor" />
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Geofence Status</span>
                    <span className="block text-[10px] font-black text-emerald-600">SECURE</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {activeTab === 'active' ? (
                    <>
                      <div className="flex-1 py-2 rounded-xl text-center text-xs font-black uppercase tracking-wider text-teal-600 border border-teal-100 bg-teal-50 flex items-center justify-center gap-1.5">
                        <ShieldCheck size={14} /> Telemetry Verified
                      </div>
                      <button 
                        onClick={() => handleDeleteDealer(dealer.id, dealer.name)}
                        className="p-2.5 rounded-xl border border-rose-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center" 
                        title="De-register Node License"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveDealer(dealer.id, dealer.name)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100/50 hover:shadow-lg transition-all"
                      >
                        <Check size={14} /> Approve Node
                      </button>
                      <button
                        onClick={() => handleRejectDealer(dealer.id, dealer.name)}
                        className="p-2.5 rounded-xl border border-rose-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center"
                        title="Reject & Delete Request"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filteredDealers.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white border border-slate-200/80 rounded-2xl">
              <Building2 className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-xs font-bold">No dealers found matching the criteria.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Register Dealer Node Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900 z-[150]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[151] overflow-hidden"
            >
              <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building2 className="text-teal-400" size={18} />
                  <h3 className="text-sm font-black uppercase tracking-wider">Register New Warehouse Node</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Dealer Node Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pune Hub & Cold Storage"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="10-digit number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Console Password *</label>
                    <input 
                      type="password" 
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="min 6 chars"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Warehouse Pincode *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 digit PIN code"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none border-b-2 border-teal-500/20"
                    />
                    {pinLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-teal-600" size={16} />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
                    <input 
                      type="text" 
                      required
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">District</label>
                    <input 
                      type="text" 
                      required
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      placeholder="District"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Village / Locality</label>
                    {villages.length > 0 ? (
                      <select 
                        value={formData.village} 
                        onChange={e => setFormData({ ...formData, village: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                      >
                        <option value="">Select Village</option>
                        {villages.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        required
                        value={formData.village}
                        onChange={e => setFormData({ ...formData, village: e.target.value })}
                        placeholder="Village / Town"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Landmark</label>
                    <input 
                      type="text" 
                      required
                      value={formData.landMark}
                      onChange={e => setFormData({ ...formData, landMark: e.target.value })}
                      placeholder="e.g. Near highway bypass"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Issue License & Register'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDealers;
