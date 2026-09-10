// src/components/LazyLoadFallback.tsx
// Loading fallback for lazy-loaded components


interface LazyLoadFallbackProps {
    message?: string;
}

const LazyLoadFallback: React.FC<LazyLoadFallbackProps> = ({ message }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px'
        }}>
            {/* Spinner */}
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3B82F6',
                animation: 'spin 1s linear infinite'
            }} />

            {/* Message */}
            {message && (
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    {message}
                </p>
            )}

            {/* Animation Keyframes */}
            <style>
                {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
            </style>
        </div>
    );
};

export default LazyLoadFallback;
