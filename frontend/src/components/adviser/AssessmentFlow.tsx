import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Activity, Clock, Flame, ShieldAlert, Check } from 'lucide-react';
import type { AssessmentData } from '../../data/adviserMockData';

interface AssessmentFlowProps {
  assessmentData: AssessmentData;
  setAssessmentData: React.Dispatch<React.SetStateAction<AssessmentData>>;
  onCompleteFlow: () => void;
  onCancel: () => void;
}

const PRIMARY_CONCERNS = [
  { id: 'acidity', title: 'Acidity & Digestion', desc: 'Frequent heartburn, bloating, or irregular appetite' },
  { id: 'sleep', title: 'Sleep & Restlessness', desc: 'Difficulty falling or staying asleep, waking up unrefreshed' },
  { id: 'energy', title: 'Low Energy & Fatigue', desc: 'Mid-day exhaustion, metabolic sluggishness, or weak Prana' },
  { id: 'joint-pain', title: 'Joint & Body Stiffness', desc: 'Cold weather stiffness, joint aches, or mobility support' },
  { id: 'immunity', title: 'Immunity & Defense', desc: 'Seasonal vulnerability, frequent colds, or general weakness' },
  { id: 'skin', title: 'Skin & Hair Vitality', desc: 'Blemishes, dull complexion, or dry skin tissue' },
];

const DURATIONS = [
  { id: 'short', label: 'Less than a week' },
  { id: 'medium', label: '1 to 4 weeks' },
  { id: 'long', label: '1 to 6 months' },
  { id: 'chronic', label: 'Long-term / Chronic condition' },
];

const LIFESTYLE_OPTIONS = [
  'High Daily Stress',
  'Late-Night Meals',
  'Irregular Sleep Schedule',
  'Sedentary Desk Work',
  'Frequent Travel',
  'Processed Food Diet',
];

const ALLERGIES_LIST = ['Dairy', 'Gluten', 'Nuts', 'Turmeric', 'Honey', 'Soy', 'Ginger'];

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({
  assessmentData,
  setAssessmentData,
  onCompleteFlow,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const toggleLifestyle = (item: string) => {
    const current = assessmentData.lifestyleFactors || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setAssessmentData(prev => ({ ...prev, lifestyleFactors: updated }));
  };

  const toggleAllergy = (allergy: string) => {
    const current = assessmentData.allergies || [];
    const updated = current.includes(allergy)
      ? current.filter(a => a !== allergy)
      : [...current, allergy];
    setAssessmentData(prev => ({ ...prev, allergies: updated }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      onCompleteFlow();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
          <span>Step {currentStep} of 4</span>
          <span className="text-emerald-600 font-extrabold">
            {currentStep === 1 && 'Primary Concern'}
            {currentStep === 2 && 'Duration & Frequency'}
            {currentStep === 3 && 'Lifestyle Factors'}
            {currentStep === 4 && 'Sensitivities & Metrics'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600 rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Contents */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">What is your primary wellness concern?</h3>
              <p className="text-xs font-medium text-slate-500">Select one option that best describes your focus.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRIMARY_CONCERNS.map((concern) => {
                const isSelected = assessmentData.primaryConcern === concern.title;
                return (
                  <button
                    key={concern.id}
                    type="button"
                    onClick={() => setAssessmentData(prev => ({ ...prev, primaryConcern: concern.title }))}
                    className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm">{concern.title}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{concern.desc}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">How long have you experienced this?</h3>
              <p className="text-xs font-medium text-slate-500">Understanding timeline helps us suggest the appropriate dosage cycle.</p>
            </div>

            <div className="space-y-2">
              {DURATIONS.map((dur) => {
                const isSelected = assessmentData.duration === dur.label;
                return (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setAssessmentData(prev => ({ ...prev, duration: dur.label }))}
                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-extrabold text-sm flex items-center gap-3">
                      <Clock size={16} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                      {dur.label}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Select any relevant lifestyle factors</h3>
              <p className="text-xs font-medium text-slate-500">Select all that apply to your daily routine.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {LIFESTYLE_OPTIONS.map((factor) => {
                const isSelected = (assessmentData.lifestyleFactors || []).includes(factor);
                return (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => toggleLifestyle(factor)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {factor}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Preferences & Sensitivities</h3>
              <p className="text-xs font-medium text-slate-500">Provide basic metrics to ensure safe catalog recommendations.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  value={assessmentData.age || ''}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : '' }))}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-1">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 68"
                  value={assessmentData.weight || ''}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, weight: e.target.value ? parseInt(e.target.value) : '' }))}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-rose-500 pl-1">
                Sensitivities / Allergies (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES_LIST.map((allergy) => {
                  const isSelected = (assessmentData.allergies || []).includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      {allergy}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs transition-colors"
        >
          <ChevronLeft size={16} />
          <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 text-xs transition-all shadow-md shadow-emerald-100"
        >
          <span>{currentStep === 4 ? 'Proceed to Consent' : 'Continue'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
