import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Clock, Leaf, ShieldCheck, Zap,
  Mail, Send, CheckCircle2, ArrowRight, Globe, Share,
  Heart, Sprout, MessageCircle, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }
  })
};

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.message.trim()) e.message = 'Message cannot be empty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    // Simulate sending
    setTimeout(() => setSent(true), 600);
  };

  const stats = [
    { value: '5000+', label: 'Happy Customers' },
    { value: '100%', label: 'Organic Certified' },
    { value: '15+', label: 'Years of Wisdom' },
    { value: '4.9★', label: 'Customer Rating' },
  ];

  const contactItems = [
    {
      icon: Phone,
      label: 'Owner Contact',
      value: '+91 9284939947',
      sub: 'Mon–Sat, 9 AM – 6 PM',
      color: 'from-emerald-400 to-emerald-600',
      bg: 'bg-emerald-50',
      href: 'tel:+919284939947'
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'hello@swasthanand.in',
      sub: 'We reply within 24 hours',
      color: 'from-sky-400 to-sky-600',
      bg: 'bg-sky-50',
      href: 'mailto:hello@swasthanand.in'
    },
    {
      icon: MapPin,
      label: 'Our Farm',
      value: 'Chibde Farm',
      sub: 'Maharashtra, India',
      color: 'from-amber-400 to-amber-600',
      bg: 'bg-amber-50',
      href: '#map'
    },
    {
      icon: Clock,
      label: 'Working Hours',
      value: 'Mon – Sat',
      sub: '9:00 AM – 6:00 PM IST',
      color: 'from-violet-400 to-violet-600',
      bg: 'bg-violet-50',
      href: undefined
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">

      {/* ─── HERO ─── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
            <Sprout size={14} />
            Pure • Natural • Trusted
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-6xl md:text-8xl font-black text-slate-900 leading-none tracking-tighter mb-6">
            Let's <span className="gradient-text">Connect</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Have a question, a bulk order, or just want to talk Ayurveda? We're one message away.
            <span className="block mt-4">
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '1.45rem',
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.4,
                  display: 'inline-block',
                  textShadow: 'none',
                }}
              >
                "Happier way toward healthy life"
              </span>
            </span>
          </motion.p>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all group">
                <div className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{s.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT CARDS ─── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {contactItems.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href ?? '#'}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative bg-white border border-slate-100 rounded-[2rem] p-7 shadow-sm hover:shadow-2xl transition-all overflow-hidden cursor-pointer block"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-[2rem]`} />

              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <div className={`bg-gradient-to-br ${item.color} rounded-xl w-10 h-10 flex items-center justify-center text-white shadow-lg`}>
                  <item.icon size={20} />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">{item.label}</p>
              <p className="text-lg font-black text-slate-800 leading-tight">{item.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">{item.sub}</p>
              {item.href && item.href !== '#' && (
                <ArrowRight size={16} className="absolute top-6 right-6 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              )}
            </motion.a>
          ))}
        </div>
      </section>

      {/* ─── FORM + MAP ─── */}
      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Contact Form */}
          <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10 relative overflow-hidden">

            {/* Decorative leaf */}
            <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
              <Leaf size={140} className="text-emerald-500 rotate-12" />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <MessageCircle size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Send a Message</h2>
                <p className="text-sm text-slate-400 font-medium">We'll get back to you shortly</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Message Sent!</h3>
                  <p className="text-slate-400 font-medium max-w-xs">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', message: '' }); }}
                    className="mt-4 px-8 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-colors text-sm">
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="e.g. Arjun Sharma"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all focus:bg-white focus:border-emerald-400 ${errors.name ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                      />
                      {errors.name && <p className="text-xs text-red-500 font-bold pl-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Phone *</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all focus:bg-white focus:border-emerald-400 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                      />
                      {errors.phone && <p className="text-xs text-red-500 font-bold pl-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email (optional)</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all focus:bg-white focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Message *</label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Tell us how we can help you..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all resize-none focus:bg-white focus:border-emerald-400 ${errors.message ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                    />
                    {errors.message && <p className="text-xs text-red-500 font-bold pl-1">{errors.message}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-premium py-5 rounded-[20px] text-lg font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-200"
                  >
                    <Send size={20} />
                    Send Message
                  </motion.button>

                  <p className="text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    Your information is safe with us. No spam, ever.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Map + Social */}
          <div className="space-y-6">
            <motion.div id="map" variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-emerald-600" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-700">Chibde Farm, Maharashtra</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow shadow-red-200" />
                  <span className="text-xs font-bold text-slate-400">Live</span>
                </div>
              </div>
              <div className="h-72">
                <iframe
                  title="Swasthanand Plant Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2914.457736967536!2d73.9867244!3d16.4674391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc0456f33568567%3A0xb4abf8be13182cb4!2sChibde%20farm!5e1!3m2!1sen!2sin!4v1775714711642!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

            {/* Testimonial card */}
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
              <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none">
                <Leaf size={120} className="rotate-12" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="text-amber-300" />)}
              </div>
              <p className="text-white/90 text-lg font-medium italic leading-relaxed mb-6">
                "Swasthanand products changed my life. Pure, effective and delivered with love. Highly recommend to anyone seeking natural wellness."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-sm">R</div>
                <div>
                  <p className="font-black text-sm">Ramesh Patil</p>
                  <p className="text-white/60 text-xs font-medium">Verified Customer · Pune</p>
                </div>
              </div>
            </motion.div>

            {/* Social links */}
            <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { icon: Heart, label: 'Follow', color: 'from-pink-500 to-rose-500' },
                  { icon: Globe, label: 'Website', color: 'from-blue-500 to-blue-700' },
                  { icon: Share, label: 'Share', color: 'from-sky-400 to-sky-600' },
                ].map(s => (
                  <motion.button key={s.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 rounded-2xl bg-gradient-to-br ${s.color} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md`}>
                    <s.icon size={16} />
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM TRUST STRIP ─── */}
      <section className="border-t border-slate-100 bg-white/70 backdrop-blur-sm py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-6 items-center justify-center">
          {[
            { icon: ShieldCheck, text: '100% Organic Certified' },
            { icon: Leaf, text: 'Zero Pesticides' },
            { icon: Zap, text: 'Fast Dispatch' },
            { icon: CheckCircle2, text: 'Lab Tested Quality' },
          ].map((t, i) => (
            <motion.div key={t.text} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <t.icon size={18} className="text-emerald-500" />
              {t.text}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
