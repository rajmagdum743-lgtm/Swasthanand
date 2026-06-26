import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit, Leaf, Loader2, Settings2, Activity, X, ChevronRight, MessageSquareHeart } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface RecommendedProduct {
  id: string;
  name: string;
  expertBenefit: string;
  chosenReason: string;
  recoveryTimeline: string;
  usageInstructions: string;
  dosageCycle: string;
  image: string;
}

interface SwasthAdviserProps {
  onProductSelect: (productId: string) => void;
}

const DISEASES = ['Diabetes', 'Hypertension', 'Arthritis', 'Asthma', 'Thyroid', 'PCOS', 'Acidity', 'Fatigue'];
const ALLERGIES = ['Dairy', 'Gluten', 'Nuts', 'Turmeric', 'Honey', 'Soy', 'Ginger'];

const SwasthAdviser: React.FC<SwasthAdviserProps> = ({ onProductSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Metrics State
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/recommend/smart-goal`, {
        goal,
        age: age || 30,
        weight: weight || 70,
        diseases: selectedDiseases,
        allergies: selectedAllergies
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching goal recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    const lowerItem = item.toLowerCase();
    setList(list.includes(lowerItem) ? list.filter(i => i !== lowerItem) : [...list, lowerItem]);
  };

  return (
    <>
      {/* Floating Tab Trigger (3D Acharya Ved) - Drag enabled for mobile/APK */}
      <motion.button
        drag
        dragConstraints={{ left: -300, right: 0, top: -400, bottom: 400 }}
        whileDrag={{ scale: 1.2, zIndex: 100, cursor: 'grabbing' }}
        whileHover={{ scale: 1.1, cursor: 'grab' }}
        dragElastic={0.1}
        initial={{ x: 100 }}
        animate={{ x: isOpen ? 100 : 0 }}
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] group pr-4 touch-none"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={!isOpen ? {
            rotateY: [-5, 5, -5],
            y: [0, -5, 0]
          } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* 3D Deep Shadow */}
          <div className="absolute inset-0 bg-black/30 rounded-full blur-md translate-x-3 translate-y-3" />

          {/* Outer Ring (3D Frame) */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-[3px] shadow-[0_10px_40px_rgba(251,191,36,0.4)] transition-all group-hover:rotate-12 active:scale-95">
            <div className="w-full h-full rounded-full bg-white p-1 shadow-inner flex items-center justify-center overflow-hidden">
              <img
                src="/acharya.png"
                alt="Acharya Ved"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Label Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-black px-3 py-1 rounded-full border-2 border-amber-300 shadow-xl whitespace-nowrap uppercase tracking-widest z-20">
              Swasth Advisor
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
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]"
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white/95 backdrop-blur-xl z-[80] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] border-l border-emerald-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Swasth Advisor</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">AI Wellness Partner</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Tell me your wellness goal, and I'll find the perfect Ayurvedic match from our labs.
                </p>
                <form onSubmit={handleSuggest} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g., I want to boost immunity..."
                      className="w-full bg-slate-50 p-5 pr-14 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold transition-all text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={loading || !goal.trim()}
                      className="absolute right-2 top-2 bottom-2 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    </button>
                  </div>

                  {/* Profile Settings Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-emerald-600 transition-colors py-2 uppercase tracking-tighter"
                  >
                    <Settings2 size={16} />
                    {showAdvanced ? 'Hide My Metrics' : 'Personalize Assessment'}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-6 pt-2"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Age</label>
                            <input
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-emerald-500 outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Weight (kg)</label>
                            <input
                              type="number"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : '')}
                              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-emerald-500 outline-none font-bold text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Conditions</label>
                          <div className="flex flex-wrap gap-2">
                            {DISEASES.map(d => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => toggleItem(selectedDiseases, setSelectedDiseases, d)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${selectedDiseases.includes(d.toLowerCase())
                                    ? 'bg-emerald-600 border-emerald-700 text-white'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                                  }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2 text-rose-400">Allergies</label>
                          <div className="flex flex-wrap gap-2">
                            {ALLERGIES.map(a => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => toggleItem(selectedAllergies, setSelectedAllergies, a)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${selectedAllergies.includes(a.toLowerCase())
                                    ? 'bg-rose-500 border-rose-600 text-white'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'
                                  }`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Results Area */}
              <div className="space-y-6 pt-4">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Ancient Wisdom...</p>
                    </div>
                  ) : hasSearched ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {recommendations.length > 0 ? (
                        <>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-400" />
                            Best Matches For You
                          </h3>
                          {recommendations.map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => {
                                onProductSelect(prod.id);
                                setIsOpen(false);
                              }}
                              className="group p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer flex gap-4"
                            >
                              <div className="flex-1 space-y-1">
                                <h4 className="font-bold text-slate-800">{prod.name}</h4>
                                <p className="text-[11px] text-slate-400 font-medium line-clamp-3 italic leading-relaxed">"{prod.expertBenefit}"</p>
                                <div className="flex items-center gap-4 pt-2">
                                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1.5 border border-emerald-100">
                                    <Activity size={12} />
                                    {prod.usageInstructions}
                                  </span>
                                </div>
                              </div>
                              <div className="self-center">
                                <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="py-20 flex flex-col items-center text-center space-y-4 px-10">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <Leaf size={40} />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800 text-lg">We will work on it</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">We couldn't find a direct match right now, but we will work on it and fulfill your need, Thanks.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="py-20 flex flex-col items-center text-center space-y-4 px-10">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                        <MessageSquareHeart size={40} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-lg">Hello! I'm Swasth</h3>
                        <p className="text-sm text-slate-400 font-medium">Ready to guide your wellness journey? Start by typing your goal above.</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-3 text-emerald-700 bg-emerald-100/50 p-4 rounded-xl text-xs font-bold leading-relaxed">
                <Leaf size={18} className="shrink-0" />
                All suggestions are verified by our in-house lab experts for your specific profile.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SwasthAdviser;
