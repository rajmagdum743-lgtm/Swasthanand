import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit, HeartPulse, Leaf, Loader2, Settings2, User, Scale, Activity } from 'lucide-react';
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

interface GoalSuggesterProps {
  onProductSelect: (productId: string) => void;
}

const DISEASES = ['Diabetes', 'Hypertension', 'Arthritis', 'Asthma', 'Thyroid', 'PCOS', 'Acidity', 'Fatigue'];
const ALLERGIES = ['Dairy', 'Gluten', 'Nuts', 'Turmeric', 'Honey', 'Soy', 'Ginger'];

const GoalSuggester: React.FC<GoalSuggesterProps> = ({ onProductSelect }) => {
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
    <section className="py-24 px-6 mb-20 relative overflow-hidden bg-slate-50/50">
      <div className="absolute top-0 right-0 -z-0 opacity-10 blur-3xl overflow-hidden pointer-events-none">
        <div className="w-[800px] h-[800px] bg-emerald-300 rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Input & Text */}
          <div className="space-y-8 relative z-10">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-black tracking-widest uppercase mb-6 border border-emerald-100"
              >
                <BrainCircuit size={16} />
                Smart Goal Assistant
              </motion.div>
              <h2 className="text-5xl font-black text-slate-900 leading-[1.1] mb-6">
                What is your <br />
                <span className="gradient-text">Wellness Goal?</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                Describe your goal in natural language. We'll cross-reference your profile to find your perfect match.
              </p>
            </div>

            <form onSubmit={handleSuggest} className="space-y-4 max-w-lg">
              <div className="relative group">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., I want to improve my skin and boost energy"
                  className="w-full bg-white p-6 pr-20 rounded-3xl border-2 border-slate-100 focus:border-emerald-500 shadow-xl shadow-slate-200/50 outline-none text-lg font-bold transition-all placeholder:text-slate-300 group-hover:border-emerald-200"
                />
                <button
                  type="submit"
                  disabled={loading || !goal.trim()}
                  className="absolute right-3 top-3 bottom-3 px-6 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-200 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                </button>
              </div>

              {/* Advanced Personalization Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${showAdvanced ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
                  }`}
              >
                <Settings2 size={18} />
                {showAdvanced ? 'Hide Personalization' : 'Personalize Suggestions'}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden bg-white rounded-3xl border border-slate-100 p-6 shadow-inner space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Age</label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                            placeholder="30"
                            className="w-full p-3 pl-12 rounded-xl bg-slate-50 border border-slate-100 focus:border-emerald-500 outline-none font-bold text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Weight (kg)</label>
                        <div className="relative">
                          <Scale size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : '')}
                            placeholder="70"
                            className="w-full p-3 pl-12 rounded-xl bg-slate-50 border border-slate-100 focus:border-emerald-500 outline-none font-bold text-sm"
                          />
                        </div>
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedDiseases.includes(d.toLowerCase())
                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200'
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedAllergies.includes(a.toLowerCase())
                                ? 'bg-rose-500 border-rose-600 text-white'
                                : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-rose-200'
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

          {/* Right Side: Results */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                >
                  <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-slate-400 font-black uppercase tracking-widest animate-pulse font-outfit">Analyzing Metrics...</p>
                </motion.div>
              ) : hasSearched ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                      <Sparkles className="text-amber-400" size={18} />
                      Top Recommended Protocols
                    </h3>
                  </div>
                  {recommendations.length > 0 ? (
                    recommendations.map((prod, idx) => (
                      <motion.div
                        key={prod.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => onProductSelect(prod.id)}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] cursor-pointer transition-all flex gap-6 items-center group/card"
                      >
                        <div className="w-28 h-28 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as any).src = "https://images.unsplash.com/photo-1615485290382-441e4d019cb5?auto=format&fit=crop&q=80&w=800";
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-800 text-lg">{prod.name}</h4>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
                              Personalized
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed italic pr-4">
                            "{prod.expertBenefit}"
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1">
                            <div className="flex items-center gap-2 text-[11px] font-extrabold text-emerald-600">
                              <Activity size={14} />
                              {prod.usageInstructions}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400">
                              <Sparkles size={14} className="text-amber-300" />
                              {prod.recoveryTimeline}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover/card:bg-emerald-500 group-hover/card:text-white transition-all">
                          <ArrowRight size={20} />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <Leaf size={32} />
                      </div>
                      <p className="text-slate-500 font-bold max-w-xs">
                        Nature is vast! Adjust your metrics or goal to find a matching herb.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="aspect-square bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg flex flex-col justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                    <HeartPulse className="text-rose-500 group-hover:scale-110 transition-transform" size={40} />
                    <p className="font-black text-slate-800 tracking-tighter text-lg leading-tight">Heart <br />Vitality</p>
                  </div>
                  <div className="aspect-square bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between text-white group translate-y-8 cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Sparkles size={120} />
                    </div>
                    <Sparkles className="text-amber-400 group-hover:rotate-12 transition-transform relative z-10" size={40} />
                    <p className="font-black tracking-tighter text-lg leading-tight relative z-10">Instant <br />Energy</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoalSuggester;
