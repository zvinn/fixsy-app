import React from 'react';

const SkeletonCard = () => {
    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '15px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        }}>
            {/* Avatar Skeleton */}
            <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0 }}></div>

            <div style={{ flex: 1 }}>
                {/* Name Skeleton */}
                <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '8px' }}></div>
                {/* Info Skeleton */}
                <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '4px' }}></div>
                <div className="skeleton" style={{ width: '30%', height: '14px' }}></div>
            </div>

            {/* Price/Rating Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                <div className="skeleton" style={{ width: '40px', height: '18px' }}></div>
                <div className="skeleton" style={{ width: '50px', height: '14px' }}></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
