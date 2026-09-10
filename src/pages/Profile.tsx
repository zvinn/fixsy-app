// src/pages/Profile.tsx
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../services/firebase';
import { User } from 'firebase/auth'; // Keep types
import { UploadCloud, FileText, User as UserIcon, Mail, Phone, ShieldAlert, LogOut, CheckCircle, Clock, XCircle, Edit2, Save, X, Camera, ChevronLeft, Wrench, AlertTriangle, Gift, Settings, Globe, MapPin, Plus, Trash2, Flame, Star, Shield, Award, Zap, Bell } from 'lucide-react';
import gsap from 'gsap';
import toast from 'react-hot-toast';
import OptimizedImage from '../components/common/OptimizedImage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import './Profile.css';

import { userService, UserProfileData, Address } from '../services/userService';

interface Technician {
    id: string;
    name: string;
    img?: string;
    specialty?: string;
    rating?: number;
    [key: string]: unknown;
}

interface ProfileProps {
    user: User | null;
    userRole: 'admin' | 'tech' | 'client' | null;
    goBack: () => void;
    changeTab: (tab: string) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    technicians: Technician[];
    applyReferralCode?: (code: string) => Promise<boolean>;
}

const Profile: React.FC<ProfileProps> = ({ user, userRole, goBack, changeTab, applyReferralCode }) => {
    const [userData, setUserData] = useState<UserProfileData | null>(null);
    const [docId, setDocId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UserProfileData>({});
    const { t, language, toggleLanguage } = useLanguage();

    const [verificationForm, setVerificationForm] = useState({ nationalId: '' });
    const [file, setFile] = useState<File | null>(null);
    const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);

    const [newAddress, setNewAddress] = useState("");
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [referralCodeInput, setReferralCodeInput] = useState("");
    const [isApplyingReferral, setIsApplyingReferral] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Animations
    useEffect(() => {
        if (userData && containerRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".profile-card-main", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
                gsap.fromTo(".fade-in-section", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2 });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [userData]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            // If no user or userRole, show message and redirect to login
            if (!user) {
                toast.error(t("pleaseLoginFirst") || "يرجى تسجيل الدخول أولاً");
                setTimeout(() => {
                    changeTab('home');
                }, 1500);
                return;
            }

            if (!userRole) {
                // Set basic user data while role is loading
                setUserData({
                    name: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || undefined
                });
                return;
            }

            try {
                const { data, id } = await userService.fetchUserProfile(user, userRole);
                setUserData(data);
                setDocId(id);
                setEditForm(data);
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error("Error fetching profile:", error);
                }
                setUserData({ name: user.displayName || '', email: user.email || '', photoURL: user.photoURL || undefined });
            }
        };
        fetchData();
    }, [user, userRole, t, changeTab]);

    const handleProfileImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setIsUploadingProfile(true);
        try {
            const imageUrl = await userService.updateProfileImage(user, file, docId, userRole || 'client');
            if (imageUrl) {
                setUserData(prev => prev ? ({ ...prev, photoURL: imageUrl }) : null);
                toast.success(t("photoChanged"));
            }
        } catch (err) {
            toast.error(t("updateFailed"));
        }
        setIsUploadingProfile(false);
    };

    const submitVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docId) return;
        if (!verificationForm.nationalId || !file) return toast.error("البيانات ناقصة");
        setIsSubmitting(true);

        try {
            const imageUrl = await userService.uploadImage(file);
            const portfolioUrls: string[] = [];
            if (portfolioFiles.length > 0) {
                for (const pFile of portfolioFiles) {
                    const url = await userService.uploadImage(pFile);
                    if (url) portfolioUrls.push(url);
                }
            }

            if (imageUrl) {
                await userService.submitVerification(docId, verificationForm.nationalId, imageUrl, portfolioUrls);
                setUserData(prev => prev ? ({
                    ...prev,
                    isVerified: "pending",
                    rejectionReason: "",
                    portfolio: [...(prev.portfolio || []), ...portfolioUrls]
                }) : null);
                toast.success(t("sentForReview"));
                setPortfolioFiles([]);
                setFile(null);
            }
        } catch (error) {
            toast.error(t("genericError"));
        }
        setIsSubmitting(false);
    };

    const handleSave = async () => {
        if (userRole === 'admin') return toast.error(t("adminNoEdit"));
        if (!docId || !userRole) return toast.error(t("noRecord"));
        try {
            await userService.updateProfileData(docId, userRole, {
                name: editForm.name,
                phone: editForm.phone || '',
                emergencyContact: editForm.emergencyContact || ''
            });
            if (userData) setUserData({ ...userData, ...editForm });
            setIsEditing(false);
            toast.success(t("updateSuccess"));
        } catch (error) { toast.error(t("genericError")); }
    };

    const handleAddressAdd = async () => {
        if (!newAddress.trim() || !docId) return;
        try {
            const newAddr: Address = { id: Date.now(), title: t("other"), detail: newAddress };
            await userService.addAddress(docId, newAddr);
            setUserData(prev => prev ? ({ ...prev, addresses: [...(prev.addresses || []), newAddr] }) : null);
            setNewAddress("");
            setIsAddingAddress(false);
            toast.success(t("save"));
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const handleAddressDelete = async (addr: Address) => {
        if (!window.confirm(t("deleteAddressConfirm")) || !docId) return;
        try {
            await userService.deleteAddress(docId, addr);
            setUserData(prev => prev ? ({ ...prev, addresses: prev.addresses?.filter(a => a.id !== addr.id) }) : null);
            toast.success(t("deleteSuccess"));
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const handleDeleteAccount = async () => {
        if (userRole === 'admin') return toast.error(t("adminNoDelete"));
        if (userRole === 'tech' && userData && (userData.debt || 0) > 0) return toast.error(`⛔ ${t("debtWarning")} ${userData.debt} ${t("currency")}`);
        if (!window.confirm(t("confirmDeleteConfig")) || !docId || !userRole || !user) return;
        try {
            await userService.deleteAccount(docId, userRole, user);
            toast.success(t("deleteSuccess")); window.location.reload();
        } catch (error) { toast.error(t("logoutAndRetry")); }
    };

    const handleLogout = () => { auth.signOut().then(() => window.location.reload()); };

    // Badges Logic
    const getBadges = () => {
        if (!userData) return [];
        const badges = [];
        if ((userData.streak || 0) >= 3) badges.push({ icon: <Flame color="#EF4444" fill="#EF4444" />, label: t("badgeOnFire"), desc: `${userData.streak} ${t("dayStreak")}`, bg: '#FEF2F2' });
        if (userData.isVerified === true || userData.isVerified === 'approved') badges.push({ icon: <Shield color="#10B981" fill="#10B981" />, label: t("badgeVerified"), desc: t("trustedUser"), bg: '#ECFDF5' });
        if (userRole === 'tech' && (userData.rating || 0) >= 4.8) badges.push({ icon: <Star color="#F59E0B" fill="#F59E0B" />, label: t("topRated"), desc: t("eliteTech"), bg: '#FFFBEB' });
        if ((userData.referralCount || 0) >= 1) badges.push({ icon: <Gift color="#ec4899" fill="#ec4899" />, label: t("inviter"), desc: t("sharedLove"), bg: '#FDF2F8' });
        if (!badges.length) badges.push({ icon: <Zap color="#6366F1" fill="#6366F1" />, label: t("rookie"), desc: t("justStarted"), bg: '#EEF2FF' });
        return badges;
    };
    const userBadges = getBadges();

    const handleNotificationToggle = async () => {
        if (!userData || !docId || !userRole) return;
        try {
            const newVal = !userData.notificationsEnabled;
            setUserData(prev => prev ? ({ ...prev, notificationsEnabled: newVal }) : null);
            await userService.toggleNotifications(docId, userRole, newVal);
            toast.success(newVal ? t("notificationsEnabled") : t("notificationsDisabled"));
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    if (!userData) return <div className="loading-container"><div className="spinner"></div><div className="loading-text">{t("loading")}</div></div>;

    return (
        <div ref={containerRef} className="profile-container">
            {/* Header */}
            <div className="profile-header-bg">
                <div className="profile-header-content">
                    <button className="back-button" onClick={goBack}>
                        <ChevronLeft size={24} />
                    </button>
                    <div className="header-actions">
                        <button className="header-action-btn" onClick={() => window.location.href = `mailto:support@fixsy.com`}>
                            <Mail size={16} /> support
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. Profile Card */}
            <div className="profile-card-main glass-card">
                <div className="profile-avatar-container">
                    <div className="profile-avatar-wrapper">
                        <OptimizedImage
                            src={userData.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`}
                            alt="user"
                            className="profile-avatar"
                        />
                        {isEditing && (
                            <label className="edit-avatar-badge">
                                {isUploadingProfile ? <div className="spinner-sm"></div> : <Camera size={14} color="white" />}
                                <input type="file" accept="image/*" className="file-input-hidden" onChange={handleProfileImageChange} disabled={isUploadingProfile} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <div className="profile-header-center">
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="profile-name-display"
                            />
                        </div>
                    ) : (
                        <h2 className="profile-name">
                            {userData.name}
                            {userData.isVerified === true && <CheckCircle size={18} color="#10B981" />}
                        </h2>
                    )}

                    <div className="profile-role-badge-wrapper">
                        <span className={`profile-role-badge profile-role-badge-styled ${userRole || 'client'}`}>
                            {userRole === 'tech' ? <Wrench size={12} /> : userRole === 'admin' ? <ShieldAlert size={12} /> : <UserIcon size={12} />}
                            {userRole === 'tech' ? t("proTech") : userRole === 'admin' ? t("systemManager") : t("vipClient")}
                        </span>
                    </div>

                    <p className="profile-email">{userData.email}</p>

                    {/* Verification Status Badge for Techs */}
                    {userRole === 'tech' && (
                        <div className="profile-stats-margin">
                            {userData.isVerified === true || userData.isVerified === 'approved' ? (
                                <Badge variant="success">✅ {t("verifiedAccount") || "حساب موثق"}</Badge>
                            ) : userData.isVerified === 'pending' ? (
                                <Badge variant="warning">🕒 {t("underReview") || "قيد المراجعة"}</Badge>
                            ) : (
                                <Badge variant="danger">⚠️ {t("unverified") || "غير موثق"}</Badge>
                            )}
                        </div>
                    )}

                    {userData.level && (
                        <div className="profile-stats-margin">
                            <Badge variant="warning">
                                {userData.level === 'Platinum' ? '💎' : userData.level === 'Gold' ? '🥇' : '🥈'} {t(userData.level.toLowerCase() + "Member")}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                {userRole !== 'admin' && (
                    <div className="stats-row">
                        <div className="stat-item">
                            <p className="stat-value">{userData.walletBalance || 0}</p>
                            <p className="stat-label">{t("wallet")}</p>
                        </div>
                        <div className="stat-item">
                            <p className="stat-value">{userData.loyaltyPoints || 0}</p>
                            <p className="stat-label">{t("points")}</p>
                        </div>
                        {userRole === 'tech' && (
                            <div className="stat-item">
                                <p className="stat-value">{userData.rating || 5.0}</p>
                                <p className="stat-label">⭐ {t("rating")}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="profile-content-padding">
                {/* 🛠️ Verification Center (Only for Techs) */}
                {userRole === 'tech' && (userData.isVerified !== true && userData.isVerified !== 'approved') && (
                    <div className="section-card verification-card fade-in-section">
                        <div className="section-header">
                            <h3 className="section-title verification-title verification-title-wrapper">
                                <div className="verification-icon-box">
                                    <ShieldAlert size={20} />
                                </div>
                                {t("verificationCenter") || "مركز التوثيق"}
                            </h3>
                        </div>

                        <div className="verification-desc-padding">
                            <p className="verification-description">
                                {t("verificationDesc") || "يرجى استكمال البيانات التالية لتفعيل حسابك والبدء في تلقي الطلبات."}
                            </p>

                            {userData.rejectionReason && (
                                <div className="rejection-box">
                                    <X size={20} className="rejection-icon-margin" />
                                    <div>
                                        <strong className="rejection-reason-title">{t("rejectionReason") || "سبب الرفض"}:</strong>
                                        {userData.rejectionReason}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submitVerification} className="verification-form">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t("nationalId") || "الرقم القومي"}
                                    </label>
                                    <Input
                                        value={verificationForm.nationalId}
                                        onChange={(e) => setVerificationForm({ ...verificationForm, nationalId: e.target.value })}
                                        placeholder={t("enterNationalId") || "أدخل رقم الهوية"}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {t("idCardImage") || "صورة البطاقة الشخصية"}
                                    </label>
                                    <label className={`custom-file-upload ${file ? 'active' : ''}`}>
                                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="file-input-hidden" />
                                        {file ? <CheckCircle size={24} color="var(--success)" /> : <UploadCloud size={24} />}
                                        <span className={file ? 'file-upload-label-selected' : 'file-upload-label-styled'}>{file ? file.name : (t("uploadId") || "رفع صورة البطاقة")}</span>
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {t("portfolio") || "سابقة الأعمال (صور)"}
                                    </label>
                                    <label className={`custom-file-upload ${portfolioFiles.length > 0 ? 'active' : ''}`}>
                                        <input type="file" accept="image/*" multiple onChange={(e) => setPortfolioFiles(Array.from(e.target.files || []))} className="file-input-hidden" />
                                        {portfolioFiles.length > 0 ? <CheckCircle size={24} color="var(--primary)" /> : <UploadCloud size={24} />}
                                        <span className={portfolioFiles.length > 0 ? 'file-upload-label-selected' : 'file-upload-label-styled'}>
                                            {portfolioFiles.length > 0 ? `${portfolioFiles.length} ${t("filesSelected") || "صور مختارة"}` : (t("uploadPortfolio") || "رفع صور أعمالك")}
                                        </span>
                                    </label>
                                </div>

                                {userData.isVerified === 'pending' ? (
                                    <Button fullWidth disabled variant="secondary" className="button-margin-top">
                                        <Clock size={18} style={{ marginLeft: '8px' }} /> {t("pendingReview") || "جاري المراجعة..."}
                                    </Button>
                                ) : (
                                    <Button type="submit" fullWidth disabled={isSubmitting} className="button-margin-top button-padding-large">
                                        {isSubmitting ? (t("uploading") || "جاري الرفع...") : (t("submitForReview") || "إرسال للمراجعة")}
                                    </Button>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Loyalty Points */}
                <div className="section-card fade-in-section">
                    <div className="loyalty-header-wrapper">
                        <h3 className="section-icon-title loyalty-section-title">
                            <Star size={20} color="#F59E0B" fill="#F59E0B" /> {t("loyaltyPoints")}
                        </h3>
                        <Badge variant="warning">{userData.loyaltyPoints || 0} {t("points")}</Badge>
                    </div>

                    <div className="loyalty-progress-margin">
                        <div className="loyalty-progress-labels">
                            <span>{t("nextReward")}</span>
                            <span>{userData.loyaltyPoints || 0} / 500</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${Math.min(((userData.loyaltyPoints || 0) / 500) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="loyalty-badges-container">
                        <Button variant="secondary" fullWidth icon={<Gift size={16} />}>{t("redeemReward")}</Button>
                        <Button variant="ghost" fullWidth icon={<FileText size={16} />}>{t("pointsHistory")}</Button>
                    </div>
                </div>

                {/* Referral Code Section */}
                {userRole !== 'admin' && (
                    <div className="section-card fade-in-section">
                        <div className="loyalty-header-wrapper">
                            <h3 className="section-icon-title loyalty-section-title">
                                <Gift size={20} color="#ec4899" fill="#ec4899" /> {t("referralCode") || "كود الإحالة"}
                            </h3>
                            {userData.referredBy && (
                                <Badge variant="success">✓ {t("applied") || "مُطبق"}</Badge>
                            )}
                        </div>

                        {userData.referredBy ? (
                            <div style={{ padding: '15px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                <p style={{ margin: 0, color: '#166534', fontWeight: '600' }}>
                                    ✅ {t("referralAppliedMessage") || "تم تطبيق كود الإحالة بنجاح!"}
                                </p>
                                <p style={{ margin: '8px 0 0', color: '#15803D', fontSize: '0.9rem' }}>
                                    {t("referredBy") || "تمت الإحالة بواسطة"}: <strong style={{ fontFamily: 'monospace' }}>{userData.referredBy}</strong>
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ margin: '0 0 15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {t("referralCodeDesc") || "أدخل كود الإحالة للحصول على مكافأة 20 ريال في محفظتك!"}
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Input
                                        placeholder={t("enterReferralCode") || "أدخل الكود"}
                                        value={referralCodeInput}
                                        onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                                        style={{ flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                                        disabled={isApplyingReferral}
                                    />
                                    <Button
                                        onClick={async () => {
                                            if (!referralCodeInput.trim() || !applyReferralCode) return;
                                            setIsApplyingReferral(true);
                                            const success = await applyReferralCode(referralCodeInput);
                                            if (success) {
                                                setReferralCodeInput('');
                                                // Refresh user data to show updated referredBy
                                                setTimeout(() => window.location.reload(), 2000);
                                            }
                                            setIsApplyingReferral(false);
                                        }}
                                        variant="primary"
                                        icon={<Gift size={18} />}
                                        disabled={isApplyingReferral || !referralCodeInput.trim()}
                                        isLoading={isApplyingReferral}
                                    >
                                        {t("apply") || "تطبيق"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Badges */}
                <h3 className="section-title achievements-title-wrapper">
                    <Award size={22} color="#F59E0B" /> {t("achievements")}
                </h3>
                <div className="achievements-scroll-container">
                    {userBadges.map((badge, index) => (
                        <div key={index} className="achievement-item">
                            <div className="achievement-icon-wrapper" style={{ background: badge.bg, boxShadow: `0 4px 10px ${badge.bg}` }}>
                                {badge.icon}
                            </div>
                            <div className="achievement-label">{badge.label}</div>
                            <div className="achievement-desc">{badge.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Personal Info */}
                <div className="section-card fade-in-section">
                    <div className="section-card-header">
                        <h3 className="section-icon-title">
                            <div className="section-icon-box section-icon-box-blue"><UserIcon size={20} /></div>
                            {t("personalInfo")}
                        </h3>
                        {userRole !== 'admin' && (
                            <Button size="sm" variant={isEditing ? 'danger' : 'secondary'} onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                            </Button>
                        )}
                    </div>

                    <div className="info-item">
                        <Mail size={22} className="info-item-icon" />
                        <div className="info-content">
                            <span className="info-label">{t("email")}</span>
                            <span className="info-value">{userData.email}</span>
                        </div>
                    </div>

                    <div className="info-item">
                        <Phone size={22} className="info-item-icon" />
                        <div className="info-content">
                            <span className="info-label">{t("phone")}</span>
                            {isEditing ? (
                                <Input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                            ) : (
                                <span className="info-value">{userData.phone || t("notRegistered")}</span>
                            )}
                        </div>
                    </div>

                    <div className="info-item info-item-emergency">
                        <ShieldAlert size={22} color="#EF4444" />
                        <div className="info-content">
                            <span className="info-label info-label-red">{t("trustedContact")}</span>
                            {isEditing ? (
                                <Input value={editForm.emergencyContact || ''} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
                            ) : (
                                <span className="info-value info-value-red">{userData.emergencyContact || t("notSet")}</span>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="edit-form-actions">
                            <Button variant="primary" fullWidth onClick={handleSave} icon={<Save size={20} />}>
                                {t("saveChanges")}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Addresses (Client Only) */}
                {userRole === 'client' && (
                    <div className="section-card fade-in-section">
                        <div className="section-card-header">
                            <h3 className="section-icon-title">
                                <div className="section-icon-box addresses-icon-box"><MapPin size={20} /></div>
                                {t("savedAddresses")}
                            </h3>
                        </div>

                        {userData?.addresses && userData.addresses.length > 0 ? (
                            <div className="addresses-grid">
                                {userData.addresses.map((addr, idx) => (
                                    <div key={idx} className="info-item">
                                        <div className="address-item-wrapper">
                                            <div className="address-icon-circle"><MapPin size={16} color="#2563EB" /></div>
                                            <div>
                                                <div className="address-title">{addr.title || t("addressTitle")}</div>
                                                <div className="address-detail">{addr.detail}</div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleAddressDelete(addr)} className="address-delete-btn"><Trash2 size={18} /></Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-addresses-message">{t("noRequests")}</p>
                        )}

                        {isAddingAddress ? (
                            <div className="add-address-form-wrapper">
                                <Input
                                    placeholder={t("addressDetails")}
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    className="add-address-input-margin"
                                />
                                <div className="add-address-buttons">
                                    <Button size="sm" onClick={handleAddressAdd}>{t("save")}</Button>
                                    <Button size="sm" variant="secondary" onClick={() => setIsAddingAddress(false)}>{t("cancel")}</Button>
                                </div>
                            </div>
                        ) : (
                            <Button variant="secondary" fullWidth onClick={() => setIsAddingAddress(true)} className="add-address-btn-dashed">
                                <Plus size={18} /> {t("addNewAddress")}
                            </Button>
                        )}
                    </div>
                )}

                {/* Settings */}
                <div className="section-card fade-in-section">
                    <div className="section-card-header">
                        <h3 className="section-icon-title">
                            <div className="section-icon-box" style={{ background: '#F1F5F9', color: '#64748B' }}><Settings size={20} /></div>
                            {t("settings")}
                        </h3>
                    </div>

                    <div className="info-item" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Globe size={20} color="#64748B" />
                            <span style={{ fontWeight: '600', color: '#334155' }}>{t("language")}</span>
                        </div>
                        <Button size="sm" variant="secondary" onClick={toggleLanguage}>
                            {language === 'ar' ? 'English' : 'عربي'}
                        </Button>
                    </div>

                    <div className="info-item" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Bell size={20} color={userData.notificationsEnabled !== false ? "#10B981" : "#94A3B8"} />
                            <span style={{ fontWeight: '600', color: '#334155' }}>{t("notifications")}</span>
                        </div>
                        <div onClick={handleNotificationToggle} style={{ cursor: 'pointer' }}>
                            {userData.notificationsEnabled !== false ? <Badge variant="success">{t("toggleOn")}</Badge> : <Badge variant="secondary">{t("toggleOff")}</Badge>}
                        </div>
                    </div>

                    {/* Role Switching */}
                    {userRole === 'client' && (
                        <div className="info-item" style={{ background: '#EFF6FF', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                <Wrench size={20} color="#2563EB" />
                                <span style={{ fontWeight: '600', color: '#1E40AF' }}>{t("becomeTech") || "انضم كفني"}</span>
                            </div>
                            <Button size="sm" variant="primary" onClick={() => changeTab('become_tech')}>
                                {t("apply") || "تقديم"}
                            </Button>
                        </div>
                    )}
                    {userRole === 'tech' && (
                        <div className="info-item" style={{ background: '#F0FDF4', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                <UserIcon size={20} color="#16A34A" />
                                <span style={{ fontWeight: '600', color: '#166534' }}>{t("switchToClient") || "التحويل لعميل"}</span>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => changeTab('home')}>
                                {t("browse") || "تصفح"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="section-card fade-in-section" style={{ border: '1px solid #FECACA', background: '#FEF2F2' }}>
                    <h3 className="section-icon-title" style={{ color: '#DC2626', marginBottom: '15px' }}>
                        <AlertTriangle size={20} /> {t("dangerZone")}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Button variant="secondary" fullWidth onClick={handleLogout} style={{ color: '#DC2626', borderColor: '#FCA5A5', background: 'white' }}>
                            <LogOut size={18} style={{ marginRight: '8px' }} /> {t("logout")}
                        </Button>

                        {userRole !== 'admin' && (
                            <Button variant="danger" fullWidth onClick={handleDeleteAccount}>
                                <XCircle size={18} style={{ marginRight: '8px' }} /> {t("deleteAccount")}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
