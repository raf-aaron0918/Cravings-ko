"use client";
import { useState } from 'react';
import StarRating from './StarRating';
import styles from './OrderReviewForm.module.css';

export default function OrderReviewForm({ orderId, onComplete }: { orderId: string, onComplete: () => void }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback }),
    });
    setLoading(false);
    if (res.ok) {
      onComplete();
    }
  };

  return (
    <div className={`${styles.formBox} handcrafted-border`}>
      <h3>Rate Your Experience</h3>
      <p>How was your meal? Your feedback helps us keep the fire burning! 🔥</p>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.ratingRow}>
          <StarRating rating={rating} onRate={setRating} interactive />
          <span className={styles.ratingText}>{rating}/5 Stars</span>
        </div>
        
        <textarea
          placeholder="Tell us what you loved (or how we can improve)..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Send Feedback ✓'}
        </button>
      </form>
    </div>
  );
}
