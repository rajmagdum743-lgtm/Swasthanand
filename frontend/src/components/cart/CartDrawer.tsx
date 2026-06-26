import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, totalItems, addToCart } = useCart();
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={22} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Your Basket ({totalItems})</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">Basket is Empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="flex gap-4 group"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                      <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <ShoppingCart size={24} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate mb-1">{item.name}</h3>
                      <p className="text-emerald-700 font-extrabold text-sm mb-3">₹{item.price}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button 
                            className="p-1 hover:text-emerald-600 transition-colors"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button 
                            className="p-1 hover:text-emerald-600 transition-colors"
                            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Subtotal</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalPrice}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full btn-premium py-5 rounded-2xl text-lg font-bold shadow-xl shadow-emerald-200"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} className="ml-2" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
