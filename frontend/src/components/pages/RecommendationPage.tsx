import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Activity,
  Target,
  Heart,
  User,
  Scale,
  Stethoscope,
  Timer,
  Info,
  CheckCircle2
} from 'lucide-react';
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

interface RecommendationResponse {
  profileSummary: {
    bmi: number;
    bmiStatus: string;
    ayurvedicInsight: string;
  };
  recommendations: RecommendedProduct[];
}

const DOSHA_QUESTIONS = [
  {
    id: 'bodyFrame',
    label: 'Body Frame & Weight',
    description: 'Which option best describes your physical build?',
    options: [
      { value: 'vata', label: 'Vata Type (Air)', desc: 'Thin, light-boned, difficult to gain weight.' },
      { value: 'pitta', label: 'Pitta Type (Fire)', desc: 'Medium build, athletic, stable and balanced weight.' },
      { value: 'kapha', label: 'Kapha Type (Earth)', desc: 'Broad, heavy-boned, gains weight easily.' }
    ]
  },
  {
    id: 'skinType',
    label: 'Skin Quality',
    description: 'Describe the natural tendency of your skin:',
    options: [
      { value: 'vata', label: 'Vata Type (Air)', desc: 'Dry, rough, thin, easily gets chapped.' },
      { value: 'pitta', label: 'Pitta Type (Fire)', desc: 'Warm, sensitive, reddish, prone to acne.' },
      { value: 'kapha', label: 'Kapha Type (Earth)', desc: 'Smooth, soft, oily, thick, pale, cool.' }
    ]
  },
  {
    id: 'weatherPref',
    label: 'Weather & Environment Preference',
    description: 'Which weather condition do you find most uncomfortable?',
    options: [
      { value: 'vata', label: 'Vata Type (Air)', desc: 'Cold, dry, and windy climates; I crave heat.' },
      { value: 'pitta', label: 'Pitta Type (Fire)', desc: 'Hot, humid weather; I crave cool breeze/shades.' },
      { value: 'kapha', label: 'Kapha Type (Earth)', desc: 'Damp, cold, and cloudy weather; I crave dryness.' }
    ]
  },
  {
    id: 'mentalState',
    label: 'Mental & Emotional Tendencies',
    description: 'How do you usually react under stress or pressure?',
    options: [
      { value: 'vata', label: 'Vata Type (Air)', desc: 'I get anxious, worried, and my mind races with thoughts.' },
      { value: 'pitta', label: 'Pitta Type (Fire)', desc: 'I get impatient, frustrated, and quick to express anger.' },
      { value: 'kapha', label: 'Kapha Type (Earth)', desc: 'I remain calm, steady, and sometimes seek comfort in sleep.' }
    ]
  },
  {
    id: 'digestionType',
    label: 'Appetite & Digestion',
    description: 'What describes your typical daily digestion pattern?',
    options: [
      { value: 'vata', label: 'Vata Type (Air)', desc: 'Irregular. Sometimes hungry, sometimes forgetting to eat; prone to gas.' },
      { value: 'pitta', label: 'Pitta Type (Fire)', desc: 'Intense and regular. I get irritable if a meal is delayed; prone to acidity.' },
      { value: 'kapha', label: 'Kapha Type (Earth)', desc: 'Slow but steady. I digest slowly and often feel heavy after meals.' }
    ]
  }
];

const RecommendationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [formData, setFormData] = useState({
    age: 30,
    weight: 70,
    height: 170,
    goal: 'weight-loss',
    diseases: [] as string[],
    allergies: [] as string[],
    activityLevel: 'moderate',
    bodyFrame: 'vata',
    skinType: 'vata',
    weatherPref: 'vata',
    mentalState: 'vata',
    digestionType: 'vata'
  });

  const GOALS = [
    { id: 'weight-loss', label: 'Weight Management', icon: Scale },
    { id: 'immunity', label: 'Immunity Boost', icon: Heart },
    { id: 'digestion', label: 'Digestive Health', icon: Activity },
    { id: 'energy', label: 'Energy & Vitality', icon: Sparkles },
    { id: 'skin', label: 'Skin Radiance', icon: User },
    { id: 'joint-pain', label: 'Joint & Bone Health', icon: Stethoscope }
  ];

  const DISEASES = [
    'Diabetes', 'Hypertension', 'Arthritis', 'Asthma', 'Thyroid', 'PCOS', 'Acidity', 'Fatigue'
  ];

  const ALLERGIES = [
    'Dairy', 'Gluten', 'Nuts', 'Turmeric', 'Honey', 'Soy', 'Ginger'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDisease = (disease: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.includes(disease)
        ? prev.diseases.filter(d => d !== disease)
        : [...prev.diseases, disease]
    }));
  };

  const toggleAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const calculateDoshas = () => {
    const answers = [
      formData.bodyFrame,
      formData.skinType,
      formData.weatherPref,
      formData.mentalState,
      formData.digestionType
    ];
    const vata = answers.filter(a => a === 'vata').length;
    const pitta = answers.filter(a => a === 'pitta').length;
    const kapha = answers.filter(a => a === 'kapha').length;

    return {
      vata: Math.round((vata / 5) * 100),
      pitta: Math.round((pitta / 5) * 100),
      kapha: Math.round((kapha / 5) * 100)
    };
  };

  const getDominantDoshaDesc = () => {
    const doshaValues = calculateDoshas();
    const dominant = Object.entries(doshaValues).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    switch (dominant) {
      case 'vata':
        return 'Dominant: Vata (Air & Space). You tend to be creative, active, and light on your feet, but are prone to anxiety, cold sensitivity, and dry skin when out of balance.';
      case 'pitta':
        return 'Dominant: Pitta (Fire & Water). You are highly focused, sharp, and ambitious, but have a tendency toward inflammation, anger, and heat sensitivity when out of balance.';
      case 'kapha':
        return 'Dominant: Kapha (Earth & Water). You possess a calm, loving, and steady nature with great stamina, but can experience slow digestion and lethargy when out of balance.';
      default:
        return 'Your doshas are in unique balance. We recommend focusing on seasonal changes.';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/recommend`, {
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        goal: formData.goal,
        diseases: formData.diseases,
        allergies: formData.allergies,
        activityLevel: formData.activityLevel
      });
      setResults(response.data);
      setStep(5);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Failed to get recommendations. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const doshaPercentages = calculateDoshas();

  return (
    <div className="pt-28 md:pt-32 pb-24 md:pb-40 px-4 sm:px-6 min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-extrabold tracking-widest uppercase mb-4 md:mb-6 shadow-sm border border-emerald-200/50"
          >
            Personalized Ayurvedic Guide
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">
            Discover Your <span className="gradient-text">Path to Balance</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Our expert recommendation engine combines ancient Ayurvedic wisdom with your unique health profile to suggest the purest natural solutions.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-morphism p-5 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 shadow-2xl relative overflow-hidden">

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Vitals & Body Metrics</h2>
                    <p className="text-slate-500 font-medium">Let's start with your basic physical attributes.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 transition-all text-lg font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                      className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 transition-all text-lg font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                      className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100/50 transition-all text-lg font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button onClick={nextStep} className="btn-premium px-10 py-4 group">
                    <span>Next Phase</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Prakriti (Dosha) Quiz</h2>
                    <p className="text-slate-500 font-medium">Select traits that represent your natural defaults.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {DOSHA_QUESTIONS.map((q) => (
                    <div key={q.id} className="space-y-3">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">{q.label}</label>
                      <p className="text-xs text-slate-400 italic px-2">{q.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {q.options.map((opt) => {
                          const isSelected = (formData as any)[q.id] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleInputChange(q.id, opt.value)}
                              className={`p-4 rounded-2xl border text-left transition-all ${isSelected
                                ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-[1.01]'
                                : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-600'
                              }`}
                            >
                              <div className="font-bold text-sm mb-1">{opt.label}</div>
                              <div className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="flex items-center gap-2 px-8 py-4 font-bold text-slate-500 hover:text-emerald-500 transition-colors">
                    <ChevronLeft size={20} />
                    <span>Back</span>
                  </button>
                  <button onClick={nextStep} className="btn-premium px-10 py-4 group">
                    <span>Next Phase</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Target size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Health Goal</h2>
                    <p className="text-slate-500 font-medium">What is your primary focus for this transition?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleInputChange('goal', goal.id)}
                      className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 group ${formData.goal === goal.id
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-xl shadow-emerald-200 scale-[1.02]'
                        : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-600'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl transition-colors ${formData.goal === goal.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        <goal.icon size={28} />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{goal.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="flex items-center gap-2 px-8 py-4 font-bold text-slate-500 hover:text-emerald-500 transition-colors">
                    <ChevronLeft size={20} />
                    <span>Back</span>
                  </button>
                  <button onClick={nextStep} className="btn-premium px-10 py-4 group">
                    <span>Next Phase</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Existing Conditions</h2>
                    <p className="text-slate-500 font-medium">Select any conditions we should account for.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {DISEASES.map((disease) => (
                    <button
                      key={disease}
                      onClick={() => toggleDisease(disease.toLowerCase())}
                      className={`px-6 py-3 rounded-full font-bold text-sm transition-all border ${formData.diseases.includes(disease.toLowerCase())
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-300'
                      }`}
                    >
                      {disease}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Any Allergies?</label>
                  <div className="flex flex-wrap gap-3">
                    {ALLERGIES.map((allergy) => (
                      <button
                        key={allergy}
                        onClick={() => toggleAllergy(allergy.toLowerCase())}
                        className={`px-6 py-2 rounded-full font-bold text-xs transition-all border ${formData.allergies.includes(allergy.toLowerCase())
                          ? 'bg-rose-500 border-rose-600 text-white shadow-lg'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500'
                        }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Activity Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['sedentary', 'moderate', 'active'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleInputChange('activityLevel', level)}
                        className={`p-4 rounded-2xl font-bold text-sm capitalize transition-all border ${formData.activityLevel === level
                          ? 'bg-slate-800 border-slate-900 text-white shadow-lg'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button onClick={prevStep} className="flex items-center gap-2 px-8 py-4 font-bold text-slate-500 hover:text-emerald-500 transition-colors">
                    <ChevronLeft size={20} />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-premium px-12 py-4 disabled:opacity-50 flex items-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                    <span>Get My Recommendations</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && results && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                {/* Results Header */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                      <Sparkles size={28} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Personalized Protocol</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                        <Scale size={80} />
                      </div>
                      <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">BMI Assessment</p>
                      <div className="text-5xl font-black mb-2">{results.profileSummary.bmi}</div>
                      <div className="text-xl font-bold opacity-90">{results.profileSummary.bmiStatus}</div>
                    </div>
                    <div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-xl shadow-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Info size={80} />
                      </div>
                      <p className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">Ayurvedic Insight</p>
                      <p className="text-lg font-medium leading-relaxed italic pr-12">
                        "{results.profileSummary.ayurvedicInsight}"
                      </p>
                    </div>
                  </div>

                  {/* Dosha Progress Bar Report */}
                  <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-lg space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Your Dosha Constitution (Prakriti)</h3>
                      <p className="text-slate-500 font-medium text-sm mt-1">{getDominantDoshaDesc()}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Vata Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-700">
                          <span>Vata (Air & Space)</span>
                          <span>{doshaPercentages.vata}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${doshaPercentages.vata}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-sky-400 to-teal-500"
                          />
                        </div>
                      </div>

                      {/* Pitta Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-700">
                          <span>Pitta (Fire & Water)</span>
                          <span>{doshaPercentages.pitta}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${doshaPercentages.pitta}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-600"
                          />
                        </div>
                      </div>

                      {/* Kapha Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-700">
                          <span>Kapha (Earth & Water)</span>
                          <span>{doshaPercentages.kapha}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${doshaPercentages.kapha}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-600 to-stone-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations List */}
                <div className="space-y-8">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight px-2 flex items-center gap-2">
                    Expert Practitioner Highlights
                    <span className="h-1 flex-1 bg-slate-100 rounded-full ml-4"></span>
                  </h3>

                  <div className="grid grid-cols-1 gap-8">
                    {results.recommendations.map((prod, idx) => (
                      <motion.div
                        key={prod.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group bg-white p-4 md:p-2 md:pr-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 items-center"
                      >
                        <div className="w-full md:w-64 h-48 md:h-64 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shrink-0">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as any).src = "https://images.unsplash.com/photo-1615485290382-441e4d019cb5?auto=format&fit=crop&q=80&w=800";
                            }}
                          />
                        </div>
                        <div className="flex-1 py-2 md:py-4">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <h4 className="text-xl md:text-2xl font-black text-slate-900">{prod.name}</h4>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-tighter border border-emerald-100">
                              Top Suggestion
                            </span>
                          </div>

                          <p className="text-slate-600 font-medium leading-relaxed mb-6 italic text-lg pr-4 border-l-4 border-emerald-500/20 pl-6">
                            "{prod.expertBenefit}"
                          </p>

                          <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 group/tip">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover/tip:bg-emerald-500 group-hover/tip:text-white transition-all">
                                <Activity size={16} />
                              </div>
                              <span className="font-bold text-slate-500">{prod.chosenReason}</span>
                            </div>
                            <div className="flex items-center gap-2 group/tip">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover/tip:bg-emerald-500 group-hover/tip:text-white transition-all">
                                <Timer size={16} />
                              </div>
                              <span className="font-bold text-slate-500">Timeline: {prod.recoveryTimeline}</span>
                            </div>
                            <div className="flex items-center gap-2 group/tip">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover/tip:bg-emerald-500 group-hover/tip:text-white transition-all">
                                <Activity size={16} />
                              </div>
                              <span className="font-bold text-emerald-700">{prod.usageInstructions}</span>
                            </div>
                            <div className="flex items-center gap-2 group/tip">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover/tip:bg-slate-800 group-hover/tip:text-white transition-all">
                                <Sparkles size={16} />
                              </div>
                              <span className="font-bold text-slate-500">{prod.dosageCycle}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="px-12 py-5 rounded-full font-black text-slate-500 hover:text-emerald-600 bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-sm"
                  >
                    Recalculate Protocol
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPage;
