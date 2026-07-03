import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, Plus, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, AlertTriangle, Trash2, Edit3, Check } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface Order {
  id: string;
  user: UserInfo;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'TRANSIT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  razorpayOrderId: string;
  createdAt: string;
  cancellationReason?: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING:   { color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200',   label: 'Pending' },
  PAID:      { color: 'text-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-200',    label: 'Paid' },
  CONFIRMED: { color: 'text-indigo-500', bg: 'bg-indigo-50',  border: 'border-indigo-200',  label: 'Confirmed' },
  TRANSIT:   { color: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-200',  label: 'In Transit' },
  SHIPPED:   { color: 'text-sky-500',    bg: 'bg-sky-50',     border: 'border-sky-200',     label: 'Shipped' },
  DELIVERED: { color: 'text-emerald-500',bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Delivered' },
  CANCELLED: { color: 'text-rose-500',   bg: 'bg-rose-50',    border: 'border-rose-200',    label: 'Cancelled' },
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals & Forms State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Manual Order Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    userId: '',
    totalAmount: '',
    status: 'PENDING',
    gatewayId: ''
  });

  // Manual Order Editing State
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editAmountValue, setEditAmountValue] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/orders`),
        fetch(`${API_BASE_URL}/api/admin/users`)
      ]);

      let rawOrders: any[] = [];
      let allUsers: UserInfo[] = [];

      if (ordersRes.ok) {
        rawOrders = await ordersRes.json();
      }
      if (usersRes.ok) {
        allUsers = await usersRes.json();
        setCustomers(allUsers.filter(u => u.role === 'CUSTOMER' || u.role === 'DEALER'));
      }

      // Map userId to full user object
      const mappedOrders = rawOrders.map((o: any) => {
        const matchingUser = allUsers.find(u => u.id === o.userId);
        return {
          ...o,
          user: matchingUser || { id: o.userId, name: 'Anonymous', phone: '', role: 'CUSTOMER' }
        };
      });

      mappedOrders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(mappedOrders);
    } catch (err) {
      console.error('Failed to fetch orders data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string, cancelReason?: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: cancelReason })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        const matchingUser = customers.find(u => u.id === updatedOrder.userId);
        const mappedUpdatedOrder = {
          ...updatedOrder,
          user: matchingUser || { id: updatedOrder.userId, name: 'Anonymous', phone: '', role: 'CUSTOMER' }
        };
        setOrders(prev => prev.map(o => o.id === orderId ? mappedUpdatedOrder : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(mappedUpdatedOrder);
        }
        setIsCancelModalOpen(false);
        setReason('');
        triggerNotification('Order status updated successfully');
      } else {
        triggerNotification('Failed to update status', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Error updating status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderData.userId) {
      alert('Please select a customer');
      return;
    }
    const amount = parseFloat(newOrderData.totalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setUpdatingId('create');
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: newOrderData.userId },
          totalAmount: amount,
          status: newOrderData.status,
          razorpayOrderId: newOrderData.gatewayId || `MANUAL_${Date.now()}`
        })
      });

      if (res.ok) {
        triggerNotification('Order created manually!');
        setIsCreateModalOpen(false);
        setNewOrderData({ userId: '', totalAmount: '', status: 'PENDING', gatewayId: '' });
        fetchData();
      } else {
        triggerNotification('Failed to create order', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Connection error', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditAmount = async () => {
    if (!selectedOrder) return;
    const amount = parseFloat(editAmountValue);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setUpdatingId(selectedOrder.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: amount
        })
      });

      if (res.ok) {
        const updated = await res.json();
        const matchingUser = customers.find(u => u.id === updated.userId);
        const mappedUpdated = {
          ...updated,
          user: matchingUser || { id: updated.userId, name: 'Anonymous', phone: '', role: 'CUSTOMER' }
        };
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? mappedUpdated : o));
        setSelectedOrder(mappedUpdated);
        setIsEditingAmount(false);
        triggerNotification('Order amount updated successfully');
      } else {
        triggerNotification('Failed to update order amount', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Connection error', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this order record? This cannot be undone.')) {
      setUpdatingId(orderId);
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          triggerNotification('Order record deleted successfully');
          setOrders(prev => prev.filter(o => o.id !== orderId));
          if (selectedOrder?.id === orderId) {
            setIsDetailOpen(false);
          }
        } else {
          triggerNotification('Failed to delete order record', 'error');
        }
      } catch (err) {
        console.error(err);
        triggerNotification('Connection error', 'error');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const openCancelDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsCancelModalOpen(true);
  };

  const filteredOrders = orders.filter(o => {
    const custName = o.user?.name || 'Unknown';
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || custName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">Transactional Operations</span>
          <h2 className="text-2xl font-black text-slate-800">Orders & Billing</h2>
          <p className="text-xs text-slate-500 font-medium">Monitor retail consumer purchases and wholesale dealer dispatch contracts</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-100/50 active:scale-95 transition-transform"
          >
            <Plus size={16} /> Create Manual Order
          </button>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order ID or client name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 pl-10 rounded-xl text-xs font-bold transition-all focus:outline-none"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:outline-none cursor-pointer text-slate-600"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="TRANSIT">In Transit</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <p className="text-xs text-slate-400 font-bold">Loading orders database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Client / Purchaser</th>
                  <th className="p-4">Channel Type</th>
                  <th className="p-4">Contract Date</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredOrders.map(o => {
                  const cfg = statusConfig[o.status] || statusConfig['PENDING'];
                  const roleStr = o.user?.role === 'DEALER' ? 'B2B Dealer' : 'Consumer';
                  const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-extrabold text-slate-800">{o.id.slice(0, 8)}...</td>
                      <td className="p-4 uppercase">{o.user?.name || 'Anonymous'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          o.user?.role === 'DEALER' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {roleStr}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{dateStr}</td>
                      <td className="p-4 text-right text-teal-600 font-black">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-center">
                        {updatingId === o.id ? (
                          <div className="flex justify-center"><Loader2 size={13} className="animate-spin text-teal-600" /></div>
                        ) : (
                          <select
                            value={o.status}
                            onChange={e => {
                              const nextStatus = e.target.value as any;
                              if (nextStatus === 'CANCELLED') {
                                openCancelDialog(o);
                              } else {
                                handleUpdateStatus(o.id, nextStatus);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-wider cursor-pointer outline-none ${cfg.bg} ${cfg.border} ${cfg.color}`}
                          >
                            <option value="PENDING" className="bg-white text-slate-700">Pending</option>
                            <option value="PAID" className="bg-white text-slate-700">Paid</option>
                            <option value="CONFIRMED" className="bg-white text-slate-700">Confirmed</option>
                            <option value="TRANSIT" className="bg-white text-slate-700">Transit</option>
                            <option value="SHIPPED" className="bg-white text-slate-700">Shipped</option>
                            <option value="DELIVERED" className="bg-white text-slate-700">Delivered</option>
                            <option value="CANCELLED" className="bg-white text-slate-700">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => { setSelectedOrder(o); setEditAmountValue(String(o.totalAmount)); setIsEditingAmount(false); setIsDetailOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all" 
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(o.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                            title="Delete record"
                            disabled={updatingId === o.id}
                          >
                            {updatingId === o.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <ShoppingBag size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold">No orders match the search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Order Creation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
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
                  <ShoppingBag className="text-teal-400" size={18} />
                  <h3 className="text-sm font-black uppercase tracking-wider">Create Manual Order</h3>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Select Client *</label>
                  <select 
                    required
                    value={newOrderData.userId}
                    onChange={e => setNewOrderData({ ...newOrderData, userId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none text-slate-700"
                  >
                    <option value="">-- Choose registered customer or dealer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (+91 {c.phone}) [{c.role}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Total Price (INR) *</label>
                    <input 
                      type="number"
                      required
                      value={newOrderData.totalAmount}
                      onChange={e => setNewOrderData({ ...newOrderData, totalAmount: e.target.value })}
                      placeholder="e.g. 2480"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Status *</label>
                    <select 
                      value={newOrderData.status}
                      onChange={e => setNewOrderData({ ...newOrderData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none text-slate-700"
                    >
                      <option value="PENDING">Pending (COD)</option>
                      <option value="PAID">Paid (Pre-paid)</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Reference Transaction / Gateway ID</label>
                  <input 
                    type="text" 
                    value={newOrderData.gatewayId}
                    onChange={e => setNewOrderData({ ...newOrderData, gatewayId: e.target.value })}
                    placeholder="e.g. COD_OFFLINE or rzp_test_..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={updatingId === 'create'}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                  >
                    {updatingId === 'create' ? <Loader2 className="animate-spin" size={14} /> : 'Save Manual Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="fixed inset-0 bg-slate-900 z-[150]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[151] overflow-hidden"
            >
              <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Order Ledger Details</h3>
                  <span className="text-[10px] text-teal-400 font-mono">{selectedOrder.id}</span>
                </div>
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Client info */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Customer Info</span>
                  <p className="text-sm font-black text-slate-800 uppercase">{selectedOrder.user?.name}</p>
                  <p className="text-xs font-bold text-slate-500">Phone: +91 {selectedOrder.user?.phone}</p>
                  <p className="text-xs font-bold text-slate-500">Channel: {selectedOrder.user?.role === 'DEALER' ? 'B2B Dealer Node' : 'Standard Consumer Retail'}</p>
                  {selectedOrder.razorpayOrderId && (
                    <p className="text-[10px] text-slate-400 font-mono mt-2">Gateway ID: {selectedOrder.razorpayOrderId}</p>
                  )}
                </div>

                {/* Status and Total amount with direct edit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Amount</span>
                    {isEditingAmount ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          value={editAmountValue}
                          onChange={e => setEditAmountValue(e.target.value)}
                          className="w-24 bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs font-bold outline-none"
                        />
                        <button 
                          onClick={handleEditAmount}
                          disabled={updatingId === selectedOrder.id}
                          className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          onClick={() => setIsEditingAmount(false)}
                          className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-teal-600">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                        <button 
                          onClick={() => { setEditAmountValue(String(selectedOrder.totalAmount)); setIsEditingAmount(true); }}
                          className="text-slate-400 hover:text-teal-600 p-1"
                          title="Edit order amount"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current State</span>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.border} ${statusConfig[selectedOrder.status]?.color
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {selectedOrder.cancellationReason && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold">
                    <span className="block text-[8px] font-black uppercase text-rose-500 tracking-wider mb-1">Reason for cancellation</span>
                    {selectedOrder.cancellationReason}
                  </div>
                )}

                {/* State modifiers */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Update Status Manually</span>
                  
                  {updatingId === selectedOrder.id ? (
                    <div className="flex items-center gap-2 p-2 justify-center text-slate-400 font-bold text-xs">
                      <Loader2 className="animate-spin text-teal-600" size={16} /> Updating status...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedOrder.status}
                        onChange={e => {
                          const nextStatus = e.target.value as any;
                          if (nextStatus === 'CANCELLED') {
                            openCancelDialog(selectedOrder);
                          } else {
                            handleUpdateStatus(selectedOrder.id, nextStatus);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none text-slate-700 cursor-pointer"
                      >
                        <option value="PENDING">Pending (COD)</option>
                        <option value="PAID">Paid (Pre-paid)</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="TRANSIT">In Transit</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancellation Dialog Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              className="fixed inset-0 bg-slate-900 z-[160]" 
              onClick={() => setIsCancelModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-3xl shadow-2xl z-[161] p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Cancel Order</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Please enter a reason for cancelling order {selectedOrder?.id?.slice(0, 8)}... This action cannot be undone.</p>
              
              <textarea 
                value={reason} 
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for cancellation (e.g. Out of stock, Customer request)"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white p-3 rounded-xl text-xs font-bold outline-none resize-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => {
                    if (selectedOrder) {
                      handleUpdateStatus(selectedOrder.id, 'CANCELLED', reason || 'Cancelled by Admin');
                    }
                  }}
                  disabled={!reason.trim()}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                >
                  Void Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminOrders;
