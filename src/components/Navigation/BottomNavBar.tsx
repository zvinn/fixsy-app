// src/components/Navigation/BottomNavBar.tsx
import React from 'react';
import { User } from 'firebase/auth';
import {
    Home, Store, ClipboardList, Zap, ShieldCheck,
    Lightbulb, User as UserIcon, LogIn, LucideIcon
} from 'lucide-react';
import './BottomNavBar.css';

interface BottomNavBarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    userRole: string | null;
    user: User | null;
    t: (key: string) => string;
    onLogin: () => void;
}

/**
 * Bottom Navigation Bar Component
 * Modern, crisp navigation with centered icon pill indicators and top active bar
 * WCAG 2.1 AA Compliant with ARIA labels and keyboard navigation
 */
const BottomNavBar: React.FC<BottomNavBarProps> = ({
    activeTab,
    setActiveTab,
    userRole,
    user,
    t,
    onLogin: _onLogin
}) => {
    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    // Role-based navigation structure
    const getNavItems = () => {
        if (userRole === 'admin') {
            return [{ id: 'admin', icon: ShieldCheck, label: t("admin") }];
        }
        if (userRole === 'tech') {
            return [
                { id: 'market', icon: Store, label: t("market") },
                { id: 'tech_panel', icon: Zap, label: t("myTasks") },
            ];
        }
        return [
            { id: 'home', icon: Home, label: t("home") },
            { id: 'market', icon: Store, label: t("market") },
            { id: 'my_requests', icon: ClipboardList, label: t("myRequests") },
            { id: 'tips', icon: Lightbulb, label: t("tips") || "نصائح" },
        ];
    };

    const navItems = getNavItems();

    const renderNavItem = (id: string, Icon: LucideIcon, label: string, onClick: () => void) => {
        const isActive = activeTab === id || (id === 'profile' && activeTab === 'login');

        return (
            <button
                key={id}
                onClick={onClick}
                onKeyDown={(e) => handleKeyDown(e, onClick)}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={0}
            >
                <div className="nav-icon-container">
                    <Icon
                        size={22}
                        className="nav-icon"
                    />
                </div>
                <span className="nav-label">
                    {label}
                </span>
            </button>
        );
    };

    return (
        <nav
            role="navigation"
            aria-label={t("mainNavigation") || "Main navigation"}
            className="bottom-nav"
        >
            {navItems.map((item) => renderNavItem(item.id, item.icon, item.label, () => setActiveTab(item.id)))}

            {/* Profile/Login Tab (Always visible) */}
            {renderNavItem(
                'profile',
                user ? UserIcon : LogIn,
                user ? t("profile") : t("login"),
                () => user ? setActiveTab('profile') : setActiveTab('login')
            )}
        </nav>
    );
};

export default BottomNavBar;
