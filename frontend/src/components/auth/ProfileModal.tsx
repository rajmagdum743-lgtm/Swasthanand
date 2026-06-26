import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, User as UserIcon, MapPin, Plus, Check, Trash2, Save, Loader2, Edit3, Clock } from 'lucide-react';
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

const OrderCard = ({ order }: { order: any }) => (
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
    <div className="p-6 bg-slate-50/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-slate-400" />
        <span className="text-sm font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>
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

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
      const data = await response.json();
      setOrders(data || []);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl z-[301] overflow-hidden"
          >
            <div className="flex flex-col h-[80vh]">
              {/* Header */}
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Profile</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(user.role === 'ADMIN' || user.phone === '9284939947') && (
                    <button 
                      onClick={() => {
                        onClose();
                        navigate('/admin');
                      }}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-200"
                    >
                      <ShieldCheck size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">Admin</span>
                    </button>
                  )}
                  <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex px-8 border-b">
                <button onClick={() => setActiveTab('info')} className={`py-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'info' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  Basic Info
                  {activeTab === 'info' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
                <button onClick={() => setActiveTab('addresses')} className={`py-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'addresses' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  Manage Addresses
                  {activeTab === 'addresses' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
                <button onClick={() => setActiveTab('cart')} className={`py-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'cart' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  My Cart
                  {activeTab === 'cart' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
                <button onClick={() => setActiveTab('orders')} className={`py-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'orders' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  My Orders
                  {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
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
                                  <OrderCard key={idx} order={order} />
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
                                  <OrderCard key={idx} order={order} />
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
    </AnimatePresence>
  );
};

export default ProfileModal;
