import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Info } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FeedbackForm from '../../components/feedback/FeedbackForm';

/**
 * SRS FR5: Unified Feedback & Enhancement System — Dealer Portal
 *
 * Role-Specific Forms: Dealer portals focus on supply chain and bulk-order management.
 * The FeedbackForm component will automatically surface dealer-specific categories
 * based on the authenticated user's role.
 */
const DealerFeedback: React.FC = () => {
  const { isDarkMode } = useOutletContext<{ isDarkMode?: boolean }>() || {};
  const { user } = useAuth();

  // SRS FR5: Meta-Data Capture — Session ID sourced from sessionStorage or user ID
  const sessionId =
    sessionStorage.getItem('swasthanand_session_id') || user?.id || null;

  const cardClass = isDarkMode
    ? 'bg-white/5 border-white/8 text-white'
    : 'bg-white border-slate-200 text-slate-800';

  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* ── Page Header ── */}
      <div>
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-0.5">
          FR5 · Unified Feedback
        </span>
        <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Supplier Feedback
        </h1>
        <p className={`text-xs font-medium mt-1 ${textMuted}`}>
          Help us improve supply chain operations and B2B service quality.
        </p>
      </div>

      {/* ── Info Banner ── */}
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border ${
          isDarkMode
            ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-300'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}
      >
        <Info size={16} className="shrink-0 mt-0.5" />
        <p className="text-xs font-medium leading-relaxed">
          Your feedback is tied to your supplier account and helps the Swasthanand team improve
          supply chain processes, bulk-order management, and dealer-level services.
        </p>
      </div>

      {/* ── Feedback Form Card ── */}
      <div className={`rounded-2xl border shadow-sm p-6 ${cardClass}`}>
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #0B4F35, #10B981)' }}
          >
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <h2 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Share Your Experience
            </h2>
            <p className={`text-[10px] font-medium ${textMuted}`}>
              All fields marked <span className="text-rose-500">*</span> are required
            </p>
          </div>
        </div>

        {/*
          SRS FR5 FeedbackForm:
          - role from useAuth (DEALER) → shows dealer-specific categories
          - orderId: null (not order-specific in this context)
          - sessionId auto-captured inside FeedbackForm via sessionStorage
          - Continuous Feedback Loop flag auto-applied if category matches Swasth Adviser
        */}
        <FeedbackForm orderId={null} />
      </div>

      {/* ── Footer note (meta-data transparency) ── */}
      <p className={`text-[10px] font-medium text-center ${textMuted}`}>
        Feedback is submitted with your account role and session identifier for quality tracking.
        No personal health data is collected on this form.
      </p>
    </motion.div>
  );
};

export default DealerFeedback;
