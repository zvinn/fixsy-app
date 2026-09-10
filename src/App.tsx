/* src/App.tsx - Modular Architecture (Phase 9 Refactored) - Validated */
import './App.css';
import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { Wrench, Hammer, Wind, PaintRoller, Tv, Satellite, Grid, Zap } from 'lucide-react';

// Core Components
import AppProviders from './components/AppProviders';
import AppRoutes from './components/AppRoutes';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
// Removed: import Login from './pages/Login'; (unused)
import AIAssistantModal from './components/Modals/AIAssistantModal';
import BookingSuccess from './components/BookingSuccess';
import MainLayout from './layouts/MainLayout';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useFavorites } from './hooks/useFavorites';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import { useVoiceInput } from './hooks/useVoiceInput';
import { useTechnicians } from './hooks/useTechnicians';
import { useNotifications } from './hooks/useNotifications';
import { useWeatherAlert } from './hooks/useWeatherAlert';
import { useClientProfile } from './hooks/useClientProfile';
import { BookingProvider, useBookingContext } from './context/BookingContext';  // NEW!

// Types
import { WeatherAlert } from './types';
import './components/HomeTab.css';
import { analytics } from './services/analyticsService';
import safeLocalStorage from './utils/safeLocalStorage';

// Service icons configuration
const servicesList = [
  { id: 'plumbing', icon: <Wrench size={28} />, color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'electricity', icon: <Zap size={28} />, color: '#eab308', bg: '#fef9c3' },
  { id: 'carpentry', icon: <Hammer size={28} />, color: '#8b5cf6', bg: '#ede9fe' },
  { id: 'ac', icon: <Wind size={28} />, color: '#10b981', bg: '#d1fae5' },
  { id: 'painting', icon: <PaintRoller size={28} />, color: '#ec4899', bg: '#fce7f3' },
  { id: 'appliances', icon: <Tv size={28} />, color: '#6366f1', bg: '#e0e7ff' },
  { id: 'dish', icon: <Satellite size={28} />, color: '#f43f5e', bg: '#ffe4e6' },
  { id: 'allServices', icon: <Grid size={28} />, color: '#64748b', bg: '#f1f5f9' }
];

function App() {
  // Initialize Analytics once on app mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { language, t } = useLanguage();
  const { user } = useAuth(t);  // Get user first

  return (
    <BookingProvider user={user} t={t}>
      <AppContentInner />
    </BookingProvider>
  );
}

