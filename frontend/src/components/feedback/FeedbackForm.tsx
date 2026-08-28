import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';

// ─── SRS FR5: Role-specific feedback categories ─────────────────────────────
// Customer portals focus strictly on product efficacy and UI (+ Swasth Adviser for Continuous Feedback Loop)
// Dealer portals focus strictly on supply chain and bulk-order management
const CUSTOMER_CATEGORIES = [
  'Product Efficacy',
  'UI (User Interface)',
  'Swasth Adviser Recommendation',
];

const DEALER_CATEGORIES = [
  'Supply Chain',
  'Bulk-Order Management',
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface FeedbackFormProps {
  /** Passed by parent — e.g. last order ID or recommendation session ID */
  orderId?: string | null;
  /** Pre-select a category if known */
  defaultCategory?: string;
  /** Called after a successful submission */
  onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  orderId = null,
  defaultCategory = '',
  onSuccess,
}) => {
  const { user } = useAuth();

  // ─── Form state ────────────────────────────────────────────────────────────
  const [category, setCategory] = useState(defaultCategory);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset category if defaultCategory changes
  useEffect(() => {
    if (defaultCategory) setCategory(defaultCategory);
  }, [defaultCategory]);

  // ─── SRS FR5: Role-specific categories ─────────────────────────────────────
  const categories =
    user?.role === 'DEALER' ? DEALER_CATEGORIES : CUSTOMER_CATEGORIES;

  // ─── SRS FR5: Meta-Data Capture ────────────────────────────────────────────
  // Role, Order ID, Session ID — captured automatically, never shown to user
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('swasthanand_session_id');
    if (!sessionId) {
      sessionId = user?.id || `anon-${Date.now()}`;
      sessionStorage.setItem('swasthanand_session_id', sessionId);
    }
    return sessionId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      setErrorMsg('Please select a feedback category.');
      return;
    }
    if (rating < 1) {
      setErrorMsg('Please provide a star rating (1–5).');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    // ─── SRS FR5: Continuous Feedback Loop ───────────────────────────────────
    // Customer ratings tied to Swasth Adviser recommendations must
    // automatically flag low-rated suggestions for admin review.
    // Triggered when category is the Swasth Adviser one AND rating is ≤ 2.
    const flaggedForAdminReview =
      category === 'Swasth Adviser Recommendation' && rating <= 2;

    // ─── Build payload with auto-captured meta-data ───────────────────────────
    const payload = {
      category,
      rating,
      comments: comments.trim() || null,
      // Meta-Data Capture (SRS FR5)
      role: user?.role || 'CUSTOMER',
      orderId: orderId || null,
      sessionId: getSessionId(),
      // Continuous Feedback Loop flag (SRS FR5)
      flaggedForAdminReview,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setCategory(defaultCategory);
        setRating(0);
        setComments('');
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        setErrorMsg(data?.message || 'Submission failed. Please try again.');
        setSubmitStatus('error');
      }
    } catch {
      // Network/connection error — show error, no mock data
      setErrorMsg('Unable to reach server. Please ensure the backend is running.');
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Star label ────────────────────────────────────────────────────────────
  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const displayRating = hoverRating || rating;

  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">Feedback Submitted</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Thank you for helping us improve Swasthanand.
          </p>
        </div>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
        >
          Submit another response
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Category (SRS FR5: Structured Data Collection) ── */}
      <div>
        <label
          htmlFor="feedback-category"
          className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2"
        >
          Feedback Category <span className="text-rose-500">*</span>
        </label>
        <select
          id="feedback-category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-bold text-slate-700 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">Select a category…</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* ── Star Rating (SRS FR5: Structured Data Collection — 1-5 star) ── */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
          Rating <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              id={`star-${star}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= displayRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-xs font-bold text-slate-500">
              {starLabels[displayRating]}
            </span>
          )}
        </div>
      </div>

      {/* ── Comments (optional) ── */}
      <div>
        <label
          htmlFor="feedback-comments"
          className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2"
        >
          Additional Comments <span className="text-slate-400 normal-case font-medium">(optional)</span>
        </label>
        <textarea
          id="feedback-comments"
          value={comments}
          onChange={e => setComments(e.target.value)}
          rows={3}
          placeholder="Share any additional details…"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-medium text-slate-700 outline-none transition-all resize-none"
        />
      </div>

      {/* ── Error message ── */}
      <AnimatePresence>
        {(errorMsg || submitStatus === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ── */}
      <button
        type="submit"
        id="feedback-submit-btn"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #0B4F35 0%, #10B981 100%)' }}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send size={15} />
            Submit Feedback
          </>
        )}
      </button>
    </form>
  );
};

export default FeedbackForm;
