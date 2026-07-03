import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClipboardList, TrendingUp, Download, Eye, Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';

const DealerReports: React.FC = () => {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [salesTimeframe, setSalesTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const reports = [
    { title: 'Warehouse Stock Audit Report', date: 'June 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'Cold-chain Temperature Logs', date: 'May 2026', size: '8.1 MB', type: 'CSV' },
    { title: 'B2B Dispatch & Delivery Report', date: 'Q2 2026 Summary', size: '1.8 MB', type: 'PDF' }
  ];

  // Sales data charts config
  const salesData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [12000, 18500, 15000, 22000, 29000, 34000, 18000],
      total: '₹1,48,500'
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [120000, 145000, 98000, 185000],
      total: '₹5,48,000'
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [480000, 520000, 610000, 580000, 710000, 640000],
      total: '₹35,40,000'
    }
  };

  const topSellers = [
    { name: 'Organic Moringa Powder', share: 45, sales: '₹2,46,600', color: 'bg-emerald-500' },
    { name: 'Organic Wild Honey', share: 30, sales: '₹1,64,400', color: 'bg-teal-500' },
    { name: 'Traditional Organic Ghee', share: 15, sales: '₹82,200', color: 'bg-amber-500' },
    { name: 'Organic Turmeric Powder', share: 10, sales: '₹54,800', color: 'bg-blue-500' }
  ];

  const lowStockReport = [
    { name: 'Organic Wild Honey', stock: 4, limit: 15 },
    { name: 'Organic Turmeric Powder', stock: 12, limit: 15 },
    { name: 'Amla Candy (Sweet)', stock: 2, limit: 10 }
  ];

  const currentSales = salesData[salesTimeframe];
  const maxVal = Math.max(...currentSales.values);

  const cardClass = isDarkMode 
    ? 'bg-[#0c1410] border border-white/5 text-white' 
    : 'bg-white border border-slate-200 text-slate-800 shadow-sm';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={14} className="text-emerald-500" />
            <span className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Sales & Inventory Analytics
            </span>
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Warehouse Reports</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">View simple sales charts, check low-stock metrics, and export data.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer">
          <Download size={13} /> Export All Reports
        </button>
      </div>

      {/* Main Reports Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales Chart (2 cols) */}
        <div className={`p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between ${cardClass}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5 mb-4 bg-slate-50/50 dark:bg-white/[0.01]">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-500" /> B2B Wholesale Revenue
              </h3>
              <p className="text-[9px] text-slate-400 font-bold">Total Sales for current selection: <span className="text-emerald-500">{currentSales.total}</span></p>
            </div>
            
            {/* Timeframe selector tabs */}
            <div className={`flex gap-1 p-0.5 border rounded-xl ${isDarkMode ? 'border-white/10 bg-white/2' : 'border-slate-200 bg-slate-50'}`}>
              {(['daily', 'weekly', 'monthly'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSalesTimeframe(tab)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    salesTimeframe === tab 
                      ? 'text-emerald-700 bg-emerald-50 dark:text-white dark:bg-emerald-500/10' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2.5 pt-6 pb-2 px-2 relative border-b border-slate-100 dark:border-white/5">
            {currentSales.values.map((val, idx) => {
              const heightPct = (val / maxVal) * 80; // keep max at 80% to avoid clipping
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ₹{val.toLocaleString('en-IN')}
                  </div>
                  
                  {/* Visual Bar */}
                  <div 
                    className="w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-400 shadow-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                  
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-2 truncate max-w-full">
                    {currentSales.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between ${cardClass}`}>
          <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-500" /> Top Selling Products
            </h3>
            <p className="text-[9px] text-slate-400 font-bold">Best performing items by revenue share</p>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {topSellers.map((seller, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="truncate pr-2">{seller.name}</span>
                  <span className="text-slate-400 shrink-0 font-mono text-[10px]">{seller.sales} ({seller.share}%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${seller.color}`} 
                    style={{ width: `${seller.share}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock Audit Report */}
        <div className={`p-5 rounded-2xl ${cardClass}`}>
          <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-rose-500">
              <AlertCircle size={14} /> Low Stock Audit
            </h3>
            <p className="text-[9px] text-slate-400 font-bold">Items requiring immediate warehouse replenishment</p>
          </div>

          <div className="space-y-3 font-bold text-xs">
            {lowStockReport.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-rose-500/10 bg-rose-500/5">
                <span className="truncate pr-2">{item.name}</span>
                <span className="text-rose-500 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded border border-rose-500/25 shrink-0">
                  {item.stock} / {item.limit} units left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Downloadable Archives list (2 cols) */}
        <div className={`p-5 rounded-2xl lg:col-span-2 ${cardClass}`}>
          <div className="pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Package size={14} className="text-emerald-500" /> Exportable Audit Documents
            </h3>
            <p className="text-[9px] text-slate-400 font-bold">Archived records and legal agricultural certificates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map((r, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 hover:border-emerald-500/20 transition-colors ${
                  isDarkMode ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 inline-block mb-2">
                    {r.type}
                  </span>
                  <h4 className="font-black text-xs leading-snug truncate-2-lines">{r.title}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1.5">
                    <Calendar size={10} />
                    <span>Issued: {r.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-400">
                  <span>{r.size}</span>
                  <div className="flex gap-1">
                    <button className="p-1 text-slate-400 hover:text-emerald-500 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"><Eye size={12} /></button>
                    <button className="p-1 text-slate-400 hover:text-emerald-500 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"><Download size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DealerReports;
