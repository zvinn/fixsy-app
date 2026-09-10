
import { Search, Sparkles, Moon, Sun, MessageCircle } from 'lucide-react';
import logo from '../../logo.png';
import logoWebP from '../../logo.webp';
import { User } from 'firebase/auth';

interface HeaderProps {
    user: User | null;
    theme: string;
    toggleTheme: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    unreadCount: number;
    isRinging: boolean;
    onNotificationsClick: () => void;
    onAIClick: () => void;
    t: (key: string) => string;
}

/**
 * Header - Main navigation header with search, theme toggle, and notifications
 * Extracted from App.tsx to reduce file size (~60 lines extracted)
 */
export function Header({
    user,
    theme,
    toggleTheme,
    searchTerm,
    setSearchTerm,
    unreadCount,
    isRinging,
    onNotificationsClick,
    onAIClick,
    t
}: HeaderProps) {
    return (
        <nav className="header">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            </div>

            {/* Top Right Actions Container */}
            <div style={{
                position: 'absolute', top: '20px', left: '20px',
                display: 'flex', gap: '10px', zIndex: 10
            }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    style={{
                        background: 'var(--glass)', border: '1px solid var(--border)',
                        borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer',
                        backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} color="#F59E0B" />}
                </button>

                {/* Notification Bell */}
                {user && (
                    <button
                        onClick={onNotificationsClick}
                        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                        style={{
                            background: 'var(--glass)', border: '1px solid var(--border)',
                            borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer',
                            backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative'
                        }}
                    >
                        <div style={{ position: 'relative', transform: isRinging ? 'rotate(15deg) scale(1.1)' : 'none', transition: '0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <MessageCircle size={20} style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }} />
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        position: 'absolute', top: '-6px', right: '-6px',
                                        background: 'var(--danger)', color: 'white',
                                        borderRadius: '50%', width: '16px', height: '16px',
                                        fontSize: '0.65rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                                        animation: isRinging ? 'pulse 0.5s infinite' : 'none'
                                    }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </button>
                )}
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="hero-content">
                <picture>
                    <source srcSet={logoWebP} type="image/webp" />
                    <img src={logo} alt="Fixsy Logo" style={{ width: '120px', marginBottom: '10px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))', borderRadius: '20px' }} loading="eager" />
                </picture>

                <div className="search-container glass-panel" style={{ width: '90%', maxWidth: '500px', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '8px', gap: '10px' }}>
                    <Search color="var(--text-secondary)" size={22} style={{ marginLeft: '10px', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        aria-label={t('searchPlaceholder')}
                        style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: 0, fontSize: '1rem', color: 'var(--text)' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={onAIClick}
                        aria-label="Open AI Assistant"
                        style={{
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                            border: 'none', borderRadius: '12px', padding: '10px 18px',
                            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)', whiteSpace: 'nowrap', flexShrink: 0
                        }}
                    >
                        <Sparkles size={18} /> AI
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Header;
