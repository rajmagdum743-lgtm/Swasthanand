import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Activity, ExternalLink, ShieldCheck } from 'lucide-react';
import type { AdviserProduct } from '../../data/adviserMockData';

interface RecommendationCardProps {
  product: AdviserProduct;
  onSelectProduct: (productId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ product, onSelectProduct }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all space-y-4"
    >
      {/* Top Main Details */}
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 p-1">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {product.category}
            </span>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
              <Sparkles size={11} /> {product.matchScore}% Match
            </span>
          </div>

          <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">{product.name}</h4>
          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
          <div className="text-sm font-black text-slate-900 pt-0.5">₹{product.price}</div>
        </div>
      </div>

      {/* Expert Benefit Highlight Pill */}
      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60 text-xs font-semibold text-emerald-900 flex items-center gap-2">
        <Activity size={16} className="text-emerald-600 shrink-0" />
        <span className="truncate">{product.expertBenefit}</span>
      </div>

      {/* Expandable "Why this was recommended" Accordion */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            Why this was recommended
          </span>
          {isAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {isAccordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-3 pt-1 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-white"
            >
              <p className="mb-2">{product.whyRecommended}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 font-bold border-t border-slate-100">
                <div>📌 Usage: {product.usageInstructions}</div>
                <div>⏱️ Timeline: {product.recoveryTimeline}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onSelectProduct(product.id)}
        className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <span>View Product in Catalog</span>
        <ExternalLink size={14} />
      </button>
    </motion.div>
  );
};
