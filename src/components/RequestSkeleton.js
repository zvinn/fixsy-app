import React from 'react';

const RequestSkeleton = () => {
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '24px',
            padding: '25px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)'
        }}>
            {/* Status Badge */}
            <div className="skeleton" style={{ position: 'absolute', top: '20px', left: '20px', width: '90px', height: '30px', borderRadius: '20px' }}></div>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div className="skeleton" style={{ width: '150px', height: '24px', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div>
            </div>

            {/* Timeline Area */}
            <div className="skeleton" style={{ width: '100%', height: '60px', margin: '25px 0', borderRadius: '12px' }}></div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div className="skeleton" style={{ height: '60px', borderRadius: '16px' }}></div>
                <div className="skeleton" style={{ height: '60px', borderRadius: '16px' }}></div>
            </div>

            {/* Button */}
            <div className="skeleton" style={{ width: '100%', height: '50px', borderRadius: '16px' }}></div>
        </div>
    );
};

export default RequestSkeleton;
