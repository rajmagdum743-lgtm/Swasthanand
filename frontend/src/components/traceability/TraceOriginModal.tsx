import React from 'react';
import { X, MapPin, Calendar, Droplets, Wind, ShieldCheck, Download, TreeDeciduous, Thermometer, Globe, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product } from '../../context/ProductContext';

interface TraceOriginModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const TraceOriginModal: React.FC<TraceOriginModalProps> = ({ isOpen, onClose, product }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (product?.batchId) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(product.batchId)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => fallbackCopy(product.batchId));
      } else {
        fallbackCopy(product.batchId);
      }
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[203]"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-full max-w-3xl max-h-[95vh] bg-white rounded-[24px] md:rounded-[40px] shadow-2xl z-[204] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Column: Visuals - Made more compact for mobile */}
            <div className="w-full md:w-2/5 relative bg-emerald-950 p-4 md:p-10 flex flex-row md:flex-col justify-between items-center md:items-start overflow-hidden group shrink-0">
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                 <Globe className="text-white rotate-12 w-[100px] h-[100px] md:w-[150px] md:h-[150px]" />
              </div>
              
              <div className="relative z-10 flex md:block items-center gap-3 md:gap-0">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-500/20 backdrop-blur rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-400 mb-0 md:mb-6">
                  <TreeDeciduous className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />
                </div>
                <div>
                  <h2 className="text-lg md:text-4xl font-black text-white leading-none md:leading-tight uppercase tracking-widest md:mb-2">Track Purity</h2>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full w-max backdrop-blur border border-white/10 mt-2">
                     <ShieldCheck size={14} className="text-emerald-400" />
                     <span className="text-[10px] font-black text-emerald-100/80 uppercase tracking-widest">Certified Batch</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-right md:text-left flex-1 md:flex-none">
                 <p className="text-emerald-300 font-bold text-[8px] md:text-sm uppercase tracking-widest mb-0 md:mb-1 opacity-60">Harvest History</p>
                 <h3 className="text-sm md:text-2xl font-black text-white truncate max-w-[120px] md:max-w-none">{product?.name}</h3>
                                   <div 
                    onClick={handleCopy}
                    className="flex items-center gap-2 justify-end md:justify-start cursor-pointer hover:text-emerald-400 transition-all group mt-2 p-1 active:scale-95 bg-white/5 rounded-lg px-2"
                  >
                    <p className="text-emerald-100 font-bold text-[9px] md:text-xs uppercase tracking-tight break-all md:break-normal group-hover:text-emerald-300">{product?.batchId}</p>
                    {copied ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} className="text-emerald-100/40 group-hover:text-emerald-400" />
                    )}
                  </div>
              </div>
            </div>

            {/* Right Column: Data - Increased scroll area and tightened spacing */}
            <div className="flex-1 p-4 md:p-10 bg-white space-y-4 md:space-y-10 overflow-y-auto">
              <div className="flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-20 pb-2 border-b border-slate-50 md:border-none">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest">Live Sync</p>
                 </div>
                 <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                   <X className="w-5 h-5 md:w-6 md:h-6" />
                 </button>
              </div>

              {/* Data Grid - More compact on mobile */}
              <div className="grid grid-cols-2 gap-3 md:gap-8">
                <div className="space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-base md:text-xl font-black text-slate-800 tracking-tight">{product?.harvestDate || 'N/A'}</p>
                </div>
                <div className="space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Origin</span>
                  </div>
                  <p className="text-base md:text-xl font-black text-slate-800 tracking-tight truncate">{product?.origin?.split(',')[0] || 'N/A'}</p>
                </div>
                <div className="space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Thermometer className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Temp</span>
                  </div>
                  <p className="text-base md:text-xl font-black text-slate-800 tracking-tight">{product?.weatherTemp || 'N/A'}</p>
                </div>
                <div className="space-y-0.5 md:space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wind className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Quality</span>
                  </div>
                  <p className="text-base md:text-xl font-black text-emerald-600 tracking-tight">{product?.growthQuality || 'N/A'}</p>
                </div>
              </div>

              {/* Lab Report Section - More compact for mobile */}
              <div className="p-4 md:p-8 bg-slate-50/50 rounded-[20px] md:rounded-[32px] border border-slate-100">
                 <div className="flex justify-between items-start mb-3 md:mb-6">
                    <div>
                      <h4 className="text-slate-800 font-black uppercase tracking-widest text-[9px] md:text-sm">Lab Report</h4>
                      <p className="text-slate-400 text-[7px] md:text-xs font-bold">Verified Organic Metrics</p>
                    </div>
                    <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                       <Droplets className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </div>
                 </div>

                 <div className="space-y-2 md:space-y-4">
                    {[
                      { label: 'Organic Matter', val: product?.organicMatter || 'N/A' },
                      { label: 'Nitrogen (N)', val: product?.nitrogen || 'N/A' },
                      { label: 'Pesticides', val: product?.zeroPesticides || 'N/A' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                         <span className="text-[9px] md:text-xs font-bold text-slate-500">{item.label}</span>
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] md:text-xs font-black text-slate-900">{item.val}</span>
                            <div className="w-4 md:w-8 h-1 bg-emerald-500 rounded-full" />
                         </div>
                      </div>
                    ))}
                 </div>
                 
                  <button 
                    onClick={() => product?.certificateUrl && window.open(product.certificateUrl, '_blank')}
                    disabled={!product?.certificateUrl}
                    className={`w-full mt-4 md:mt-6 py-2.5 md:py-4 px-4 border-2 rounded-xl md:rounded-2xl font-black text-[9px] md:text-sm flex items-center justify-center gap-2 transition-all ${
                      product?.certificateUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-100 border-slate-100 text-slate-400'
                    }`}
                  >
                    <Download className="w-3 h-3 md:w-4 md:h-4" />
                    {product?.certificateUrl ? 'Get Certificate' : 'No Certificate'}
                  </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TraceOriginModal;