function AppContentInner() {
  const { theme, toggleTheme } = useTheme();
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auth Hook
  const { user, userRole, setUserRole, registerAsClient, handleGoogleLogin, handleEmailSignUp, handleEmailLogin, handleGuestLogin, applyReferralCode } = useAuth(t);

  // Local State
  const [showSplash, setShowSplash] = useState(() => {
    try {
      if (window.location.search.includes('demo=') || window.location.search.includes('nosplash=true')) return false;
      return !sessionStorage.getItem('fixsy_splash_shown');
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState("");
  const [weatherAlertState, setWeatherAlertState] = useState<WeatherAlert | null>(null);

  // Custom Hooks - MUST be called before any conditional returns
  const { technicians, isLoading: isLoadingTechs, serviceMap } = useTechnicians();
  const { clientProfile } = useClientProfile({ user, userRole });
  const { weatherAlert } = useWeatherAlert();
  const { unreadCount, isRinging: notificationRinging } = useNotifications({ user, t });
  const { favorites, toggleFavorite } = useFavorites(user);

  // Booking is now in Context - no hook needed here!
  const booking = useBookingContext();  // Use context instead!

  // AI Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const aiAnalysis = useAIAnalysis(user);
  const { isListening, handleVoiceInput } = useVoiceInput();

  // Sync weather alert
  useEffect(() => {
    // Only set if weatherAlert is valid and has required 'show' property
    if (weatherAlert && typeof weatherAlert === 'object' && 'show' in weatherAlert) {
      setWeatherAlertState(weatherAlert as WeatherAlert);
    }
  }, [weatherAlert]);

  // Role Redirect
  useEffect(() => {
    if (userRole === 'admin' && activeTab === 'home') setActiveTab('admin');
    else if (userRole === 'tech' && activeTab === 'home') setActiveTab('market');
  }, [userRole, activeTab]);

  // Track page views (tab changes)
  useEffect(() => {
    analytics.trackPageView(`/${activeTab}`, activeTab);
  }, [activeTab]);

  const changeTab = useCallback((tab: string) => {
    startTransition(() => setActiveTab(tab));
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await booking.submitBooking(e, aiAnalysis.aiResult ?? undefined);
  };

  const onVoiceInput = () => handleVoiceInput((transcript: string) => aiAnalysis.setAiQuery(transcript));
  const onApplySuggestion = () => aiAnalysis.applyAISuggestion(setSearchTerm, () => setShowAIModal(false));
  const onSmartBook = () => aiAnalysis.handleSmartBook(technicians, serviceMap, booking.setSelectedTech, booking.setFormData, () => setShowAIModal(false));

  // Login Check
  if (!user && !safeLocalStorage.getItem('skipLogin')) {
    return (
      <LoginPage
        onLogin={handleGoogleLogin}
        onEmailLogin={handleEmailLogin}
        onEmailSignUp={handleEmailSignUp}
        onTechSignup={() => setActiveTab('tech-signup')}
      />
    );
  }

  const handleSetUserRole = (role: string) => setUserRole(role as 'client' | 'tech' | 'admin');

  return (
    <div className="App">
      {showSplash && <SplashScreen onComplete={() => {
        try { sessionStorage.setItem('fixsy_splash_shown', 'true'); } catch {}
        setTimeout(() => setShowSplash(false), 300);
      }} />}

      <MainLayout
        activeTab={activeTab} setActiveTab={changeTab}
        user={user} userRole={userRole}
        theme={theme || 'light'} toggleTheme={toggleTheme} t={t}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        unreadCount={Number(unreadCount) || 0} isRinging={notificationRinging}
        onNotificationsClick={() => setActiveTab('notifications')}
        onAIClick={() => setShowAIModal(true)}
        onLogin={handleGoogleLogin}
      >
        <AIAssistantModal
          show={showAIModal} onClose={() => setShowAIModal(false)} t={t} language={language}
          aiResult={aiAnalysis.aiResult} isAnalyzing={aiAnalysis.isAnalyzing} aiQuery={aiAnalysis.aiQuery} setAiQuery={aiAnalysis.setAiQuery}
          aiImage={aiAnalysis.aiImage} setAiImage={aiAnalysis.setAiImage} isListening={isListening} onVoiceInput={onVoiceInput}
          onImageSelect={aiAnalysis.handleAIImageSelect} onAnalyze={aiAnalysis.analyzeProblem} onApplySuggestion={onApplySuggestion}
          onSmartBook={onSmartBook} onBroadcast={() => { }}
          onClearResult={aiAnalysis.clearAIResult}
        />

        <AppRoutes
          activeTab={activeTab} changeTab={changeTab} user={user} userRole={userRole} setUserRole={handleSetUserRole}
          t={t} theme={theme} toggleTheme={toggleTheme} weatherAlert={weatherAlertState} setWeatherAlert={setWeatherAlertState}
          servicesList={servicesList} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          technicians={technicians} isLoadingTechs={isLoadingTechs} serviceMap={serviceMap}
          selectedTech={booking.selectedTech} setSelectedTech={booking.setSelectedTech} favorites={favorites} toggleFavorite={toggleFavorite}
          handleBookingSubmit={handleBookingSubmit} clientProfile={clientProfile} language={language}
          registerAsClient={registerAsClient} applyReferralCode={applyReferralCode}
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          handleEmailSignUp={handleEmailSignUp} handleEmailLogin={handleEmailLogin} handleGoogleLogin={handleGoogleLogin}
        />

        {/* Booking Success Modal */}
        {booking.lastBookingDetails && (
          <BookingSuccess
            details={booking.lastBookingDetails}
            onClose={booking.resetBooking}
            onTrack={() => { booking.resetBooking(); changeTab('my_requests'); }}
          />
        )}
      </MainLayout>
    </div>
  );
}

export default App;
