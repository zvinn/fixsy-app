// src/components/common/OptimizedImage.tsx
import { useState } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: 'blur' | 'empty';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    style = {},
    placeholder = 'blur'
}) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    const handleLoad = (): void => {
        setIsLoaded(true);
    };

    const handleError = (): void => {
        setHasError(true);
        setIsLoaded(true);
    };

    // Advanced: Cloudinary Auto-Optimization
    let finalSrc = src;
    if (src && src.includes('cloudinary.com') && !src.includes('q_auto')) {
        finalSrc = src.replace('/upload/', '/upload/q_auto,f_auto/');
    }

    return (
        <div
            className={`optimized-image-container ${className}`}
            style={{ position: 'relative', overflow: 'hidden', ...style }}
        >
            {/* Skeleton / Placeholder */}
            {!isLoaded && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: '#f0f0f0',
                        animation: 'pulse 1.5s infinite ease-in-out',
                        borderRadius: style?.borderRadius || 'inherit'
                    }}
                />
            )}

            {/* Actual Image */}
            <img
                src={hasError ? 'https://via.placeholder.com/150?text=Image+Error' : finalSrc}
                alt={alt}
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    ...style
                }}
            />

            <style>
                {`
                    @keyframes pulse {
                        0% { background-color: #f0f0f0; }
                        50% { background-color: #e0e0e0; }
                        100% { background-color: #f0f0f0; }
                    }
                `}
            </style>
        </div>
    );
};

export default OptimizedImage;
