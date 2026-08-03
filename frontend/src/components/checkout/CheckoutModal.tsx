import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, MapPin, CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Loader2, Edit3, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare let Razorpay: any;

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.addresses.findIndex(a => a.isDefault) !== -1 ? user?.addresses.findIndex(a => a.isDefault) : 0
  );

  const [systemConfig, setSystemConfig] = useState<{ razorpayEnabled: boolean; activeProfile: string }>({
    razorpayEnabled: true,
    activeProfile: 'dev'
  });
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'COD'>('CARD');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const showPaymentError = (message: string) => {
    setPaymentError(message);
    setTimeout(() => setPaymentError(null), 8000);
  };

  React.useEffect(() => {
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
      fetchConfig();
    }
  }, [isOpen]);

  const [manualAddress, setManualAddress] = useState('Plot 42, Green Avenue, Kothrud, Pune, Maharashtra - 411038');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const selectedAddress = user?.addresses[selectedAddressIndex!] || null;
  const displayAddress = selectedAddress
    ? `${selectedAddress.village}, ${selectedAddress.district}, ${selectedAddress.state} - ${selectedAddress.pincode}`
    : manualAddress;

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRazorpayPayment = async () => {
    setIsLoading(true);

    // 15-second timeout for backend order creation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      // 1. Create order on backend to get Order ID
      const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      const order = await response.json();

      // 2. Open Razorpay Modal — loading spinner ends here, Razorpay handles the rest
      const options = {
        key: 'rzp_test_placeholder_id',
        amount: order.amount,
        currency: order.currency,
        name: "Swasthanand",
        description: "Pure & Authentic Marketplace",
        image: "/logo.png",
        order_id: order.id,
        handler: async (response: any) => {
          setIsLoading(true); // Re-enable while verifying
          // 3. Verify Signature on Backend
          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.status === 'success') {
            // 4. Create actual order in database
              await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user?.id,
                  user: { id: user?.id },
                  totalAmount: totalPrice,
                  status: 'PAID',
                  razorpayOrderId: response.razorpay_order_id,
                  items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price }))
                })
              });

            clearCart();
            setIsLoading(false);
            setStep(3);
          } else {
            alert('Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay modal without paying
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          contact: user?.phone
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
      setIsLoading(false); // Stop spinner once Razorpay modal is open
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Razorpay process failed:', err);
      setIsLoading(false);
      setPaymentMethod('COD');
      if (err.name === 'AbortError') {
        showPaymentError("Online payment is currently unavailable. We've switched you to Cash on Delivery — please place your order using that option.");
      } else {
        showPaymentError('Unable to connect to the payment gateway. Please use Cash on Delivery for now.');
      }
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!selectedAddress && !manualAddress) {
        alert('Please provide a delivery address');
        return;
      }
      setIsEditingAddress(false);
      setStep(2);
    }
    else if (step === 2) {
      if (paymentMethod === 'CARD') {
        handleRazorpayPayment();
      } else {
        // Cash on Delivery
        setIsLoading(true);
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
            clearCart();
            setIsLoading(false);
            setStep(3);
          } else {
            const msg = resData?.message || 'Failed to place order due to inventory restriction.';
            showPaymentError(msg);
            setIsLoading(false);
          }
        } catch (err: any) {
          console.error('Order creation failed:', err);
          setIsLoading(false);
          showPaymentError(err.message || 'Failed to place order.');
        }
      }
    }
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
                  <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Step {step} of 3</span>
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
                      className="w-full btn-premium py-6 rounded-[28px] text-xl font-bold shadow-2xl shadow-emerald-200"
                    >
                      Confirm Address & Payment
                      <ChevronRight size={22} className="ml-1" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                        <CreditCard size={36} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">Secure Payment</h3>
                    </div>

                    <div className="space-y-4">
                      {systemConfig.razorpayEnabled && (
                        <div
                          onClick={() => setPaymentMethod('CARD')}
                          className={`p-6 rounded-[28px] border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <div className="flex items-center gap-4">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Razorpay_logo.svg" alt="Razorpay" className="h-6" />
                            <span className="font-bold text-slate-800 text-lg">UPI / Credit Card / Wallet</span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-emerald-500 p-1' : 'border-slate-200'}`}>
                            {paymentMethod === 'CARD' && <div className="w-full h-full bg-emerald-500 rounded-full" />}
                          </div>
                        </div>
                      )}

                      <div
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-6 rounded-[28px] border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-800 text-lg">Cash on Delivery</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-emerald-500 p-1' : 'border-slate-200'}`}>
                          {paymentMethod === 'COD' && <div className="w-full h-full bg-emerald-500 rounded-full" />}
                        </div>
                      </div>
                    </div>

                    {/* Payment Error Banner — shown for 8 seconds on Razorpay failure */}
                    <AnimatePresence>
                      {paymentError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[24px] p-5 text-left"
                        >
                          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Payment Notice</p>
                            <p className="text-sm font-bold text-amber-800 leading-relaxed">{paymentError}</p>
                          </div>
                          <button onClick={() => setPaymentError(null)} className="ml-auto text-amber-400 hover:text-amber-600 transition-colors shrink-0">
                            <X size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4 space-y-4">
                      <button
                        onClick={handleNextStep}
                        disabled={isLoading}
                        className="w-full btn-premium py-6 rounded-[28px] text-xl font-bold shadow-2xl shadow-emerald-200 disabled:opacity-70 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={24} className="animate-spin mr-3" />
                            {paymentMethod === 'CARD' ? 'Contacting Razorpay Secure...' : 'Processing Order...'}
                          </>
                        ) : (
                          paymentMethod === 'CARD' ? `Pay ₹${totalPrice}` : 'Place Order (COD)'
                        )}
                      </button>
                      <p className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <ShieldCheck size={16} />
                        PCI DSS Secure Gateway
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
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
                        <span>#SW-93402-A</span>
                        <span className="text-emerald-600">₹{totalPrice}</span>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-5 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
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
