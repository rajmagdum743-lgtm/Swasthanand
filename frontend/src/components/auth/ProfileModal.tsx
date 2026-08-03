import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, User as UserIcon, MapPin, Plus, Check, Trash2, Save, Loader2, Edit3, Clock, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Package, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'info' | 'addresses' | 'cart' | 'orders';
}

const OrderCard = ({ order, onViewInvoice }: { order: any; onViewInvoice: (order: any) => void }) => (
  <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all group">
    <div className="p-6 flex items-center justify-between border-b border-slate-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
          <Package size={24} />
        </div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</p>
          <p className="font-black text-slate-800">#SW-{order.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount</p>
        <p className="font-black text-emerald-600 text-lg">₹{order.totalAmount}</p>
      </div>
    </div>
    <div className="p-6 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-slate-400" />
        <span className="text-sm font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onViewInvoice(order)}
          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all border border-emerald-100"
        >
          View Receipt
        </button>
        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
          order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
            order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
              order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-600' :
                order.status === 'TRANSIT' ? 'bg-blue-100 text-blue-600' :
                  'bg-slate-100 text-slate-600'
          }`}>
          {order.status}
        </div>
      </div>
    </div>
    {order.status === 'CANCELLED' && order.cancellationReason && (
      <div className="px-6 pb-5 pt-1">
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <span className="text-red-400 mt-0.5 shrink-0">⚠️</span>
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Cancellation Notice</p>
            <p className="text-sm font-bold text-red-700">{order.cancellationReason}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);


const CartContent = ({ onCheckout }: { onCheckout: () => void }) => {
  const { cart, removeFromCart, totalItems, addToCart } = useCart();
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="text-center p-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
        <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6" strokeWidth={1} />
        <h3 className="text-xl font-black text-slate-900 mb-2">Your cart is empty</h3>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Add some pure goodness to it!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Cart Items ({totalItems})</h4>
      </div>
      <div className="grid gap-4">
        {cart.map((item) => (
          <div key={item.id} className="p-6 bg-slate-50 rounded-3xl flex items-center gap-6 group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <ShoppingBag size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-800 uppercase tracking-tight">{item.name}</h4>
              <p className="text-emerald-600 font-black">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-red-500 transition-colors"><Minus size={18} /></button>
              <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
              <button onClick={() => addToCart({ ...item })} className="p-1 hover:text-emerald-600 transition-colors"><Plus size={18} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Total Payable</p>
          <p className="text-3xl font-black text-slate-900">₹{totalPrice}</p>
        </div>
        <button onClick={onCheckout} className="btn-premium px-10 py-5 rounded-2xl shadow-xl shadow-emerald-200/50">
          Continue to Checkout <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'info' }) => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'cart' | 'orders'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const downloadHtmlReceipt = () => {
    if (!selectedInvoiceOrder) return;
    const order = selectedInvoiceOrder;
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const isCod = !order.razorpayOrderId || 
                  order.razorpayOrderId.toUpperCase().startsWith('COD') || 
                  order.razorpayOrderId.toUpperCase().includes('COD') || 
                  order.status === 'PENDING';
    const paymentMethodText = isCod ? 'Cash on Delivery (COD)' : 'Online Card/UPI';
    
    const refHtml = isCod ? `
        <div class="meta-row">
          <span>Payment Status:</span>
          <strong style="color: #d97706; font-weight: 800;">Pay on Delivery (COD)</strong>
        </div>` : (order.razorpayOrderId ? `
        <div class="meta-row">
          <span>Transaction Ref:</span>
          <strong style="color: #334155; font-family: monospace;">${order.razorpayOrderId}</strong>
        </div>` : '');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - INV-SW-${order.id.substring(0, 8).toUpperCase()}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; padding: 40px; color: #1e293b; }
    .receipt { max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: white; padding: 32px; display: flex; justify-content: space-between; align-items: center; }
    .header-logo { font-size: 20px; font-weight: 900; }
    .header-id { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .body { padding: 32px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
    .label { font-weight: 800; text-transform: uppercase; color: #94a3b8; font-size: 10px; margin-bottom: 4px; }
    .val { font-weight: 800; color: #1e293b; }
    .items { border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 24px 0; margin-bottom: 24px; }
    .item-desc { font-weight: 900; color: #1e293b; }
    .item-cat { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .summary { font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .total { font-size: 18px; font-weight: 900; color: #0f172a; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 16px; }
    .green { color: #10b981; }
    .meta { background: #f8fafc; padding: 16px; border-radius: 16px; font-size: 12px; color: #64748b; margin-bottom: 24px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.6; }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-weight: 900; text-transform: uppercase; font-size: 9px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div>
        <div class="header-logo">Swasthanand</div>
        <div class="header-id">INV-SW-${order.id.substring(0, 8).toUpperCase()}</div>
      </div>
    </div>
    <div class="body">
      <div class="row">
        <div>
          <div class="label">Billed To</div>
          <div class="val">${user?.name}</div>
          <div style="color: #64748b;">+91 ${user?.phone}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Date</div>
          <div class="val">${dateStr}</div>
          <div style="color: #64748b;">${timeStr}</div>
        </div>
      </div>
      <div class="items">
        <div class="row" style="margin-bottom: 0;">
          <div>
            <div class="item-desc">Swasthanand Organic Farm Batch Allocation</div>
            <div class="item-cat">Category: Premium Ayurvedic Marketplace</div>
          </div>
          <div class="val" style="font-size: 14px;">₹${order.totalAmount}</div>
        </div>
      </div>
      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span style="color: #1e293b;">₹${order.totalAmount}</span>
        </div>
        <div class="summary-row" style="font-size: 12px;">
          <span>Estimated Tax (GST 5%)</span>
          <span style="color: #1e293b;">Included</span>
        </div>
        <div class="summary-row">
          <span>Delivery Charges</span>
          <span class="green">FREE</span>
        </div>
        <div class="summary-row total">
          <span>Grand Total</span>
          <span class="green">₹${order.totalAmount}</span>
        </div>
      </div>
      <div class="meta">
        <div class="meta-row">
          <span>Payment Method:</span>
          <strong style="color: #1e293b;">${paymentMethodText}</strong>
        </div>
        ${refHtml}
      </div>
      <div class="footer">
        <span class="badge">🛡️ NABL Lab Certified Purity</span>
        <p>This is an electronically generated delivery note and invoice. Sourced direct from organic certified growers.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-SW-${order.id.substring(0, 8).toUpperCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const receiptEl = document.getElementById('swasthanand-receipt-modal-content');
    if (!receiptEl) return;
    const printDiv = document.createElement('div');
    printDiv.id = 'swasthanand-print-root';
    printDiv.innerHTML = receiptEl.innerHTML;
    document.body.appendChild(printDiv);
    window.print();
    document.body.removeChild(printDiv);
  };

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && user && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isOpen, user, activeTab]);

  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddressIdx, setEditingAddressIdx] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    pincode: '',
    state: '',
    district: '',
    village: '',
    landMark: '',
    isDefault: false
  });
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Synchronize modal state with latest user data from context
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
      setAddresses(user.addresses || []);
      setSuccess(false);
      setEditingAddressIdx(null);
      setShowAddAddress(false);
    }
  }, [isOpen, user]);

  const handleUpdateInfo = async () => {
    if (!user) return;
    setIsLoading(true);
    const success = await updateProfile({
      ...user,
      name: formData.name
    });
    setIsLoading(false);
    if (success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    let updatedAddresses;
    if (editingAddressIdx !== null) {
      updatedAddresses = addresses.map((addr, i) => i === editingAddressIdx ? { ...addr, ...newAddress } : addr);
    } else {
      updatedAddresses = [...addresses, { ...newAddress, isDefault: addresses.length === 0 }];
    }

    setIsLoading(true);
    const success = await updateProfile({
      ...user,
      addresses: updatedAddresses
    });
    setIsLoading(false);
    if (success) {
      setAddresses(updatedAddresses);
      setShowAddAddress(false);
      setEditingAddressIdx(null);
      setNewAddress({ label: '', pincode: '', state: '', district: '', village: '', landMark: '', isDefault: false });
    }
  };

  const startEditing = (idx: number) => {
    const addr = addresses[idx];
    setNewAddress({ ...addr });
    setEditingAddressIdx(idx);
    setShowAddAddress(true);
  };

  const handleDeleteAddress = async (index: number) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    const updatedAddresses = addresses.filter((_, i) => i !== index);
    const success = await updateProfile({
      ...user,
      addresses: updatedAddresses
    });
    if (success) setAddresses(updatedAddresses);
  };

  const handleSetDefault = async (index: number) => {
    if (!user) return;
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }));
    const success = await updateProfile({
      ...user,
      addresses: updatedAddresses
    });
    if (success) setAddresses(updatedAddresses);
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300]" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl z-[301] overflow-hidden"
          >
            <div className="flex flex-col h-[85vh] sm:h-[80vh]">
              {/* Header */}
              <div className="p-4 sm:p-8 border-b flex justify-between items-center bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                    <UserIcon size={20} className="sm:w-[24px] sm:h-[24px]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Profile</h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest">+91 {user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {(user.role === 'ADMIN' || user.phone === '9284939947') && (
                    <button 
                      onClick={() => {
                        onClose();
                        navigate('/admin');
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow-lg shadow-emerald-200"
                    >
                      <ShieldCheck size={16} />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Admin</span>
                    </button>
                  )}
                  <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X size={20} className="sm:w-[24px] sm:h-[24px]" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto scrollbar-none px-2 sm:px-8 border-b shrink-0 whitespace-nowrap">
                <button onClick={() => setActiveTab('info')} className={`py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'info' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  Basic Info
                  {activeTab === 'info' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
                <button onClick={() => setActiveTab('addresses')} className={`py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'addresses' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  Manage Addresses
                  {activeTab === 'addresses' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
                <button onClick={() => setActiveTab('cart')} className={`py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'cart' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  My Cart
                  {activeTab === 'cart' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
                <button onClick={() => setActiveTab('orders')} className={`py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'orders' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  My Orders
                  {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                {activeTab === 'info' ? (
                  <div className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl font-bold text-lg outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Phone (Primary)</label>
                      <input type="text" value={formData.phone} disabled
                        className="w-full p-4 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-lg text-slate-400 cursor-not-allowed" />
                    </div>
                    <button onClick={handleUpdateInfo} disabled={isLoading} className="btn-premium px-10 py-4 rounded-2xl flex items-center gap-2">
                      {isLoading ? <Loader2 size={20} className="animate-spin" /> : success ? <Check size={20} /> : <Save size={20} />}
                      {success ? 'Updated!' : 'Save Changes'}
                    </button>
                  </div>
                ) : activeTab === 'addresses' ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-slate-900">Saved Addresses</h3>
                      {!showAddAddress && (
                        <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-2 text-emerald-600 font-bold hover:bg-emerald-50 p-2 px-4 rounded-xl transition-colors">
                          <Plus size={20} /> Add New
                        </button>
                      )}
                    </div>

                    {showAddAddress ? (
                      <div className="p-6 border-2 border-emerald-500/10 rounded-3xl bg-emerald-50/20 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">
                            {editingAddressIdx !== null ? 'Edit Address' : 'New Address'}
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Label (e.g. Work)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                            className="bg-white p-3 rounded-xl border font-bold" />
                          <input type="text" placeholder="PIN Code" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="bg-white p-3 rounded-xl border font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Village" value={newAddress.village} onChange={e => setNewAddress({ ...newAddress, village: e.target.value })}
                            className="bg-white p-3 rounded-xl border font-bold" />
                          <input type="text" placeholder="Landmark" value={newAddress.landMark} onChange={e => setNewAddress({ ...newAddress, landMark: e.target.value })}
                            className="bg-white p-3 rounded-xl border font-bold" />
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleSaveAddress} className="btn-premium py-2 px-6 rounded-xl text-sm font-bold">
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Address'}
                          </button>
                          <button onClick={() => { setShowAddAddress(false); setEditingAddressIdx(null); }} className="text-slate-400 font-bold text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {addresses.map((addr, idx) => (
                          <div key={idx} className={`p-6 rounded-3xl border-2 transition-all ${addr.isDefault ? 'border-emerald-500/30 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/50'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3 items-start">
                                <div className={`p-2 rounded-xl ${addr.isDefault ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                  <MapPin size={20} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-slate-900">{addr.label || 'Home'}</span>
                                    {addr.isDefault && <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Default</span>}
                                  </div>
                                  <p className="text-slate-500 text-sm font-medium">{addr.village}, {addr.district}, {addr.state} - {addr.pincode}</p>
                                  {addr.landMark && <p className="text-slate-400 text-xs font-bold mt-1">Ref: {addr.landMark}</p>}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => startEditing(idx)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-full transition-colors" title="Edit">
                                  <Edit3 size={18} />
                                </button>
                                {!addr.isDefault && (
                                  <button onClick={() => handleSetDefault(idx)} className="p-2 text-emerald-600 hover:bg-white rounded-full transition-colors" title="Set as default">
                                    <Check size={18} />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteAddress(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-full transition-colors" title="Delete">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : activeTab === 'cart' ? (
                  <CartContent onCheckout={onClose} />
                ) : (
                  <div className="space-y-10">
                    {/* Sort orders newest first */}
                    {(() => {
                      const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      const activeOrders = sorted.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
                      const historyOrders = sorted.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');
                      return (
                        <>
                          {/* Ordered Section */}
                          <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Ordered</h3>
                              <button onClick={fetchOrders} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                                <Clock size={20} />
                              </button>
                            </div>

                            {isLoading ? (
                              <div className="flex flex-col items-center justify-center p-12 gap-4">
                                <Loader2 size={40} className="animate-spin text-emerald-600" />
                              </div>
                            ) : activeOrders.length === 0 ? (
                              <div className="text-center p-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-bold italic text-sm">No active orders.</p>
                              </div>
                            ) : (
                              <div className="grid gap-6">
                                {activeOrders.map((order, idx) => (
                                  <OrderCard key={idx} order={order} onViewInvoice={(o) => setSelectedInvoiceOrder(o)} />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Order History Section (Delivered + Cancelled) */}
                          <div className="pt-8 border-t border-slate-100 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Order History</h3>
                              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">{historyOrders.length} Orders</span>
                            </div>

                            {isLoading ? (
                              null
                            ) : historyOrders.length === 0 ? (
                              <div className="text-center p-8 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-bold italic text-sm">No completed orders yet.</p>
                              </div>
                            ) : (
                              <div className="grid gap-4 opacity-75 grayscale-[0.5]">
                                {historyOrders.map((order, idx) => (
                                  <OrderCard key={idx} order={order} onViewInvoice={(o) => setSelectedInvoiceOrder(o)} />
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
      <AnimatePresence>
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
            <motion.div
              id="swasthanand-receipt-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[36px] w-full max-w-lg overflow-hidden shadow-2xl relative print-receipt-container print:fixed print:inset-0 print:w-full print:max-w-none print:shadow-none"
            >
              {/* Receipt Header */}
              <div className="p-8 bg-slate-900 text-white flex justify-between items-start print:bg-white print:text-black">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white print:border print:border-black">
                      <span className="font-black text-sm">S</span>
                    </div>
                    <span className="text-lg font-black tracking-tight">Swasthanand</span>
                  </div>
                  <p className="text-xs text-slate-400 print:text-slate-500 font-bold">INV-SW-{selectedInvoiceOrder.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-1 print:hidden">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                    title="Print Receipt / Save PDF"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={downloadHtmlReceipt}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                    title="Download Receipt File"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-8 space-y-6 text-slate-800 print:p-0">
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="font-black uppercase tracking-wider text-slate-400 mb-1">Billed To</p>
                    <p className="font-extrabold text-sm text-slate-800">{user.name}</p>
                    <p className="font-bold text-slate-500">+91 {user.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black uppercase tracking-wider text-slate-400 mb-1">Date</p>
                    <p className="font-bold text-sm text-slate-800">{new Date(selectedInvoiceOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="font-bold text-slate-500">{new Date(selectedInvoiceOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-t border-b border-slate-100 py-6 space-y-4">
                  <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>Description</span>
                    <span>Total Price</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800">Swasthanand Organic Farm Batch Allocation</span>
                      <span className="text-xs text-slate-400 font-semibold mt-0.5">Category: Premium Ayurvedic Marketplace</span>
                    </div>
                    <span className="font-black text-slate-900">₹{selectedInvoiceOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2 text-sm font-bold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800">₹{selectedInvoiceOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Estimated Tax (GST 5%)</span>
                    <span className="text-slate-800">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span className="text-emerald-600">₹{selectedInvoiceOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1 font-semibold text-slate-500">
                  {(() => {
                    const isCod = !selectedInvoiceOrder.razorpayOrderId || 
                                  selectedInvoiceOrder.razorpayOrderId.toUpperCase().startsWith('COD') || 
                                  selectedInvoiceOrder.razorpayOrderId.toUpperCase().includes('COD') || 
                                  selectedInvoiceOrder.status === 'PENDING';
                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-bold text-slate-800">
                            {isCod ? 'Cash on Delivery (COD)' : 'Online Card/UPI'}
                          </span>
                        </div>
                        {isCod ? (
                          <div className="flex justify-between">
                            <span>Payment Status:</span>
                            <span className="font-mono font-bold text-amber-600">Pay on Delivery</span>
                          </div>
                        ) : (
                          selectedInvoiceOrder.razorpayOrderId && (
                            <div className="flex justify-between">
                              <span>Transaction Ref:</span>
                              <span className="font-mono font-bold text-slate-700">{selectedInvoiceOrder.razorpayOrderId}</span>
                            </div>
                          )
                        )}
                      </>
                    );
                  })()}
                  {selectedInvoiceOrder.dealershipNodeId && (
                    <div className="flex justify-between">
                      <span>Distribution Node:</span>
                      <span className="font-bold text-slate-800">{selectedInvoiceOrder.dealershipNodeId}</span>
                    </div>
                  )}
                </div>

                {/* Seal / Footer */}
                <div className="text-center pt-2 space-y-4 print:pt-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    🛡️ NABL Lab Certified Purity
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-xs mx-auto">
                    This is an electronically generated delivery note and invoice. Sourced direct from organic certified growers.
                  </p>
                </div>
              </div>

              {/* Action Print Button */}
              <div className="p-6 bg-slate-50 border-t flex justify-end print:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ProfileModal;
