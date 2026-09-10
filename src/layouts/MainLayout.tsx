/* src/layouts/MainLayout.tsx */
import { ReactNode } from 'react';
import Header from '../components/Navigation/Header';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import InstallPrompt from '../components/InstallPrompt';
import IOSInstallPrompt from '../components/IOSInstallPrompt';
import OfflineIndicator from '../components/OfflineIndicator';
import ReloadPrompt from '../ReloadPrompt';
import { MessageCircle } from 'lucide-react';
import { User } from 'firebase/auth';

interface MainLayoutProps {
    children: ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: User | null;
    userRole: string | null;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    t: (key: string) => string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    unreadCount: number;
    isRinging: boolean;
    onNotificationsClick: () => void;
    onAIClick: () => void;
    onLogin: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    activeTab,
    setActiveTab,
    user,
    userRole,
    theme,
    toggleTheme,
    t,
    searchTerm,
    setSearchTerm,
    unreadCount,
    isRinging,
    onNotificationsClick,
    onAIClick,
    onLogin
}) => {
    const WHATSAPP_NUMBER = "201000000000";

    return (
        <div style={{ opacity: 1, transition: 'opacity 0.5s ease-in' }}>
            <ReloadPrompt />
            <OfflineIndicator />
            <InstallPrompt />
            <IOSInstallPrompt t={t} />

            {/* WhatsApp Button */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Contact via WhatsApp" className="whatsapp-float-btn" style={{ position: 'fixed', bottom: '90px', backgroundColor: '#25D366', color: 'white', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)', zIndex: 10000, textDecoration: 'none', transition: 'transform 0.3s' }}>
                <MessageCircle size={28} />
            </a>

            {/* Header */}
            {activeTab === 'home' && (
                <Header
                    user={user}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    unreadCount={unreadCount}
                    isRinging={isRinging}
                    onNotificationsClick={onNotificationsClick}
                    onAIClick={onAIClick}
                    t={t}
                />
            )}

            {/* Main Content */}
            <main id="main-content" style={{ paddingBottom: '100px', maxWidth: '1100px', margin: '0 auto', width: '100%' }} tabIndex={-1}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNavBar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
                user={user}
                t={t}
                onLogin={onLogin}
            />
        </div>
    );
};

export default MainLayout;
