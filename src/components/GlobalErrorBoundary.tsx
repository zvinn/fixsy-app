// src/components/GlobalErrorBoundary.tsx
/**
 * Global Error Boundary Component
 * Catches React rendering errors and displays user-friendly fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '../services/errorLogger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to our centralized error service
        errorLogger.logError(error, {
            severity: 'critical',
            context: 'React Error Boundary',
            componentStack: errorInfo.componentStack ?? null
        });

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });

        // Reload the page to reset the app state
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '40px',
                        maxWidth: '500px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>😔</div>
                        <h1 style={{
                            color: '#1E293B',
                            marginBottom: '15px',
                            fontSize: '24px',
                            fontWeight: 'bold'
                        }}>
                            عذراً! حدث خطأ غير متوقع
                        </h1>
                        <p style={{
                            color: '#64748B',
                            marginBottom: '30px',
                            fontSize: '16px',
                            lineHeight: '1.6'
                        }}>
                            نعتذر عن هذا الإزعاج. تم تسجيل المشكلة وسنعمل على حلها في أقرب وقت.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                background: '#FEF2F2',
                                padding: '15px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                textAlign: 'left'
                            }}>
                                <summary style={{
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginBottom: '10px'
                                }}>
                                    تفاصيل الخطأ (للمطورين)
                                </summary>
                                <pre style={{
                                    fontSize: '12px',
                                    overflow: 'auto',
                                    color: '#991B1B',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '15px 40px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                transition: 'transform 0.2s',
                                width: '100%'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            🔄 إعادة تحميل التطبيق
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
