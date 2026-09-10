// src/pages/Login.tsx
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

interface LoginProps {
    onGoogleLogin: () => void;
    onEmailSignUp: (email: string, password: string, name: string) => Promise<boolean>;
    onEmailLogin: (email: string, password: string) => Promise<boolean>;
    onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onGoogleLogin, onEmailSignUp, onEmailLogin, onSuccess }) => {
    const { t } = useLanguage();
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error(t("fillAllFields") || "يرجى ملء جميع الحقول");
            return;
        }

        if (isSignUp) {
            if (!formData.name) {
                toast.error(t("enterName") || "يرجى إدخال الاسم");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error(t("passwordMismatch") || "كلمتا المرور غير متطابقتين");
                return;
            }
            if (formData.password.length < 6) {
                toast.error(t("weakPassword") || "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
                return;
            }
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
                onSuccess();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #0056D2 0%, #003D99 100%)',
            direction: 'rtl'
        }}>
            {/* Logo */}
            <div style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: 'white'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    🔧 Fixsy
                </h1>
                <p style={{ opacity: 0.8, marginTop: '5px' }}>
                    {t("appSlogan") || "صيانة منزلك بين إيديك"}
                </p>
            </div>

            {/* Form Card */}
            <Card style={{
                width: '100%',
                maxWidth: '400px',
                padding: '30px',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Toggle Tabs */}
                <div style={{
                    display: 'flex',
                    marginBottom: '25px',
                    background: '#F1F5F9',
                    borderRadius: '12px',
                    padding: '4px'
                }}>
                    <button
                        onClick={() => setIsSignUp(false)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: !isSignUp ? '#0056D2' : 'transparent',
                            color: !isSignUp ? 'white' : '#64748B'
                        }}
                    >
                        {t("login") || "تسجيل الدخول"}
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isSignUp ? '#0056D2' : 'transparent',
                            color: isSignUp ? 'white' : '#64748B'
                        }}
                    >
                        {t("createAccount") || "حساب جديد"}
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Name Field (Sign Up only) */}
                    {isSignUp && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: '600',
                                color: '#334155',
                                fontSize: '0.9rem'
                            }}>
                                {t("name") || "الاسم"}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User
                                    size={18}
                                    color="#94A3B8"
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                />
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t("enterYourName") || "أدخل اسمك"}
                                    style={{ paddingRight: '40px' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#334155',
                            fontSize: '0.9rem'
                        }}>
                            {t("email") || "البريد الإلكتروني"}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                color="#94A3B8"
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            />
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                style={{ paddingRight: '40px' }}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '600',
                            color: '#334155',
                            fontSize: '0.9rem'
                        }}>
                            {t("password") || "كلمة المرور"}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                color="#94A3B8"
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{ paddingRight: '40px', paddingLeft: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password (Sign Up only) */}
                    {isSignUp && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontWeight: '600',
                                color: '#334155',
                                fontSize: '0.9rem'
                            }}>
                                {t("confirmPassword") || "تأكيد كلمة المرور"}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={18}
                                    color="#94A3B8"
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ paddingRight: '40px' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isLoading}
                        style={{
                            marginTop: '10px',
                            padding: '14px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            borderRadius: '12px'
                        }}
                    >
                        {isLoading ? (
                            <span>{t("loading") || "جاري التحميل..."}</span>
                        ) : (
                            <>
                                {isSignUp ? (t("createAccount") || "إنشاء حساب") : (t("login") || "دخول")}
                                <ArrowRight size={18} style={{ marginRight: '8px' }} />
                            </>
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '25px 0',
                    gap: '15px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        {t("or") || "أو"}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                </div>

                {/* Google Login */}
                <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={onGoogleLogin}
                    style={{
                        padding: '14px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <Chrome size={20} color="#4285F4" />
                    {t("continueWithGoogle") || "المتابعة بحساب Google"}
                </Button>
            </Card>

            {/* Footer */}
            <p style={{
                color: 'rgba(255,255,255,0.7)',
                marginTop: '20px',
                fontSize: '0.8rem',
                textAlign: 'center'
            }}>
                {t("agreeToTerms") || "بتسجيلك، أنت موافق على شروط الاستخدام"}
            </p>
        </div>
    );
};

export default Login;
