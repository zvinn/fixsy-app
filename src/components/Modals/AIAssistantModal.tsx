// src/components/Modals/AIAssistantModal.tsx
import { useRef } from 'react';
import { Sparkles, Mic, Camera, X, Lightbulb, DollarSign, Zap } from 'lucide-react';
import { AIAnalysisResult } from '../../types';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AIAssistantModalProps {
    show: boolean;
    onClose: () => void;
    t: (key: string) => string;
    language: string;
    aiResult: AIAnalysisResult | null;
    isAnalyzing: boolean;
    aiQuery: string;
    setAiQuery: (query: string) => void;
    aiImage: string | null;
    setAiImage: (image: string | null) => void;
    isListening: boolean;
    onVoiceInput: () => void;
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAnalyze: () => void;
    onApplySuggestion: () => void;
    onSmartBook: () => void;
    onBroadcast: () => void;
    onClearResult: () => void;
}

/**
 * AI Assistant Modal Component
 * Provides AI-powered problem analysis with voice and image input
 */
const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
    show,
    onClose,
    t,
    language,
    aiResult,
    isAnalyzing,
    aiQuery,
    setAiQuery,
    aiImage,
    setAiImage,
    isListening,
    onVoiceInput,
    onImageSelect,
    onAnalyze,
    onApplySuggestion,
    onSmartBook,
    onBroadcast,
    onClearResult
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // ✅ Enhanced: Focus trap with Escape key support
    useFocusTrap(modalRef, show, () => {
        onClose();
        onClearResult();
    });

    if (!show) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
            <div ref={modalRef} className="modal-content" style={{ textAlign: 'center', maxWidth: '400px', padding: '25px' }}>
                {/* Close Button */}
                <button
                    className="close-btn"
                    onClick={() => {
                        onClose();
                        onClearResult();
                    }}
                    aria-label={t("close") || "Close dialog"}
                >
                    ✕
                </button>

                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <Sparkles size={40} color="#7C3AED" style={{ marginBottom: '10px' }} />
                    <h2 id="ai-modal-title" style={{ margin: 0, color: '#1E293B' }}>{t("aiAssistantTitle")}</h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '5px' }}>
                        {t("aiAssistantDesc")}
                    </p>
                </div>

                {/* Input Section */}
                {!aiResult ? (
                    <>
                        <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                            <textarea
                                placeholder={t("aiPlaceholder")}
                                className="form-input"
                                rows={4}
                                value={aiQuery}
                                onChange={e => setAiQuery(e.target.value)}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid #E2E8F0',
                                    padding: '15px',
                                    paddingLeft: language === 'ar' ? '15px' : '50px',
                                    paddingRight: language === 'ar' ? '50px' : '15px',
                                    resize: 'none',
                                    height: '120px',
                                    width: '100%',
                                    borderRadius: '16px',
                                    fontSize: '1rem',
                                    lineHeight: '1.5',
                                    boxSizing: 'border-box', // Critical Fix
                                    fontFamily: 'inherit'
                                }}
                            />

                            {/* Image Preview */}
                            {aiImage && (
                                <div style={{ position: 'relative', marginTop: '10px', width: 'fit-content', margin: '10px auto' }}>
                                    <img
                                        src={aiImage}
                                        alt="Preview"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            objectFit: 'cover',
                                            border: '2px solid #3B82F6'
                                        }}
                                    />
                                    <button
                                        onClick={() => setAiImage(null)}
                                        aria-label={t("removeImage") || "Remove image"}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            background: '#EF4444',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '22px',
                                            height: '22px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Voice Input Button */}
                            <button
                                onClick={onVoiceInput}
                                aria-label={isListening ? t("stopListening") || "Stop listening" : t("startVoice") || "Start voice input"}
                                style={{
                                    position: 'absolute',
                                    [language === 'ar' ? 'right' : 'left']: '12px',
                                    top: '12px',
                                    background: isListening ? '#EF4444' : 'var(--bg-secondary)',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s',
                                    zIndex: 10,
                                    animation: isListening ? 'pulse-red 1.5s infinite' : 'none'
                                } as React.CSSProperties}
                            >
                                <Mic size={18} color={isListening ? 'white' : '#64748B'} />
                            </button>

                            {/* Camera Button */}
                            <label style={{
                                position: 'absolute',
                                [language === 'ar' ? 'right' : 'left']: '12px',
                                top: '56px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                zIndex: 10
                            } as React.CSSProperties}>
                                <Camera size={18} color="#64748B" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onImageSelect}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {/* Analyze Button */}
                        <button
                            onClick={onAnalyze}
                            className="submit-btn"
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                marginTop: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%'
                            }}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? t("analyzing") : (
                                <>
                                    <Sparkles size={18} /> {t("analyzeFault")}
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    /* Result Section */
                    <div
                        className="fade-in"
                        style={{
                            background: '#F0F9FF',
                            padding: '20px',
                            borderRadius: '16px',
                            marginTop: '10px',
                            border: '1px solid #BAE6FD',
                            textAlign: 'left'
                        }}
                    >
                        {/* Diagnosis Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '12px' }}>
                                {aiResult.icon}
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t("diagnosis")}</span>
                                <h3 style={{ margin: 0, color: '#0369A1' }}>{aiResult.type}</h3>
                            </div>
                        </div>

                        {/* Estimated Price Range */}
                        {aiResult.estimatedPrice && (
                            <div
                                className="fade-in"
                                style={{
                                    background: 'linear-gradient(to right, #F0FDF4, #DCFCE7)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    marginBottom: '15px',
                                    border: '1px solid #BBF7D0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <div style={{
                                    background: '#166534',
                                    borderRadius: '50%',
                                    padding: '6px',
                                    color: 'white',
                                    display: 'flex'
                                }}>
                                    <DollarSign size={16} />
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 'bold', display: 'block' }}>
                                        {t("estimatedCost") || "Estimated Cost"}
                                    </span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#14532D' }}>
                                        {(aiResult?.estimatedCost || aiResult?.estimatedPrice || 0).toLocaleString('ar-EG')}{' '}
                                        <span style={{ fontSize: '0.8rem' }}>{t('currency') || 'جنيه'}</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Quick Tips */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                            <h4 style={{
                                margin: '0 0 10px 0',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#B45309'
                            }}>
                                <Lightbulb size={16} /> {t("quickTips")}
                            </h4>
                            <ul style={{ margin: 0, paddingRight: '20px', fontSize: '0.85rem', color: '#475569' }}>
                                {aiResult.tips?.map((tip: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: '5px' }}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Show Techs Button */}
                        <button
                            onClick={onApplySuggestion}
                            className="submit-btn"
                            style={{ background: '#0369A1', width: '100%' }}
                        >
                            {t("showTechsFor")} {aiResult?.type || aiResult?.category}
                        </button>

                        {/* Smart Book Button */}
                        {aiResult?.action && aiResult.action === 'BOOK_REQUEST' && (
                            <button
                                onClick={onSmartBook}
                                className="submit-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    width: '100%',
                                    marginTop: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <Zap size={18} fill="white" /> {t("smartBook") || "Smart Book Now"}
                            </button>
                        )}

                        {/* Broadcast Button */}
                        <button
                            onClick={onBroadcast}
                            className="submit-btn"
                            style={{
                                background: 'linear-gradient(45deg, #F59E0B, #D97706)',
                                width: '100%',
                                marginTop: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '0.9rem'
                            }}
                        >
                            📢 {t("notifyAll")}
                        </button>

                        {/* Search Another Button */}
                        <button
                            onClick={onClearResult}
                            style={{
                                marginTop: '15px',
                                background: 'none',
                                border: 'none',
                                color: '#64748B',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                width: '100%',
                                fontSize: '0.85rem'
                            }}
                        >
                            {t("searchAnother")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistantModal;
