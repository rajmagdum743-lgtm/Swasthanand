import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, ShoppingCart, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { motion } from 'framer-motion';

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
  addresses: Address[];
}

interface Order {
  id: string;
  user: { id: string };
  totalAmount: number;
  status: string;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`),
        fetch(`${API_BASE_URL}/api/admin/orders`)
      ]);
      
      let customerList: User[] = [];
      if (usersRes.ok) {
        const allUsers: User[] = await usersRes.json();
        customerList = allUsers.filter(u => u.role === 'CUSTOMER');
      }

      let orderList: Order[] = [];
      if (ordersRes.ok) {
        orderList = await ordersRes.json();
      }

      setCustomers(customerList);
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to load customers analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCustomerAnalytics = (customerId: string) => {
    const customerOrders = orders.filter(o => o.user?.id === customerId);
    const completedOrders = customerOrders.filter(o => o.status !== 'CANCELLED');
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      count: customerOrders.length,
      spent: totalSpent
    };
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">User Accounts</span>
        <h2 className="text-2xl font-black text-slate-800">Customer Base</h2>
        <p className="text-xs text-slate-500 font-medium">View consumer details, loyalty metrics, and transaction counts</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white p-3 pl-10 rounded-xl text-xs font-bold transition-all focus:outline-none"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <p className="text-xs text-slate-400 font-bold">Querying user registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Orders</th>
                  <th className="p-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredCustomers.map(c => {
                  const defaultAddr = c.addresses?.find(a => a.isDefault) || c.addresses?.[0];
                  const analytics = getCustomerAnalytics(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold text-slate-800 uppercase">{c.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{c.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <Phone size={11} />
                          <span>+91 {c.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {defaultAddr ? `${defaultAddr.village}, ${defaultAddr.district}, ${defaultAddr.state}` : 'Maharashtra, India'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200/50">
                          <ShoppingCart size={10} /> {analytics.count}
                        </span>
                      </td>
                      <td className="p-4 text-right text-teal-600 font-black">
                        ₹{analytics.spent.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <Users size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold">No retail customers registered in database.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminCustomers;
