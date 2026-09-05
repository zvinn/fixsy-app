/* src/App.js - النسخة "الذهبية" (تصميم بريميم + AI ذكي + بار ثابت) */
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, setDoc, addDoc, onSnapshot, increment } from 'firebase/firestore';
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import logo from './logo.png';
// استدعاء كل الأيقونات الضرورية
import {
  MapPin, Search, Calendar, Star, Camera, X, MessageCircle, Send, Mic, Image as ImageIcon, User, Home, Store, ClipboardList, Zap, ShieldCheck, LogIn, Moon, Sun, Sparkles, CheckCircle, ArrowRight, Lightbulb, Tag, Wrench, Hammer, Wind, PaintRoller, Tv, Satellite, Grid, Banknote, CreditCard, XCircle, AlertTriangle, Flame, Download, DollarSign
} from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';

import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import TechOnboarding from './pages/TechOnboarding';
import HomeTab from './components/HomeTab';
import UserBookings from './pages/UserBookings'; // 📅
import TechDashboard from './pages/TechDashboard'; // 🛠️
import AdminPanel from './pages/AdminPanel'; // 👑
import Profile from './pages/Profile'; // 👤
import WalletPage from './pages/WalletPage'; // 💰
import ChatWindow from './components/ChatWindow'; // 💬
import Notifications from './components/Notifications'; // 🔔
import JobMarket from './pages/JobMarket';
import CommunityHub from './pages/CommunityHub';
import BookingModal from './components/BookingModal';
import BookingSuccess from './components/BookingSuccess';
import Stories from './components/Stories';
import HelpCenter from './pages/HelpCenter';
import LegalPages from './pages/LegalPages';


function App() {
  return (
    <HelmetProvider>
      <AppContent />
    </HelmetProvider>
  );
}

