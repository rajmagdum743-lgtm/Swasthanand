import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { X, Users, ShoppingBag, LayoutDashboard, Search, Loader2, RefreshCw, CheckCircle, Truck, Package, Clock, MapPin, Phone, Mail, Plus, Edit2, Trash2, Image, AlertCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useProducts, type Product } from '../../context/ProductContext';

interface AdminDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'products'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    image: '',
    category: 'Grains',
    batchId: '',
    origin: '',
    description: '',
    harvestDate: '',
    weatherTemp: '',
    growthQuality: '',
    organicMatter: '',
    nitrogen: '',
    zeroPesticides: '',
    certificateUrl: ''
  });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<any[]>([]);
  const [isUserModalLoading, setIsUserModalLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', productForm.name || 'Product');

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setProductForm(prev => ({ ...prev, certificateUrl: data.url }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload certificate. Please check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    setIsUserModalLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`);
      const data = await response.json();
      setSelectedUserOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setIsUserModalLoading(false);
    }
  };

  const handleOpenProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: Number(product.price),
        image: product.image,
        category: product.category,
        batchId: product.batchId,
        origin: product.origin,
        description: product.description,
        harvestDate: product.harvestDate || '',
        weatherTemp: product.weatherTemp || '',
        growthQuality: product.growthQuality || '',
        organicMatter: product.organicMatter || '',
        nitrogen: product.nitrogen || '',
        zeroPesticides: product.zeroPesticides || '',
        certificateUrl: product.certificateUrl || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: 0,
        image: '',
        category: categories[1] || 'Grains',
        batchId: '',
        origin: '',
        description: '',
        harvestDate: '',
        weatherTemp: '',
        growthQuality: '',
        organicMatter: '',
        nitrogen: '',
        zeroPesticides: '',
        certificateUrl: ''
      });
    }
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, { ...productForm, price: Number(productForm.price) });
    } else {
      addProduct({ ...productForm, price: Number(productForm.price) });
    }
    setIsProductFormOpen(false);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'users' ? 'users' : 'orders';
      const response = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`);
      const data = await response.json();
      if (activeTab === 'users') setUsers(data);
      else setOrders(data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string, reason?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: reason || null })
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, cancellationReason: reason || null } : o));
        setConfirmingCancelId(null);
      } else {
        const errorText = await response.text();
        alert(`Failed to update order: ${errorText || response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Network error: Could not reach the server. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, activeTab]);

  if (!user || (user.role !== 'ADMIN' && user.phone !== '9284939947')) return null;

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.phone.includes(searchQuery)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[400]" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 bg-white rounded-[40px] shadow-2xl z-[401] overflow-hidden flex"
          >
            {/* Sidebar */}
            <div className="w-72 bg-slate-50 border-r p-8 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                  <LayoutDashboard size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Admin Console</h2>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Users size={20} />
                  <span>User Management</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ShoppingBag size={20} />
                  <span>Order Lifecycle</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Package size={20} />
                  <span>Product Catalog</span>
                </button>
              </div>

              <div className="mt-auto p-6 bg-emerald-50 rounded-[32px] border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">System Health</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-700 font-bold text-xs uppercase">Primary Node: Online</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Header */}
              <div className="p-8 border-b flex justify-between items-center">
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-100/50 rounded-2xl border-2 border-transparent focus:border-emerald-500/20 outline-none font-bold text-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={fetchData} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors">
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={onClose || (() => window.history.back())} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Table/List View */}
              <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'users' ? (
                  <div className="grid gap-4">
                    <div className="flex text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 pb-2 border-b">
                      <span className="w-12">Avatar</span>
                      <span className="flex-1">User Information</span>
                      <span className="flex-1 text-center">Primary Phone</span>
                      <span className="w-32 text-center">Location Trace</span>
                    </div>
                    {isLoading ? (
                      <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                    ) : filteredUsers.map((u, idx) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        key={u.id} className="p-4 bg-slate-50 hover:bg-white hover:shadow-lg transition-all rounded-3xl border border-transparent hover:border-slate-100 flex items-center group">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black">
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex-1 ml-4">
                          <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{u.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                        </div>
                        <div className="flex-1 text-center font-bold text-slate-600">
                          {u.phone}
                        </div>
                        <div className="w-32 text-center">
                          <button
                            onClick={() => { setSelectedUser(u); fetchUserOrders(u.id); }}
                            className="text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest"
                          >
                            View Profile
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : activeTab === 'orders' ? (
                  <div className="grid gap-4">
                    <div className="flex text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 pb-2 border-b">
                      <span className="w-16">Status</span>
                      <span className="flex-1">Order Details</span>
                      <span className="flex-1 text-center">Customer</span>
                      <span className="w-32 text-right">Total Amount</span>
                    </div>
                    {isLoading ? (
                      <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
                    ) : filteredOrders.map((o, idx) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        key={o.id} className="p-6 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-[32px] border border-transparent hover:border-slate-100 flex items-center gap-6 group">

                        <div className={`w-2 h-16 rounded-full shrink-0 ${o.status === 'DELIVERED' ? 'bg-emerald-500' :
                            o.status === 'CANCELLED' ? 'bg-red-500' :
                              o.status === 'TRANSIT' ? 'bg-blue-500' :
                                o.status === 'CONFIRMED' ? 'bg-indigo-500' :
                                  'bg-orange-400'
                          }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-black text-slate-800 uppercase tracking-tight truncate">Order #{o.id.substring(0, 8)}</p>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                                o.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                  'bg-slate-200 text-slate-600'
                              }`}>{o.status}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={12} />
                            {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="flex-1 hidden md:block">
                          <p className="font-black text-slate-800 text-sm uppercase">{o.user?.name || 'Unknown'}</p>
                          <p className="text-xs font-bold text-slate-400">{o.user?.phone}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black text-emerald-600 text-xl tracking-tight">₹{o.totalAmount}</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{o.razorpayOrderId?.startsWith('COD') ? 'Cash on Delivery' : 'Prepaid Online'}</p>
                        </div>

                        <div className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-6 group-hover:border-emerald-100 transition-colors">
                          {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                            <>
                              {o.status === 'PAID' || o.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')}
                                  className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm border border-slate-100"
                                  title="Confirm Order"
                                >
                                  <CheckCircle size={20} />
                                </button>
                              ) : null}

                              {o.status === 'CONFIRMED' ? (
                                <button
                                  onClick={() => handleUpdateStatus(o.id, 'TRANSIT')}
                                  className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm border border-slate-100"
                                  title="Mark as in Transit"
                                >
                                  <Truck size={20} />
                                </button>
                              ) : null}

                              {o.status === 'TRANSIT' ? (
                                <button
                                  onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                                  className="p-3 bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm border border-slate-100"
                                  title="Mark as Delivered"
                                >
                                  <Package size={20} />
                                </button>
                              ) : null}

                              {confirmingCancelId === o.id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-red-500 uppercase tracking-widest">Confirm?</span>
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, 'CANCELLED', 'Order cancelled due to product unavailability')}
                                    className="px-3 py-2 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all uppercase"
                                  >
                                    Yes, Cancel
                                  </button>
                                  <button
                                    onClick={() => setConfirmingCancelId(null)}
                                    className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-200 transition-all uppercase"
                                  >
                                    Keep
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmingCancelId(o.id)}
                                  className="p-3 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm border border-slate-100"
                                  title="Cancel Order"
                                >
                                  <X size={20} />
                                </button>
                              )}
                            </>
                          )}

                          {o.status === 'DELIVERED' && (
                            <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                              <CheckCircle size={24} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10">
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Product Catalog</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{products.length} Items listed in marketplace</p>
                      </div>
                      <button
                        onClick={() => handleOpenProductForm()}
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
                      >
                        <Plus size={20} />
                        Add New Product
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                      {products.filter(p =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((p, idx) => (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                          key={p.id} className="p-6 bg-slate-50 rounded-[40px] border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-2xl transition-all flex flex-col gap-6 group relative overflow-hidden"
                        >
                          <div className="w-full aspect-[4/3] rounded-[32px] overflow-hidden bg-slate-200">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                {p.category}
                              </span>
                              <div className="flex gap-2">
                                <button onClick={() => handleOpenProductForm(p)} className="p-3 bg-white text-slate-400 hover:text-emerald-600 rounded-2xl transition-all shadow-sm border border-slate-100">
                                  <Edit2 size={18} />
                                </button>
                                <button onClick={() => { if (window.confirm('Delete this product?')) deleteProduct(p.id) }} className="p-3 bg-white text-slate-400 hover:text-red-600 rounded-2xl transition-all shadow-sm border border-slate-100">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-black text-slate-800 text-xl uppercase tracking-tight mb-2 truncate">{p.name}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹{p.price}</p>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <MapPin size={14} className="text-slate-300" />
                                {p.origin.split(',')[0]}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200/50">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Batch ID</p>
                              <code className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{p.batchId}</code>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[500]" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[501] flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedUser.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedUser.role} Account</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-3 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* User Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                      <Phone size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mobile Number</span>
                    </div>
                    <p className="font-black text-slate-800 text-lg">{selectedUser.phone}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                      <Mail size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                    </div>
                    <p className="font-black text-slate-800 text-sm truncate">{selectedUser.email || 'No email provided'}</p>
                  </div>
                </div>

                {/* Saved Addresses */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Registered Addresses</h4>
                  <div className="grid gap-3">
                    {selectedUser.addresses?.length > 0 ? selectedUser.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-5 bg-white border-2 border-slate-100 rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{addr.label || 'Home'} {addr.isDefault && <span className="text-[10px] text-emerald-600 font-black ml-2">DEFAULT</span>}</p>
                          <p className="text-sm font-medium text-slate-500 mt-1">{addr.village}, {addr.district}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-400 font-bold italic px-1">No addresses saved by user.</p>
                    )}
                  </div>
                </div>

                {/* Order History */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Transaction History</h4>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black">{selectedUserOrders.length} Orders</span>
                  </div>

                  {isUserModalLoading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-600" /></div>
                  ) : selectedUserOrders.length > 0 ? (
                    <div className="grid gap-4">
                      {selectedUserOrders.map((o: any) => (
                        <div key={o.id} className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                              <p className="font-black text-slate-800">#SW-{o.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                                o.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                  'bg-slate-100 text-slate-600'
                              }`}>
                              {o.status}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(o.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><ShoppingBag size={14} /> ₹{o.totalAmount}</span>
                            </div>

                            {/* Action buttons same as main dashboard but smaller */}
                            <div className="flex gap-2">
                              {o.status === 'PAID' || o.status === 'PENDING' ? (
                                <button onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><CheckCircle size={16} /></button>
                              ) : null}
                              {o.status === 'CONFIRMED' ? (
                                <button onClick={() => handleUpdateStatus(o.id, 'TRANSIT')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Truck size={16} /></button>
                              ) : null}
                              {o.status === 'TRANSIT' ? (
                                <button onClick={() => handleUpdateStatus(o.id, 'DELIVERED')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Package size={16} /></button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">This user hasn't placed any orders yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isProductFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductFormOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-10 md:bottom-10 md:left-1/2 md:-translate-x-1/2 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl z-[601] flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{editingProduct ? `Updating ${editingProduct.name}` : 'Fill in the catalog details'}</p>
                  </div>
                </div>
                <button onClick={() => setIsProductFormOpen(false)} className="p-3 bg-white hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all rounded-2xl font-bold outline-none"
                      placeholder="e.g. Organic Honey" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input required type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all rounded-2xl font-bold outline-none"
                      placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all rounded-2xl font-bold outline-none appearance-none">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Picture URL</label>
                    <div className="relative">
                      <Image size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input required type="url" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all rounded-2xl font-bold outline-none"
                        placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Traceability & Origin</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch ID</label>
                      <input required type="text" value={productForm.batchId} onChange={e => setProductForm({ ...productForm, batchId: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="F-SATARA-2024-A" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Origin (Trace)</label>
                      <input required type="text" value={productForm.origin} onChange={e => setProductForm({ ...productForm, origin: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="Village, State" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harvest Date</label>
                      <input type="text" value={productForm.harvestDate} onChange={e => setProductForm({ ...productForm, harvestDate: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="e.g. Dec 14, 2024" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weather Temp</label>
                      <input type="text" value={productForm.weatherTemp} onChange={e => setProductForm({ ...productForm, weatherTemp: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="e.g. 24°C / Clear Sky" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Growth Quality</label>
                      <input type="text" value={productForm.growthQuality} onChange={e => setProductForm({ ...productForm, growthQuality: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="e.g. A+ Grade" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organic Matter</label>
                      <input type="text" value={productForm.organicMatter} onChange={e => setProductForm({ ...productForm, organicMatter: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="e.g. 4.2%" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nitrogen (N)</label>
                      <input type="text" value={productForm.nitrogen} onChange={e => setProductForm({ ...productForm, nitrogen: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="e.g. Optimal" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zero Pesticides</label>
                      <input type="text" value={productForm.zeroPesticides} onChange={e => setProductForm({ ...productForm, zeroPesticides: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400"
                        placeholder="e.g. Verified" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lab Certificate (PDF/Image)</label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <input type="file" accept=".pdf,image/*" onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-full px-5 py-3 bg-white border-2 border-dashed border-emerald-100 rounded-xl font-bold text-slate-400 flex items-center gap-3">
                          {isUploading ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Plus size={18} className="text-emerald-500" />}
                          <span>{productForm.certificateUrl ? 'Certificate Uploaded' : 'Click to upload lab report'}</span>
                        </div>
                      </div>
                      {productForm.certificateUrl && (
                        <a href={productForm.certificateUrl} target="_blank" rel="noreferrer"
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                          <Eye size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                    <textarea required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl font-bold outline-none focus:border-emerald-400 h-24 resize-none"
                      placeholder="Describe the purity and process..." />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsProductFormOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                    {editingProduct ? 'Update Product' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default AdminDashboard;
