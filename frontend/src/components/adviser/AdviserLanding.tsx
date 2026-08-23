import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Sliders, ShieldCheck, HeartPulse } from 'lucide-react';
import { EXAMPLE_PROMPTS } from '../../data/adviserMockData';

interface AdviserLandingProps {
  goalText: string;
  setGoalText: (val: string) => void;
  onQuickSubmit: () => void;
  onStartPersonalized: () => void;
  validationError?: string | null;
}

export const AdviserLanding: React.FC<AdviserLandingProps> = ({
  goalText,
  setGoalText,
  onQuickSubmit,
  onStartPersonalized,
  validationError
}) => {
  const handlePromptClick = (prompt: string) => {
    setGoalText(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-200 border border-white/10">
            <Sparkles size={12} className="text-amber-300" />
            Your AI Wellness Partner
          </div>
          <h2 className="text-2xl font-black tracking-tight">Swasth Adviser</h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Tell us about your wellness goals or daily discomforts. We match your profile with pure, lab-verified Ayurvedic solutions from the Swasthanand catalog.
          </p>
        </div>
      </div>

      {/* Main Goal Input Form */}
      <div className="space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 pl-1">
          What are you experiencing today?
        </label>

        <div className="relative">
          <textarea
            rows={4}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Tell us about your wellness goal or symptoms... (e.g., I want better sleep, or I often feel bloated after meals)"
            className={`w-full p-4 rounded-2xl bg-slate-50 border-2 ${
              validationError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-100 focus:border-emerald-500'
            } outline-none font-medium text-sm text-slate-800 transition-all resize-none shadow-inner`}
          />
          {validationError && (
            <p className="text-xs font-bold text-rose-500 mt-1 pl-1">{validationError}</p>
          )}
        </div>

        {/* Quick Example Prompts Chips */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-slate-400 pl-1 uppercase tracking-widest">
            Try these example prompts:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePromptClick(prompt)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border text-left ${
                  goalText === prompt
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                💡 {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={onQuickSubmit}
            disabled={!goalText.trim()}
            className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 text-sm tracking-wide active:scale-[0.99]"
          >
            <span>Get Immediate Suggestions</span>
            <ArrowRight size={18} />
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={onStartPersonalized}
            className="w-full py-3.5 bg-white border-2 border-emerald-600/30 hover:border-emerald-600 text-emerald-800 font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs tracking-wider uppercase hover:bg-emerald-50/80 active:scale-[0.99]"
          >
            <Sliders size={16} className="text-emerald-600" />
            <span>Personalize Guided Assessment (Step-by-Step)</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3 text-slate-500 text-xs font-medium leading-relaxed">
        <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Wellness Notice:</strong> Swasth Adviser provides holistic Ayurvedic product suggestions from verified Swasthanand catalog items. It does not diagnose, treat, or replace professional medical advice.
        </span>
      </div>
    </div>
  );
};
