import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Shield, MapPin, Building, Key, Clock, Save, Lock, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const DealerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const navigate = useNavigate();

  // Profile forms state
  const [profileName, setProfileName] = useState(user?.name || 'Swasthanand Dealer Lead');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '9284939947');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'dealer.satara@swasthanand.com');
  const [profileAddress, setProfileAddress] = useState('Satara Agri Co-op Hub, Sector-4, NH-4, Maharashtra');
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setSuccessMsg('Profile details successfully updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setSuccessMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  const handleExit = () => {
    logout();
    navigate('/');
  };

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
    isDarkMode 
      ? 'text-white border-white/8 bg-white/4 focus:border-emerald-500/40' 
      : 'text-slate-800 border-slate-200 bg-white focus:border-emerald-500/30'
  }`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-emerald-500" />
          <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Account Credentials
          </span>
        </div>
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profile Settings</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage operator contact info, change passwords, and check depot registry logs.</p>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 size={14} className="shrink-0" /> {successMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Edit profile & password forms (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Contact Details Form */}
          <div className={`p-5 rounded-2xl border ${cardClass}`}>
            <h3 className="text-xs font-black uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
              Edit Profile Information
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User size={10} /> Full Name
                  </label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className={inputClass} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone size={10} /> Phone Number
                  </label>
                  <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={10} /> Email Address
                </label>
                <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className={inputClass} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} /> Physical Address
                </label>
                <textarea rows={2} value={profileAddress} onChange={e => setProfileAddress(e.target.value)} className={inputClass} required />
              </div>

              <button 
                type="submit" 
                disabled={updating}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <Save size={13} /> Save Profile
              </button>
            </form>
          </div>

          {/* Change password form */}
          <div className={`p-5 rounded-2xl border ${cardClass}`}>
            <h3 className="text-xs font-black uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={10} /> Current Password
                </label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className={inputClass} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Key size={10} /> New Password
                  </label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Key size={10} /> Confirm New Password
                  </label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={updating}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <Lock size={13} /> Update Password
              </button>
            </form>
          </div>

        </div>

        {/* Business details side column */}
        <div className="space-y-6">
          
          {/* Registry info */}
          <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                isDarkMode ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-emerald-500/20 bg-emerald-50 text-emerald-700'
              }`}>
                <Building size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase dark:text-white leading-tight">Warehouse Registry</h4>
                <span className="inline-flex items-center gap-1 mt-0.5 text-[8px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Shield size={10} /> Certified Node Lead
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>DEPOT ID:</span>
                <span className="text-slate-800 dark:text-white font-mono">SW-NODE-7392</span>
              </div>
              <div className="flex justify-between">
                <span>Co-op Register #:</span>
                <span className="text-slate-800 dark:text-white">SAT-AGR-492-2026</span>
              </div>
              <div className="flex justify-between">
                <span>Warehouse Size:</span>
                <span className="text-slate-800 dark:text-white">45,000 sq ft</span>
              </div>
              <div className="flex justify-between">
                <span>Cold Room capacity:</span>
                <span className="text-slate-800 dark:text-white">8,000 cu ft</span>
              </div>
              <div className="flex justify-between">
                <span>Registry Issued:</span>
                <span className="text-slate-800 dark:text-white">20 Jun 2026</span>
              </div>
            </div>
          </div>

          {/* Device Telemetry info */}
          <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
            <h4 className="text-xs font-black uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-1">
              <Clock size={12} className="text-emerald-500" /> Session Telemetry
            </h4>

            <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Operator Role:</span>
                <span className="text-slate-800 dark:text-white uppercase font-mono">ROLE_DEALER</span>
              </div>
              <div className="flex justify-between">
                <span>IP Address:</span>
                <span className="text-slate-800 dark:text-white font-mono">192.168.1.84</span>
              </div>
              <div className="flex justify-between">
                <span>Device status:</span>
                <span className="text-emerald-500">Capacitor Android wrapper valid</span>
              </div>
            </div>

            <button 
              onClick={handleExit}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer text-center mt-2 block"
            >
              Sign Out & Exit
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DealerProfile;
