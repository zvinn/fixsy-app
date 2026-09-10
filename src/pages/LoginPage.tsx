// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { User, Wrench, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import OptimizedImage from '../components/common/OptimizedImage';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import logo from '../logo.png';
import logoWebP from '../logo.webp';

type Role = 'client' | 'tech';

interface LoginPageProps {
    onLogin: (role?: Role) => void;
    onEmailLogin: (email: string, password: string) => Promise<boolean>;
    onEmailSignUp: (email: string, password: string, name: string) => Promise<boolean>;
    onTechSignup?: () => void;
    onGuestLogin?: (role: "client" | "tech" | "admin") => void;
}

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
        gsap.fromTo(".login-card", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    }, []);

    const handleGoogleLoginClick = (): void => {
        onLogin(selectedRole);
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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            fontFamily: 'Cairo, sans-serif',
            direction: language === 'ar' ? 'rtl' : 'ltr',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            overflow: 'auto',
            position: 'relative',
            padding: '20px'
        }}>
            {/* Background Blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(0, 86, 210, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} aria-hidden="true"></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }} aria-hidden="true"></div>

            <div className="login-card glass-panel" style={{
                width: '90%',
                maxWidth: '450px',
                padding: '40px',
                borderRadius: '30px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                background: 'rgba(255, 255, 255, 0.9)'
            }}>
                <picture>
                    <source srcSet={logoWebP} type="image/webp" />
                    <OptimizedImage src={logo} alt="Fixsy Logo" style={{ width: '100px', marginBottom: '20px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                </picture>

                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0056D2', marginBottom: '5px' }}>Fixsy</h1>
                <p style={{ color: '#475569', marginBottom: '30px', fontWeight: '500' }}>{t("loginSubtitle")}</p>

                {/* Role Selection */}
                <fieldset style={{ marginBottom: '30px', textAlign: language === 'ar' ? 'right' : 'left', border: 'none', padding: 0 }}>
                    <legend style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>{t("selectRole")}</legend>
                    <div style={{ display: 'flex', gap: '15px' }} role="radiogroup" aria-label={t("selectRole")}>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('client')}
                            role="radio"
                            aria-checked={selectedRole === 'client'}
                            className={selectedRole === 'client' ? 'hover-scale' : ''}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: selectedRole === 'client' ? '3px solid #0056D2' : '2px solid #cbd5e1',
                                background: selectedRole === 'client' ? '#eff6ff' : 'white',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: selectedRole === 'client' ? '700' : '600',
                                color: selectedRole === 'client' ? '#0056D2' : '#475569',
                                fontSize: '0.95rem'
                            }}
                        >
                            <User size={20} />
                            {t("client")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRole('tech')}
                            role="radio"
                            aria-checked={selectedRole === 'tech'}
                            className={selectedRole === 'tech' ? 'hover-scale' : ''}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: selectedRole === 'tech' ? '3px solid #ea580c' : '2px solid #cbd5e1',
                                background: selectedRole === 'tech' ? '#fff7ed' : 'white',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: selectedRole === 'tech' ? '700' : '600',
                                color: selectedRole === 'tech' ? '#ea580c' : '#475569',
                                fontSize: '0.95rem'
                            }}
                        >
                            <Wrench size={20} />
                            {t("technician")}
                        </button>
                    </div>
                </fieldset>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailSubmit} style={{ marginBottom: '20px', textAlign: 'left' }}>
                    {/* Name Input (Sign Up Only) */}
                    {isSignUp && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                                {t("fullName") || "الاسم الكامل"}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t("enterName") || "أدخل اسمك"}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        paddingLeft: language === 'ar' ? '12px' : '40px',
                                        paddingRight: language === 'ar' ? '40px' : '12px',
                                        border: '2px solid #cbd5e1',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        color: '#1e293b',
                                        fontWeight: '500'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                            {t("email") || "البريد الإلكتروني"}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t("enterEmail") || "أدخل بريدك الإلكتروني"}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    paddingLeft: language === 'ar' ? '12px' : '40px',
                                    paddingRight: language === 'ar' ? '40px' : '12px',
                                    border: '2px solid #cbd5e1',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    color: '#1e293b',
                                    fontWeight: '500'
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                            {t("password") || "كلمة المرور"}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: language === 'ar' ? 'auto' : '12px', right: language === 'ar' ? '12px' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t("enterPassword") || "أدخل كلمة المرور"}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    paddingLeft: language === 'ar' ? '40px' : '40px',
                                    paddingRight: language === 'ar' ? '40px' : '40px',
                                    border: '2px solid #cbd5e1',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    color: '#1e293b',
                                    fontWeight: '500'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: language === 'ar' ? 'auto' : '12px',
                                    left: language === 'ar' ? '12px' : 'auto',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="hover-scale"
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #0056D2 0%, #0047AB 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '1.05rem',
                            fontWeight: '700',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(0, 86, 210, 0.3)'
                        }}
                    >
                        {isLoading ? '⏳ جاري التحميل...' : (isSignUp ? (t("signUp") || "إنشاء حساب") : (t("login") || "تسجيل الدخول"))}
                    </button>
                </form>

                {/* Toggle Sign Up / Login */}
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#0056D2',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginBottom: '20px',
                        textDecoration: 'underline',
                        fontWeight: '600'
                    }}
                >
                    {isSignUp ? (t("alreadyHaveAccount") || "لديك حساب؟ سجل دخول") : (t("dontHaveAccount") || "ليس لديك حساب؟ أنشئ حساب")}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#64748b' }}>
                    <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                    <span style={{ padding: '0 10px', fontSize: '0.85rem', fontWeight: '600' }}>{t("or") || "أو"}</span>
                    <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLoginClick}
                    className="hover-scale"
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: 'white',
                        border: '2px solid #cbd5e1',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                    {t("continueWithGoogle") || "المتابعة باستخدام Google"}
                </button>
                {/* Quick 1-Click Demo Mode Card */}
                <div style={{
                    marginTop: '22px',
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(240, 253, 244, 0.95) 100%)',
                    border: '1.5px dashed #3b82f6',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Sparkles size={18} color="#2563eb" />
                        <span style={{ fontWeight: '800', color: '#1e40af', fontSize: '0.92rem' }}>
                            {t("quickDemoTitle") || "🚀 تجربة سريعة بدون تسجيل (Demo Mode)"}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '12px' }}>
                        {t("quickDemoSubtitle") || "اختر الدور لتجربة كامل ميزات المنصة فوراً بنقرة واحدة:"}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => onGuestLogin ? onGuestLogin('client') : null}
                            className="hover-scale"
                            style={{
                                padding: '10px 4px',
                                borderRadius: '12px',
                                border: '1px solid #93c5fd',
                                background: 'white',
                                color: '#1d4ed8',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)'
                            }}
                        >
                            <User size={18} />
                            <span>{t("clientDemo") || "عميل تجريبي"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onGuestLogin ? onGuestLogin('tech') : null}
                            className="hover-scale"
                            style={{
                                padding: '10px 4px',
                                borderRadius: '12px',
                                border: '1px solid #fed7aa',
                                background: 'white',
                                color: '#c2410c',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(194, 65, 12, 0.1)'
                            }}
                        >
                            <Wrench size={18} />
                            <span>{t("techDemo") || "فني تجريبي"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onGuestLogin ? onGuestLogin('admin') : null}
                            className="hover-scale"
                            style={{
                                padding: '10px 4px',
                                borderRadius: '12px',
                                border: '1px solid #e9d5ff',
                                background: 'white',
                                color: '#7e22ce',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(126, 34, 206, 0.1)'
                            }}
                        >
                            <ShieldCheck size={18} />
                            <span>{t("adminDemo") || "أدمن المنصة"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
