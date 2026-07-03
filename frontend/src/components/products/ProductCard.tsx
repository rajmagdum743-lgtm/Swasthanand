import React from 'react';
import { Eye, MapPin, TreeDeciduous, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { type Product } from '../../context/ProductContext';
import { API_BASE_URL } from '../../config/api';

interface ProductProps extends Product {
  onTrace: (product: Product) => void;
  isHighlighted?: boolean;
}

const ProductCard: React.FC<ProductProps> = (props) => {
  const { id, name, price, image, onTrace, isHighlighted } = props;
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAdd = () => {
    addToCart({ id, name, price });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = props.stock === 0;
  const [showNotify, setShowNotify] = React.useState(false);
  const [notifyContact, setNotifyContact] = React.useState('');
  const [notifyStatus, setNotifyStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact) return;
    setNotifyStatus('loading');
    try {
      await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, contactInfo: notifyContact })
      });
      setNotifyStatus('success');
      setTimeout(() => setShowNotify(false), 3000);
    } catch (err) {
      setNotifyStatus('error');
      setTimeout(() => setNotifyStatus('idle'), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={isHighlighted ? { 
        scale: [1, 1.15, 1, 1.15, 1, 1.05],
        boxShadow: [
          "0 0 0px rgba(245, 158, 11, 0)",
          "0 0 80px rgba(245, 158, 11, 0.8)",
          "0 0 0px rgba(245, 158, 11, 0)",
          "0 0 80px rgba(245, 158, 11, 0.8)",
          "0 0 20px rgba(245, 158, 11, 0.2)",
          "0 0 40px rgba(245, 158, 11, 0.4)"
        ],
        borderColor: "#F59E0B",
        zIndex: 50
      } : { 
        opacity: 1, 
        y: 0,
        scale: 1,
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        borderColor: "rgb(241 245 249)",
        zIndex: 1
      }}
      transition={isHighlighted ? { 
        duration: 5,
        times: [0, 0.12, 0.24, 0.36, 0.48, 1],
        ease: "easeInOut"
      } : { duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border-2 ${isHighlighted ? 'border-amber-500 ring-4 ring-amber-50/50' : 'border-slate-100'} flex flex-col h-full`}
      id={`product-${id}`}
    >
      {isHighlighted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-amber-500/5 pointer-events-none z-10"
        />
      )}
      <div className="relative aspect-square overflow-hidden bg-slate-50 shrink-0">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 backdrop-blur rounded-full text-emerald-600 shadow-lg hover:bg-emerald-500 hover:text-white transition-colors">
            <Eye size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{name}</h3>
            <span className="text-[#0B4F35] font-extrabold text-base shrink-0">₹{price}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <TreeDeciduous size={13} className="text-[#10B981]" />
              <span>Farmed Naturally</span>
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#10B981]" />
              <span className="truncate max-w-[100px]">{props.origin?.split(',')[0]}</span>
            </span>
          </div>

          <p className="text-slate-400 text-xs font-medium line-clamp-2 leading-relaxed min-h-[32px]">
            {props.description || 'Verified organic produce from partner farms.'}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {isOutOfStock ? (
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[10px] font-bold text-amber-800 leading-tight">
                  This product is currently out of stock. We are working with our trusted dealers to restock it as quickly as possible.
                </p>
              </div>
              <AnimatePresence mode="wait">
                {!showNotify ? (
                  <motion.button 
                    key="notify-btn"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowNotify(true)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-center font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    Notify Me When Available
                  </motion.button>
                ) : (
                  <motion.form 
                    key="notify-form"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleNotifySubmit}
                    className="flex flex-col gap-2"
                  >
                    <input 
                      type="text" 
                      placeholder="Email or Phone Number" 
                      value={notifyContact}
                      onChange={e => setNotifyContact(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={notifyStatus === 'loading' || notifyStatus === 'success'}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${notifyStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    >
                      {notifyStatus === 'loading' ? 'Subscribing...' : notifyStatus === 'success' ? 'Subscribed!' : 'Confirm'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={handleAdd}
              disabled={added}
              className={`w-full ${added ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'btn-premium'} py-3.5 rounded-xl text-center justify-center font-bold relative transition-all duration-300 text-sm`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span 
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Check size={16} strokeWidth={3} />
                    Added to Basket
                  </motion.span>
                ) : (
                  <motion.span 
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1.5"
                  >
                    Add to Basket
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
          
          <button 
            onClick={() => onTrace(props)}
            className="w-full py-2.5 border border-emerald-600/20 text-[#0B4F35] font-black uppercase tracking-wider text-[10px] bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-500/40 rounded-xl transition-all flex items-center justify-center gap-1.5"
            title="Trace the origin of this batch"
          >
            <Info size={13} />
            <span>Trace Origin</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
