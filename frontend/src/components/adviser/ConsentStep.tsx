import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronLeft, ArrowRight, Lock } from 'lucide-react';

interface ConsentStepProps {
  onConsentGiven: () => void;
  onBack: () => void;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({ onConsentGiven, onBack }) => {
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Your Wellness Information</h3>
            <p className="text-xs font-semibold text-emerald-700">Privacy & Transparency Guarantee</p>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-600 leading-relaxed">
          We respect your health data. The information you provided is used solely on your device to match your goals with verified natural products from the Swasthanand catalog.
        </p>

        <div className="space-y-2 pt-2">
          <div className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Used strictly for personalized catalog matching</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Never sold, stored on external servers, or shared with third parties</span>
          </div>
        </div>
      </div>

      {/* Explicit Checkbox Consent Gate */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-700 leading-relaxed">
            I consent to the collection and processing of my health-related information for generating personalized wellness recommendations.
          </span>
        </label>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={!hasConsented}
          onClick={onConsentGiven}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black bg-emerald-600 text-white hover:bg-emerald-700 text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <span>Generate My Recommendations</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
