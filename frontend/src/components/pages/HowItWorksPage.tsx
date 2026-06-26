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
  History
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
      <section className="relative pt-40 pb-24 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              The Swasthanand Quality Protocol
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-8">
              Transparency You Can <span className="gradient-text">Trust.</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12">
              We started Swasthanand with a simple question: How can you be sure your food is truly pure? Our traceability system is the answer—a direct connection between you and the soil.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/traceability')}
                className="btn-premium px-10 py-5 text-lg flex items-center gap-3"
              >
                Try it Now <Search size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
           <TreeDeciduous size={600} className="text-emerald-900 translate-x-1/2 -translate-y-1/4" />
        </div>
      </section>

      {/* The Swasthanand Difference */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col lg:flex-row gap-20 items-center">
              <motion.div 
                {...fadeIn}
                className="lg:w-1/2 space-y-8"
              >
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  Beyond Certification: <br/> We Go to the Farm.
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                   Unlike standard organic labels that rely on annual paperwork, **Swasthanand experts visit every farming partner personally**. We test all parameters on-site to ensure that every single product meets the highest standards of purity before it reaches your table.
                </p>
                <div className="space-y-4">
                   {["Soil pH & Organic Carbon Check", "Pesticide-Free Verification", "Sustainable Water Usage Audit", "Real-time Growth Monitoring"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <CheckCircle2 className="text-emerald-500" size={20} />
                         <span className="font-black text-slate-700 uppercase tracking-wide text-sm">{item}</span>
                      </div>
                   ))}
                </div>
              </motion.div>
              <motion.div 
                {...fadeIn}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                 {commitmentPoints.map((point, i) => (
                    <div key={i} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-emerald-200 hover:bg-white transition-all group">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <point.icon size={24} />
                       </div>
                       <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{point.title}</h3>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">{point.desc}</p>
                    </div>
                 ))}
              </motion.div>
           </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-32 px-6 bg-slate-900 text-white rounded-[60px] mx-4 mb-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
           <Leaf size={400} className="rotate-45" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6">How to Trace Your Product</h2>
            <p className="text-slate-400 text-lg font-medium">It only takes a few seconds to verify the purity of your purchase.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-8 shadow-xl`}>
                  <step.icon size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4">{step.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-8 -right-6 text-slate-700">
                    <ArrowRight size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="pb-40 px-6">
        <div className="max-w-4xl mx-auto bg-emerald-50 content-glow rounded-[48px] p-12 md:p-20 text-center border-2 border-emerald-100">
          <motion.div {...fadeIn}>
            <Leaf className="mx-auto text-emerald-600 mb-8" size={60} />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Ready to Trace the Origin?</h2>
            <p className="text-xl text-slate-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of conscious consumers who choose health without compromise. Start your journey into purity today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                 onClick={() => navigate('/')}
                 className="btn-premium px-12 py-5 text-lg"
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
