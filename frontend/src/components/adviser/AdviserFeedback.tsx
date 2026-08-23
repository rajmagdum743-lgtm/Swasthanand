import React, { useState } from 'react';
import { Star, CheckCircle, Send, MessageSquare } from 'lucide-react';

export const AdviserFeedback: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const HIGH_RATING_CATEGORIES = ['Very helpful', 'Somewhat helpful', 'Not relevant', 'Other'];
  const LOW_RATING_OPTIONS = [
    'Recommendation was not relevant',
    'Product did not match my concern',
    'I wanted different options',
    'Other'
  ];

  const handleRatingClick = (stars: number) => {
    setRating(stars);
    setSelectedCategory('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 bg-emerald-50/80 border border-emerald-100 rounded-3xl text-center space-y-2">
        <CheckCircle size={32} className="text-emerald-600 mx-auto" />
        <h4 className="font-black text-slate-800 text-base">Thank you for your feedback!</h4>
        <p className="text-xs text-slate-500 font-medium">
          {rating <= 3
            ? 'Your feedback has been recorded for review. We are continuously improving our wellness recommendations.'
            : 'We are thrilled that our recommendations matched your wellness journey!'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-4">
      <div className="text-center space-y-1">
        <h4 className="font-extrabold text-slate-800 text-sm">Was this recommendation helpful?</h4>
        <p className="text-[11px] font-medium text-slate-400">Rate your Swasth Adviser experience</p>
      </div>

      {/* 1-5 Star Controls */}
      <div className="flex items-center justify-center gap-2 py-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              className="p-1.5 rounded-full hover:scale-125 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Star
                size={26}
                className={`transition-colors ${
                  isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Conditional Detailed Feedback Form */}
      {rating > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200/60">
          {rating <= 3 ? (
            /* Low Rating Feedback State */
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-700">Thanks for helping us improve. What could be improved?</p>
              <div className="flex flex-wrap gap-2">
                {LOW_RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedCategory(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedCategory === opt
                        ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* High Rating Feedback State */
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-700">What went well?</p>
              <div className="flex flex-wrap gap-2">
                {HIGH_RATING_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Comment Box */}
          <div className="space-y-1">
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Additional comments (optional)..."
              className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Send size={14} />
            <span>Submit Feedback</span>
          </button>
        </form>
      )}
    </div>
  );
};
