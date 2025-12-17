import React from 'react';

const JobSkeleton = () => {
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '24px',
            padding: '25px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
            {/* Status Badge Skeleton */}
            <div className="skeleton" style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '30px', borderBottomLeftRadius: '20px' }}></div>

            {/* Header Skeleton */}
            <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '10px', borderRadius: '6px' }}></div>

            {/* Meta Row */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="skeleton" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '120px', height: '16px', borderRadius: '4px' }}></div>
            </div>

            {/* Budget Skeleton */}
            <div style={{ marginBottom: '15px' }}>
                <div className="skeleton" style={{ width: '80px', height: '14px', marginBottom: '5px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '100px', height: '28px', borderRadius: '6px' }}></div>
            </div>

            {/* Desc Skeleton */}
            <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '16px', marginBottom: '20px' }}></div>

            {/* Footer Skeleton */}
            <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
                    <div className="skeleton" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '120px', height: '45px', borderRadius: '14px' }}></div>
            </div>
        </div>
    );
};

export default JobSkeleton;
