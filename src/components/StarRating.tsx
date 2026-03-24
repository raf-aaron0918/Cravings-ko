"use client";
import { useState } from 'react';
import styles from './StarRating.module.css';

type StarRatingProps = {
  rating: number;
  max?: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
};

export default function StarRating({ rating, max = 5, onRate, interactive = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const displayRating = Math.max(0, Math.min(rating, max));

  return (
    <div className={styles.container}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hover || displayRating);
        
        return (
          <span
            key={starValue}
            className={`${styles.star} ${isActive ? styles.active : ''} ${interactive ? styles.interactive : ''}`}
            onMouseEnter={() => interactive && setHover(starValue)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate && onRate(starValue)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
