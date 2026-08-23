import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Leaf, RefreshCw, AlertCircle } from 'lucide-react';
import type { AdviserProduct } from '../../data/adviserMockData';
import { RecommendationCard } from './RecommendationCard';
import { AdviserFeedback } from './AdviserFeedback';

interface RecommendationResultsProps {
  recommendations: AdviserProduct[];
  onSelectProduct: (productId: string) => void;
  onReset: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({
  recommendations,
  onSelectProduct,
  onReset,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="py-12 px-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-800 text-lg">No Exact Match Found</h3>
          <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
            We couldn't find a suitable recommendation based on the information provided. Try adding a little more detail.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
          <Sparkles size={12} className="text-amber-500" />
          Verified Catalog Match
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Swasth Adviser Recommendations</h3>
        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          Based on the information you provided, here are relevant products from the Swasthanand catalog.
        </p>
      </div>

      {/* Recommended Products Grid */}
      <div className="space-y-4">
        {recommendations.map((product) => (
          <RecommendationCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>

      {/* Recalculate Action */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-400 text-slate-600 hover:text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw size={14} />
          <span>Start New Wellness Assessment</span>
        </button>
      </div>

      {/* Recommendation Feedback Section */}
      <AdviserFeedback />
    </div>
  );
};
