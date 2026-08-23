import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Loader2, Leaf } from 'lucide-react';

interface AnalysisStateProps {
  onCompleteAnalysis: () => void;
}

const STAGES = [
  'Understanding your wellness goal',
  'Reviewing your responses',
  'Matching relevant products',
  'Preparing your recommendations',
];

export const AnalysisState: React.FC<AnalysisStateProps> = ({ onCompleteAnalysis }) => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onCompleteAnalysis();
          }, 600);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, [onCompleteAnalysis]);

  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-8">
      {/* Central Animated Pulsing Icon */}
      <div className="relative">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
          <Leaf size={44} className="animate-bounce" />
        </div>
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Analyzing Ayurvedic Formulations...
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          Synthesizing your requirements against Swasthanand lab parameters
        </p>
      </div>

      {/* Vertical Timeline Progress */}
      <div className="w-full max-w-sm space-y-3 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-left">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;
          return (
            <div key={idx} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 size={18} className="text-amber-500 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0 ml-0.5" />
              )}
              <span
                className={`text-xs font-bold transition-colors ${
                  isDone
                    ? 'text-emerald-700 font-extrabold'
                    : isCurrent
                    ? 'text-slate-900 font-black'
                    : 'text-slate-400'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-600 rounded-full"
          initial={{ width: '15%' }}
          animate={{ width: `${((activeStage + 1) / STAGES.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};
