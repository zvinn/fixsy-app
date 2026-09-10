// src/components/ErrorBoundary.tsx
// Error Boundary component for graceful error handling
import { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorUtils';

interface ErrorBoundaryProps {
    children: ReactNode;
    language?: 'ar' | 'en';
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ error, errorInfo });
        // Log error using utility
        logError('ErrorBoundary', { error, errorInfo });
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            const { language = 'ar' } = this.props;
            const isAr = language === 'ar';

            return (
                <main
                    role="alert"
                    aria-live="assertive"
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                        padding: '20px',
                        direction: isAr ? 'rtl' : 'ltr'
                    }}
                >
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '40px',
                        maxWidth: '500px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        {/* Error Icon */}
                        <div style={{ fontSize: '64px', marginBottom: '20px' }} aria-hidden="true">
                            😵
                        </div>

                        {/* Title */}
                        <h1 style={{
                            color: '#FFFFFF',
                            fontSize: '1.5rem',
                            marginBottom: '15px',
                            fontWeight: '700'
                        }}>
                            {isAr ? 'حدث خطأ غير متوقع' : 'Something Went Wrong'}
                        </h1>

                        {/* Message */}
                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            marginBottom: '30px',
                            lineHeight: '1.6'
                        }}>
                            {isAr
                                ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'
                                : 'We apologize for the inconvenience. Please try again.'}
                        </p>

                        {/* Retry Button */}
                        <button
                            onClick={this.handleRetry}
                            aria-label={isAr ? 'إعادة المحاولة' : 'Try Again'}
                            style={{
                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '14px 32px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                            }}
                            onMouseOver={(e) => {
                                (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                            }}
                        >
                            <span aria-hidden="true">🔄 </span>
                            {isAr ? 'إعادة المحاولة' : 'Try Again'}
                        </button>

                        {/* Error Details (Development Only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                marginTop: '30px',
                                textAlign: 'left',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                                <summary style={{
                                    color: '#FCA5A5',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }}>
                                    Error Details (Dev Only)
                                </summary>
                                <pre style={{
                                    color: '#FEE2E2',
                                    fontSize: '0.75rem',
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