function AppContent() {
  // Notification Permission
  useEffect(() => {
    const reqPerm = async () => {
      try {
        const platform = navigator.platform;
        // Basic permission request
        const p = await Notification.requestPermission();
        if (p === 'granted') {
          console.log("Notification permission granted on " + platform);
          // const token = await getToken(messaging);
          // console.log("Token:", token);
        }
      } catch (e) { console.error("Notification permission error", e); }
    };
    reqPerm();
  }, []);

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);

  // ... (auth listener stays same) ...

  const handleGoogleLogin = async (role = 'client') => {
    localStorage.setItem('preferredRole', role);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try { await signInWithPopup(auth, provider); toast.success(t("welcome")); } catch (error) { toast.error(t("errorOccurred")); }
  };

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Handle Splash Complete (Triggered by onComplete in SplashScreen)
  const handleSplashComplete = () => {
    // Small delay to ensure smooth transition
    setTimeout(() => setShowSplash(false), 500);
  };


  const [userRole, setUserRole] = useState(null);
  const [clientProfile, setClientProfile] = useState(null); // Client Data (Addresses etc)
  const [activeTab, setActiveTab] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs للأنيميشن
  const containerRef = useRef(null);

  const WHATSAPP_NUMBER = "201000000000";

  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [formData, setFormData] = useState({ address: '', problem: '', location: null, scheduledTime: '' });

  const CLOUD_NAME = "du9zxrsfl";
  const UPLOAD_PRESET = "fixsy_upload";

  const [searchTerm, setSearchTerm] = useState("");
  const [lastBookingDetails, setLastBookingDetails] = useState(null); // For Premium Receipt Modal
  const [newTechData, setNewTechData] = useState({ specialty: 'plumbing', price: '' });
  const [problemFile, setProblemFile] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 💵 New State

  // AI States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // PWA Install Prompt state

  // PWA Install Event Listener
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
    }
  };

  // Referral Code Logic
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState(null); // Track if user came from link

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCodeFromUrl(ref);
      setReferralCodeInput(ref);
    }
  }, []);


  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiImage, setAiImage] = useState(null);

  const handleAIImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t("voiceNotSupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-EG' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAiQuery(transcript);
      setIsListening(false);
      toast.success(t("voiceRecorded"));
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
      toast.error(t("voiceError"));
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const [favorites, setFavorites] = useState([]); // ❤️ Favorites State

  // Load Favorites on User Load
  useEffect(() => {
    if (user && user.uid) {
      const fetchFavs = async () => {
        const userDoc = await getDocs(query(collection(db, "clients"), where("email", "==", user.email)));
        if (!userDoc.empty) {
          setFavorites(userDoc.docs[0].data().favorites || []);
        }
      };
      fetchFavs();
    }
  }, [user]);

  const toggleFavorite = async (techId) => {
    if (!user) return toast.error(t("loginFirst"));

    let newFavs = [];
    if (favorites.includes(techId)) {
      newFavs = favorites.filter(id => id !== techId);
      toast.success(t("removedFromFav"));
    } else {
      newFavs = [...favorites, techId];
      toast.success(t("addedToFav"));
    }
    setFavorites(newFavs);

    // Persist
    const q = query(collection(db, "clients"), where("email", "==", user.email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(doc(db, "clients", snap.docs[0].id), { favorites: newFavs });
    }
  };

  // قائمة الخدمات (للتصميم)
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

  // Mapping for legacy data support (DB has 'سباكة', new is 'plumbing')
  const serviceMap = {
    plumbing: ['plumbing', 'سباكة'],
    electricity: ['electricity', 'كهرباء'],
    carpentry: ['carpentry', 'نجارة'],
    ac: ['ac', 'تكييف'],
    painting: ['painting', 'نقاشة'],
    appliances: ['appliances', 'أجهزة', 'أجهزة منزلية'],
    dish: ['dish', 'دش'],
    alumetal: ['alumetal', 'الوميتال'],
    allServices: []
  };

  // أنيميشن GSAP عند فتح الصفحة الرئيسية
  useEffect(() => {
    if (activeTab === 'home') {
      const ctx = gsap.context(() => {
        gsap.fromTo(".hero-content", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
        gsap.fromTo(".service-item", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)", delay: 0.2 });
        gsap.fromTo(".tech-card-pro", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.4 });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [activeTab, technicians, searchTerm]);

  // Auth Listener
  useEffect(() => {
    // Debug Login Override
    const debugUser = localStorage.getItem('debugUser');
    if (debugUser) {
      const parsedUser = JSON.parse(debugUser);
      setUser(parsedUser);
      checkUserRole(parsedUser.email);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); checkUserRole(currentUser.email); }
      else { setUser(null); }
    });
    return () => unsubscribe();
  }, []);

  // Notifications Listener & Smart Logic 🔔
  const notificationSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));
  const prevUnreadCount = useRef(0);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("userId", "==", user.email), where("read", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newCount = snapshot.size;

      // Smart Alert Logic: If count increased, Play Sound & Animate
      if (newCount > prevUnreadCount.current) {
        notificationSound.current.play().catch(e => console.log("Audio play failed:", e));
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 1000); // Stop ringing after 1s

        // Show browser notification if supported (Optional Polish)
        if (Notification.permission === "granted" && document.hidden) {
          new Notification("Fixsy", { body: t("newNotification"), icon: "/logo192.png" });
        }
      }

      setUnreadCount(newCount);
      prevUnreadCount.current = newCount;
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Client Profile (Real-time for Addresses)
  useEffect(() => {
    if (!user || userRole !== 'client') return;
    const q = query(collection(db, "clients"), where("email", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setClientProfile(snapshot.docs[0].data());
    });
    return () => unsubscribe();
  }, [user, userRole]);

  // --- Helper Functions ---
  // handleGoogleLogin moved to top
  const checkUserRole = async (email) => {
    if (email === "mhamed.saad.ibrahim@gmail.com" || email === "ahmed.wagdy1289@gmail.com") { setUserRole('admin'); return; }
    const techQuery = query(collection(db, "technicians"), where("email", "==", email));
    const techSnapshot = await getDocs(techQuery);
    if (!techSnapshot.empty) { setUserRole('tech'); handleStreak(techSnapshot.docs[0]); return; }
    const clientQuery = query(collection(db, "clients"), where("email", "==", email));
    const clientSnapshot = await getDocs(clientQuery);
    if (!clientSnapshot.empty) { setUserRole('client'); handleStreak(clientSnapshot.docs[0]); return; }
    setUserRole('new');
  };

  // 🔥 Handle Daily Streak
  const handleStreak = async (userDoc) => {
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = userData.lastLoginDate;
    let newStreak = userData.streak || 0;

    // 🏆 Gamification Logic: Calculate Level
    const calculateLevel = (streak, earnings = 0) => {
      if (streak >= 30 || earnings > 5000) return { name: 'Platinum', icon: '💎', color: '#E5E4E2' };
      if (streak >= 14 || earnings > 2000) return { name: 'Gold', icon: '🥇', color: '#FFD700' };
      if (streak >= 7 || earnings > 500) return { name: 'Silver', icon: '🥈', color: '#C0C0C0' };
      return { name: 'Bronze', icon: '🥉', color: '#CD7F32' };
    };

    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let showToast = false;
      if (lastLogin === yesterdayStr) {
        newStreak += 1;
        showToast = true;
      } else {
        newStreak = 1;
        showToast = true;
      }

      // Determine Collection
      const collectionName = userData.role === 'technician' || userData.specialty ? 'technicians' : 'clients';

      const currentLevel = calculateLevel(newStreak, userData.earnings);

      await updateDoc(doc(db, collectionName, userDoc.id), {
        lastLoginDate: today,
        streak: newStreak,
        level: currentLevel.name // Save Level
      });

      if (showToast) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px' }}>
            <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '50%', border: '2px solid #FCA5A5' }}>
              <Flame size={28} color="#DC2626" fill="#EF4444" className="pulse-icon" />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#991B1B' }}>Daily Streak: {newStreak} 🔥</div>
              <div style={{ fontSize: '0.85rem', color: '#7F1D1D' }}>Keep the fire burning!</div>
            </div>
          </div>
        ), { duration: 5000, position: 'top-center', style: { borderRadius: '20px', background: '#FFF1F2', border: '1px solid #FECACA' } });

        if ([3, 7, 30].includes(newStreak)) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }
    }
  };

  // Referral State
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const registerAsClient = async () => {
    let startingBalance = 0;
    let referredBy = null;

    if (referralCodeInput) {
      const q = query(collection(db, "clients"), where("referralCode", "==", referralCodeInput.trim().toUpperCase()));
      const snap = await getDocs(q);

      // Also check techs
      const qTech = query(collection(db, "technicians"), where("referralCode", "==", referralCodeInput.trim().toUpperCase()));
      const snapTech = await getDocs(qTech);

      if (!snap.empty || !snapTech.empty) {
        startingBalance = 20; // New user bonus
        referredBy = referralCodeInput.trim().toUpperCase();

        // Reward Referrer
        const referrerDoc = !snap.empty ? snap.docs[0] : snapTech.docs[0];
        const collectionName = !snap.empty ? "clients" : "technicians";

        await updateDoc(doc(db, collectionName, referrerDoc.id), {
          walletBalance: increment(50), // Referrer bonus
          referralCount: increment(1)
        });
        toast.success(t("referralApplied"));
      } else {
        toast.error(t("invalidReferral"));
        return; // Stop registration if code is invalid (optional, but good for UX)
      }
    }

    try {
      // Generate My Referral Code
      const myCode = (user.displayName?.substring(0, 4) + (Math.floor(1000 + Math.random() * 9000))).toUpperCase().replace(/\s/g, '');

      await addDoc(collection(db, "clients"), {
        email: user.email,
        name: user.displayName,
        role: 'client',
        walletBalance: startingBalance,
        referralCode: myCode,
        referredBy: referredBy
      });

      setUserRole('client');
      toast.success(t("registrationSuccess"));
    } catch (error) { toast.error(t("errorOccurred")); }
  };

  const registerAsTech = async (e) => {
    e.preventDefault();
    if (!newTechData.price) return toast.error(t("specifyPrice"));
    try {
      await addDoc(collection(db, "technicians"), {
        email: user.email, name: user.displayName, img: user.photoURL,
        specialty: newTechData.specialty, price: Number(newTechData.price), rating: 5, role: 'tech',
        earnings: 0, debt: 0, unpaidOrdersCount: 0, isFirstOrderDone: false, isVerified: false
      });
      setUserRole('tech'); toast.success(t("registrationSuccess"));
    } catch (error) { toast.error(t("errorOccurred")); }
  };

  // handleLogout removed (unused here, handled in Profile.js)

  // Fetch Technicians
  const [isLoadingTechs, setIsLoadingTechs] = useState(true);

  useEffect(() => {
    const getTechnicians = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "technicians"));
        setTechnicians(querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching techs:", error);
      } finally {
        setIsLoadingTechs(false);
      }
    };
    getTechnicians();
  }, []);

  // Booking Logic
  const getCurrentLocation = () => {
    const loadingToast = toast.loading(t("locating"));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, address: t("gpsLocated"), location: { lat: latitude, lng: longitude } }));
        toast.dismiss(loadingToast); toast.success(t("done"));
      }, () => { toast.dismiss(loadingToast); toast.error(t("failed")); });
    } else { toast.error(t("noGPS")); }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      return data.secure_url;
    } catch (error) { console.error(error); return null; }
  };

  const applyCoupon = async () => {
    if (!couponCode) return toast.error(t("enterCode"));
    const loadingToast = toast.loading(t("verifying"));
    try {
      const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()));
      const snapshot = await getDocs(q);
      toast.dismiss(loadingToast);
      if (snapshot.empty) { setDiscount(0); return toast.error(t("invalidCode")); }
      const couponData = snapshot.docs[0].data();
      if (!couponData.isActive) return toast.error(t("inactive"));
      setDiscount(couponData.discount);
      toast.success(t("discountApplied", { discount: couponData.discount }));
    } catch (error) { toast.dismiss(loadingToast); toast.error(t("errorOccurred")); }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error(t("loginFirst"));
    const appointmentTime = formData.scheduledTime || new Date().toISOString();

    // 🕒 Smart Schedule Check
    if (selectedTech.workingHours) {
      const date = new Date(appointmentTime);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

      if (selectedTech.workingHours.offDays && selectedTech.workingHours.offDays.includes(dayName)) {
        return toast.error(t("techOffDay", { day: dayName }));
      }

      if (time < selectedTech.workingHours.start || time > selectedTech.workingHours.end) {
        return toast.error(t("techOutsideHours", { start: selectedTech.workingHours.start, end: selectedTech.workingHours.end }));
      }
    }

    const finalPrice = Math.max(0, (selectedTech.price || 0) - discount);
    const loadingToast = toast.loading(t("bookingInProgress"));
    try {
      let imageUrl = null;
      if (problemFile) imageUrl = await uploadImage(problemFile);

      // 💰 Wallet Logic
      if (paymentMethod === 'wallet') {
        const clientQuery = query(collection(db, "clients"), where("email", "==", user.email));
        const clientSnap = await getDocs(clientQuery);

        if (clientSnap.empty) return toast.error(t("errorOccurred"));

        const clientDoc = clientSnap.docs[0];
        const currentBalance = clientDoc.data().walletBalance || 0;

        if (currentBalance < finalPrice) {
          toast.dismiss(loadingToast);
          return toast.error(t("insufficientBalance"));
        }

        // Deduct Balance
        await updateDoc(doc(db, "clients", clientDoc.id), {
          walletBalance: increment(-finalPrice)
        });

        // Log Transaction
        await addDoc(collection(db, "transactions"), {
          userId: user.email,
          amount: finalPrice,
          type: 'payment',
          date: new Date().toISOString(),
          description: `Booking payment: ${selectedTech.name}`
        });
      }

      const docRef = await addDoc(collection(db, "requests"), {
        technician_name: selectedTech.name, technician_email: selectedTech.email,
        client_name: user.displayName, client_email: user.email,
        client_address: formData.address, location: formData.location || null,
        problem_desc: formData.problem, problem_image: imageUrl,
        ai_diagnosis: aiResult ? { type: aiResult.type, advice: aiResult.advice, estimatedPrice: aiResult.estimatedPrice } : null,
        original_price: selectedTech.price, discount: discount, price: finalPrice, coupon_used: discount > 0 ? couponCode : null,
        paymentMethod: paymentMethod,
        status: "pending", scheduledDate: appointmentTime, date: new Date().toISOString()
      });
      if (selectedTech.email) {
        await addDoc(collection(db, "notifications"), {
          userId: selectedTech.email, message: t("newRequestNotification", { clientName: user.displayName }),
          icon: "🆕", type: 'request', date: new Date().toISOString(), read: false
        });
      }

      // 🚀 Premium Success Flow
      const bookingData = {
        id: docRef.id,
        technician_name: selectedTech.name,
        technician_image: selectedTech.img,
        serviceType: selectedTech.specialty,
        client_address: formData.address,
        scheduledDate: appointmentTime,
        paymentMethod: paymentMethod,
        price: finalPrice
      };

      toast.dismiss(loadingToast);
      setLastBookingDetails(bookingData); // Show Success Modal
      // We do NOT close selectedTech here to keep context for the modal

      // confetti moved to inside BookingSuccess component
    } catch (error) { toast.dismiss(loadingToast); toast.error(t("errorOccurred")); }
  };

  // 🧠 Smart AI Logic
  // 🧠 Smart AI Logic (Updated with Gemini)
  // const [aiResult, setAiResult] = useState(null); // Already declared above
  // const [isAnalyzing, setIsAnalyzing] = useState(false); // Already declared above

  const analyzeProblem = async () => {
    if (!aiQuery) return toast.error(t("writeProblem"));
    setIsAnalyzing(true);

    // Dynamic Import to avoid build errors if package is missing during dev
    try {
      const { analyzeHomeIssue } = await import('./services/aiService');
      const result = await analyzeHomeIssue(aiQuery, aiImage, language);
      setAiResult(result);



      // 📊 Log for Admin Analytics
      try {
        await addDoc(collection(db, "ai_logs"), {
          date: new Date().toISOString(),
          query: aiQuery,
          type: result.type,
          hasImage: !!aiImage,
          userEmail: user ? user.email : "anonymous"
        });
      } catch (err) { console.error("Log Error:", err); }
    } catch (e) {
      console.error(e);
      toast.error(t("aiError"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiResult && aiResult.type !== 'عام') {
      setSearchTerm(aiResult.type); toast.success(t("filteredByType", { type: aiResult.type }));
      setShowAIModal(false); setAiQuery(""); setAiResult(null); setAiImage(null);
    } else { toast(t("tryManualSearch")); setShowAIModal(false); }
  };

  const handleSmartBook = () => {
    if (!aiResult || !aiResult.action || aiResult.action.type !== 'BOOK_REQUEST') return;

    const serviceType = aiResult.action.service;
    // Find Best Tech (Highest Rating)
    const mapping = serviceMap[serviceType.toLowerCase()] || serviceMap['general']; // fallback

    // Filter techs matching service (or general if not found)
    const matchingTechs = technicians.filter(t => {
      if (t.role !== 'tech') return false;
      // Check specialty against service name or mapped keywords
      const tSpecialty = t.specialty.toLowerCase();
      const sType = serviceType.toLowerCase();
      // Simple inclusion check or map check
      return tSpecialty.includes(sType) || (serviceMap[sType] && serviceMap[sType].some(k => tSpecialty.includes(k)));
    });

    if (matchingTechs.length === 0) return toast.error(t("noTechsFound"));

    // Sort by Rating
    matchingTechs.sort((a, b) => Number(b.rating) - Number(a.rating));
    const bestTech = matchingTechs[0];

    // Open Booking
    setSelectedTech(bestTech);
    setFormData(prev => ({ ...prev, problem: aiQuery })); // Pre-fill problem
    setShowAIModal(false);
    toast.success(`⚡ ${t("smartMatch")}: ${bestTech.name}`);
  };

  const handleBroadcastRequest = async () => {
    if (!user) return toast.error(t("loginFirst"));
    if (!aiResult) return;

    const loadingToast = toast.loading(t("broadcasting"));

    try {
      // 1. Identify Specialty Key (Map AI result to DB Key)
      let specialtyKey = 'general';
      const aiType = aiResult.type.toLowerCase();

      // Reverse lookup in serviceMap
      for (const [key, values] of Object.entries(serviceMap)) {
        if (values.some(v => aiType.includes(v.toLowerCase()))) {
          specialtyKey = key;
          break;
        }
      }

      console.log(`Broadcasting to specialty: ${specialtyKey} (AI: ${aiType})`);

      // 2. Find Technicians
      const q = query(
        collection(db, "technicians"),
        where("role", "==", "tech"),
        where("specialty", "==", specialtyKey)
      );

      const querySnapshot = await getDocs(q);
      const techDocs = querySnapshot.docs;

      if (techDocs.length === 0) {
        toast.dismiss(loadingToast);
        return toast.error(t("noTechsFound"));
      }

      // 3. Send Notifications
      techDocs.forEach(techDoc => {
        const techData = techDoc.data();
        if (techData.email) {
          addDoc(collection(db, "notifications"), {
            userId: techData.email,
            message: t("broadcastMessage", { type: aiResult.type }),
            icon: "📢",
            type: 'broadcast',
            date: new Date().toISOString(),
            read: false
          });
        }
      });

      toast.dismiss(loadingToast);
      toast.success(t("broadcastSuccess", { count: techDocs.length }));
      setShowAIModal(false);

    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error(t("errorOccurred"));
    }
  };

  // ⛈️ Real-time Weather Logic
  const [weatherAlert, setWeatherAlert] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        const weather = data.current_weather;

        // Map WMO Weather Codes to Description & Icon
        const weatherMap = {
          0: { desc: "مشمس وعال العال", icon: "☀️" },
          1: { desc: "صافي غالباً", icon: "🌤️" },
          2: { desc: "غائم جزئياً", icon: "⛅" },
          3: { desc: "مغيمة شوية", icon: "☁️" },
          45: { desc: "شبورة وتوهان", icon: "🌫️" },
          48: { desc: "ضباب كثيف", icon: "🌫️" },
          51: { desc: "ندى خفيف", icon: "🌧️" },
          53: { desc: "رذاذ مطر", icon: "🌧️" },
          55: { desc: "رذاذ تقيل", icon: "🌧️" },
          61: { desc: "مطر خفيف", icon: "🌧️" },
          63: { desc: "مطرة حلوة", icon: "🌧️" },
          65: { desc: "مطرة شديدة.. ركز", icon: "🌧️" },
          80: { desc: "زياخ مطر خفيفة", icon: "🌦️" },
          81: { desc: "مطرة فجائية", icon: "🌦️" },
          82: { desc: "سيول.. خد بالك", icon: "🌧️" },
          95: { desc: "رعد وبرق.. ليلة صعبة", icon: "⛈️" }
        };

        const status = weatherMap[weather.weathercode] || { desc: "الجو غريب شوية", icon: "🌡️" };

        setWeatherAlert({
          isActive: true,
          icon: status.icon,
          message: `درجة الحرارة دلوقتي ${weather.temperature}°C وموقعك بيقول إن الجو ${status.desc}.`
        });
      } catch (error) {
        console.error("Weather fetch failed", error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Cairo if permission denied
          fetchWeather(30.0444, 31.2357);
        }
      );
    } else {
      // Fallback to Cairo
      fetchWeather(30.0444, 31.2357);
    }
  }, []);

  // Filter Logic moved inline to render
  // const filteredTechs = ... (Calculated inline in JSX)


  // --- Render Content ---
  const renderContent = () => {
    // Flow for New Users
    if (user && userRole === 'new') {
      const preferredRole = localStorage.getItem('preferredRole');

      if (preferredRole === 'tech') {
        return (
          <div style={{ padding: '20px', minHeight: '100vh', background: 'var(--bg-gradient)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <TechOnboarding user={user} onComplete={() => setUserRole('tech')} />
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-gradient)' }}>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '10px' }}>{t("welcome")} {user.displayName}</h2>
            <p style={{ marginBottom: '30px', color: 'var(--text-secondary)' }}>{t("clientDesc")}</p>

            {referralCodeFromUrl && (
              <input
                type="text"
                placeholder={t("enterReferralCode")}
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                style={{ padding: '10px', width: '100%', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            )}

            <button onClick={registerAsClient} className="submit-btn" style={{ marginBottom: '15px' }}>
              {t("continue")}
            </button>

            <button onClick={() => {
              localStorage.setItem('preferredRole', 'tech');
              window.location.reload();
            }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>
              {t("techDesc")} (تغيير للحساب فني)
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'market': return <JobMarket user={user} userRole={userRole} goBack={() => setActiveTab('home')} />;
      case 'my_requests': return <UserBookings user={user} goBack={() => setActiveTab('home')} />;
      case 'profile': return <Profile user={user} userRole={userRole} goBack={() => setActiveTab('home')} changeTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />;
      case 'tech_panel': return <TechDashboard user={user} goBack={() => setActiveTab('home')} />;
      case 'admin': return <AdminPanel goBack={() => setActiveTab('home')} />;
      case 'about': return <LegalPages page="about" goBack={() => setActiveTab('profile')} />;
      case 'privacy': return <LegalPages page="privacy" goBack={() => setActiveTab('profile')} />;
      case 'about': return <LegalPages page="about" goBack={() => setActiveTab('profile')} />;
      case 'privacy': return <LegalPages page="privacy" goBack={() => setActiveTab('profile')} />;
      case 'notifications': return <Notifications user={user} goBack={() => setActiveTab('home')} />;
      case 'notifications': return <Notifications user={user} goBack={() => setActiveTab('home')} />;
      case 'community': return <CommunityHub />;
      case 'help': return <HelpCenter goBack={() => setActiveTab('profile')} />;
      default: return (
        <div ref={containerRef}>
          <HomeTab
            user={user}
            userRole={userRole}
            t={t}
            weatherAlert={weatherAlert}
            setWeatherAlert={setWeatherAlert}
            servicesList={servicesList}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
            technicians={technicians}
            isLoadingTechs={isLoadingTechs}
            serviceMap={serviceMap}
            setSelectedTech={setSelectedTech}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
          {selectedTech && (
            <BookingModal
              selectedTech={selectedTech}
              onClose={() => setSelectedTech(null)}
              formData={formData}
              setFormData={setFormData}
              handleBookingSubmit={handleBookingSubmit}
              t={t}
              clientProfile={clientProfile}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={applyCoupon}
              problemFile={problemFile}
              setProblemFile={setProblemFile}
              language={language}
            />
          )}
        </div>
      );
    }
  };

  if (!user && !localStorage.getItem('skipLogin')) {
    return <LoginPage onLogin={handleGoogleLogin} />;
  }


  if (activeTab === 'admin') return <AdminPanel goBack={() => setActiveTab('home')} />;



  return (
    <div className="App app-container">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Main App Content (Hidden until splash is done to prevent flicker) */}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease-in' }}>
        <Toaster position="top-center" />

        {/* زرار الواتساب */}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{ position: 'fixed', bottom: '90px', right: '20px', backgroundColor: '#25D366', color: 'white', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)', zIndex: 10000, textDecoration: 'none', transition: 'transform 0.3s' }}><MessageCircle size={28} /></a>

        {/* مودال AI المتطور */}
        {showAIModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', width: '92%', maxWidth: '420px', padding: '15px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '28px' }}>
              <button className="close-btn" style={{ top: '12px', right: '12px', background: '#F1F5F9', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }} onClick={() => { setShowAIModal(false); setAiResult(null); setAiImage(null); window.speechSynthesis.cancel(); }}>✕</button>
              <div style={{ marginBottom: '20px' }}>
                <Sparkles size={40} color="#7C3AED" style={{ marginBottom: '10px' }} />
                <h2 style={{ margin: 0, color: '#1E293B' }}>{t("aiAssistantTitle")}</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '5px' }}>{t("aiAssistantDesc")}</p>
              </div>
              {!aiResult ? (
                <>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <textarea
                      placeholder={t("aiPlaceholder")}
                      className="form-input"
                      rows="4"
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '15px',
                        paddingLeft: language === 'ar' ? '15px' : '50px',
                        paddingRight: language === 'ar' ? '50px' : '15px',
                        resize: 'none',
                        height: '120px',
                        width: '100%'
                      }}
                    ></textarea>

                    {/* Image Preview */}
                    {aiImage && (
                      <div style={{ position: 'relative', marginTop: '10px', width: 'fit-content', margin: '10px auto' }}>
                        <img src={aiImage} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #3B82F6' }} />
                        <button onClick={() => setAiImage(null)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#EF4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <button onClick={handleVoiceInput} style={{
                      position: 'absolute',
                      [language === 'ar' ? 'right' : 'left']: '10px',
                      top: '10px',
                      background: isListening ? '#EF4444' : 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s',
                      zIndex: 10,
                      animation: isListening ? 'pulse-red 1.5s infinite' : 'none'
                    }}>
                      <Mic size={20} color={isListening ? 'white' : '#64748B'} />
                    </button>

                    <label style={{
                      position: 'absolute',
                      [language === 'ar' ? 'right' : 'left']: '10px',
                      top: '60px',
                      background: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      zIndex: 10
                    }}>
                      <Camera size={20} color="#64748B" />
                      <input type="file" accept="image/*" onChange={handleAIImageSelect} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <button onClick={analyzeProblem} className="submit-btn" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }} disabled={isAnalyzing}>{isAnalyzing ? t("analyzing") : <><Sparkles size={18} /> {t("analyzeFault")}</>}</button>
                </>
              ) : (
                <div className="fade-in" style={{ background: '#F0F9FF', padding: '20px', borderRadius: '16px', marginTop: '10px', border: '1px solid #BAE6FD', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>{aiResult.icon}</div>
                    <div><span style={{ fontSize: '0.8rem', color: '#64748B' }}>{t("diagnosis")}</span><h3 style={{ margin: 0, color: '#0369A1' }}>{aiResult.type}</h3></div>
                  </div>

                  {/* 💰 Estimated Price Range */}
                  {aiResult.estimatedPrice && (
                    <div className="fade-in" style={{ background: 'linear-gradient(to right, #F0FDF4, #DCFCE7)', padding: '12px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#166534', borderRadius: '50%', padding: '6px', color: 'white', display: 'flex' }}><DollarSign size={16} /></div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 'bold', display: 'block' }}>{t("estimatedCost") || "Estimated Cost"}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#14532D' }}>
                          {aiResult.estimatedPrice.min} - {aiResult.estimatedPrice.max} <span style={{ fontSize: '0.8rem' }}>{aiResult.estimatedPrice.currency}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309' }}><Lightbulb size={16} /> {t("quickTips")}</h4>
                    <ul style={{ margin: 0, paddingRight: '20px', fontSize: '0.85rem', color: '#475569' }}>{aiResult.tips.map((tip, idx) => <li key={idx} style={{ marginBottom: '5px' }}>{tip}</li>)}</ul>
                  </div>
                  <button onClick={applyAISuggestion} className="submit-btn" style={{ background: '#0369A1', width: '100%' }}>{t("showTechsFor")} {aiResult.type}</button>

                  {/* ⚡ Smart Action Button */}
                  {aiResult.action && aiResult.action.type === 'BOOK_REQUEST' && (
                    <button onClick={handleSmartBook} className="submit-btn" style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      width: '100%', marginTop: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                    }}>
                      <Zap size={18} fill="white" /> {t("smartBook") || "Smart Book Now"}
                    </button>
                  )}

                  {/* 📢 Broadcast Button */}
                  <button onClick={handleBroadcastRequest} className="submit-btn" style={{
                    background: 'linear-gradient(45deg, #F59E0B, #D97706)',
                    width: '100%',
                    marginTop: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '0.9rem'
                  }}>
                    📢 {t("notifyAll", { type: aiResult.type })}
                  </button>

                  <button onClick={() => setAiResult(null)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', textDecoration: 'underline', width: '100%', fontSize: '0.85rem' }}>{t("searchAnother")}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Modal (Handled in HomeTab) */}

        {/* Header - Only on Home */}
        {activeTab === 'home' && (
          <nav className="header">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            </div>

            {/* Top Right Actions Container */}
            <div style={{
              position: 'absolute', top: '20px', left: '20px', // Left for English, will need to check RTL or just use flex logic relative to page
              display: 'flex', gap: '10px', zIndex: 10
            }}>


              {/* Notification Bell moved here */}
              {user && (
                <button onClick={() => setActiveTab('notifications')} style={{
                  background: 'var(--glass)', border: '1px solid var(--border)',
                  borderRadius: '12px', width: '40px', height: '40px', cursor: 'pointer',
                  backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ position: 'relative', transform: isRinging ? 'rotate(15deg) scale(1.1)' : 'none', transition: '0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <MessageCircle size={20} color="white" style={{ transition: 'color 0.2s' }} />
                    {unreadCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)', animation: isRinging ? 'pulse 0.5s infinite' : 'none' }}>{unreadCount}</span>}
                  </div>
                </button>
              )}
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="hero-content">
              <img src={logo} alt="Fixsy Logo" style={{ width: '120px', marginBottom: '10px', dropShadow: '0 4px 6px rgba(0,0,0,0.2)', borderRadius: '20px' }} />

              <div className="search-container glass-panel" style={{ width: '90%', maxWidth: '500px', display: 'flex', alignItems: 'center', background: 'white', borderRadius: '16px', padding: '8px', gap: '10px' }}>
                <Search color="var(--text-secondary)" size={22} style={{ marginLeft: '10px', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: 0, fontSize: '1rem', color: 'var(--text)' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => setShowAIModal(true)} style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', border: 'none', borderRadius: '12px', padding: '10px 18px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <Sparkles size={18} /> AI
                </button>
              </div>
            </div>
          </nav>
        )}

        <div style={{ paddingBottom: '100px' }}>{renderContent()}</div>

        {/* الشريط السفلي الثابت */}
        <div className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '15px 0', zIndex: 9999 }}>
          <button onClick={() => setActiveTab('home')} className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
            <Home size={26} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>{t("home")}</span>
          </button>
          <button onClick={() => setActiveTab('market')} className={`nav-btn ${activeTab === 'market' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'market' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
            <Store size={26} strokeWidth={activeTab === 'market' ? 2.5 : 2} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'market' ? 'bold' : 'normal' }}>{t("market")}</span>
          </button>

          {/* Notifications Moved to Header */}

          {(userRole === 'client' || userRole === 'admin') && <button onClick={() => setActiveTab('my_requests')} className={`nav-btn ${activeTab === 'my_requests' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'my_requests' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}><ClipboardList size={26} strokeWidth={activeTab === 'my_requests' ? 2.5 : 2} /><span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'my_requests' ? 'bold' : 'normal' }}>{t("myRequests")}</span></button>}
          {(userRole === 'tech' || userRole === 'admin') && <button onClick={() => setActiveTab('tech_panel')} className={`nav-btn ${activeTab === 'tech_panel' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'tech_panel' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}><Zap size={26} strokeWidth={activeTab === 'tech_panel' ? 2.5 : 2} /><span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'tech_panel' ? 'bold' : 'normal' }}>{t("myTasks")}</span></button>}
          {userRole === 'admin' && <button onClick={() => setActiveTab('admin')} className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'admin' ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer' }}><ShieldCheck size={26} strokeWidth={activeTab === 'admin' ? 2.5 : 2} /><span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'admin' ? 'bold' : 'normal' }}>{t("admin")}</span></button>}

          {/* 💡 Community Tab */}
          <button onClick={() => setActiveTab('community')} className={`nav-btn ${activeTab === 'community' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'community' ? 'var(--warning)' : 'var(--text-secondary)', cursor: 'pointer' }}>
            <Lightbulb size={26} strokeWidth={activeTab === 'community' ? 2.5 : 2} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'community' ? 'bold' : 'normal' }}>{t("tips")}</span>
          </button>

          <button onClick={() => user ? setActiveTab('profile') : handleGoogleLogin()} className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}>{user ? <User size={26} strokeWidth={activeTab === 'profile' ? 2.5 : 2} /> : <LogIn size={26} />}<span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}>{user ? t("profile") : t("login")}</span></button>
        </div>
        {/* Premium Booking Success Modal */}
        {lastBookingDetails && (
          <BookingSuccess
            details={lastBookingDetails}
            onClose={() => {
              setLastBookingDetails(null);
              setSelectedTech(null);
              setFormData({ address: '', problem: '', location: null, scheduledTime: '' });
              setProblemFile(null); setCouponCode(""); setDiscount(0);
            }}
            onTrack={() => {
              setLastBookingDetails(null);
              setSelectedTech(null);
              setFormData({ address: '', problem: '', location: null, scheduledTime: '' });
              setProblemFile(null); setCouponCode(""); setDiscount(0);
              setActiveTab('my_requests');
            }}
          />
        )}
      </div>
    </div>
  );
}


export default App;
