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

  const filteredProducts = Array.isArray(products)
    ? (selectedCategory === 'All' 
        ? products 
        : products.filter(p => p.category === selectedCategory))
    : [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 bg-emerald-100 text-emerald-700 rounded-full text-[11px] sm:text-xs md:text-sm font-extrabold tracking-widest uppercase shadow-sm border border-emerald-200/50">
              Freshly Harvested from the Heartland
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl xl:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight"
          >
            Experience Purity, <br/>
            <span className="gradient-text tracking-tighter">Trace the Origin.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium mx-auto"
          >
            Swasthanand connects you directly with local organic farmers. Tap "Trace Origin" on any food item to view its harvesting date, laboratory soil parameters, and local weather charts.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 w-full sm:w-auto"
          >
            <button 
              onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-premium px-8 md:px-10 py-4 md:py-5 text-base md:text-lg shadow-2xl shadow-emerald-200 cursor-pointer w-full sm:w-auto text-center justify-center"
            >
              Explore Marketplace
            </button>
            <button 
              onClick={() => navigate('/how-it-works')}
              className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-bold border-2 border-slate-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition-all text-slate-700 bg-white shadow-sm cursor-pointer w-full sm:w-auto text-center justify-center"
            >
              How It Works
            </button>
          </motion.div>
        </div>

        {/* Floating Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 opacity-30 pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.05, 1]
            }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-200 blur-[100px] sm:blur-[140px] rounded-full"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {FEATURE_DATA.map((feat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 md:p-8 rounded-3xl border border-slate-100 hover:border-emerald-200/50 hover:bg-emerald-50/30 transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                <feat.icon size={24} className="text-emerald-500 group-hover:text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Simple 3-Step Customer Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16 space-y-2">
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-200/40">
            Transparency Made Simple
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Trace in 3 Simple Steps</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-base">Verify the purity of your organic food before it reaches your plate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border font-black text-lg ${item.color}`}>
                {item.step}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-xs md:text-sm">{item.desc}</p>
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
            className="max-w-7xl mx-auto px-4 sm:px-6 mb-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <WifiOff size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-amber-800 text-xs sm:text-sm">Offline Mode — Showing Cached Products</p>
                  {lastSynced && (
                    <p className="text-amber-600 text-[10px] sm:text-xs font-medium">Last synced: {lastSynced}</p>
                  )}
                </div>
              </div>
              <button
                onClick={refreshProducts}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 transition-colors shrink-0 self-end sm:self-auto"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid Section */}
      <section id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 md:pb-40 scroll-mt-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-1 md:mb-2">Our Bestsellers</h2>
            <p className="text-slate-500 font-medium text-sm md:text-lg">Curated directly from our certified farming partners.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-none shrink-0 w-full md:w-auto">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
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
