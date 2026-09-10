// src/components/Rating/StarRating.tsx
import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    size?: number;
    interactive?: boolean;
    color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    setRating,
    size = 24,
    interactive = false,
    color = "#F59E0B"
}) => {
    const [hover, setHover] = useState<number | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent, ratingValue: number) => {
        if (interactive && setRating && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setRating(ratingValue);
        }
    };

    return (
        <div
            role="group"
            aria-label={`Rating: ${rating} out of 5 stars`}
            style={{ display: 'flex', gap: '5px' }}
        >
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                const isFilled = ratingValue <= (hover || rating);

                return (
                    <span
                        key={index}
                        role={interactive ? "button" : "img"}
                        aria-label={`${ratingValue} star${ratingValue > 1 ? 's' : ''}`}
                        tabIndex={interactive ? 0 : -1}
                        onKeyDown={(e) => handleKeyDown(e, ratingValue)}
                        style={{ outline: 'none' }}
                    >
                        <Star
                            size={size}
                            className={interactive ? "star-interactive" : ""}
                            fill={isFilled ? color : "none"}
                            color={isFilled ? color : "#CBD5E1"}
                            style={{
                                cursor: interactive ? 'pointer' : 'default',
                                transition: 'transform 0.2s',
                                transform: interactive && isFilled ? 'scale(1.1)' : 'scale(1)'
                            }}
                            onMouseEnter={() => interactive && setHover(ratingValue)}
                            onMouseLeave={() => interactive && setHover(null)}
                            onClick={() => interactive && setRating && setRating(ratingValue)}
                            aria-hidden="true"
                        />
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;
