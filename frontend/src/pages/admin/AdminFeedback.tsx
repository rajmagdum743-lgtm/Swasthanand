import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, Star, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

/**
 * SRS FR5: Unified Feedback & Enhancement System — Admin Review Panel
 *
 * Continuous Feedback Loop: Customer ratings tied to Swasth Adviser
 * recommendations must automatically flag low-rated suggestions for admin review.
 *
 * This page fetches all submitted feedback and highlights entries where
 * flaggedForAdminReview = true (i.e. Swasth Adviser recommendations rated ≤ 2 stars).
 */

interface FeedbackEntry {
  id: string;
  category: string;
  rating: number;
  comments?: string | null;
  role: string;
  orderId?: string | null;
  sessionId?: string | null;
  flaggedForAdminReview?: boolean;
  createdAt?: string;
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={13}
        className={s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
      />
    ))}
    <span className="ml-1.5 text-[10px] font-bold text-slate-500">{STAR_LABELS[rating]}</span>
  </div>
);

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedback(Array.isArray(data) ? data : []);
      } else {
        setError(`Server returned ${res.status}. Make sure the backend is running.`);
      }
    } catch {
      setError('Unable to reach server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // SRS FR5 Continuous Feedback Loop: flagged entries = low-rated Swasth Adviser feedback
  const flaggedEntries = feedback.filter(f => f.flaggedForAdminReview);
  const allEntries = feedback;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest block mb-0.5">
            FR5 · Unified Feedback
          </span>
          <h1 className="text-2xl font-black text-slate-800">Feedback Review</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            All submitted feedback — flagged low-rated Swasth Adviser entries are highlighted for review.
          </p>
        </div>
        <button
          id="feedback-refresh-btn"
          onClick={fetchFeedback}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-500/20 bg-teal-50 text-teal-700 text-xs font-black hover:bg-teal-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── SRS FR5 Continuous Feedback Loop: Flagged entries banner ── */}
      {!loading && flaggedEntries.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-rose-700">
              {flaggedEntries.length} flagged entr{flaggedEntries.length === 1 ? 'y' : 'ies'} require admin review
            </p>
            <p className="text-[10px] font-medium text-rose-500 mt-0.5">
              These are low-rated Swasth Adviser recommendations (≤ 2 stars) automatically flagged per SRS FR5.
            </p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 size={28} className="animate-spin text-teal-600" />
          <p className="text-xs font-bold text-slate-400">Loading feedback entries…</p>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-700">Could not load feedback</p>
            <p className="text-[10px] font-medium text-amber-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && allEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 bg-white rounded-2xl border border-slate-200">
          <MessageSquare size={28} className="text-slate-300" />
          <p className="text-sm font-black text-slate-400">No feedback submissions yet</p>
          <p className="text-xs font-medium text-slate-400">
            Feedback submitted through Customer and Dealer portals will appear here.
          </p>
        </div>
      )}

      {/* ── Feedback table ── */}
      {!loading && !error && allEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Category</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Order / Session</th>
                  <th className="p-4">Comments</th>
                  <th className="p-4 text-center">Review Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {allEntries.map(entry => (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.flaggedForAdminReview
                        ? 'bg-rose-50/60 hover:bg-rose-50'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-extrabold text-slate-800">{entry.category}</span>
                    </td>
                    <td className="p-4">
                      <StarDisplay rating={entry.rating} />
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                          entry.role === 'DEALER'
                            ? 'bg-emerald-100 text-emerald-700'
                            : entry.role === 'ADMIN'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {entry.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px]">
                      {entry.orderId && (
                        <div>Order: {entry.orderId}</div>
                      )}
                      {entry.sessionId && (
                        <div className="text-slate-400">
                          Session: {String(entry.sessionId).slice(0, 12)}…
                        </div>
                      )}
                      {!entry.orderId && !entry.sessionId && (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs text-slate-600 font-medium">
                      {entry.comments || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-4 text-center">
                      {entry.flaggedForAdminReview ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-100 text-rose-600 border border-rose-200">
                          <AlertTriangle size={10} />
                          Review Required
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminFeedback;
