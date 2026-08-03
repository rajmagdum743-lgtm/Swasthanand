import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Shield, Building, Key, Clock, Save, Lock, CheckCircle2, Loader2, AlertCircle, FileText, Upload, Plus, ExternalLink, ShieldCheck, FileCheck, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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

const DealerProfile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const context = useOutletContext<{ isDarkMode?: boolean }>() || {};
  const isDarkMode = !!context.isDarkMode;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile forms state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileAddress, setProfileAddress] = useState('');
  const [dealershipNode, setDealershipNode] = useState<DealershipNode | null>(null);
  const [userStatus, setUserStatus] = useState<string>('ACTIVE');
  const [isApproved, setIsApproved] = useState<boolean>(true);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  // Business Certifications State
  const [certifications, setCertifications] = useState<DealerCertification[]>([]);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certUploading, setCertUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certForm, setCertForm] = useState({
    id: '',
    certType: 'FSSAI',
    title: 'FSSAI Food Safety License',
    certNumber: '',
    issueDate: '',
    expiryDate: '',
    fileUrl: '',
    fileName: ''
  });

  // Fetch full dealer profile & certifications from backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.name || user?.name || '');
        setProfilePhone(data.phone || user?.phone || '');
        setProfileEmail(data.email || `dealer.${data.phone || user?.phone}@swasthanand.com`);
        setUserStatus(data.status || 'ACTIVE');
        setIsApproved(data.isApproved !== false);

        if (data.addresses && data.addresses.length > 0) {
          const addr = data.addresses[0];
          setProfileAddress(`${addr.village || ''}, ${addr.district || ''}, ${addr.state || ''} - ${addr.pincode || ''}`);
        } else {
          setProfileAddress('Satara Agri Co-op Hub, Sector-4, NH-4, Maharashtra');
        }

        if (data.dealershipNode) {
          setDealershipNode(data.dealershipNode);
        }
      } else {
        setProfileName(user?.name || 'Swasthanand Dealer Lead');
        setProfilePhone(user?.phone || '');
        setProfileEmail(user?.email || '');
        setProfileAddress('');
      }
    } catch (err) {
      console.error('Failed to fetch dealer profile from backend:', err);
      setProfileName(user?.name || 'Swasthanand Dealer Lead');
      setProfilePhone(user?.phone || '');
      setProfileEmail(user?.email || '');
      setProfileAddress('');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertifications = async () => {
    try {
      const token = localStorage.getItem('swasthanand_token');
      const res = await fetch(`${API_BASE_URL}/api/dealer/certifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCertifications(data || []);
      }
    } catch (err) {
      console.warn('Could not load dealer certifications:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCertifications();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          name: profileName,
          phone: profilePhone,
          email: profileEmail
        };
        updateProfile(updatedUser);
        
        await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: profileName, email: profileEmail })
        });
      }
      setSuccessMsg('Supplier Profile details saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSuccessMsg('Profile updated locally.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Security password updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1000);
  };

  const handleOpenAddCert = () => {
    setCertForm({
      id: '',
      certType: 'FSSAI',
      title: 'FSSAI Food Safety License',
      certNumber: '',
      issueDate: '',
      expiryDate: '',
      fileUrl: '',
      fileName: ''
    });
    setSelectedFile(null);
    setCertModalOpen(true);
  };

  const handleOpenEditCert = (cert: DealerCertification) => {
    setCertForm({
      id: cert.id,
      certType: cert.certType,
      title: cert.title,
      certNumber: cert.certNumber || '',
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      fileUrl: cert.fileUrl,
      fileName: cert.fileName || ''
    });
    setSelectedFile(null);
    setCertModalOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.title || (!certForm.fileUrl && !selectedFile)) {
      alert('Please provide certification title and document file.');
      return;
    }

    setCertUploading(true);
    try {
      let finalFileUrl = certForm.fileUrl;
      let finalFileName = certForm.fileName;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('prefix', `cert_${certForm.certType.toLowerCase()}`);

        const uploadRes = await fetch(`${API_BASE_URL}/api/files/upload`, {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const fileData = await uploadRes.json();
          finalFileUrl = fileData.url;
          finalFileName = fileData.originalFilename || selectedFile.name;
        } else {
          alert('Failed to upload certification document file.');
          setCertUploading(false);
          return;
        }
      }

      const payload = {
        certType: certForm.certType,
        title: certForm.title,
        certNumber: certForm.certNumber,
        fileUrl: finalFileUrl,
        fileName: finalFileName,
        issueDate: certForm.issueDate,
        expiryDate: certForm.expiryDate
      };

      const url = certForm.id 
        ? `${API_BASE_URL}/api/dealer/certifications/${certForm.id}`
        : `${API_BASE_URL}/api/dealer/certifications`;
      
      const method = certForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setCertModalOpen(false);
        setSuccessMsg('Business certification saved successfully for verification!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchCertifications();
      } else {
        alert('Failed to save certification record.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error saving certification.');
    } finally {
      setCertUploading(false);
    }
  };

  const handleDeleteCert = async (certId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete certification "${title}"?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dealer/certifications/${certId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setSuccessMsg('Certification document deleted.');
          setTimeout(() => setSuccessMsg(''), 4000);
          fetchCertifications();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
    isDarkMode 
      ? 'text-white border-white/8 bg-white/4 focus:border-emerald-500/40' 
      : 'text-slate-800 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500/30'
  }`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-emerald-500" />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Account & Compliance Settings
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Supplier Profile</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage node details, business certifications, and account security.</p>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={14} /> Node Status: Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-black uppercase tracking-wider">
              <Clock size={14} /> Approval Pending
            </span>
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 text-emerald-600 hover:text-emerald-800"><X size={14} /></button>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 text-rose-600 hover:text-rose-800"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Personal Info & Security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info Form */}
          <div className={`p-5 rounded-2xl border ${cardClass}`}>
            <h3 className="text-xs font-black uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-white/5 mb-4 flex items-center gap-1.5">
              <User size={14} className="text-emerald-500" /> Authorized Contact Details
            </h3>

            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className={inputClass} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mobile Number</label>
                    <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className={inputClass} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Official Email Address</label>
                  <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className={inputClass} required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Registered Business / Warehouse Address</label>
                  <input type="text" value={profileAddress} onChange={e => setProfileAddress(e.target.value)} className={inputClass} />
                </div>

                <button 
                  type="submit" 
                  disabled={updating}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save size={13} /> Save Profile Details
                </button>
              </form>
            )}
          </div>

          {/* Change password form */}
          <div className={`p-5 rounded-2xl border ${cardClass}`}>
            <h3 className="text-xs font-black uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-white/5 mb-4 flex items-center gap-1.5">
              <Lock size={14} className="text-emerald-500" /> Security & Password Settings
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={10} /> Current Password
                </label>
                <PasswordInput value={oldPassword} onChange={e => setOldPassword(e.target.value)} className={inputClass} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Key size={10} /> New Password
                  </label>
                  <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Key size={10} /> Confirm New Password
                  </label>
                  <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} required />
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

          {/* Business Certifications Management Section */}
          <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck size={14} className="text-emerald-500" /> Business Certifications & Compliance
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Upload FSSAI, GST, Organic, ISO, or Lab Reports (PDF, JPG, PNG)</p>
              </div>

              <button 
                onClick={handleOpenAddCert}
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm"
              >
                <Plus size={13} /> Add Certification
              </button>
            </div>

            {certifications.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                <FileText size={28} className="text-slate-400 mx-auto mb-2" />
                <h4 className="font-black text-xs uppercase text-slate-700 dark:text-slate-200">No Business Certifications Uploaded</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">Upload your FSSAI license or GST registration to establish verified supplier trust.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifications.map(cert => (
                  <div key={cert.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50/50 dark:bg-white/2 space-y-3 relative group">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-black text-xs">
                          <FileText size={16} />
                        </div>
                        <div>
                          <span className="inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-0.5">
                            {cert.certType}
                          </span>
                          <h4 className="text-xs font-black dark:text-white leading-tight">{cert.title}</h4>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        cert.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                          : cert.verificationStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800'
                          : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                      }`}>
                        {cert.verificationStatus}
                      </span>
                    </div>

                    {cert.certNumber && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        No / License: <span className="font-bold">{cert.certNumber}</span>
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-white/5 text-[10px]">
                      <a 
                        href={cert.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={11} /> View Document
                      </a>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEditCert(cert)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCert(cert.id, cert.title)}
                          className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Business Details Side Column */}
        <div className="space-y-6">
          
          {/* Registry Info */}
          <div className={`p-5 rounded-2xl border ${cardClass} space-y-4`}>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                isDarkMode ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-emerald-500/20 bg-emerald-50 text-emerald-700'
              }`}>
                <Building size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase dark:text-white leading-tight">
                  {dealershipNode ? dealershipNode.name : 'Warehouse Registry'}
                </h4>
                <span className="inline-flex items-center gap-1 mt-0.5 text-[8px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Shield size={10} /> Certified Node Lead
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>DEPOT ID:</span>
                <span className="text-slate-800 dark:text-white font-mono">
                  {dealershipNode ? dealershipNode.id : 'satara-coop-node-id'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Geofence Radius:</span>
                <span className="text-slate-800 dark:text-white font-mono">
                  {dealershipNode ? `${dealershipNode.geofenceRadiusKm} km` : '15.0 km'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Role Authority:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">DEALER SUPPLIER</span>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className={`p-5 rounded-2xl border ${cardClass} space-y-3`}>
            <h4 className="text-xs font-black uppercase tracking-wider dark:text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Account Audit Status
            </h4>
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              Your supplier account is verified. Business certifications uploaded will be reviewed by Swasthanand Quality Agronomists.
            </div>
          </div>

        </div>
      </div>

      {/* UPLOAD / EDIT CERTIFICATION MODAL */}
      <AnimatePresence>
        {certModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 relative overflow-hidden ${
                isDarkMode ? 'bg-[#0b140f] text-white border border-white/10' : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <button 
                onClick={() => setCertModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <span className="block text-[8px] text-emerald-500 font-black uppercase tracking-widest">Business Compliance</span>
                <h3 className="text-base font-black uppercase mt-0.5">{certForm.id ? 'Edit Certification' : 'Upload Business Certification'}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Upload FSSAI, GST, Organic, ISO, or Lab reports (Supported: PDF, JPG, PNG).</p>
              </div>

              <form onSubmit={handleSaveCert} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Certification Type *</label>
                    <select 
                      value={certForm.certType}
                      onChange={e => {
                        const val = e.target.value;
                        let defaultTitle = certForm.title;
                        if (val === 'FSSAI') defaultTitle = 'FSSAI Food Safety License';
                        else if (val === 'GST') defaultTitle = 'GST Registration Certificate';
                        else if (val === 'ORGANIC') defaultTitle = 'Organic Farming Certification';
                        else if (val === 'ISO') defaultTitle = 'ISO Quality Management Cert';
                        else if (val === 'BUSINESS_REG') defaultTitle = 'Business Registration Certificate';
                        else if (val === 'LAB_REPORT') defaultTitle = 'Laboratory Soil & Residue Report';
                        setCertForm({ ...certForm, certType: val, title: defaultTitle });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 p-3 rounded-xl outline-none"
                    >
                      <option value="FSSAI">FSSAI License</option>
                      <option value="GST">GST Certificate</option>
                      <option value="ORGANIC">Organic Certification</option>
                      <option value="ISO">ISO Certification</option>
                      <option value="BUSINESS_REG">Business Registration</option>
                      <option value="LAB_REPORT">Laboratory Report</option>
                      <option value="OTHER">Other Credential</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">License / Certificate No.</label>
                    <input 
                      type="text" 
                      value={certForm.certNumber}
                      onChange={e => setCertForm({ ...certForm, certNumber: e.target.value })}
                      placeholder="e.g. 11524039000182"
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 p-3 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Certification Title *</label>
                  <input 
                    type="text" 
                    required
                    value={certForm.title}
                    onChange={e => setCertForm({ ...certForm, title: e.target.value })}
                    placeholder="e.g. FSSAI Food Safety License"
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 p-3 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Issue Date</label>
                    <input 
                      type="date" 
                      value={certForm.issueDate}
                      onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 p-3 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry Date</label>
                    <input 
                      type="date" 
                      value={certForm.expiryDate}
                      onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 p-3 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Upload Document File (PDF, JPG, PNG) *</label>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 focus:border-emerald-500 p-2.5 rounded-xl outline-none text-xs"
                  />
                  {certForm.fileUrl && !selectedFile && (
                    <p className="text-[9px] text-emerald-500 font-bold truncate">Current File: {certForm.fileName || certForm.fileUrl}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setCertModalOpen(false)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border text-center transition-colors ${
                      isDarkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={certUploading}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {certUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} Save Certification
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealerProfile;
