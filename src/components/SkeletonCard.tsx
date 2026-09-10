// src/components/SkeletonCard.tsx


interface SkeletonCardProps {
    className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
    return (
        <div
            role="status"
            aria-label="Loading content"
            className={className}
            style={{
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '15px',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}
        >
            {/* Avatar Skeleton */}
            <div
                className="skeleton"
                aria-hidden="true"
                style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0 }}
            ></div>

            <div style={{ flex: 1 }}>
                {/* Name Skeleton */}
                <div
                    className="skeleton"
                    aria-hidden="true"
                    style={{ width: '60%', height: '20px', marginBottom: '8px' }}
                ></div>
                {/* Info Skeleton */}
                <div
                    className="skeleton"
                    aria-hidden="true"
                    style={{ width: '40%', height: '14px', marginBottom: '4px' }}
                ></div>
                <div
                    className="skeleton"
                    aria-hidden="true"
                    style={{ width: '30%', height: '14px' }}
                ></div>
            </div>

            {/* Price/Rating Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                <div
                    className="skeleton"
                    aria-hidden="true"
                    style={{ width: '40px', height: '18px' }}
                ></div>
                <div
                    className="skeleton"
                    aria-hidden="true"
                    style={{ width: '50px', height: '14px' }}
                ></div>
            </div>

            {/* Screen reader text */}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default SkeletonCard;
