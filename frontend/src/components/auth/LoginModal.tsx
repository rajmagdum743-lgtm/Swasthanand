import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, Phone, ShieldCheck, Loader2, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'dealer' | 'admin';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { checkPhone, sendOtp, verifyOtp, register, login, logout } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // step: 1=Phone entry, 2=OTP verify, 3=Registration form, 4=Password login
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'login' | 'register' | 'dealer' | 'admin'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    phone: '',
    pincode: '',
    country: 'India',
    state: '',
    district: '',
    village: '',
    landMark: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
  });
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setStep(1);
      setMode(initialMode);
      setIsLoading(false);
      setError('');
      setTimer(30);
      setPassword('');
      setRegistrationData({ name: '', phone: '', pincode: '', country: 'India', state: '', district: '', village: '', landMark: '', password: '', confirmPassword: '' });
    }
  }, [isOpen, initialMode]);

  // Fetch states on step 3
  useEffect(() => {
    if (step === 3) {
      fetch(`${API_BASE_URL}/api/locations/states`)
        .then(res => res.json())
        .then(data => setStates(data))
        .catch(err => console.error('Error fetching states:', err));
    }
  }, [step]);

  // Fetch districts when state changes
  useEffect(() => {
    if (registrationData.state) {
      fetch(`${API_BASE_URL}/api/locations/districts/${registrationData.state}`)
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(err => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
  }, [registrationData.state]);

  // PIN code lookup
  useEffect(() => {
    if (registrationData.pincode.length === 6) {
      setIsLoading(true);
      fetch(`https://api.postalpincode.in/pincode/${registrationData.pincode}`)
        .then(res => res.json())
        .then(data => {
          setIsLoading(false);
          if (data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            const first = postOffices[0];
            setRegistrationData(prev => ({
              ...prev,
              state: first.State,
              district: first.District
            }));
            setVillages(postOffices.map((po: any) => po.Name));
          }
        })
        .catch(() => setIsLoading(false));
    }
  }, [registrationData.pincode]);

  const handleActionFirstStep = async () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    // If user tries to register (new phone), skip checkPhone and go straight to OTP
    if (mode === 'register') {
      setIsLoading(true);
      setError('');
      try {
        const registered = await checkPhone(phone);
        if (registered) {
          setError('This phone number is already registered. Please login instead.');
          setMode('login');
          setIsLoading(false);
          return;
        }
        const result = await sendOtp(phone);
        if (result.success) {
          setStep(2);
        } else {
          setError(result.error || 'Failed to send OTP. Please try again.');
        }
      } catch (err: any) {
        setError(err.message || 'Connection failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise standard login flow (User or Dealer)
    setIsLoading(true);
    setError('');
    try {
      const registered = await checkPhone(phone);
      if (registered) {
        setStep(4); // Go to password login
      } else {
        setError('This phone number is not registered. Please switch to the Register tab above to sign up.');
      }
    } catch (err: any) {
      console.error('Login Step 1 Error:', err);
      setError(err.message || 'Connection failed. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const loggedInUser = await login(phone, password);
      setIsLoading(false);
      if (loggedInUser) {
        // Validate role according to selected tab mode
        if (mode === 'admin' && loggedInUser.role !== 'ADMIN') {
          setError('This account does not have Admin privileges.');
          logout();
          return;
        }
        if (mode === 'dealer' && loggedInUser.role !== 'DEALER') {
          setError('This account does not have Dealer privileges.');
          logout();
          return;
        }
        if (mode === 'login' && loggedInUser.role !== 'CUSTOMER') {
          setError('Please use the Admin or Dealer tab to log in to Console panels.');
          logout();
          return;
        }
        onClose();
      } else {
        setError('Invalid phone or password. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleSendOtp = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError('');
    try {
      const { success } = await sendOtp(phone);
      if (success) {
        setTimer(30);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    const res = await verifyOtp(phone, fullOtp);
    setIsLoading(false);
    if (res.success) {
      if (res.isRegistered) {
        const loggedInUser = res.user;
        if (loggedInUser) {
          // Validate role according to selected tab mode
          if (mode === 'admin' && loggedInUser.role !== 'ADMIN') {
            setError('This account does not have Admin privileges.');
            logout();
            return;
          }
          if (mode === 'dealer' && loggedInUser.role !== 'DEALER') {
            setError('This account does not have Dealer privileges.');
            logout();
            return;
          }
          if (mode === 'login' && loggedInUser.role !== 'CUSTOMER') {
            setError('Please use the Admin or Dealer tab to log in to Console panels.');
            logout();
            return;
          }
        }
        onClose();
      } else {
        setRegistrationData(prev => ({ ...prev, phone }));
        setStep(3);
      }
    } else {
      setError('Invalid OTP. Please use 123456 for demo.');
    }
  };

  const handleCompleteRegistration = async () => {
    if (!registrationData.name || !registrationData.password || !registrationData.confirmPassword || !registrationData.pincode || !registrationData.state || !registrationData.district || !registrationData.village || !registrationData.landMark) {
      setError('All fields are mandatory.');
      return;
    }
    if (registrationData.password !== registrationData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    const res = await register({ ...registrationData, phone });
    setIsLoading(false);
    if (res.success) {
      if (res.isPendingApproval) {
        alert("Registration request submitted! Your account is pending administrator approval before you can log in.");
      }
      onClose();
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  const handleRegistrationChange = (field: keyof typeof registrationData, value: string) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[40px] shadow-2xl z-[201] flex flex-col max-h-[90vh]"
          >
            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 flex items-center justify-center p-1 rounded-2xl bg-emerald-50">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <button onClick={onClose} className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all border-2 border-slate-200 hover:border-red-100 shadow-sm active:scale-95" title="Close">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* ── Tabs Switcher (Only on step 1) ── */}
              {step === 1 && (
                <div className="flex flex-wrap mb-6 bg-slate-100 rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 min-w-[80px] py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${
                      mode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 min-w-[80px] py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${
                      mode === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Register
                  </button>
                  <button
                    onClick={() => { setMode('dealer'); setError(''); }}
                    className={`flex-1 min-w-[80px] py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${
                      mode === 'dealer' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Dealer
                  </button>
                  <button
                    onClick={() => { setMode('admin'); setError(''); }}
                    className={`flex-1 min-w-[80px] py-2 rounded-xl text-[10px] md:text-xs font-black transition-all ${
                      mode === 'admin' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                  {step === 1 && mode === 'login' && 'User Sign In'}
                  {step === 1 && mode === 'register' && 'New Registration'}
                  {step === 1 && mode === 'dealer' && 'Dealer Access'}
                  {step === 1 && mode === 'admin' && 'Admin Access'}
                  {step === 2 && 'Verify Code'}
                  {step === 3 && 'Create Profile'}
                  {step === 4 && 'Enter Password'}
                </h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  {step === 1 && mode === 'login' && 'Log in using your registered mobile number.'}
                  {step === 1 && mode === 'register' && 'Register your mobile number to get started with Swasthanand.'}
                  {step === 1 && mode === 'dealer' && 'Authorized dealers only. Please input credentials.'}
                  {step === 1 && mode === 'admin' && 'Executive administrators only. Please input credentials.'}
                  {step === 2 && `We sent a code to +91 ${phone}.`}
                  {step === 3 && 'Complete the form below to register.'}
                  {step === 4 && 'Enter the password associated with this number.'}
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-red-50 text-red-600 rounded-2xl font-bold text-xs mb-5 border border-red-100 flex items-center gap-2"
                >
                  <ShieldAlert size={16} className="text-red-400 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Phone size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit Mobile Number"
                        onKeyDown={e => e.key === 'Enter' && handleActionFirstStep()}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white p-5 pl-12 rounded-2xl text-lg font-bold transition-all focus:outline-none"
                      />
                    </div>
                    <button onClick={handleActionFirstStep} disabled={isLoading} className="w-full btn-premium py-4 rounded-[20px] text-base font-bold shadow-lg shadow-emerald-100 disabled:opacity-70 flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 size={20} className="animate-spin" /> : mode === 'register' ? 'Register Now' : 'Continue'}
                      {!isLoading && <ArrowRight size={18} />}
                    </button>
                    {/* Quick switch hint */}
                    <p className="text-center text-xs text-slate-400 font-medium">
                      {mode === 'login' ? (
                        <>New user?{' '}<button onClick={() => { setMode('register'); setError(''); }} className="text-emerald-600 font-black hover:underline">Register an account</button></>
                      ) : mode === 'register' ? (
                        <>Already registered?{' '}<button onClick={() => { setMode('login'); setError(''); }} className="text-emerald-600 font-black hover:underline">Login instead</button></>
                      ) : (
                        <>Standard User?{' '}<button onClick={() => { setMode('login'); setError(''); }} className="text-emerald-600 font-black hover:underline">Return to User Login</button></>
                      )}
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex justify-between gap-1.5">
                      {otp.map((digit, index) => (
                        <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-14 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white text-center text-2xl font-black rounded-xl transition-all focus:outline-none"
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full btn-premium py-4 rounded-[20px] text-base font-bold shadow-lg shadow-emerald-100 disabled:opacity-70 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Identity'}
                      </button>
                      <div className="text-center">
                        <button
                          onClick={handleSendOtp}
                          disabled={timer > 0 || isLoading}
                          className="text-emerald-600 font-bold hover:underline disabled:text-slate-400 text-xs"
                        >
                          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3.5">
                    <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Registering As</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRegistrationChange('role', 'CUSTOMER')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                            registrationData.role !== 'DEALER'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRegistrationChange('role', 'DEALER')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                            registrationData.role === 'DEALER'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          Dealer
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password *</label>
                      <input type="password" placeholder="Create a password" value={registrationData.password} onChange={e => handleRegistrationChange('password', e.target.value)}
                        className="w-full bg-slate-50 p-3.5 rounded-xl text-sm focus:outline-emerald-500 font-medium" required />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password *</label>
                      <div className="relative">
                        <input type="password" placeholder="Repeat your password" value={registrationData.confirmPassword} onChange={e => handleRegistrationChange('confirmPassword', e.target.value)}
                          className={`w-full bg-slate-50 p-3.5 rounded-xl text-sm focus:outline-emerald-500 font-medium transition-all ${registrationData.password && registrationData.confirmPassword && registrationData.password === registrationData.confirmPassword ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}`} required />
                        {registrationData.password && registrationData.confirmPassword && registrationData.password === registrationData.confirmPassword && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">
                            <ShieldCheck size={20} />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                      <input type="text" placeholder="e.g. John Doe" value={registrationData.name} onChange={e => handleRegistrationChange('name', e.target.value)}
                        className="w-full bg-slate-50 p-3.5 rounded-xl text-sm focus:outline-emerald-500 font-medium" required />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN Code *</label>
                      <div className="relative group">
                        <input type="text" placeholder="6 Digit Code" maxLength={6} value={registrationData.pincode} onChange={e => handleRegistrationChange('pincode', e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 p-3.5 rounded-xl text-sm focus:outline-emerald-500 font-medium border-b-2 border-emerald-500/20" required />
                        {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={16} />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">State *</label>
                        <select value={registrationData.state} onChange={e => handleRegistrationChange('state', e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm font-medium outline-none border-0 ring-0" required>
                          <option value="">State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">District *</label>
                        <select value={registrationData.district} onChange={e => handleRegistrationChange('district', e.target.value)} className="w-full bg-slate-50 p-3.5 rounded-xl text-sm font-medium outline-none border-0 ring-0" required>
                          <option value="">District</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Village/Locality *</label>
                      <div className="relative">
                        {villages.length > 0 ? (
                          <select value={registrationData.village} onChange={e => handleRegistrationChange('village', e.target.value)} className="w-full bg-emerald-50/50 p-3.5 rounded-xl text-sm font-bold outline-emerald-500 border-2 border-emerald-500/20" required>
                            <option value="">Select Locality</option>
                            {villages.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        ) : (
                          <input type="text" placeholder="Enter Village / Area" value={registrationData.village} onChange={e => handleRegistrationChange('village', e.target.value)}
                            className="w-full bg-slate-50 p-3.5 rounded-xl text-sm focus:outline-emerald-500 font-medium" required />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Landmark *</label>
                      <input type="text" placeholder="e.g. Near Main Temple" value={registrationData.landMark} onChange={e => handleRegistrationChange('landMark', e.target.value)}
                        className="w-full bg-slate-50 p-3.5 rounded-xl text-sm focus:outline-emerald-500 font-medium" required />
                    </div>

                    <div className="pt-3 flex flex-col gap-3">
                      <button onClick={handleCompleteRegistration} disabled={isLoading} className="w-full btn-premium py-4 rounded-[20px] text-base font-bold shadow-lg shadow-emerald-100">
                        {isLoading ? <Loader2 className="animate-spin inline mr-2" /> : 'Complete Registration'}
                      </button>
                      <p className="text-center text-xs font-medium text-slate-400">
                        Already have an account? <button onClick={() => setStep(1)} className="text-emerald-600 font-black hover:underline ml-1">Login</button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="password-login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <KeyRound size={18} className="text-slate-400" />
                        </div>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white p-5 pl-12 rounded-2xl text-lg font-bold transition-all focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={handlePasswordLogin} disabled={isLoading} className="w-full btn-premium py-4 rounded-[20px] text-base font-bold shadow-lg shadow-emerald-100 disabled:opacity-70 flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                        {!isLoading && <ArrowRight size={18} />}
                      </button>
                      <button onClick={() => setStep(1)} className="text-slate-400 font-bold hover:text-emerald-600 transition-colors text-xs">
                        Change Mobile Number
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="bg-emerald-500 py-3 text-center rounded-b-[40px]">
              <p className="text-white/80 text-[9px] uppercase font-black tracking-[0.3em]">Authenticity Verified by Swasthanand</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
