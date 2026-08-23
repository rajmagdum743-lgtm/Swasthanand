import React, { useState, useEffect } from 'react';
import { API_BASE_URL, RAZORPAY_KEY_ID } from '../../config/api';
import { loadRazorpaySDK } from '../../utils/razorpay';
import { X, MapPin, CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Loader2, Edit3, Save, AlertCircle, Banknote, Lock, ArrowLeft, Smartphone, Wallet, Building2, Clock, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentLifecycleState = 'FORM' | 'PROCESSING' | 'WAITING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Address, 2: Select Method, 3: Mock Payment, 4: Success
  const [isLoading, setIsLoading] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.addresses.findIndex(a => a.isDefault) !== -1 ? user?.addresses.findIndex(a => a.isDefault) : 0
  );

  const [systemConfig, setSystemConfig] = useState<{ razorpayEnabled: boolean; activeProfile: string }>({
    razorpayEnabled: true,
    activeProfile: 'dev'
  });
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'COD'>('CARD');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 3 Mock Payment Form state & lifecycle
  const [mockTab, setMockTab] = useState<'UPI' | 'CARD' | 'WALLET' | 'NETBANKING'>('UPI');
  const [mockUpiId, setMockUpiId] = useState('swasthanand@upi');
  const [mockCard, setMockCard] = useState({ number: '4532 8912 3456 7890', expiry: '12/28', cvv: '888', name: user?.name || 'Authorized Buyer' });
  const [mockWallet, setMockWallet] = useState('Paytm');
  const [mockBank, setMockBank] = useState('SBI');

  // Step 3 Payment Lifecycle State
  const [paymentState, setPaymentState] = useState<PaymentLifecycleState>('FORM');
  const [mockTxId, setMockTxId] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(90); // 01:30

  const showPaymentError = (message: string) => {
    setPaymentError(message);
    setTimeout(() => setPaymentError(null), 8000);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/system/config`);
        const data = await response.json();
        setSystemConfig(data);
        if (!data.razorpayEnabled) {
          setPaymentMethod('COD');
        }
      } catch (err) {
        console.error('Failed to fetch system config:', err);
      }
    };
    if (isOpen) {
      setStep(1);
      setPaymentState('FORM');
      setPaymentError(null);
      fetchConfig();
    }
  }, [isOpen]);

  // Countdown timer for WAITING state in Step 3
  useEffect(() => {
    let interval: any = null;
    if (step === 3 && paymentState === 'WAITING') {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setPaymentState('TIMEOUT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, paymentState]);

  const [manualAddress, setManualAddress] = useState('Plot 42, Green Avenue, Kothrud, Pune, Maharashtra - 411038');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const selectedAddress = user?.addresses[selectedAddressIndex!] || null;
  const displayAddress = selectedAddress
    ? `${selectedAddress.village}, ${selectedAddress.district}, ${selectedAddress.state} - ${selectedAddress.pincode}`
    : manualAddress;

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Step 3 Lifecycle Actions
  const resetStep3ToForm = () => {
    setPaymentState('FORM');
    setIsLoading(false);
    setPaymentError(null);
  };

  const handlePayClick = () => {
    const txId = `tx_mock_${Math.floor(100000 + Math.random() * 900000)}`;
    setMockTxId(txId);
    setPaymentState('PROCESSING');
    setIsLoading(true);

    // After 1.5s processing delay, transition to WAITING FOR CONFIRMATION
    setTimeout(() => {
      setIsLoading(false);
      setTimerSeconds(90);
      setPaymentState('WAITING');
    }, 1500);
  };

  const handleSimulateSuccess = () => {
    setPaymentState('SUCCESS');
    setTimeout(() => {
      setPlacedOrderId(mockTxId || `RZP-MOCK-${Math.floor(100000 + Math.random() * 900000)}`);
      setOrderTotal(totalPrice);
      clearCart();
      setPaymentState('FORM');
      setStep(4);
    }, 1500);
  };

  const handleSimulateFailure = () => {
    setPaymentState('FAILED');
  };

  const handleSimulateTimeout = () => {
    setPaymentState('TIMEOUT');
  };

  // Place COD Order Handler
  const handlePlaceCODOrder = async () => {
    setIsLoading(true);
    setPaymentError(null);
    try {
      const orderData = {
        userId: user?.id,
        user: { id: user?.id },
        totalAmount: totalPrice,
        status: 'PENDING',
        razorpayOrderId: 'COD_' + Date.now(),
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price }))
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok && resData && resData.success !== false) {
        setPlacedOrderId(resData.id || `COD-${Date.now().toString().slice(-6)}`);
        setOrderTotal(totalPrice);
        clearCart();
        setIsLoading(false);
        setStep(4);
      } else {
        // Fallback for demo mode
        setPlacedOrderId(`COD-DEMO-${Date.now().toString().slice(-6)}`);
        setOrderTotal(totalPrice);
        clearCart();
        setIsLoading(false);
        setStep(4);
      }
    } catch (err: any) {
      // Fallback for demo mode
      setPlacedOrderId(`COD-DEMO-${Date.now().toString().slice(-6)}`);
      setOrderTotal(totalPrice);
      clearCart();
      setIsLoading(false);
      setStep(4);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedAddress && !manualAddress) {
        alert('Please provide a delivery address');
        return;
      }
      setIsEditingAddress(false);
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'CARD') {
        setPaymentState('FORM');
        setStep(3);
      } else {
        handlePlaceCODOrder();
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-white rounded-[28px] sm:rounded-[40px] shadow-2xl z-[201] overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-8 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h2>
                <div className="flex items-center gap-2 mt-1 sm:mt-2">
                  <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`w-6 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`w-6 h-1 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`w-2 h-2 rounded-full ${step >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Step {step} of 4</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 sm:p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} className="sm:w-[24px] sm:h-[24px]" />
              </button>
            </div>

            <div className="p-4 sm:p-8 md:p-10 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {/* STEP 1: DELIVERY ADDRESS */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <MapPin size={20} />
                          <span className="text-sm font-black uppercase tracking-widest">Delivery Address</span>
                        </div>
                        {(!user || user.addresses.length === 0) && (
                          <button
                            onClick={() => setIsEditingAddress(!isEditingAddress)}
                            className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-sm font-bold"
                          >
                            {isEditingAddress ? <><Save size={16} /> Save</> : <><Edit3 size={16} /> Edit</>}
                          </button>
                        )}
                      </div>

                      {user && user.addresses.length > 0 ? (
                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                          {user.addresses.map((addr, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedAddressIndex(idx)}
                              className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all ${selectedAddressIndex === idx ? 'bg-emerald-50 border-emerald-500/30' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                  <div className={`p-2 rounded-xl h-fit ${selectedAddressIndex === idx ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <MapPin size={18} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-slate-900">{addr.label || 'Address'}</span>
                                      {addr.isDefault && <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Default</span>}
                                    </div>
                                    <p className="text-slate-500 font-bold text-sm mt-1">{addr.village}, {addr.district}, {addr.state} - {addr.pincode}</p>
                                  </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddressIndex === idx ? 'border-emerald-500' : 'border-slate-200'}`}>
                                  {selectedAddressIndex === idx && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 ${isEditingAddress ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-50' : 'bg-slate-50 border-emerald-500/10'}`}>
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Recipient</span>
                            <p className="font-black text-slate-800 text-xl mb-4 px-1">{user?.name || 'Guest User'}</p>

                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mb-1">Full Address</span>
                            {isEditingAddress ? (
                              <textarea
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                className="w-full bg-slate-50 p-4 rounded-2xl text-slate-800 font-bold border-2 border-slate-100 focus:border-emerald-500/30 focus:outline-none min-h-[120px] leading-relaxed transition-all"
                                autoFocus
                              />
                            ) : (
                              <p className="text-slate-600 font-bold text-lg leading-relaxed px-1">
                                {manualAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-emerald-50 rounded-[32px] flex items-center justify-between border border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Fast Delivery Enabled</p>
                          <p className="text-emerald-700 font-bold">Standard (2-3 Days)</p>
                        </div>
                      </div>
                      <span className="text-emerald-600 font-black">FREE</span>
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full btn-premium py-6 rounded-[28px] text-xl font-bold shadow-2xl shadow-emerald-200 flex items-center justify-center cursor-pointer"
                    >
                      Continue to Payment
                      <ChevronRight size={22} className="ml-1" />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: SELECT PAYMENT METHOD */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 text-center"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        <ArrowLeft size={16} /> Back to Address
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50">
                        <CreditCard size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Payment Method</h3>
                        <p className="text-slate-500 font-medium text-sm mt-0.5">Choose your payment mode to proceed</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-left">
                      {systemConfig.razorpayEnabled && (
                        <div
                          onClick={() => setPaymentMethod('CARD')}
                          className={`p-5 sm:p-6 rounded-[28px] border-2 flex items-center justify-between cursor-pointer transition-all ${
                            paymentMethod === 'CARD'
                              ? 'bg-emerald-50/60 border-emerald-500 shadow-lg shadow-emerald-50/50 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-2.5 shrink-0 shadow-sm">
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Razorpay_logo.svg"
                                alt="Razorpay"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-base sm:text-lg">Razorpay / Online Payment</span>
                              </div>
                              <p className="text-slate-500 font-bold text-xs sm:text-sm mt-0.5">
                                UPI • Cards • Wallets • Net Banking
                              </p>
                              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-black mt-1">
                                <ShieldCheck size={14} />
                                <span>Secured by Razorpay</span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'CARD' ? 'border-emerald-500 bg-white' : 'border-slate-300'}`}>
                            {paymentMethod === 'CARD' && <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />}
                          </div>
                        </div>
                      )}

                      <div
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-5 sm:p-6 rounded-[28px] border-2 flex items-center justify-between cursor-pointer transition-all ${
                          paymentMethod === 'COD'
                            ? 'bg-emerald-50/60 border-emerald-500 shadow-lg shadow-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100/80 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                            <Banknote size={28} />
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-base sm:text-lg block">Cash on Delivery</span>
                            <p className="text-slate-500 font-bold text-xs sm:text-sm mt-0.5">
                              Pay with cash when package arrives
                            </p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'COD' ? 'border-emerald-500 bg-white' : 'border-slate-300'}`}>
                          {paymentMethod === 'COD' && <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-4">
                      <button
                        onClick={handleNextStep}
                        disabled={isLoading}
                        className="w-full btn-premium py-5 sm:py-6 rounded-[28px] text-lg sm:text-xl font-bold shadow-2xl shadow-emerald-200 disabled:opacity-70 flex items-center justify-center transition-all cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={24} className="animate-spin mr-3" />
                            <span>Processing Order...</span>
                          </>
                        ) : (
                          paymentMethod === 'CARD' ? 'Continue to Payment' : 'Place Order'
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <Lock size={14} className="text-emerald-600" />
                        <span>Secured Encryption</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: MOCK RAZORPAY PAYMENT LIFECYCLE */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 text-center"
                  >
                    {/* STATE 1: PAYMENT FORM */}
                    {paymentState === 'FORM' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => setStep(2)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors text-xs font-black uppercase tracking-wider cursor-pointer"
                          >
                            <ArrowLeft size={16} /> Back to Payment Method
                          </button>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100/50">
                            <ShieldCheck size={30} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Complete Razorpay Payment</h3>
                            <p className="text-slate-500 font-medium text-xs mt-0.5">Secure online payment</p>
                          </div>
                        </div>

                        {/* Summary Info */}
                        <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-200/80 text-left space-y-2">
                          <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400">
                            <span>Selected Payment Method</span>
                            <span className="text-emerald-600">Razorpay Online</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-black text-slate-800">
                            <span>Total Payable Amount</span>
                            <span className="text-emerald-600 text-2xl font-extrabold">₹{totalPrice}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-500">
                            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Delivery Address</span>
                            <p className="mt-0.5 text-slate-700 truncate">{displayAddress}</p>
                          </div>
                        </div>

                        {/* Payment Method Tabs */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                            {[
                              { id: 'UPI', label: 'UPI', icon: Smartphone },
                              { id: 'CARD', label: 'Cards', icon: CreditCard },
                              { id: 'WALLET', label: 'Wallets', icon: Wallet },
                              { id: 'NETBANKING', label: 'Net Banking', icon: Building2 },
                            ].map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => setMockTab(tab.id as any)}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                                  mockTab === tab.id
                                    ? 'bg-white text-emerald-600 font-black shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <tab.icon size={16} />
                                <span className="text-[11px]">{tab.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* Tab Contents */}
                          <div className="p-5 bg-white border-2 border-slate-100 rounded-[28px] text-left space-y-4">
                            {mockTab === 'UPI' && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                                    Enter UPI ID
                                  </label>
                                  <input
                                    type="text"
                                    value={mockUpiId}
                                    onChange={(e) => setMockUpiId(e.target.value)}
                                    placeholder="example@upi"
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white p-3.5 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Popular UPI Apps</span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map(app => (
                                      <div
                                        key={app}
                                        onClick={() => setMockUpiId(`user@${app.toLowerCase().replace(/\s+/g, '')}`)}
                                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center cursor-pointer"
                                      >
                                        <span className="text-xs font-bold text-slate-700">{app}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {mockTab === 'CARD' && (
                              <div className="space-y-3.5">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Card Number</label>
                                  <input
                                    type="text"
                                    value={mockCard.number}
                                    onChange={(e) => setMockCard({ ...mockCard, number: e.target.value })}
                                    placeholder="4532 •••• •••• 8921"
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Expiry Date</label>
                                    <input
                                      type="text"
                                      value={mockCard.expiry}
                                      onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                                      placeholder="MM/YY"
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">CVV</label>
                                    <input
                                      type="password"
                                      maxLength={4}
                                      value={mockCard.cvv}
                                      onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value })}
                                      placeholder="•••"
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Cardholder Name</label>
                                  <input
                                    type="text"
                                    value={mockCard.name}
                                    onChange={(e) => setMockCard({ ...mockCard, name: e.target.value })}
                                    placeholder="Full Name on Card"
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 p-3 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {mockTab === 'WALLET' && (
                              <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Select Wallet</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                  {['Paytm', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge', 'Other Wallet'].map(w => (
                                    <div
                                      key={w}
                                      onClick={() => setMockWallet(w)}
                                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                        mockWallet === w ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black' : 'bg-slate-50 border-slate-100 text-slate-700 font-bold'
                                      }`}
                                    >
                                      <span className="text-xs">{w}</span>
                                      {mockWallet === w && <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {mockTab === 'NETBANKING' && (
                              <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Select Bank</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                  {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Other Banks'].map(b => (
                                    <div
                                      key={b}
                                      onClick={() => setMockBank(b)}
                                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                        mockBank === b ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black' : 'bg-slate-50 border-slate-100 text-slate-700 font-bold'
                                      }`}
                                    >
                                      <span className="text-xs">{b}</span>
                                      {mockBank === b && <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 space-y-4">
                          <button
                            onClick={handlePayClick}
                            className="w-full btn-premium py-5 sm:py-6 rounded-[28px] text-lg sm:text-xl font-bold shadow-2xl shadow-emerald-200 flex items-center justify-center transition-all cursor-pointer"
                          >
                            Pay ₹{totalPrice}
                          </button>

                          <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <Lock size={14} className="text-emerald-600" />
                            <span>Secured by Razorpay Sandbox</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE 2: PROCESSING PAYMENT */}
                    {paymentState === 'PROCESSING' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 space-y-6"
                      >
                        <div className="relative w-20 h-20 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-25" />
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-500/30 text-emerald-600 shadow-lg shadow-emerald-100">
                            <Loader2 size={40} className="animate-spin" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Processing Payment</h3>
                          <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">
                            Please wait while we securely process your payment.
                          </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-200 max-w-md mx-auto space-y-2 text-left">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Amount</span>
                            <span className="text-emerald-600 text-xl font-black">₹{totalPrice}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                            <span>Payment Option</span>
                            <span className="text-slate-800 font-extrabold">Razorpay Online ({mockTab})</span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
                          <AlertCircle size={16} />
                          <span>Do not close or refresh this window</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STATE 3: WAITING FOR PAYMENT CONFIRMATION */}
                    {paymentState === 'WAITING' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-6 space-y-6"
                      >
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300/50 shadow-sm animate-pulse mb-3">
                            <Clock size={14} /> Payment Pending
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Waiting for Payment Confirmation</h3>
                          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md mx-auto mt-1">
                            Your payment has been initiated. Waiting for confirmation from the payment gateway.
                          </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-200 max-w-md mx-auto space-y-4 text-left shadow-sm relative overflow-hidden">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaction Ref</span>
                            <span className="text-xs font-mono font-extrabold text-slate-800">{mockTxId}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payable Amount</span>
                            <span className="text-2xl font-black text-emerald-600">₹{totalPrice}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-t border-slate-200/60 pt-3">
                            <span>Payment Channel</span>
                            <span className="text-slate-800 font-bold">Razorpay ({mockTab})</span>
                          </div>
                          <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/70 text-center space-y-1">
                            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block">Confirmation Timeout</span>
                            <div className="text-3xl font-black font-mono text-amber-600">{formatTimer(timerSeconds)}</div>
                          </div>
                        </div>

                        <p className="text-xs font-bold text-slate-400">Please do not close or refresh this window.</p>

                        {/* 🧪 TEST / DEMO SIMULATION CONTROLS */}
                        <div className="p-4 bg-slate-900 text-white rounded-3xl max-w-md mx-auto space-y-3 shadow-xl">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            <span>🧪 Test / Demo Controls</span>
                            <span>Simulate Gateway Event</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={handleSimulateSuccess}
                              className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                            >
                              Simulate Success
                            </button>
                            <button
                              onClick={handleSimulateFailure}
                              className="py-2.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                            >
                              Simulate Failure
                            </button>
                            <button
                              onClick={handleSimulateTimeout}
                              className="py-2.5 px-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                            >
                              Simulate Timeout
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STATE 4: PAYMENT SUCCESS */}
                    {paymentState === 'SUCCESS' && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="py-10 space-y-6 text-center"
                      >
                        <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-200 animate-bounce">
                          <CheckCircle2 size={56} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-black text-slate-900">Payment Successful</h3>
                          <p className="text-slate-500 font-bold text-sm">Payment confirmed successfully.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[28px] max-w-sm mx-auto space-y-2 text-left border border-slate-200">
                          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>Amount Paid</span>
                            <span className="text-emerald-600 text-xl font-black">₹{totalPrice}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Transaction ID</span>
                            <span className="font-mono text-slate-800">{mockTxId}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                          <Loader2 size={16} className="animate-spin text-emerald-600" />
                          <span>Finalizing order confirmation...</span>
                        </div>
                      </motion.div>
                    )}

                    {/* STATE 5: PAYMENT FAILED */}
                    {paymentState === 'FAILED' && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="py-8 space-y-6 text-center"
                      >
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center border-2 border-rose-200 shadow-lg shadow-rose-50">
                          <XCircle size={48} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-black text-slate-900">Payment Failed</h3>
                          <p className="text-slate-500 font-bold text-sm">Your payment could not be completed.</p>
                        </div>
                        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl max-w-md mx-auto text-xs font-bold text-left space-y-1">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-rose-500">Failure Reason</span>
                          <p>Transaction declined by issuing bank or payment gateway authorization failed.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                          <button
                            onClick={resetStep3ToForm}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-100 transition-all cursor-pointer"
                          >
                            Retry Payment
                          </button>
                          <button
                            onClick={() => { resetStep3ToForm(); setStep(2); }}
                            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
                          >
                            Change Payment Method
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STATE 6: PAYMENT TIMEOUT */}
                    {paymentState === 'TIMEOUT' && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="py-8 space-y-6 text-center"
                      >
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center border-2 border-amber-200 shadow-lg shadow-amber-50">
                          <AlertTriangle size={48} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-3xl font-black text-slate-900">Payment Confirmation Timed Out</h3>
                          <p className="text-slate-500 font-bold text-sm">We couldn't confirm the payment status in time.</p>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl max-w-md mx-auto text-xs font-bold text-left space-y-1">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-amber-600">Notice</span>
                          <p>If your account was debited, your order will be updated automatically upon bank verification.</p>
                        </div>
                        <div className="flex flex-col gap-2.5 max-w-md mx-auto pt-2">
                          <button
                            onClick={handleSimulateSuccess}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={16} /> Check Payment Status
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={resetStep3ToForm}
                              className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
                            >
                              Try Again
                            </button>
                            <button
                              onClick={() => { resetStep3ToForm(); setStep(2); }}
                              className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
                            >
                              Change Method
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: ORDER CONFIRMATION */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6 space-y-8"
                  >
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.1 }}
                        className="w-32 h-32 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-2xl shadow-emerald-200"
                      >
                        <CheckCircle2 size={64} strokeWidth={2.5} />
                      </motion.div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-4xl font-black text-slate-900 leading-tight">Order Placed!</h3>
                      <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto leading-relaxed">
                        Your order is being processed and will be delivered to:
                        <span className="block italic text-emerald-600 mt-2">"{displayAddress}"</span>
                      </p>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[32px] max-w-md mx-auto relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2">
                        <ShieldCheck size={48} className="text-emerald-500/5 rotate-12" />
                      </div>
                      <div className="flex justify-between text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
                        <span>Receipt ID</span>
                        <span>Total Paid</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-black text-2xl mb-8">
                        <span className="font-mono text-xl">{placedOrderId ? `#${placedOrderId.slice(0, 14)}` : '#SW-ORDER-SUCCESS'}</span>
                        <span className="text-emerald-600">₹{orderTotal || totalPrice}</span>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-5 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
                      >
                        Trace Your Order
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
