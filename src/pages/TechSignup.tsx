// src/pages/TechSignup.tsx
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Phone, MapPin, Wrench, Camera,
    Upload, Eye, EyeOff, ArrowRight, SkipForward, CheckCircle,
    Briefcase, CreditCard
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';
import OptimizedImage from '../components/common/OptimizedImage';
import safeLocalStorage from '../utils/safeLocalStorage';

interface TechSignupProps {
    onEmailSignUp: (email: string, password: string, name: string) => Promise<boolean>;
    onGoogleLogin: () => void;
    onSuccess: () => void;
    onSkip?: () => void;
}

const specialties = [
    { id: 'plumbing', icon: '🔧', color: 'var(--primary)', bg: 'rgba(0, 86, 210, 0.1)' },
    { id: 'electricity', icon: '⚡', color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)' },
    { id: 'carpentry', icon: '🪚', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
    { id: 'ac', icon: '❄️', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { id: 'painting', icon: '🎨', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { id: 'appliances', icon: '📺', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
];

const TechSignup: React.FC<TechSignupProps> = ({ onEmailSignUp, onGoogleLogin, onSuccess, onSkip }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        specialty: '',
        area: '',
        idImage: null as File | null,
        portfolioImages: [] as File[],
        experience: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idImage' | 'portfolioImages') => {
        if (e.target.files) {
            if (field === 'idImage') {
                setFormData({ ...formData, idImage: e.target.files[0] });
            } else {
                setFormData({ ...formData, portfolioImages: Array.from(e.target.files).slice(0, 5) });
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.password || !formData.name) {
            toast.error(t("fillAllFields") || "يرجى ملء جميع الحقول المطلوبة");
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

        setIsLoading(true);
        try {
            const success = await onEmailSignUp(formData.email, formData.password, formData.name);
            if (success) {
                // Store tech data for later use
                safeLocalStorage.setItem('pendingTechData', JSON.stringify({
                    phone: formData.phone,
                    specialty: formData.specialty,
                    area: formData.area,
                    experience: formData.experience,
                    hasIdImage: !!formData.idImage,
                    portfolioCount: formData.portfolioImages.length
                }));
                safeLocalStorage.setItem('preferredRole', 'tech');
                toast.success(t("techAccountCreated") || "تم إنشاء حساب الفني بنجاح! 🔧");
                onSuccess();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
                <label className="input-label">
                    {t("name") || "الاسم الكامل"} *
                </label>
                <div style={{ position: 'relative' }}>
                    <User size={18} className="input-icon" />
                    <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t("enterYourName") || "أدخل اسمك"} className="icon-input" />
                </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
                <label className="input-label">
                    {t("email") || "البريد الإلكتروني"} *
                </label>
                <div style={{ position: 'relative' }}>
                    <Mail size={18} className="input-icon" />
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" className="icon-input" />
                </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
                <label className="input-label">
                    {t("password") || "كلمة المرور"} *
                </label>
                <div style={{ position: 'relative' }}>
                    <Lock size={18} className="input-icon" />
                    <Input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="icon-input" style={{ paddingLeft: '40px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">
                    {t("confirmPassword") || "تأكيد كلمة المرور"} *
                </label>
                <div style={{ position: 'relative' }}>
                    <Lock size={18} className="input-icon" />
                    <Input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="icon-input" />
                </div>
            </div>

            <Button type="button" fullWidth onClick={() => setStep(2)} style={{ marginTop: '10px' }}>
                {t("next") || "التالي"} <ArrowRight size={18} style={{ marginRight: '8px' }} />
            </Button>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            {/* Phone */}
            <div style={{ marginBottom: '16px' }}>
                <label className="input-label">
                    {t("phone") || "رقم الموبايل"}
                </label>
                <div style={{ position: 'relative' }}>
                    <Phone size={18} className="input-icon" />
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="01xxxxxxxxx" className="icon-input" />
                </div>
            </div>

            {/* Specialty */}
            <div style={{ marginBottom: '16px' }}>
                <label className="input-label">
                    {t("specialty") || "التخصص"}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {specialties.map((spec) => (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={spec.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, specialty: spec.id })}
                            style={{
                                padding: '15px 10px',
                                borderRadius: '16px',
                                border: formData.specialty === spec.id ? `2px solid ${spec.color}` : '1px solid var(--border)',
                                background: formData.specialty === spec.id ? spec.bg : 'var(--bg-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: formData.specialty === spec.id ? `0 4px 12px ${spec.bg}` : 'none'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{spec.icon}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: formData.specialty === spec.id ? spec.color : 'var(--text-secondary)' }}>
                                {t(spec.id) || spec.id}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Area */}
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">
                    {t("area") || "المنطقة"}
                </label>
                <div style={{ position: 'relative' }}>
                    <MapPin size={18} className="input-icon" />
                    <Input type="text" name="area" value={formData.area} onChange={handleChange} placeholder={t("enterArea") || "مثال: المعادي، القاهرة"} className="icon-input" />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                    {t("back") || "رجوع"}
                </Button>
                <Button type="button" fullWidth onClick={() => setStep(3)} style={{ flex: 2 }}>
                    {t("next") || "التالي"} <ArrowRight size={18} style={{ marginRight: '8px' }} />
                </Button>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
            {/* ID Image */}
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">
                    <CreditCard size={16} style={{ marginLeft: '5px', verticalAlign: 'middle' }} />
                    {t("idImage") || "صورة البطاقة الشخصية"}
                </label>
                <label className={`upload-box ${formData.idImage ? 'active' : ''}`}>
                    {formData.idImage ? (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <CheckCircle size={32} color="var(--success)" />
                            <span style={{ marginTop: '8px', color: 'var(--success)', fontWeight: '600' }}>{formData.idImage.name}</span>
                        </motion.div>
                    ) : (
                        <>
                            <Camera size={32} color="var(--text-secondary)" />
                            <span style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{t("uploadId") || "اضغط لرفع صورة البطاقة"}</span>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'idImage')} style={{ display: 'none' }} />
                </label>
            </div>

            {/* Portfolio */}
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">
                    <Briefcase size={16} style={{ marginLeft: '5px', verticalAlign: 'middle' }} />
                    {t("portfolio") || "سابقة الأعمال"} ({formData.portfolioImages.length}/5)
                </label>
                <label className={`upload-box ${formData.portfolioImages.length > 0 ? 'active' : ''}`}>
                    {formData.portfolioImages.length > 0 ? (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <CheckCircle size={32} color="var(--primary)" />
                            <span style={{ marginTop: '8px', color: 'var(--primary)', fontWeight: '600' }}>
                                {formData.portfolioImages.length} {t("imagesUploaded") || "صور تم رفعها"}
                            </span>
                        </motion.div>
                    ) : (
                        <>
                            <Upload size={32} color="var(--text-secondary)" />
                            <span style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{t("uploadPortfolio") || "ارفع صور أعمالك السابقة"}</span>
                        </>
                    )}
                    <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'portfolioImages')} style={{ display: 'none' }} />
                </label>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">
                    {t("experience") || "الخبرة"}
                </label>
                <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder={t("experienceDesc") || "اكتب نبذة عن خبرتك في المجال..."}
                    className="custom-textarea"
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
                    {t("back") || "رجوع"}
                </Button>
                <Button type="button" fullWidth onClick={handleSubmit} disabled={isLoading} style={{ flex: 2 }}>
                    {isLoading ? (t("loading") || "جاري التحميل...") : (t("createTechAccount") || "إنشاء حساب الفني")}
                </Button>
            </div>
        </motion.div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            direction: 'rtl'
        }}>
            <style>
                {`
                    .input-label { display: block; margin-bottom: 6px; font-weight: 600; color: var(--text); font-size: 0.9rem; }
                    .input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; z-index: 10; }
                    .icon-input { padding-right: 40px !important; background: var(--bg-secondary) !important; border-color: var(--border) !important; color: var(--text) !important; }
                    .password-toggle { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; color: var(--text-secondary); }
                    .upload-box { display: flex; flex-direction: column; alignItems: center; padding: 25px; border: 2px dashed var(--border); border-radius: 16px; cursor: pointer; background: var(--bg-secondary); transition: all 0.3s; }
                    .upload-box:hover { border-color: var(--primary); background: var(--bg-primary); }
                    .upload-box.active { background: rgba(0, 86, 210, 0.05); border-color: var(--primary); }
                    .custom-textarea { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); min-height: 80px; resize: vertical; font-family: inherit; font-size: 0.95rem; background: var(--bg-secondary); color: var(--text); }
                    .custom-textarea:focus { border-color: var(--primary); outline: none; }
                `}
            </style>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
                <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Wrench size={32} /> {t("techSignup") || "تسجيل فني جديد"}
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} style={{ opacity: 0.9, marginTop: '8px', fontSize: '1.1rem' }}>
                    {t("techSignupDesc") || "انضم لفريق فنيين Fixsy وابدأ في استقبال الطلبات"}
                </motion.p>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
                {[1, 2, 3].map((s) => (
                    <motion.div
                        key={s}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{
                            width: '40px',
                            height: '6px',
                            borderRadius: '3px',
                            background: step >= s ? 'white' : 'rgba(255,255,255,0.25)',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>

            {/* Form Card */}
            <Card className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '35px', borderRadius: '24px', background: 'var(--bg-primary)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: '20px' }}>
                        {t("step") || "الخطوة"} {step} / 3
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </AnimatePresence>

                {/* Skip Button */}
                {onSkip && (
                    <button
                        onClick={onSkip}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            marginTop: '20px',
                            padding: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <SkipForward size={16} />
                        {t("skipForNow") || "تخطي الآن وأكمل لاحقاً"}
                    </button>
                )}

                {/* Google Alternative */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', gap: '15px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t("or") || "أو"}</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <Button type="button" variant="secondary" fullWidth onClick={onGoogleLogin} style={{ gap: '10px', height: '50px', fontSize: '1rem' }}>
                    <OptimizedImage src="https://www.google.com/favicon.ico" alt="" style={{ width: '22px' }} />
                    {t("continueWithGoogle") || "المتابعة بحساب Google"}
                </Button>
            </Card>
        </div>
    );
};

export default TechSignup;
