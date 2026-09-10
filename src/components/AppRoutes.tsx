import { Suspense, lazy, useCallback, startTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LazyLoadFallback from './LazyLoadFallback';
import HomeTab from './HomeTab';
import Notifications from './Notifications';
import BookingModal from './BookingModal';
import RoleSelectionModal from './Modals/RoleSelectionModal';
import TechOnboarding from '../pages/TechOnboarding';
import { Technician, BookingFormData, WeatherAlert, ClientProfile } from '../types';
import { User } from 'firebase/auth';
import { useBookingContext } from '../context/BookingContext';  // NEW!
import safeLocalStorage from '../utils/safeLocalStorage';

// Lazy load heavy pages for better performance
// ✅ Removed 'as any' for proper type safety
const UserBookings = lazy(() => import('../pages/UserBookings'));
const TechDashboard = lazy(() => import('../pages/TechDashboard'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const Profile = lazy(() => import('../pages/Profile'));
const JobMarket = lazy(() => import('../pages/JobMarket'));
const CommunityHub = lazy(() => import('../pages/CommunityHub'));
const HelpCenter = lazy(() => import('../pages/HelpCenter'));
const LegalPages = lazy(() => import('../pages/LegalPages'));
const Tips = lazy(() => import('../pages/Tips'));
const Login = lazy(() => import('../pages/Login'));
const TechSignup = lazy(() => import('../pages/TechSignup'));

interface ServiceItem {
    id: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

interface ServiceMap {
    [key: string]: string[];
}

interface AppRoutesProps {
    activeTab: string;
    changeTab: (tab: string) => void;
    user: User | null;
    userRole: string | null;
    setUserRole: (role: string) => void;
    t: (key: string, params?: Record<string, unknown>) => string;
    theme: string;
    toggleTheme: () => void;
    // Home tab props
    weatherAlert: WeatherAlert | null;
    setWeatherAlert: (alert: WeatherAlert | null) => void;
    servicesList: ServiceItem[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    technicians: Technician[];
    isLoadingTechs: boolean;
    serviceMap: ServiceMap;
    selectedTech: Technician | null;
    setSelectedTech: (tech: Technician | null) => void;
    favorites: string[];
    toggleFavorite: (techId: string) => void;
    // Booking props removed - now using Context!
    handleBookingSubmit: (e: React.FormEvent) => void;  // Keep this
    clientProfile: ClientProfile | null;
    language: string;
    // Role selection props
    registerAsClient: (referralCode?: string) => void;
    applyReferralCode?: (code: string) => Promise<boolean>;
    containerRef: React.RefObject<HTMLDivElement>;
    // Email Auth props
    handleEmailSignUp?: (email: string, password: string, name: string) => Promise<boolean>;
    handleEmailLogin?: (email: string, password: string) => Promise<boolean>;
    handleGoogleLogin?: () => void;
}

const pageVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.2 }
};

/**
 * AppRoutes - Handles tab-based routing and content rendering
 * Extracted from App.tsx to reduce file size and improve maintainability
 */
export function AppRoutes({
    activeTab,
    changeTab,
    user,
    userRole,
    setUserRole,
    t,
    theme,
    toggleTheme,
    weatherAlert,
    setWeatherAlert,
    servicesList,
    searchTerm,
    setSearchTerm,
    technicians,
    isLoadingTechs,
    serviceMap,
    selectedTech,
    setSelectedTech,
    favorites,
    toggleFavorite,
    // Removed: formData, setFormData, paymentMethod, etc.
    handleBookingSubmit,  // Still from App.tsx
    clientProfile,
    language,
    registerAsClient,
    applyReferralCode,
    containerRef,
    handleEmailSignUp,
    handleEmailLogin,
    handleGoogleLogin
}: AppRoutesProps) {
    // Use BookingContext instead of props!
    const booking = useBookingContext();
    // Flow for New Users
    if (user && userRole === 'new') {
        const preferredRole = safeLocalStorage.getItem('preferredRole');

        if (preferredRole === 'tech') {
            return (
                <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-gradient)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <TechOnboarding user={user} onComplete={() => setUserRole('tech')} />
                </div>
            );
        }

        return (
            <RoleSelectionModal
                user={user}
                onRegisterClient={() => {
                    setUserRole('client');
                    safeLocalStorage.setItem('fixsy_user_role', 'client');
                    registerAsClient();
                }}
                onSwitchToTech={() => {
                    setUserRole('client');
                    safeLocalStorage.setItem('fixsy_user_role', 'client');
                    changeTab('tech-signup');
                }}
                onClose={() => {
                    setUserRole('client');
                    safeLocalStorage.setItem('fixsy_user_role', 'client');
                }}
                t={t}
            />
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'market':
                return <Suspense fallback={<LazyLoadFallback />}><JobMarket user={user!} userRole={userRole as 'client' | 'tech' | 'admin' | null} goBack={() => changeTab('home')} /></Suspense>;
            case 'my_requests':
                return <Suspense fallback={<LazyLoadFallback />}><UserBookings user={user!} goBack={() => changeTab('home')} /></Suspense>;
            case 'profile':
                return <Suspense fallback={<LazyLoadFallback />}><Profile user={user} userRole={userRole as 'client' | 'tech' | 'admin' | null} goBack={() => changeTab('home')} changeTab={changeTab} theme={theme as 'light' | 'dark'} toggleTheme={toggleTheme} technicians={technicians as any} applyReferralCode={applyReferralCode} /></Suspense>;
            case 'tech_panel':
                return <Suspense fallback={<LazyLoadFallback />}><TechDashboard user={user!} goBack={() => changeTab('home')} /></Suspense>;
            case 'admin':
                return <Suspense fallback={<LazyLoadFallback />}><AdminPanel goBack={() => changeTab('home')} /></Suspense>;
            case 'about':
                return <Suspense fallback={<LazyLoadFallback />}><LegalPages page="about" goBack={() => changeTab('profile')} /></Suspense>;
            case 'privacy':
                return <Suspense fallback={<LazyLoadFallback />}><LegalPages page="privacy" goBack={() => changeTab('profile')} /></Suspense>;
            case 'notifications':
                return <Notifications
                    user={user}
                    goBack={() => changeTab('home')}
                    onSelectNotif={(targetId, type) => {
                        // Navigate to my_requests to show the booking/request
                        changeTab('my_requests');
                    }}
                />;
            case 'community':
                return <Suspense fallback={<LazyLoadFallback />}><CommunityHub user={user} /></Suspense>;
            case 'help':
                return <Suspense fallback={<LazyLoadFallback />}><HelpCenter goBack={() => changeTab('profile')} /></Suspense>;
            case 'tips':
                return <Suspense fallback={<LazyLoadFallback />}><Tips goBack={() => changeTab('home')} /></Suspense>;
            case 'login':
                return (
                    <Suspense fallback={<LazyLoadFallback />}>
                        <Login
                            onGoogleLogin={handleGoogleLogin || (() => { })}
                            onEmailSignUp={handleEmailSignUp || (async () => false)}
                            onEmailLogin={handleEmailLogin || (async () => false)}
                            onSuccess={() => changeTab('home')}
                        />
                    </Suspense>
                );
            case 'tech_signup':
                return (
                    <Suspense fallback={<LazyLoadFallback />}>
                        <TechSignup
                            onEmailSignUp={handleEmailSignUp || (async () => false)}
                            onGoogleLogin={handleGoogleLogin || (() => { })}
                            onSuccess={() => changeTab('home')}
                            onSkip={() => changeTab('home')}
                        />
                    </Suspense>
                );
            default:
                return (
                    <div ref={containerRef}>
                        <HomeTab
                            user={user}
                            userRole={userRole || 'new'}
                            t={t}
                            weatherAlert={weatherAlert}
                            setWeatherAlert={setWeatherAlert}
                            servicesList={servicesList}
                            setSearchTerm={setSearchTerm}
                            searchTerm={searchTerm}
                            technicians={technicians}
                            isLoadingTechs={isLoadingTechs}
                            serviceMap={serviceMap}
                            setSelectedTech={(tech) => setSelectedTech(tech)}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                        />
                        {selectedTech && (
                            <BookingModal
                                selectedTech={selectedTech}
                                onClose={() => setSelectedTech(null)}
                                formData={booking.formData}
                                setFormData={booking.setFormData}
                                handleBookingSubmit={handleBookingSubmit}
                                t={t}
                                clientProfile={clientProfile}
                                paymentMethod={booking.paymentMethod}
                                setPaymentMethod={booking.setPaymentMethod}
                                couponCode={booking.coupon.code}
                                setCouponCode={booking.setCouponCode}
                                applyCoupon={booking.applyCoupon}
                                problemFile={booking.problemFile}
                                setProblemFile={booking.setProblemFile}
                                language={language}
                            />
                        )}
                    </div>
                );
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageVariants.transition}
                style={{ width: '100%', minHeight: '100%' }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
    );
}

export default AppRoutes;
