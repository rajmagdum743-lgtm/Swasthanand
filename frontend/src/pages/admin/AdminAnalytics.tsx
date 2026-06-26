import React from 'react';
import { TrendingUp, BarChart3, PieChart, ArrowUpRight, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAnalytics: React.FC = () => {
  const kpis = [
    { title: 'Gross Profit Margin', val: '68.4%', icon: Percent, change: '+2.4% vs last Q', color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { title: 'Avg Order Value', val: '₹3,450', icon: DollarSign, change: '+12% vs last month', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { title: 'Churn Rate', val: '1.2%', icon: TrendingUp, change: '-0.4% improvement', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">Performance Intelligence</span>
        <h2 className="text-2xl font-black text-slate-800">Analytics Insights</h2>
        <p className="text-xs text-slate-500 font-medium">Evaluate business expansion, checkout conversions, and wholesale demand velocity</p>
      </div>

      {/* Analytics KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">{kpi.val}</h3>
                <span className="text-[10px] font-bold text-emerald-600">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Region */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 size={15} className="text-teal-600" /> Regional Sales Velocity
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">B2B demand statistics by geographical zones</p>
          </div>
          <div className="space-y-3">
            {[
              { region: 'Pune Zone', amount: '₹840,000', pct: 42 },
              { region: 'Mumbai Metro', amount: '₹620,000', pct: 31 },
              { region: 'Satara District', amount: '₹340,000', pct: 17 },
              { region: 'Sangli Region', amount: '₹200,000', pct: 10 }
            ].map((r, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{r.region}</span>
                  <span className="text-teal-600 font-black">{r.amount} ({r.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ delay: i * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <PieChart size={15} className="text-teal-600" /> Platform Conversion Funnel
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Customer actions from viewing items to checkout confirmation</p>
          </div>
          <div className="space-y-3">
            {[
              { stage: 'Product Page Views', count: '14,205 visits', pct: 100 },
              { stage: 'Add to Cart Actions', count: '2,840 items', pct: 20 },
              { stage: 'Checkout Screen Entered', count: '1,420 sessions', pct: 10 },
              { stage: 'Completed Purchases', count: '852 transactions', pct: 6 }
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{s.stage}</span>
                  <span className="text-slate-400 font-medium">{s.count} ({s.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ delay: i * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAnalytics;
