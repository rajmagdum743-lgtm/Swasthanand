import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Leaf, Droplets, Truck, WifiOff, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import SwasthAdviser from '../home/SwasthAdviser';
import { useProducts } from '../../context/ProductContext';

const FEATURE_DATA: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShieldCheck, title: 'Certified Origin', desc: 'Every batch is verified and certified by local agronomists.' },
  { icon: Leaf, title: 'Purely Organic', desc: 'Grown without synthetic pesticides or chemical fertilizers.' },
  { icon: Droplets, title: 'Water-Conscious', desc: 'Our farmers use drip irrigation to save up to 40% more water.' },
  { icon: Truck, title: 'Farm-to-Door', desc: 'Directly sourced from farms, shortening the supply chain.' }
];

interface HomePageProps {
  products: any[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  handleTraceOpen: (product: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  products, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  handleTraceOpen 
}) => {
  const navigate = useNavigate();
  const [highlightedProductId, setHighlightedProductId] = React.useState<string | null>(null);
  const { isOffline, lastSynced, refreshProducts } = useProducts();

  const handleProductSelect = (productId: string) => {
    console.log('Selecting product:', productId);
    setSelectedCategory('All');
    setHighlightedProductId(productId);
    
    let attempts = 0;
    const scrollInterval = setInterval(() => {
      const element = document.getElementById(`product-${productId}`);
      attempts++;
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        clearInterval(scrollInterval);
      } else if (attempts >= 10) {
        console.warn('Product element not found after multiple attempts, falling back to section scroll');
        document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' });
        clearInterval(scrollInterval);
      }
    }, 100);

    setTimeout(() => setHighlightedProductId(null), 5000);
  };

  const handleTraceDemo = (name: string) => {
    const p = products.find(prod => prod.name.toLowerCase().includes(name.toLowerCase()));
    if (p) {
      handleTraceOpen(p);
    } else if (products.length > 0) {
      handleTraceOpen(products[0]);
    }
  };

  const filteredProducts = Array.isArray(products)
    ? (selectedCategory === 'All' 
        ? products 
        : products.filter(p => p.category === selectedCategory))
    : [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8"
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-extrabold tracking-widest uppercase shadow-sm border border-emerald-200/50">
              Freshly Harvested from the Heartland
            </span>
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-slate-900 leading-[1.1]">
              Experience Purity, <br/>
              <span className="gradient-text tracking-tighter">Trace the Origin.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
              Swasthanand connects you directly with local organic farmers. Tap "Trace Origin" on any food item to view its harvesting date, laboratory soil parameters, and local weather charts.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-premium px-10 py-5 text-lg shadow-2xl shadow-emerald-200"
              >
                Explore Marketplace
              </button>
              <button 
                onClick={() => navigate('/how-it-works')}
                className="px-10 py-5 text-lg font-bold border-2 border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-all text-slate-700 bg-white shadow-sm"
              >
                How It Works
              </button>
            </div>
          </motion.div>

          {/* Right Column: Premium Quick Audit card for customers */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 bg-white border border-slate-100 rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-200/50">
                  <ShieldCheck size={12} /> Food Trust Console
                </span>
                <h3 className="text-2xl font-black text-slate-800">Verify Your Food</h3>
                <p className="text-xs text-slate-400 font-medium">Have a Batch ID or want to test our database? Audit a farm trace in one click.</p>
              </div>

              {/* Text Search Input (Redirects to TraceabilityPage) */}
              <div className="relative group">
                <input 
                  type="text" 
                  id="quick-batch-input"
                  placeholder="Enter Batch ID (e.g. batch-001)..."
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#10B981] p-4.5 pl-5 rounded-2xl text-sm font-semibold outline-none transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) navigate(`/traceability/${val.trim()}`);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const el = document.getElementById('quick-batch-input') as HTMLInputElement;
                    if (el?.value.trim()) navigate(`/traceability/${el.value.trim()}`);
                  }}
                  className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-[#0B4F35] text-white text-xs font-black uppercase tracking-wider px-4 rounded-xl transition-all"
                >
                  Verify
                </button>
              </div>

              {/* Quick Seeded Click Audits */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Instant Demo Audits</span>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleTraceDemo('turmeric')}
                    className="p-4 bg-amber-50/50 border border-amber-100 hover:border-amber-300 rounded-2xl text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span className="block text-[8px] font-black text-amber-800 uppercase tracking-widest mb-1">HARVEST BATCH</span>
                    <span className="block text-xs font-black text-slate-800 truncate">Organic Turmeric</span>
                    <span className="text-[9px] font-medium text-slate-400 block mt-1">Sourced from Sangli</span>
                  </button>
                  <button 
                    onClick={() => handleTraceDemo('ghee')}
                    className="p-4 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-300 rounded-2xl text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span className="block text-[8px] font-black text-emerald-800 uppercase tracking-widest mb-1">HARVEST BATCH</span>
                    <span className="block text-xs font-black text-slate-800 truncate">A2 Vedic Ghee</span>
                    <span className="text-[9px] font-medium text-slate-400 block mt-1">Sourced from Satara</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-medium text-center flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Synchronized with Organic Data Network</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 right-0 -z-0 opacity-20 pointer-events-none xl:opacity-100">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-96 h-96 bg-emerald-200 blur-[120px] rounded-full"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {FEATURE_DATA.map((feat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl border border-slate-100 hover:border-emerald-200/50 hover:bg-emerald-50/30 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                <feat.icon size={28} className="text-emerald-500 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Simple 3-Step Customer Guide */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-200/40">
            Transparency Made Simple
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Trace in 3 Simple Steps</h2>
          <p className="text-slate-500 font-medium text-sm md:text-base">Verify the purity of your organic food before it reaches your plate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Pick Your Product",
              desc: "Browse our list of naturally-grown spices, supplements, and dairy products harvested by local farmers.",
              color: "border-emerald-100 text-[#0B4F35] bg-emerald-50/30"
            },
            {
              step: "02",
              title: "Inspect Lab Metrics",
              desc: "Click the 'Trace Origin' button on any product card to view its harvesting logs, temperature records, and pesticide status.",
              color: "border-amber-100 text-amber-800 bg-amber-50/30"
            },
            {
              step: "03",
              title: "Receive Organic Goodness",
              desc: "Get certified, chemical-free food delivered directly to your doorstep, verified from source coordinates.",
              color: "border-blue-100 text-blue-800 bg-blue-50/30"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border font-black text-lg ${item.color}`}>
                {item.step}
              </span>
              <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Swasth AI Adviser Floating Tab */}
      <SwasthAdviser onProductSelect={handleProductSelect} />

      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-7xl mx-auto px-6 mb-4"
          >
            <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <WifiOff size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-amber-800 text-sm">Offline Mode — Showing Cached Products</p>
                  {lastSynced && (
                    <p className="text-amber-600 text-xs font-medium">Last synced: {lastSynced}</p>
                  )}
                </div>
              </div>
              <button
                onClick={refreshProducts}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition-colors shrink-0"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid Section */}
      <section id="marketplace" className="max-w-7xl mx-auto px-6 pb-40 scroll-mt-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Our Bestsellers</h2>
            <p className="text-slate-500 font-medium text-lg">Curated directly from our certified farming partners.</p>
          </div>
          <div className="flex gap-4">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              onTrace={handleTraceOpen} 
              isHighlighted={highlightedProductId === product.id}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
