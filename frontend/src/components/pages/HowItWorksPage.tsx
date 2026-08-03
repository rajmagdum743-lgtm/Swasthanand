import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Droplets, 
  Microscope, 
  UserCheck, 
  ArrowRight,
  Leaf,
  CheckCircle2,
  TreeDeciduous,
  History,
  Sprout,
  FileCheck,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const steps = [
    {
      icon: Search,
      title: "Find your Batch ID",
      desc: "Every product package features a unique Batch ID on the label or QR code.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: MapPin,
      title: "Enter on Traceability Page",
      desc: "Visit our Traceability portal and enter the ID to access the secure ledger.",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: History,
      title: "Unlock the Journey",
      desc: "Instantly view the farm location, harvest date, and specific growth conditions.",
      color: "bg-amber-50 text-amber-600"
    }
  ];

  const commitmentPoints = [
    {
      icon: UserCheck,
      title: "Direct Field Visits",
      desc: "The Swasthanand team physically goes to each farm. We don't just rely on paperwork; we meet the farmers and walk the land personally."
    },
    {
      icon: Microscope,
      title: "Parameter Verification",
      desc: "On-site testing of all critical parameters including soil organic carbon, moisture levels, and water purity to ensure ideal growing conditions."
    },
    {
      icon: Droplets,
      title: "No Synthetic Input",
      desc: "Our field experts verify that only natural bio-fertilizers and pest-management systems are used, ensuring zero chemical residue."
    },
    {
      icon: ShieldCheck,
      title: "Batch Certification",
      desc: "Only products that pass our strict internal audit are assigned a digital certificate and batch ID for the marketplace."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-28 md:pt-40 pb-16 md:pb-24 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 md:mb-8">
              The Swasthanand Quality Protocol
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-4 md:mb-8">
              Transparency You Can <span className="gradient-text">Trust.</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-8 md:mb-12">
              We started Swasthanand with a simple question: How can you be sure your food is truly pure? Our traceability system is the answer—a direct connection between you and the soil.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/traceability')}
                className="btn-premium px-8 md:px-10 py-4 md:py-5 text-base md:text-lg flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Try it Now <Search size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none hidden sm:block">
           <TreeDeciduous size={600} className="text-emerald-900 translate-x-1/2 -translate-y-1/4" />
        </div>
      </section>

      {/* The Swasthanand Difference */}
      <section className="py-16 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col lg:flex-row gap-10 md:gap-20 items-center">
              <motion.div 
                {...fadeIn}
                className="lg:w-1/2 space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={16} /> Direct Verification
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  Beyond Certification: Instant Real-time Soil & Lab Audit
                </h2>
                <p className="text-slate-600 font-medium text-lg leading-relaxed">
                  Traditional organic logos often rely on annual audits. At Swasthanand, every harvest batch is audited independently before distribution.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    "Soil N-P-K nutrient breakdown attached to batch ID",
                    "Harvest date, location pin, and farmer identity",
                    "Pesticide-free laboratory test certificates"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-700 font-bold text-sm md:text-base">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs shrink-0">✓</div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div {...fadeIn} className="lg:w-1/2 w-full">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200" 
                    alt="Organic Farming Soil Test" 
                    className="w-full h-[320px] md:h-[480px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6 md:p-8 text-white">
                    <div>
                      <p className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">Field Visit Record</p>
                      <h3 className="text-xl md:text-2xl font-black">Soil Nutrient & Moisture Logged Live</h3>
                    </div>
                  </div>
                </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* The 4 Step Protocol */}
      <section className="bg-slate-900 text-white py-16 md:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-20 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/30">
              End-to-End Pipeline
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">From Soil to Doorstep</h2>
            <p className="text-slate-400 font-medium text-sm md:text-base">How Swasthanand ensures complete authenticity at every stage of production.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Sprout,
                step: "Step 01",
                title: "Organic Sourcing",
                desc: "Harvested naturally without synthetic pesticides or harmful chemical fertilizers."
              },
              {
                icon: FileCheck,
                step: "Step 02",
                title: "Lab Testing",
                desc: "Soil parameters, moisture levels, and purity certificates uploaded directly to the platform."
              },
              {
                icon: ShieldCheck,
                step: "Step 03",
                title: "Batch Sealing",
                desc: "Unique QR Batch IDs issued for each lot ensuring tamper-proof tracking."
              },
              {
                icon: Truck,
                step: "Step 04",
                title: "Doorstep Delivery",
                desc: "Direct delivery from verified local warehouses to maintain fresh quality."
              }
            ].map((st, i) => (
              <motion.div 
                key={i} 
                {...fadeIn} 
                className="bg-slate-800/80 border border-slate-700 p-6 md:p-8 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                  <st.icon size={24} />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">{st.step}</span>
                <h3 className="text-lg md:text-xl font-extrabold text-white">{st.title}</h3>
                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">{st.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="pb-24 md:pb-40 px-4 sm:px-6 pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto bg-emerald-50 content-glow rounded-[28px] sm:rounded-[48px] p-6 sm:p-12 md:p-20 text-center border-2 border-emerald-100">
          <motion.div {...fadeIn}>
            <Leaf className="mx-auto text-emerald-600 mb-6 md:mb-8" size={48} />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">Ready to Trace the Origin?</h2>
            <p className="text-sm sm:text-lg md:text-xl text-slate-600 font-medium mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of conscious consumers who choose health without compromise. Start your journey into purity today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                 onClick={() => navigate('/')}
                 className="btn-premium px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                Go to Marketplace
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
