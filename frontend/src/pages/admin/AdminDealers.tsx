import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Phone, ShieldCheck, Trash2, X, Loader2, Check, ExternalLink, Mail, UserCheck, ShieldAlert, User, Info, Navigation, Globe, Bell, FileCheck, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordInput from '../../components/common/PasswordInput';

interface DealershipNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  geofenceRadiusKm: number;
  assignedDealerId?: string;
}

interface DealerCertification {
  id: string;
  dealerId: string;
  certType: string;
  title: string;
  certNumber?: string;
  fileUrl: string;
  fileName?: string;
  issueDate?: string;
  expiryDate?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt?: string;
}

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
  email?: string;
  isApproved?: boolean;
  status?: string;
  addresses: Address[];
  dealershipNode?: DealershipNode | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
};

const AdminDealers: React.FC = () => {
  const [dealers, setDealers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'suspended'>('active');
  
  // Dealer Details View Modal State
  const [selectedDealer, setSelectedDealer] = useState<User | null>(null);
  const [dealerCerts, setDealerCerts] = useState<DealerCertification[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Alert / Direct Messaging State
  const [alertSubject, setAlertSubject] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'INFORMATION' | 'WARNING' | 'SUCCESS' | 'IMPORTANT'>('INFORMATION');
  const [sendingAlert, setSendingAlert] = useState(false);

  // New Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [villages, setVillages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
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

      // Attempt enriched /api/admin/dealers first
      const res = await fetch(`${API_BASE_URL}/api/admin/dealers`);
      if (res.ok) {
        const dealerUsers: User[] = await res.json();
        setDealers(dealerUsers);
      } else {
        // Fallback to /api/admin/users
        const fallbackRes = await fetch(`${API_BASE_URL}/api/admin/users`);
        if (fallbackRes.ok) {
          const users: User[] = await fallbackRes.json();
          const dealerList = users.filter(u => u.role === 'DEALER');
          setDealers(dealerList);
        } else {
          setDealers([]);
        }
      }
    } catch (err) {
      console.error('Fetch dealers error:', err);
      setDealers([]);
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
      password: '',
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
          if (selectedDealer?.id === dealerId) setSelectedDealer(null);
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
      const res = await fetch(`${API_BASE_URL}/api/admin/dealers/${dealerId}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        triggerNotification(`Dealer "${name}" approved successfully`);
        fetchDealers();
        if (selectedDealer?.id === dealerId) {
          setSelectedDealer(prev => prev ? { ...prev, isApproved: true, status: 'ACTIVE' } : null);
        }
      } else {
        triggerNotification('Failed to approve dealer', 'error');
      }
    } catch (err) {
      triggerNotification('Error connecting to backend', 'error');
    }
  };

  const handleActivateDealer = async (dealerId: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dealers/${dealerId}/activate`, {
        method: 'PUT'
      });
      if (res.ok) {
        triggerNotification(`Dealer "${name}" activated successfully`);
        fetchDealers();
        if (selectedDealer?.id === dealerId) {
          setSelectedDealer(prev => prev ? { ...prev, isApproved: true, status: 'ACTIVE' } : null);
        }
      } else {
        triggerNotification('Failed to activate dealer', 'error');
      }
    } catch (err) {
      triggerNotification('Error connecting to backend', 'error');
    }
  };

  const handleSuspendDealer = async (dealerId: string, name: string) => {
    if (window.confirm(`Are you sure you want to suspend dealer "${name}"?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/dealers/${dealerId}/suspend`, {
          method: 'PUT'
        });
        if (res.ok) {
          triggerNotification(`Dealer "${name}" suspended`);
          fetchDealers();
          if (selectedDealer?.id === dealerId) {
            setSelectedDealer(prev => prev ? { ...prev, status: 'SUSPENDED' } : null);
          }
        } else {
          triggerNotification('Failed to suspend dealer', 'error');
        }
      } catch (err) {
        triggerNotification('Error connecting to backend', 'error');
      }
    }
  };

  const handleRejectDealer = async (dealerId: string, name: string) => {
    if (window.confirm(`Are you sure you want to reject the registration request for "${name}"?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/dealers/${dealerId}/reject`, {
          method: 'PUT'
        });
        if (res.ok) {
          triggerNotification('Dealer request rejected');
          fetchDealers();
          if (selectedDealer?.id === dealerId) {
            setSelectedDealer(prev => prev ? { ...prev, isApproved: false, status: 'REJECTED' } : null);
          }
        } else {
          triggerNotification('Failed to reject dealer request', 'error');
        }
      } catch (err) {
        triggerNotification('Error connecting to backend', 'error');
      }
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) return;
    if (!alertSubject.trim() || !alertMessage.trim()) {
      alert('Please enter both Subject and Message');
      return;
    }
    setSendingAlert(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dealers/${selectedDealer.id}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: alertSubject,
          message: alertMessage,
          messageType: alertType
        })
      });

      if (res.ok) {
        triggerNotification(`Alert dispatched to ${selectedDealer.name} successfully!`);
        setAlertSubject('');
        setAlertMessage('');
        setAlertType('INFORMATION');
      } else {
        const errData = await res.json();
        triggerNotification(errData.message || 'Failed to dispatch alert', 'error');
      }
    } catch (err) {
      triggerNotification('Connection error sending alert', 'error');
    } finally {
      setSendingAlert(false);
    }
  };

  useEffect(() => {
    if (selectedDealer) {
      setLoadingCerts(true);
      fetch(`${API_BASE_URL}/api/admin/dealers/${selectedDealer.id}/certifications`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setDealerCerts(data || []))
        .catch(err => console.warn(err))
        .finally(() => setLoadingCerts(false));
    } else {
      setDealerCerts([]);
    }
  }, [selectedDealer]);

  const handleUpdateCertStatus = async (certId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/certifications/${certId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerNotification(`Certification status updated to ${status}`);
        setDealerCerts(prev => prev.map(c => c.id === certId ? { ...c, verificationStatus: status } : c));
      } else {
        triggerNotification('Failed to update certification status', 'error');
      }
    } catch (err) {
      triggerNotification('Error connecting to backend', 'error');
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

  const activeDealers = dealers.filter(d => d.status === 'ACTIVE' || (d.isApproved !== false && d.status !== 'SUSPENDED' && d.status !== 'REJECTED'));
  const pendingDealers = dealers.filter(d => d.isApproved === false || d.status === 'PENDING_APPROVAL');
  const suspendedDealers = dealers.filter(d => d.status === 'SUSPENDED');

  const getFilteredDealers = () => {
    let list = dealers;
    if (activeTab === 'active') list = activeDealers;
    else if (activeTab === 'pending') list = pendingDealers;
    else if (activeTab === 'suspended') list = suspendedDealers;

    return list.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.phone.includes(search) || 
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      (d.dealershipNode?.name && d.dealershipNode.name.toLowerCase().includes(search.toLowerCase())) ||
      d.addresses.some(a => a.village?.toLowerCase().includes(search.toLowerCase()) || a.district?.toLowerCase().includes(search.toLowerCase()) || a.state?.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const filteredDealers = getFilteredDealers();

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
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">Dealer Management & Logistics</span>
          <h2 className="text-2xl font-black text-slate-800">Registered Dealers Registry</h2>
          <p className="text-xs text-slate-500 font-medium">View, approve, and manage B2B dealer profiles, distribution quotas, and warehouse licenses</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-100/50 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus size={16} /> Register New Dealer
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          All ({dealers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Active ({activeDealers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Pending ({pendingDealers.length})
          {pendingDealers.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border border-white animate-bounce">
              {pendingDealers.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suspended')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'suspended' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Suspended ({suspendedDealers.length})
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by dealer name, ID, phone, business node, or location..."
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
          <p className="text-xs text-slate-400 font-bold">Loading dealer registry...</p>
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
            const defaultAddr = dealer.addresses?.find(a => a.isDefault) || dealer.addresses?.[0];
            const isPending = dealer.isApproved === false || dealer.status === 'PENDING_APPROVAL';
            const isSuspended = dealer.status === 'SUSPENDED';
            const isRejected = dealer.status === 'REJECTED';
            const businessName = dealer.dealershipNode?.name || defaultAddr?.label || 'Swasthanand Dealer Node';

            return (
              <motion.div 
                key={dealer.id} 
                variants={itemVariants}
                onClick={() => setSelectedDealer(dealer)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer border-l-4 hover:border-teal-500"
                style={{
                  borderLeftColor: isPending ? '#f59e0b' : isSuspended ? '#f43f5e' : isRejected ? '#64748b' : '#10b981'
                }}
              >
                <div className="flex justify-between items-start pt-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                    <Building2 size={20} />
                  </div>
                  {isPending ? (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                      Pending Approval
                    </span>
                  ) : isSuspended ? (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      Suspended
                    </span>
                  ) : isRejected ? (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Dealer
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-slate-800 uppercase text-sm leading-tight group-hover:text-teal-600 transition-colors">
                      {dealer.name}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      ID: {dealer.id.slice(0, 8)}...
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                    <Building2 size={12} className="text-teal-600" /> {businessName}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <MapPin size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {defaultAddr ? `${defaultAddr.village}, ${defaultAddr.district}, ${defaultAddr.state} (${defaultAddr.pincode})` : 'Address Undefined'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <Phone size={11} className="text-slate-400 shrink-0" />
                      <span>+91 {dealer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <Mail size={11} className="text-slate-400 shrink-0" />
                      <span>{dealer.email || `dealer.${dealer.phone}@swasthanand.com`}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-center text-xs">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Warehouse Node</span>
                    <span className="block text-[10px] font-black text-slate-700 truncate">
                      {dealer.dealershipNode ? dealer.dealershipNode.name : 'Default Hub'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Geofence Radius</span>
                    <span className="block text-[10px] font-black text-emerald-600">
                      {dealer.dealershipNode ? `${dealer.dealershipNode.geofenceRadiusKm} km` : '5.0 km'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedDealer(dealer)}
                    className="flex-1 py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-wider text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Info size={13} /> View Complete Profile
                  </button>

                  <div className="flex gap-1 ml-2">
                    {isPending && (
                      <button 
                        onClick={() => handleApproveDealer(dealer.id, dealer.name)}
                        className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        title="Approve Dealer"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {!isSuspended && !isPending && (
                      <button 
                        onClick={() => handleSuspendDealer(dealer.id, dealer.name)}
                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors"
                        title="Suspend Dealer"
                      >
                        <ShieldAlert size={14} />
                      </button>
                    )}
                    {isSuspended && (
                      <button 
                        onClick={() => handleActivateDealer(dealer.id, dealer.name)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Re-activate Dealer"
                      >
                        <UserCheck size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteDealer(dealer.id, dealer.name)}
                      className="p-2 rounded-xl border border-rose-100 text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" 
                      title="De-register Dealer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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

      {/* ─── DEDICATED DEALER PROFILE DETAILS MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {selectedDealer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDealer(null)}
              className="fixed inset-0 bg-slate-900 z-[150]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-white rounded-3xl shadow-2xl z-[151] overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider leading-tight">{selectedDealer.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Dealer ID: {selectedDealer.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDealer(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-teal-600" />
                    <span className="text-xs font-bold text-slate-700">Registration Status:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDealer.isApproved === false || selectedDealer.status === 'PENDING_APPROVAL' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        Pending Approval
                      </span>
                    ) : selectedDealer.status === 'SUSPENDED' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                        Suspended
                      </span>
                    ) : selectedDealer.status === 'REJECTED' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-800 border border-slate-300">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active / Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 1: Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <User size={14} /> 1. Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                      <span className="font-extrabold text-slate-800">{selectedDealer.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">System Role</span>
                      <span className="font-bold font-mono text-teal-700">{selectedDealer.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Unique Dealer ID</span>
                      <span className="font-mono text-slate-700">{selectedDealer.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Approval</span>
                      <span className="font-bold text-slate-700">{selectedDealer.isApproved !== false ? 'Approved' : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Business & Warehouse Node Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <Building2 size={14} /> 2. Business & Warehouse Node Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Business / Warehouse Name</span>
                      <span className="font-extrabold text-slate-800">
                        {selectedDealer.dealershipNode?.name || selectedDealer.addresses?.[0]?.label || 'Satara Agri-Coop Center'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Node ID</span>
                      <span className="font-mono text-slate-700">
                        {selectedDealer.dealershipNode?.id || 'satara-coop-node-id'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">GPS Coordinates (Lat, Long)</span>
                      <span className="font-mono text-slate-700 flex items-center gap-1">
                        <Navigation size={12} className="text-teal-600" />
                        {selectedDealer.dealershipNode?.latitude || 17.6805}, {selectedDealer.dealershipNode?.longitude || 73.9918}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Geofence Radius</span>
                      <span className="font-bold text-emerald-600">
                        {selectedDealer.dealershipNode?.geofenceRadiusKm || 5.0} km
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact & Address Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <Phone size={14} /> 3. Contact & Address Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Mobile Phone Number</span>
                      <span className="font-bold font-mono text-slate-800">+91 {selectedDealer.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
                      <span className="font-bold font-mono text-slate-800">{selectedDealer.email || `dealer.${selectedDealer.phone}@swasthanand.com`}</span>
                    </div>
                    
                    {selectedDealer.addresses && selectedDealer.addresses.length > 0 ? (
                      selectedDealer.addresses.map((addr, idx) => (
                        <div key={idx} className="col-span-2 space-y-1 border-t border-slate-200 pt-2 mt-1">
                          <span className="text-[10px] font-bold text-teal-600 uppercase block">Address ({addr.label || 'Primary Warehouse'})</span>
                          <p className="text-slate-700 font-medium">
                            {addr.village}, {addr.landMark ? `${addr.landMark}, ` : ''}{addr.district}, {addr.state} - <span className="font-mono font-bold">{addr.pincode}</span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-slate-400 italic">No detailed address record available.</div>
                    )}
                  </div>
                </div>

                {/* Section 4: Account & Security Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> 4. Account & Security Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Status</span>
                      <span className="font-bold text-slate-800 uppercase">{selectedDealer.status || 'ACTIVE'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Authentication Method</span>
                      <span className="font-mono text-slate-700">Mobile OTP / Password Encrypted</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Send Alert / Direct Message to Dealer */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <Bell size={14} /> 5. Dispatch Alert & Direct Message to Dealer
                  </h4>
                  
                  <form onSubmit={handleSendAlert} className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alert Subject *</label>
                        <input 
                          type="text" 
                          required
                          value={alertSubject} 
                          onChange={e => setAlertSubject(e.target.value)} 
                          placeholder="e.g. Cold Chain Maintenance Notice"
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 p-2.5 rounded-xl text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Message Type *</label>
                        <select 
                          value={alertType} 
                          onChange={e => setAlertType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 focus:border-teal-500 p-2.5 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="INFORMATION">Information</option>
                          <option value="IMPORTANT">Important</option>
                          <option value="WARNING">Warning</option>
                          <option value="SUCCESS">Success</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Message Body *</label>
                      <textarea 
                        rows={3} 
                        required
                        value={alertMessage} 
                        onChange={e => setAlertMessage(e.target.value)} 
                        placeholder="Enter message or urgent instructions for this dealer..."
                        className="w-full bg-white border border-slate-200 focus:border-teal-500 p-2.5 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={sendingAlert}
                      className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {sendingAlert ? <Loader2 className="animate-spin" size={14} /> : <Bell size={14} />} Dispatch Alert to Dealer
                    </button>
                  </form>
                </div>

                {/* Section 6: Business Certifications & Compliance Licenses */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <FileCheck size={14} /> 6. Dealer Business Certifications & Compliance
                  </h4>
                  
                  {loadingCerts ? (
                    <div className="p-6 flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-teal-600" size={18} />
                      <span className="text-xs font-bold text-slate-500">Loading dealer business certifications...</span>
                    </div>
                  ) : dealerCerts.length === 0 ? (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-400">
                      No business certifications (FSSAI, GST, Organic) uploaded by this dealer yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dealerCerts.map(cert => (
                        <div key={cert.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 mb-1">
                                {cert.certType}
                              </span>
                              <h5 className="font-black text-slate-800">{cert.title}</h5>
                              {cert.certNumber && <p className="text-[10px] text-slate-500 font-mono">No: {cert.certNumber}</p>}
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                              cert.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : cert.verificationStatus === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {cert.verificationStatus}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[10px]">
                            <a 
                              href={cert.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={11} /> View Document
                            </a>

                            <div className="flex gap-1.5">
                              {cert.verificationStatus !== 'VERIFIED' && (
                                <button 
                                  onClick={() => handleUpdateCertStatus(cert.id, 'VERIFIED')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded text-[9px] uppercase tracking-wider cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {cert.verificationStatus !== 'REJECTED' && (
                                <button 
                                  onClick={() => handleUpdateCertStatus(cert.id, 'REJECTED')}
                                  className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-black rounded text-[9px] uppercase tracking-wider cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer / Management Actions */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0">
                <div className="flex gap-2">
                  {(selectedDealer.isApproved === false || selectedDealer.status === 'PENDING_APPROVAL') && (
                    <button
                      onClick={() => handleApproveDealer(selectedDealer.id, selectedDealer.name)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check size={14} /> Approve Dealer
                    </button>
                  )}
                  {selectedDealer.status === 'SUSPENDED' && (
                    <button
                      onClick={() => handleActivateDealer(selectedDealer.id, selectedDealer.name)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <UserCheck size={14} /> Activate Dealer
                    </button>
                  )}
                  {selectedDealer.status !== 'SUSPENDED' && selectedDealer.isApproved !== false && (
                    <button
                      onClick={() => handleSuspendDealer(selectedDealer.id, selectedDealer.name)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <ShieldAlert size={14} /> Suspend Dealer
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDealer(selectedDealer.id, selectedDealer.name)}
                    className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Record
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedDealer(null)}
                  className="px-5 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    <PasswordInput 
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
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
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
