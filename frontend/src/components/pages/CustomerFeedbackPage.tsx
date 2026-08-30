import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart } from 'lucide-react';
import FeedbackForm from '../feedback/FeedbackForm';

/**
 * Customer Feedback Page — SRS FR 5
 * Accessible at /feedback on the main website.
 * Allows retail customers to submit feedback focused on Product Efficacy,
 * UI (User Interface), and Swasth Adviser Recommendations.
 */
const CustomerFeedbackPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 pt-28 pb-20 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-2">
            <Heart size={14} className="text-emerald-500" />
            Customer Experience
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Feedback</h1>
          <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
            Your voice helps us ensure authentic quality, pure ingredients, and a seamless digital experience.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, #0B4F35, #10B981)' }}
            >
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Share Your Feedback</h2>
              <p className="text-xs text-slate-400 font-medium">Fields marked with * are required</p>
            </div>
          </div>

          <FeedbackForm />
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerFeedbackPage;
