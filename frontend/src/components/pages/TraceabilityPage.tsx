import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, Droplets, Thermometer,
  ShieldCheck, ArrowRight, Sprout, Tractor, PackageCheck,
  Truck, Globe, AlertCircle, Copy, Check, Leaf,
  Star, FileText, Scan, Clock, CheckCircle2, Info
} from 'lucide-react';

interface BatchData {
  id: string;
  harvestDate: string;
  region: string;
  soilTestUrl: string;
  weatherSnapshot: string;
}

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } })
};

const TraceabilityPage: React.FC = () => {
  const { batchId: urlBatchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(urlBatchId || '');
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    if (urlBatchId) fetchBatchDetails(urlBatchId);
  }, [urlBatchId]);

  const fetchBatchDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/products/batch/${id}`);
      if (!response.ok) throw new Error('Batch not found. Please check the ID and try again.');
      const product = await response.json();
      setBatchData({
        id: product.batchId || product.id,
        harvestDate: product.harvestDate || 'Jan 20, 2024',
        region: product.origin || 'Unknown Region',
        soilTestUrl: product.certificateUrl || '#',
        weatherSnapshot: product.weatherTemp || '28°C'
      });
    } catch (err: any) {
      setError(err.name === 'AbortError'
        ? 'Request timed out. Please check if the backend is running.'
        : err.message || 'Something went wrong.');
      setBatchData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/traceability/${searchInput.trim()}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timelineSteps = [
    {
      icon: Sprout, label: 'Seed Sowing', date: 'Oct 15, 2023',
      desc: 'Non-GMO seeds sown in rich black cotton soil. Soil pH verified at 6.8 — ideal for organic growth.',
      color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', badge: 'Certified Organic'
    },
    {
      icon: Droplets, label: 'Cultivation', date: 'Nov – Dec 2023',
      desc: 'Natural drip irrigation & zero chemical pesticides. Compost-based fertilisation only.',
      color: 'from-sky-400 to-sky-600', bg: 'bg-sky-50', badge: 'Zero Pesticides'
    },
    {
      icon: Tractor, label: 'Harvesting', date: batchData?.harvestDate || 'Jan 20, 2024',
      desc: 'Hand-picked at peak maturity by skilled farmers. Cold-stored within 2 hrs of harvest.',
      color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', badge: 'Hand Picked'
    },
    {
      icon: PackageCheck, label: 'Quality Testing', date: 'Jan 22, 2024',
      desc: 'NABL-accredited lab verified: Zero pesticide residue, heavy metals tested, purity confirmed.',
      color: 'from-violet-400 to-violet-600', bg: 'bg-violet-50', badge: 'Lab Verified'
    },
    {
      icon: Truck, label: 'Dispatch', date: 'In Transit',
      desc: 'Temperature-controlled packaging. Direct farm-to-hub logistics. No middlemen involved.',
      color: 'from-rose-400 to-rose-600', bg: 'bg-rose-50', badge: 'Direct Dispatch'
    },
  ];

  const trustStats = [
    { icon: ShieldCheck, value: '100%', label: 'Organic Verified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Leaf, value: 'Zero', label: 'Pesticides Used', color: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: Star, value: 'NABL', label: 'Lab Certified', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Clock, value: '<2hrs', label: 'Farm to Cold Store', color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20">

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-32 w-[400px] h-[400px] bg-sky-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
            <Scan size={13} />
            Blockchain-Backed Transparency
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-6xl md:text-8xl font-black text-slate-900 leading-none tracking-tighter mb-6">
            Track Your <span className="gradient-text">Food's</span><br />Journey
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Every product has a story. Enter your batch ID to trace its path —
            from the farm soil to your doorstep.
          </motion.p>

          {/* Search Bar */}
          <motion.form variants={fadeUp} custom={3} initial="hidden" animate="visible"
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Search size={22} />
            </div>
            <input
              id="batch-search"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Enter Batch ID (e.g. SWS-2024-001)"
              className="w-full pl-16 pr-36 py-6 bg-white border-2 border-slate-100 rounded-[28px] shadow-xl shadow-slate-200/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 outline-none transition-all text-lg font-bold"
            />
            <button type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-[20px] font-black text-sm uppercase tracking-wider hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200">
              Verify <ArrowRight size={16} />
            </button>
          </motion.form>

          {/* How it works hint */}
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
            className="flex items-center justify-center gap-2 mt-5 text-slate-400 text-sm font-medium">
            <Info size={14} />
            Find the Batch ID printed on your product package or QR code
          </motion.div>
        </div>
      </section>

      {/* ── TRUST STATS ── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustStats.map((s, i) => (
            <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white border border-slate-100 rounded-3xl p-5 text-center shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
              <div className={`w-10 h-10 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── RESULTS AREA ── */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck size={28} className="text-emerald-500" />
                  </div>
                </div>
                <p className="font-black uppercase tracking-widest text-sm text-slate-400 animate-pulse">Accessing Secure Ledger...</p>
              </motion.div>
            )}

            {/* Error */}
            {!loading && error && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="max-w-md mx-auto">
                <div className="bg-red-50 border-2 border-red-100 rounded-[32px] p-10 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <AlertCircle size={30} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-red-900 mb-2">Batch Not Found</h3>
                  <p className="text-red-600 font-medium text-sm leading-relaxed">{error}</p>
                  <div className="mt-4 px-4 py-2 bg-red-100 rounded-xl text-xs font-black text-red-400 uppercase tracking-widest inline-block">
                    Code: TRACE_NOT_FOUND
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data */}
            {!loading && !error && batchData && (
              <motion.div key="data" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }} className="space-y-10">

                {/* ── BATCH ID CARD (QR-style) ── */}
                <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
                  className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-16 -left-8 w-64 h-64 bg-white/5 rounded-full" />

                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse" />
                        <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">Verified Batch</span>
                      </div>
                      <h2 className="text-3xl font-black tracking-tight mb-1">Batch Authenticated ✓</h2>
                      <p className="text-white/70 font-medium text-sm">This product has been traced and verified by Swasthanand</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-4 min-w-[220px]">
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Batch ID</p>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black font-mono">{batchData.id}</span>
                        <button onClick={() => copyToClipboard(batchData.id)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                          {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                  {/* Left: Journey Timeline */}
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Globe size={22} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Full Journey Map</h2>
                        <p className="text-xs text-slate-400 font-bold">Click each step to learn more</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                      {/* Connecting line */}
                      <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-200 via-sky-200 to-rose-200 hidden md:block rounded-full" />

                      <div className="space-y-4">
                        {timelineSteps.map((step, i) => (
                          <motion.div
                            key={i}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            onClick={() => setActiveStep(activeStep === i ? null : i)}
                            className="flex gap-5 cursor-pointer group"
                          >
                            {/* Icon dot */}
                            <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shrink-0 z-10 shadow-md transition-transform group-hover:scale-110`}>
                              <step.icon size={20} />
                              {i < timelineSteps.length - 1 && (
                                <CheckCircle2 size={14} className="absolute -bottom-1 -right-1 bg-white rounded-full text-emerald-500" />
                              )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 bg-slate-50 group-hover:bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${activeStep === i ? 'border-emerald-200 bg-white shadow-md' : 'border-transparent'}`}>
                              <div className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-black text-slate-800">{step.label}</h4>
                                  <span className={`hidden sm:inline-flex px-2 py-0.5 ${step.bg} text-[10px] font-black uppercase tracking-wider rounded-full`}>
                                    {step.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-lg">
                                  {step.date}
                                </span>
                              </div>

                              <AnimatePresence>
                                {activeStep === i && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <p className="px-5 pb-4 text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-3">
                                      {step.desc}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Info size={12} />
                      Click any step above to expand details
                    </div>
                  </div>

                  {/* Right: Info cards */}
                  <div className="space-y-5">
                    {/* Origin card */}
                    <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] p-7 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><MapPin size={100} /></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin size={16} className="text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Origin</span>
                        </div>
                        <h3 className="text-2xl font-black mb-1">{batchData.region}</h3>
                        <p className="text-white/50 text-sm font-medium">Certified Organic Farming Zone</p>
                        <div className="mt-5 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-xs font-bold text-white/60">Location Verified</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Weather & Harvest */}
                    <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                          <Thermometer size={18} className="text-orange-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Temp</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{batchData.weatherSnapshot}</p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                          <Calendar size={18} className="text-emerald-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Harvest</p>
                        <p className="text-base font-black text-slate-900 mt-1 leading-tight">{batchData.harvestDate}</p>
                      </div>
                    </motion.div>

                    {/* Soil Report */}
                    <motion.a
                      href={batchData.soilTestUrl}
                      target="_blank"
                      rel="noreferrer"
                      variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      whileHover={{ scale: 1.02 }}
                      className="block bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-[2rem] p-6 group transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-500 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:text-white transition-all">
                          <FileText size={22} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-800 text-sm">Soil Analysis Report</h4>
                          <p className="text-slate-400 text-xs font-medium mt-0.5">100% Organic · Lab Certified</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.a>

                    {/* Trust badge */}
                    <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-[2rem] p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck size={20} className="text-emerald-600" />
                        <span className="text-sm font-black text-emerald-800">Swasthanand Quality Promise</span>
                      </div>
                      <div className="space-y-2">
                        {['Zero Pesticides', 'Cold Chain Maintained', 'No Additives / Preservatives', 'Direct from Farmer'].map(item => (
                          <div key={item} className="flex items-center gap-2">
                            <Check size={13} className="text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-emerald-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && !error && !batchData && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-24 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                    <Search size={44} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Scan Your Product</h3>
                  <p className="text-slate-400 font-medium leading-relaxed mb-8">
                    Enter the Batch ID printed on your product package or scan the QR code to instantly verify its origin and journey.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: Sprout, label: 'Farm Origin' },
                      { icon: ShieldCheck, label: 'Lab Tested' },
                      { icon: Truck, label: 'Live Tracking' },
                    ].map(item => (
                      <div key={item.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <item.icon size={20} className="text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-tight text-center">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default TraceabilityPage;
