import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X, Leaf } from 'lucide-react';
import { AdviserLanding } from '../adviser/AdviserLanding';
import { AssessmentFlow } from '../adviser/AssessmentFlow';
import { ConsentStep } from '../adviser/ConsentStep';
import { AnalysisState } from '../adviser/AnalysisState';
import { RecommendationResults } from '../adviser/RecommendationResults';
import {
  getSimulatedRecommendations,
  type AdviserProduct,
  type AssessmentData,
} from '../../data/adviserMockData';

interface SwasthAdviserProps {
  onProductSelect: (productId: string) => void;
}

type AdviserStep = 'LANDING' | 'ASSESSMENT' | 'CONSENT' | 'ANALYSIS' | 'RESULTS';

const SwasthAdviser: React.FC<SwasthAdviserProps> = ({ onProductSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<AdviserStep>('LANDING');

  // Assessment & Goal State
  const [goalText, setGoalText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    goalText: '',
    primaryConcern: '',
    duration: '',
    lifestyleFactors: [],
    age: '',
    weight: '',
    allergies: [],
  });

  const [recommendations, setRecommendations] = useState<AdviserProduct[]>([]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Quick submit from landing input
  const handleQuickSubmit = () => {
    if (!goalText.trim()) {
      setValidationError('Please enter a goal or select an example prompt.');
      return;
    }
    setValidationError(null);
    setAssessmentData((prev) => ({ ...prev, goalText }));
    setCurrentStep('CONSENT');
  };

  // Start step-by-step guided questionnaire
  const handleStartPersonalized = () => {
    setValidationError(null);
    setCurrentStep('ASSESSMENT');
  };

  // Assessment flow finished -> Move to Consent
  const handleAssessmentComplete = () => {
    setCurrentStep('CONSENT');
  };

  // Consent given -> Start Timed AI Simulation Analysis
  const handleConsentGiven = () => {
    setCurrentStep('ANALYSIS');
  };

  // Timed analysis completed -> Calculate mock results & show Results screen
  const handleAnalysisComplete = () => {
    const results = getSimulatedRecommendations({
      ...assessmentData,
      goalText: goalText || assessmentData.goalText,
    });
    setRecommendations(results);
    setCurrentStep('RESULTS');
  };

  // Reset Adviser back to Landing
  const handleReset = () => {
    setGoalText('');
    setValidationError(null);
    setAssessmentData({
      goalText: '',
      primaryConcern: '',
      duration: '',
      lifestyleFactors: [],
      age: '',
      weight: '',
      allergies: [],
    });
    setRecommendations([]);
    setCurrentStep('LANDING');
  };

  const handleSelectProduct = (productId: string) => {
    onProductSelect(productId);
    handleClose();
  };

  return (
    <>
      {/* Floating Tab Trigger (3D Acharya Ved) */}
      <motion.button
        drag
        dragConstraints={{ left: -300, right: 0, top: -400, bottom: 400 }}
        whileDrag={{ scale: 1.15, zIndex: 100, cursor: 'grabbing' }}
        whileHover={{ scale: 1.08, cursor: 'grab' }}
        dragElastic={0.1}
        initial={{ x: 100 }}
        animate={{ x: isOpen ? 100 : 0 }}
        onClick={handleOpen}
        aria-label="Open Swasth Adviser AI Wellness Partner"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] group pr-3 sm:pr-4 touch-none focus:outline-none"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={
            !isOpen
              ? {
                  rotateY: [-5, 5, -5],
                  y: [0, -5, 0],
                }
              : {}
          }
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Deep Shadow */}
          <div className="absolute inset-0 bg-black/30 rounded-full blur-md translate-x-2 translate-y-2" />

          {/* Outer Ring */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-[3px] shadow-[0_10px_40px_rgba(251,191,36,0.4)] transition-all group-hover:rotate-6 active:scale-95">
            <div className="w-full h-full rounded-full bg-white p-1 shadow-inner flex items-center justify-center overflow-hidden">
              <img
                src="/acharya.png"
                alt="Acharya Ved"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>

            {/* Label Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full border-2 border-amber-300 shadow-xl whitespace-nowrap uppercase tracking-widest z-20">
              Swasth Adviser
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl group-hover:bg-amber-400/40 transition-all pointer-events-none" />
        </motion.div>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70]"
          />
        )}
      </AnimatePresence>

      {/* Side Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[80] shadow-[-20px_0_60px_rgba(0,0,0,0.15)] border-l border-emerald-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">
                    Swasth Adviser
                  </h2>
                  <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">
                    AI Wellness Partner
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Swasth Adviser drawer"
                className="p-2.5 hover:bg-white rounded-2xl transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {currentStep === 'LANDING' && (
                  <motion.div
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AdviserLanding
                      goalText={goalText}
                      setGoalText={setGoalText}
                      onQuickSubmit={handleQuickSubmit}
                      onStartPersonalized={handleStartPersonalized}
                      validationError={validationError}
                    />
                  </motion.div>
                )}

                {currentStep === 'ASSESSMENT' && (
                  <motion.div
                    key="assessment"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AssessmentFlow
                      assessmentData={assessmentData}
                      setAssessmentData={setAssessmentData}
                      onCompleteFlow={handleAssessmentComplete}
                      onCancel={() => setCurrentStep('LANDING')}
                    />
                  </motion.div>
                )}

                {currentStep === 'CONSENT' && (
                  <motion.div
                    key="consent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ConsentStep
                      onConsentGiven={handleConsentGiven}
                      onBack={() => setCurrentStep(assessmentData.primaryConcern ? 'ASSESSMENT' : 'LANDING')}
                    />
                  </motion.div>
                )}

                {currentStep === 'ANALYSIS' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AnalysisState onCompleteAnalysis={handleAnalysisComplete} />
                  </motion.div>
                )}

                {currentStep === 'RESULTS' && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RecommendationResults
                      recommendations={recommendations}
                      onSelectProduct={handleSelectProduct}
                      onReset={handleReset}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5 text-emerald-800 bg-emerald-100/60 p-3 rounded-xl text-[11px] font-extrabold leading-snug">
                <Leaf size={16} className="shrink-0 text-emerald-600" />
                <span>Verified by Swasthanand lab experts for your safety.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SwasthAdviser;
