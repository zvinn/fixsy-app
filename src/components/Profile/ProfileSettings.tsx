// src/components/Profile/ProfileSettings.tsx
// Profile settings component with toggles for theme, language, notifications


import { Settings, Globe, Sun, Moon, Bell } from 'lucide-react';

interface UserData {
    notificationsEnabled?: boolean;
}

interface ProfileSettingsProps {
    userData: UserData;
    theme: 'light' | 'dark';
    language: 'ar' | 'en';
    onToggleLanguage: () => void;
    onToggleTheme: () => void;
    onToggleNotifications: () => void;
    t: (key: string) => string;
}

/**
 * ProfileSettings - Settings section with toggles
 * WCAG 2.1 AA Compliant with proper ARIA attributes
 */
const ProfileSettings: React.FC<ProfileSettingsProps> = ({
    userData,
    theme,
    language,
    onToggleLanguage,
    onToggleTheme,
    onToggleNotifications,
    t
}) => {
    const isNotificationsEnabled = userData?.notificationsEnabled !== false;

    return (
        <section
            aria-label={t("settings")}
            className="profile-section"
            style={{
                background: 'var(--bg-secondary)',
                padding: '25px',
                borderRadius: '24px',
                boxShadow: 'var(--card-shadow)',
                marginBottom: '20px'
            }}
        >
            <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#334155'
            }}>
                <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '10px' }}>
                    <Settings size={20} color="#64748B" aria-hidden="true" />
                </div>
                {t("settings")}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} role="group" aria-label={t("settings")}>
                {/* Language Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #F1F5F9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Globe size={20} color="#64748B" aria-hidden="true" />
                        <span style={{ fontWeight: '600', color: '#334155' }}>{t("language")}</span>
                    </div>
                    <button
                        onClick={onToggleLanguage}
                        aria-label={`${t("language")}: ${language === 'ar' ? 'Switch to English' : 'تغيير للعربي'}`}
                        style={{
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            borderRadius: '20px',
                            padding: '6px 16px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {language === 'ar' ? 'English' : 'عربي'}
                    </button>
                </div>

                {/* Theme Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #F1F5F9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {theme === 'light' ?
                            <Sun size={20} color="#F59E0B" aria-hidden="true" /> :
                            <Moon size={20} color="#6366F1" aria-hidden="true" />
                        }
                        <span style={{ fontWeight: '600', color: '#334155' }}>{t("appearance")}</span>
                    </div>
                    <button
                        onClick={onToggleTheme}
                        aria-label={`${t("appearance")}: ${theme === 'light' ? t("darkMode") : t("lightMode")}`}
                        aria-pressed={theme === 'dark'}
                        style={{
                            background: theme === 'light' ? '#FFFBEB' : '#EEF2FF',
                            color: theme === 'light' ? '#D97706' : '#4F46E5',
                            border: `1px solid ${theme === 'light' ? '#FDE68A' : '#C7D2FE'}`,
                            borderRadius: '20px',
                            padding: '6px 16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        {theme === 'light' ? t("darkMode") : t("lightMode")}
                    </button>
                </div>

                {/* Notifications Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={20} color={isNotificationsEnabled ? "#10B981" : "#94A3B8"} aria-hidden="true" />
                        <span style={{ fontWeight: '600', color: '#334155' }}>{t("notifications") || "Notifications"}</span>
                    </div>
                    <button
                        role="switch"
                        aria-checked={isNotificationsEnabled}
                        aria-label={`${t("notifications") || "Notifications"}: ${isNotificationsEnabled ? 'On' : 'Off'}`}
                        onClick={onToggleNotifications}
                        style={{
                            width: '50px',
                            height: '28px',
                            background: isNotificationsEnabled ? '#10B981' : '#CBD5E1',
                            borderRadius: '30px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.3s',
                            border: 'none',
                            padding: 0
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            background: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: isNotificationsEnabled ? '24px' : '2px',
                            transition: 'left 0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} aria-hidden="true"></div>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProfileSettings;
