// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { User, Wrench, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import OptimizedImage from '../components/common/OptimizedImage';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import logo from '../logo.png';
import logoWebP from '../logo.webp';
import './LoginPage.css';

type Role = 'client' | 'tech';

interface LoginPageProps {
    onLogin: (role?: Role) => void;
    onEmailLogin: (email: string, password: string) => Promise<boolean>;
    onEmailSignUp: (email: string, password: string, name: string) => Promise<boolean>;
    onTechSignup?: () => void;
    onGuestLogin?: (role: "client" | "tech" | "admin") => void;
}

const DEMO_CREDENTIALS = {
    client: {
        uid: 'demo-client-001',
        email: 'client.demo@fixsy.com',
        displayName: 'أحمد محمود (عميل تجريبي)',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    tech: {
        uid: 'demo-tech-001',
        email: 'tech.demo@fixsy.com',
        displayName: 'م. كريم سامي (فني تجريبي)',
        photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
    admin: {
        uid: 'demo-admin-001',
        email: 'admin.demo@fixsy.com',
        displayName: 'إدارة المنصة (أدمن تجريبي)',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    }
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onEmailLogin, onEmailSignUp, onTechSignup, onGuestLogin }) => {
    const { t, language } = useLanguage();
    const [selectedRole, setSelectedRole] = useState<Role>('client');
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        gsap.fromTo(
            ".login-card-container",
            { y: 25, opacity: 0, scale: 0.98 },
            { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power3.out" }
        );
    }, []);

    const handleGoogleLoginClick = (): void => {
        onLogin(selectedRole);
    };

    const handleDemoSelect = (role: 'client' | 'tech' | 'admin') => {
        try {
            const demo = DEMO_CREDENTIALS[role];
            localStorage.setItem('fixsy_demo_user', JSON.stringify(demo));
            localStorage.setItem('fixsy_demo_role', role);
            localStorage.setItem('fixsy_user_role', role);
            localStorage.setItem('skipLogin', 'true');
        } catch (e) {
            console.warn("Storage fallback notice:", e);
        }

        if (onGuestLogin) {
            onGuestLogin(role);
        } else {
            // Instant guaranteed URL fallback
            window.location.href = `/?demo=${role}`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error(t("fillAllFields") || "يرجى ملء جميع الحقول");
            return;
        }

        if (isSignUp && !formData.name) {
            toast.error(t("enterName") || "يرجى إدخال الاسم");
            return;
        }

        if (formData.password.length < 6) {
            toast.error(t("weakPassword") || "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        setIsLoading(true);
        try {
            let success = false;
            if (isSignUp) {
                success = await onEmailSignUp(formData.email, formData.password, formData.name);
            } else {
                success = await onEmailLogin(formData.email, formData.password);
            }

            if (success) {
                toast.success(isSignUp ? '✅ تم إنشاء الحساب بنجاح' : '✅ تم تسجيل الدخول بنجاح');
                window.location.reload();
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Login error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Ambient Background Blobs */}
            <div className="login-ambient-blob blob-1" aria-hidden="true" />
            <div className="login-ambient-blob blob-2" aria-hidden="true" />

            <div className="login-card-container">
                {/* Brand Header */}
                <div className="login-header">
                    <div className="login-logo-wrap">
                        <picture>
                            <source srcSet={logoWebP} type="image/webp" />
                            <OptimizedImage src={logo} alt="Fixsy Logo" />
                        </picture>
                    </div>

                    <div className="login-title-row">
                        <h1 className="login-title">Fixsy</h1>
                        <span className="login-version-badge">v2.4 PRO</span>
                    </div>
                    <p className="login-subtitle">{t("loginSubtitle") || "منصة خدمات الصيانة المنزلية الذكية"}</p>
                </div>

                {/* Role Switcher */}
                <div className="role-tabs-container" role="radiogroup" aria-label="اختر صفة الحساب">
                    <button
                        type="button"
                        onClick={() => setSelectedRole('client')}
                        role="radio"
                        aria-checked={selectedRole === 'client'}
                        className={`role-tab-btn ${selectedRole === 'client' ? 'active client' : ''}`}
                    >
                        <User size={18} />
                        <span>{t("client") || "عميل"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('tech')}
                        role="radio"
                        aria-checked={selectedRole === 'tech'}
                        className={`role-tab-btn ${selectedRole === 'tech' ? 'active tech' : ''}`}
                    >
                        <Wrench size={18} />
                        <span>{t("technician") || "فني معتمد"}</span>
                    </button>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailSubmit} className="login-form">
                    {/* Full Name (Sign Up Only) */}
                    {isSignUp && (
                        <div className="form-group">
                            <label className="form-label">
                                {t("fullName") || "الاسم الكامل"}
                            </label>
                            <div className="form-input-wrap">
                                <User size={18} className="input-icon-start" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t("enterName") || "أدخل اسمك الكريم"}
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="form-group">
                        <label className="form-label">
                            {t("email") || "البريد الإلكتروني"}
                        </label>
                        <div className="form-input-wrap">
                            <Mail size={18} className="input-icon-start" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label className="form-label">
                            {t("password") || "كلمة المرور"}
                        </label>
                        <div className="form-input-wrap">
                            <Lock size={18} className="input-icon-start" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="form-input has-pwd-toggle"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="input-toggle-pwd"
                                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-submit-primary"
                    >
                        {isLoading ? (
                            <span>جاري التحميل...</span>
                        ) : (
                            <>
                                <span>
                                    {isSignUp
                                        ? (t("createAccount") || "إنشاء حساب جديد")
                                        : (t("login") || "تسجيل الدخول")}
                                </span>
                                {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                            </>
                        )}
                    </button>
                </form>

                {/* Switch between Login and Sign Up */}
                <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="switch-mode-btn"
                >
                    {isSignUp
                        ? (t("alreadyHaveAccount") || "لديك حساب بالفعل؟ تسجيل الدخول")
                        : (t("dontHaveAccount") || "ليس لديك حساب؟ إنشاء حساب جديد")}
                </button>

                {/* Divider */}
                <div className="login-divider">
                    <span>{t("or") || "أو"}</span>
                </div>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={handleGoogleLoginClick}
                    className="btn-google-auth"
                    aria-label="تسجيل الدخول باستخدام حساب Google"
                >
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    <span>{t("continueWithGoogle") || "المتابعة باستخدام Google"}</span>
                </button>

                {/* VIP 1-Click Demo Mode Card */}
                <div className="demo-mode-card">
                    <div className="demo-header">
                        <span className="demo-title">
                            <Sparkles size={16} />
                            {t("quickDemoTitle") || "🚀 تجربة سريعة بدون تسجيل (Demo Mode)"}
                        </span>
                    </div>
                    <p className="demo-subtitle">
                        {t("quickDemoSubtitle") || "اختر الدور لتجربة كامل ميزات المنصة فوراً بنقرة واحدة:"}
                    </p>

                    <div className="demo-roles-grid">
                        {/* Client Demo */}
                        <button
                            type="button"
                            onClick={() => handleDemoSelect('client')}
                            className="demo-role-btn client-demo"
                            title="دخول فوري كعميل تجريبي"
                        >
                            <div className="demo-icon-circle">
                                <User size={18} />
                            </div>
                            <span className="demo-role-label">{t("clientDemo") || "عميل تجريبي"}</span>
                            <span className="demo-role-tag">طلب خدمات</span>
                        </button>

                        {/* Tech Demo */}
                        <button
                            type="button"
                            onClick={() => handleDemoSelect('tech')}
                            className="demo-role-btn tech-demo"
                            title="دخول فوري كفني معتمد"
                        >
                            <div className="demo-icon-circle">
                                <Wrench size={18} />
                            </div>
                            <span className="demo-role-label">{t("techDemo") || "فني معتمد"}</span>
                            <span className="demo-role-tag">سوق العمل</span>
                        </button>

                        {/* Admin Demo */}
                        <button
                            type="button"
                            onClick={() => handleDemoSelect('admin')}
                            className="demo-role-btn admin-demo"
                            title="دخول فوري كمسؤول المنصة"
                        >
                            <div className="demo-icon-circle">
                                <ShieldCheck size={18} />
                            </div>
                            <span className="demo-role-label">{t("adminDemo") || "إدارة المنصة"}</span>
                            <span className="demo-role-tag">تحكم شامل</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
