'use client';

import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { rateCurriculum } from '@/lib/actions/curriculum';

interface Props {
    curriculumId: string;
    currentRating: number;
    ratingCount: number;
}

export default function RatingSection({ curriculumId, currentRating, ratingCount }: Props) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setLoading(true);
        try {
            const result = await rateCurriculum({
                curriculumId,
                rating,
                review: review.trim() || undefined,
            });

            if (result.success) {
                setSubmitted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star size={20} className="text-amber-400" />
                Rate This Curriculum
            </h2>

            {submitted ? (
                <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={32}
                                className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
                            />
                        ))}
                    </div>
                    <p className="text-[#10b981] font-bold">Thank you for your feedback!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    size={40}
                                    className={
                                        star <= (hoverRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-white/20'
                                    }
                                />
                            </button>
                        ))}
                    </div>

                    {/* Review Text */}
                    <textarea
                        placeholder="Write a review (optional)..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#10b981]/50 resize-none h-24"
                    />

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || loading}
                        className="w-full bg-[#10b981] hover:bg-[#10b981]/90 disabled:bg-white/10 disabled:text-white/30 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <Send size={18} />
                        Submit Review
                    </button>
                </div>
            )}
        </div>
    );
}
