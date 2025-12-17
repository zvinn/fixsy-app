import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { deleteUser, signOut, updateProfile } from 'firebase/auth';
import { UploadCloud, FileText, User, Mail, Phone, ShieldAlert, LogOut, CheckCircle, Clock, XCircle, Edit2, Save, X, Camera, ChevronLeft, Wrench, AlertTriangle, Gift, Share2, Settings, Globe, Sun, Moon, Wallet, MapPin, Plus, Trash2, Flame, Star, Shield, Award, Zap, Building, HelpCircle, Lock } from 'lucide-react';
import gsap from 'gsap';
import toast from 'react-hot-toast';

function Profile({ user, userRole, goBack, changeTab, theme, toggleTheme, technicians }) {
    const [userData, setUserData] = useState(null);
    const [docId, setDocId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const { t, language, toggleLanguage } = useLanguage();

    const [verificationForm, setVerificationForm] = useState({ nationalId: '' });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Removed unused profileImageFile state
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);

    const [newAddress, setNewAddress] = useState("");
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    useEffect(() => {
        if (!userData) return;
        setEditedData({ name: userData.name || '', phone: userData.phone || '' });
    }, [userData]);

    // Helper to sync local edit form
    const [editedData, setEditedData] = useState({}); // Adding this as it seemed missing or I'll just use editForm directly (editForm is already there on line 14, wait. Line 14: const [editForm, setEditForm] = useState({});)
    // Actually, I don't need editedData if editForm is used. I'll just add the address state.

    const containerRef = useRef(null);
    const CLOUD_NAME = "du9zxrsfl";
    const UPLOAD_PRESET = "fixsy_upload";

    useEffect(() => {
        if (userData) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".profile-card", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
                gsap.fromTo(".profile-section", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2 });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [userData]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            if (userRole === 'admin') {
                setUserData({ name: user.displayName || t("adminRole"), email: user.email, phone: t("notRegistered"), role: 'admin', photoURL: user.photoURL });
                return;
            }
            const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
            try {
                const q = query(collection(db, collectionName), where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0];
                    setUserData({ ...docData.data(), photoURL: docData.data().img || user.photoURL });
                    setDocId(docData.id);
                    setEditForm(docData.data());
                } else {
                    setUserData({ name: user.displayName, email: user.email, phone: '', photoURL: user.photoURL });
                }
            } catch (error) { setUserData({ name: user.displayName, email: user.email, photoURL: user.photoURL }); }
        };
        fetchData();
    }, [user, userRole]);

    const uploadToCloudinary = async (fileToUpload) => {
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("upload_preset", UPLOAD_PRESET);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            return data.secure_url;
        } catch (error) { console.error(error); return null; }
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // setProfileImageFile(file); // Triggered warning, removed
        setIsUploadingProfile(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
            try {
                await updateProfile(auth.currentUser, { photoURL: imageUrl });
                if (docId) {
                    const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
                    await updateDoc(doc(db, collectionName, docId), { img: imageUrl });
                }
                setUserData(prev => ({ ...prev, photoURL: imageUrl }));
                toast.success(t("photoChanged"));
            } catch (err) { toast.error(t("updateFailed")); }
        }
        setIsUploadingProfile(false);
    };

    const submitVerification = async (e) => {
        e.preventDefault();
        if (!verificationForm.nationalId || !file) return toast.error("البيانات ناقصة");
        setIsSubmitting(true);
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl && docId) {
            try {
                const userRef = doc(db, "technicians", docId);
                await updateDoc(userRef, { nationalId: verificationForm.nationalId, idCardImage: imageUrl, isVerified: "pending", rejectionReason: "" });
                setUserData(prev => ({ ...prev, isVerified: "pending", rejectionReason: "" }));
                toast.success(t("sentForReview"));
            } catch (error) { toast.error(t("genericError")); }
        }
        setIsSubmitting(false);
    };

    const handleSave = async () => {
        if (userRole === 'admin') return toast.error(t("adminNoEdit"));
        if (!docId) return toast.error(t("noRecord"));
        try {
            const collectionName = userRole === 'tech' ? 'technicians' : 'clients';

            await updateDoc(doc(db, collectionName, docId), {
                name: editForm.name,
                phone: editForm.phone || '',
                emergencyContact: editForm.emergencyContact || '' // 🛡️ Safety
            });
            setUserData({ ...userData, ...editForm });
            setIsEditing(false);
            toast.success(t("updateSuccess"));
        } catch (error) { toast.error(t("genericError")); }
    };

    // Client Exp 2.0: Address Handlers
    const handleAddressAdd = async () => {
        if (!newAddress.trim()) return;
        try {
            await updateDoc(doc(db, "clients", docId), {
                addresses: arrayUnion({ id: Date.now(), title: t("other"), detail: newAddress })
            });
            // Update local state
            setUserData(prev => ({
                ...prev,
                addresses: [...(prev.addresses || []), { id: Date.now(), title: t("other"), detail: newAddress }]
            }));
            setNewAddress("");
            setIsAddingAddress(false);
            toast.success(t("save"));
        } catch (e) {
            console.error(e);
            toast.error(t("errorOccurred"));
        }
    };

    const handleAddressDelete = async (addr) => {
        if (!window.confirm(t("deleteAddressConfirm"))) return;
        try {
            await updateDoc(doc(db, "clients", docId), {
                addresses: arrayRemove(addr)
            });
            setUserData(prev => ({
                ...prev,
                addresses: prev.addresses.filter(a => a.id !== addr.id)
            }));
            toast.success(t("deleteSuccess"));
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const handleDeleteAccount = async () => {
        if (userRole === 'admin') return toast.error(t("adminNoDelete"));
        if (userRole === 'tech' && userData.debt > 0) return toast.error(`⛔ ${t("debtWarning")} ${userData.debt} ${t("currency")}`);
        if (!window.confirm(t("confirmDeleteConfig"))) return;
        try {
            const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
            if (docId) await deleteDoc(doc(db, collectionName, docId));
            await deleteUser(auth.currentUser);
            toast.success(t("deleteSuccess")); window.location.reload();
        } catch (error) { toast.error(t("logoutAndRetry")); }
    };

    const handleLogout = () => { signOut(auth); window.location.reload(); };

    const handleShare = async () => {
        const referralCode = userData.referralCode || (userData.name?.substring(0, 4) + (userData.phone?.substring(userData.phone.length - 4) || "2024")).toUpperCase().replace(/\s/g, '');
        const shareData = {
            title: t("referralTitle"),
            text: `${t("referralText")} ${referralCode} ${t("gift50").split('!')[0]}`,
            url: 'https://fixsy-app-1d3b7.web.app',
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.error(err); }
        } else {
            navigator.clipboard.writeText(shareData.text);
            toast.success(t("codeCopied"));
        }
    };

    if (!userData) return <div className="loading-container"><div className="spinner"></div><div className="loading-text">{t("loading")}</div></div>;

    // 🏆 Gamification Badges Logic
    const getBadges = () => {
        const badges = [];
        // 1. Streak Badge
        if (userData.streak >= 3) badges.push({ icon: <Flame color="#EF4444" fill="#EF4444" />, label: t("badgeOnFire") || "On Fire!", desc: `${userData.streak} Day Streak`, bg: '#FEF2F2' });

        // 2. Verified Badge
        if (userData.isVerified === true || userData.isVerified === 'approved') badges.push({ icon: <Shield color="#10B981" fill="#10B981" />, label: t("badgeVerified") || "Verified", desc: "Trusted User", bg: '#ECFDF5' });

        // 3. Rating Badge (Tech)
        if (userRole === 'tech' && userData.rating >= 4.8) badges.push({ icon: <Star color="#F59E0B" fill="#F59E0B" />, label: "Top Rated", desc: "Elite Tech", bg: '#FFFBEB' });

        // 4. Referral Badge
        if (userData.referralCount >= 1) badges.push({ icon: <Gift color="#ec4899" fill="#ec4899" />, label: "Inviter", desc: "Shared the Love", bg: '#FDF2F8' });

        // 5. Early Adopter (Mock Logic for now)
        if (userData.id && userData.id.length > 5) badges.push({ icon: <Building color="#8B5CF6" fill="#8B5CF6" />, label: "Founder", desc: "Early Member", bg: '#F5F3FF' });

        // New User Badge as fallback
        if (!badges.length) badges.push({ icon: <Zap color="#6366F1" fill="#6366F1" />, label: "Rookie", desc: "Just Started", bg: '#EEF2FF' });

        return badges;
    };
    const userBadges = getBadges();

    const handleUpgrade = async () => {
        if (userData.isPlus) return toast.success(t("alreadyPlus") || "You are already a Plus member!");
        const PRICE = 100;

        if (!window.confirm(`${t("confirmUpgrade") || "Upgrade to Fixsy Plus for"} ${PRICE} ${t("currency")}?`)) return;

        if ((userData.walletBalance || 0) < PRICE) {
            return toast.error(t("insufficientBalance"));
        }

        try {
            await updateDoc(doc(db, "clients", docId), {
                walletBalance: (userData.walletBalance || 0) - PRICE,
                isPlus: true,
                level: 'Gold', // Instant Gold Status
                plusSince: new Date().toISOString()
            });

            setUserData(prev => ({
                ...prev,
                walletBalance: (prev.walletBalance || 0) - PRICE,
                isPlus: true,
                level: 'Gold'
            }));

            // Celebration!
            import('canvas-confetti').then((confetti) => {
                confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            });

            toast.success(t("welcomePlus") || "Welcome to Fixsy Plus! 💎");
        } catch (e) {
            console.error(e);
            toast.error(t("errorOccurred"));
        }
    };


    return (
        <div ref={containerRef} style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>

            {/* الهيدر العلوي */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', padding: '15px 20px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#0056D2', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={24} /> {t("profileTitle")}
                </h2>
                <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {t("back")} <ChevronLeft size={16} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                </button>
            </div>

            {/* 1. كارت البروفايل */}
            <div className="profile-card glass-panel" style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
                <div style={{ height: '120px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}></div>

                <div style={{ padding: '0 25px 25px', marginTop: '-60px', textAlign: 'center', position: 'relative' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '6px solid white', margin: '0 auto', position: 'relative', background: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                        <img src={userData.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`} alt="user" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        {isEditing && (
                            <label style={{ position: 'absolute', bottom: '5px', left: '5px', background: '#F59E0B', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', border: '2px solid white' }}>
                                {isUploadingProfile ? <div className="spinner" style={{ width: '15px', height: '15px', borderTopColor: 'white' }}></div> : <Camera size={18} color="white" />}
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImageChange} disabled={isUploadingProfile} />
                            </label>
                        )}
                    </div>

                    {isEditing ? (
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ display: 'block', margin: '15px auto 5px', padding: '8px', fontSize: '1.3rem', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px', width: '80%', fontWeight: 'bold', color: '#1e293b' }} />
                    ) : (
                        <h2 style={{ margin: '15px 0 5px', color: '#1e293b', fontSize: '1.6rem' }}>{userData.name}</h2>
                    )}

                    <span style={{ background: userRole === 'tech' ? '#EFF6FF' : '#F0FDF4', color: userRole === 'tech' ? '#0056D2' : '#166534', padding: '6px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {userRole === 'tech' ? <Wrench size={14} /> : userRole === 'admin' ? <ShieldAlert size={14} /> : <User size={14} />}
                        {userRole === 'tech' ? t("proTech") : userRole === 'admin' ? t("systemManager") : t("vipClient")}
                    </span>

                    {/* 🏆 Level Indicator */}
                    {userData.level && (
                        <div style={{ marginTop: '15px' }}>
                            <span style={{
                                background: userData.level === 'Platinum' ? '#E5E4E2' : userData.level === 'Gold' ? '#FFD700' : userData.level === 'Silver' ? '#C0C0C0' : '#CD7F32',
                                color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                display: 'inline-flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}>
                                {userData.level === 'Platinum' ? '💎' : userData.level === 'Gold' ? '🥇' : userData.level === 'Silver' ? '🥈' : '🥉'} {userData.level} Member
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 🏆 Gamification Badges Section */}
            <h3 style={{ margin: '0 0 15px', padding: '0 10px', fontSize: '1.2rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={22} color="#F59E0B" /> {t("achievements")}
            </h3>
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 5px 20px', marginBottom: '20px' }} className="hide-scrollbar">
                {userBadges.map((badge, index) => (
                    <div key={index} className="badge-card" style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        minWidth: '110px',
                        padding: '15px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: badge.bg,
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                            boxShadow: `0 4px 10px ${badge.bg}`
                        }}>
                            {badge.icon}
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B', marginBottom: '3px' }}>{badge.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: '1.3' }}>{badge.desc}</div>
                    </div>
                ))}
                {/* Locked Badge Teaser */}
                <div style={{
                    minWidth: '110px',
                    background: '#F1F5F9',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6
                }}>
                    <Lock size={20} color="#94A3B8" />
                    <span style={{ fontSize: '0.75rem', marginTop: '5px', color: '#64748B' }}>{t("moreToUnlock")}</span>
                </div>
            </div>

            {/* 2. قسم البيانات الشخصية (المنظم) */}
            <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px', position: 'relative' }}>

                {/* هيدر القسم + زرار التعديل */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                        <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '10px' }}><User size={20} color="#0056D2" /></div>
                        {t("personalInfo")}
                    </h3>
                    {userRole !== 'admin' && (
                        <button onClick={() => setIsEditing(!isEditing)} style={{ background: isEditing ? '#EF4444' : '#F1F5F9', color: isEditing ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' }}>
                            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#F8FAFC', borderRadius: '16px' }}>
                        <Mail size={22} color="#94A3B8" />
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>{t("email")}</span>
                            <span style={{ color: '#334155', fontWeight: '600' }}>{userData.email}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#F8FAFC', borderRadius: '16px' }}>
                        <Phone size={22} color="#94A3B8" />
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>{t("phone")}</span>
                            {isEditing ? (
                                <input type="text" value={editForm.phone || ''} placeholder={t("enterPhone")} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '600', outline: 'none', borderBottom: '1px solid #ccc', fontSize: '1rem' }} />
                            ) : (
                                <span style={{ color: '#334155', fontWeight: '600' }}>{userData.phone || t("notRegistered")}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🛡️ Trusted Contact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FECACA' }}>
                    <ShieldAlert size={22} color="#EF4444" />
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: '#EF4444', display: 'block', marginBottom: '2px' }}>{t("trustedContact")}</span>
                        {isEditing ? (
                            <input
                                type="tel"
                                placeholder="01xxxxxxxxx"
                                value={editForm.emergencyContact || ''}
                                onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                                style={{ width: '100%', padding: '5px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        ) : (
                            <span style={{ color: '#991B1B', fontWeight: '600' }}>{userData.emergencyContact || t("notSet")}</span>
                        )}
                    </div>
                </div>
            </div>

            {isEditing && (
                <button onClick={handleSave} style={{ width: '100%', marginTop: '20px', background: '#10B981', color: 'white', border: 'none', padding: '15px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <Save size={20} /> {t("saveChanges")}
                </button>
            )}


            {/* ❤️ Saved Technicians (New) */}
            {userRole === 'client' && userData?.favorites?.length > 0 && (
                <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                        <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '10px' }}><Star size={20} color="#EF4444" /></div>
                        {t("savedTechs") || "Favorite Technicians"}
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {technicians?.filter(t => userData.favorites.includes(t.id)).map(tech => (
                            <div key={tech.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                <img src={tech.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={tech.name} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', color: '#1F2937' }}>{tech.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{tech.specialty} • ⭐ {tech.rating}</div>
                                </div>
                                <button style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                                    // Quick remove local logic if needed, or just let App.js handle it
                                    // For now just visual
                                }}>
                                    <Star size={16} fill="white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2.5 قسم الإعدادات (جديد) */}
            <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                    <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '10px' }}><Settings size={20} color="#64748B" /></div>
                    {t("settings")}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Language Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Globe size={20} color="#64748B" />
                            <span style={{ fontWeight: '600', color: '#334155' }}>{t("language")}</span>
                        </div>
                        <button onClick={toggleLanguage} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {language === 'ar' ? 'English' : 'عربي'}
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {theme === 'light' ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6366F1" />}
                            <span style={{ fontWeight: '600', color: '#334155' }}>{t("appearance")}</span>
                        </div>
                        <button onClick={toggleTheme} style={{ background: theme === 'light' ? '#FFFBEB' : '#EEF2FF', color: theme === 'light' ? '#D97706' : '#4F46E5', border: `1px solid ${theme === 'light' ? '#FDE68A' : '#C7D2FE'}`, borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {theme === 'light' ? t("darkMode") : t("lightMode")}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2.6 ملخص المحفظة (للفني فقط) */}
            {
                userRole === 'tech' && (
                    <div className="profile-section hover-scale" onClick={() => changeTab('tech_panel')} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', marginBottom: '20px', color: 'white', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '5px' }}>{t("walletSummary")}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{userData.debt ? (userData.debt * -1) : 0} {t("currency")}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '5px' }}>{userData.debt > 0 ? t("debtWarning") : t("availableBalance")}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                                <Wallet size={28} color="white" />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 3. قسم بيانات الدخول (كان 2. قسم البيانات الشخصية) - تم الاحتفاظ به كما هو ولكن ترتيبه تغير منطقياً */}
            {/* ... باقي الأقسام ... */}

            {/* 3. قسم التوثيق */}
            {
                userRole === 'tech' && (
                    <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                            <div style={{ background: '#FFF7ED', padding: '8px', borderRadius: '10px' }}><FileText size={20} color="#F59E0B" /></div>
                            {t("accountStatus")}
                        </h3>
                        {(userData.isVerified === true || userData.isVerified === 'approved') && <div style={{ background: '#ECFDF5', color: '#065F46', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={24} /><div><strong>{t("verifiedAccount")}</strong><div style={{ fontSize: '0.8rem' }}>{t("canReceiveOrders")}</div></div></div>}
                        {userData.isVerified === 'pending' && <div style={{ background: '#FFFBEB', color: '#B45309', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={24} /><div><strong>{t("underReview")}</strong><div style={{ fontSize: '0.8rem' }}>{t("reviewingDocs")}</div></div></div>}
                        {userData.isVerified !== true && userData.isVerified !== 'approved' && userData.isVerified !== 'pending' && (
                            <div style={{ background: '#FFF7ED', border: '1px dashed #F97316', padding: '20px', borderRadius: '16px' }}>
                                {userData.rejectionReason && <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>❌ {t("prevRequestRejected")}<br />{t("reason")}: {userData.rejectionReason}</div>}
                                <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '15px' }}>{t("uploadIdPrompt")}</p>
                                <form onSubmit={submitVerification} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input type="text" placeholder={t("nationalId")} value={verificationForm.nationalId} onChange={(e) => setVerificationForm({ ...verificationForm, nationalId: e.target.value })} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#F9FAFB' }} />
                                    <label style={{ border: '2px dashed #FDBA74', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', background: 'white' }}>
                                        <UploadCloud size={24} color="#F97316" style={{ marginBottom: '5px' }} /><div style={{ color: '#F97316', fontSize: '0.8rem' }}>{file ? file.name : t("clickUploadId")}</div><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                                    </label>
                                    <button type="submit" disabled={isSubmitting} style={{ padding: '12px', background: '#F97316', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>{isSubmitting ? t("uploading") : `${t("sendReview")} 📤`}</button>
                                </form>
                            </div>
                        )}
                    </div>
                )
            }

            {/* 3.1 معرض الأعمال (Portfolio) - للفنيين فقط */}
            {
                userRole === 'tech' && userData && (
                    <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                            <div style={{ background: '#F0F9FF', padding: '8px', borderRadius: '10px' }}><Camera size={20} color="#0EA5E9" /></div>
                            {t("portfolioTitle")}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                            {/* عرض الصور الموجودة */}
                            {userData.portfolio && userData.portfolio.map((img, index) => (
                                <div key={index} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1/1', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                    <img src={img} alt="Work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(t("confirmDeletePhoto"))) {
                                                try {
                                                    const updatedPortfolio = userData.portfolio.filter(i => i !== img);
                                                    await updateDoc(doc(db, "technicians", docId), { portfolio: updatedPortfolio });
                                                    setUserData(prev => ({ ...prev, portfolio: updatedPortfolio }));
                                                    toast.success(t("deleteSuccess"));
                                                } catch (e) { toast.error(t("genericError")); }
                                            }
                                        }}
                                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* زر إضافة صورة جديدة */}
                            <label style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', aspectRatio: '1/1', background: '#F8FAFC' }}>
                                {isUploadingProfile ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#64748B' }}></div> : (
                                    <>
                                        <UploadCloud size={24} color="#64748B" />
                                        <span style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: 'bold' }}>{t("addPhoto")}</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    disabled={isUploadingProfile}
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setIsUploadingProfile(true);
                                        const url = await uploadToCloudinary(file);
                                        if (url) {
                                            try {
                                                const newPortfolio = [...(userData.portfolio || []), url];
                                                await updateDoc(doc(db, "technicians", docId), { portfolio: newPortfolio });
                                                setUserData(prev => ({ ...prev, portfolio: newPortfolio }));
                                                toast.success(t("updateSuccess"));
                                            } catch (e) { toast.error(t("genericError")); }
                                        }
                                        setIsUploadingProfile(false);
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )
            }

            {/* --- Client Exp 2.0: Saved Addresses (For Clients) --- */}
            {
                userRole === 'client' && (
                    <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                            <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '10px' }}><MapPin size={20} color="#2563EB" /></div>
                            {t("savedAddresses")}
                        </h3>

                        {userData && userData.addresses && userData.addresses.length > 0 ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {userData.addresses.map((addr, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '50%' }}><MapPin size={16} color="#2563EB" /></div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>{addr.title || t("addressTitle")}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{addr.detail}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleAddressDelete(addr)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', fontStyle: 'italic', background: '#F8FAFC', padding: '15px', borderRadius: '12px' }}>{t("noRequests")}</p>
                        )}

                        {isAddingAddress ? (
                            <div style={{ marginTop: '15px', background: '#F1F5F9', padding: '15px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>{t("addNewAddress")}</h4>
                                <input
                                    type="text"
                                    placeholder={t("addressDetails")}
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', marginBottom: '10px', fontSize: '1rem' }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={handleAddressAdd} style={{ flex: 1, background: '#10B981', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>{t("save")}</button>
                                    <button onClick={() => setIsAddingAddress(false)} style={{ flex: 1, background: '#E2E8F0', color: '#475569', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>{t("cancel")}</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingAddress(true)} style={{ marginTop: '15px', width: '100%', padding: '12px', border: '2px dashed #CBD5E1', borderRadius: '16px', background: '#F8FAFC', color: '#64748B', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}>
                                <Plus size={18} /> {t("addNewAddress")}
                            </button>
                        )}
                    </div>
                )
            }

            {/* 3.2 المساعدة والدعم (Help & Support) */}
            <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>

                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                    <div style={{ background: '#FEF3C7', padding: '8px', borderRadius: '10px' }}><AlertTriangle size={20} color="#D97706" /></div>
                    {t("helpSupport")}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => changeTab('help')} style={{ flex: 1, border: 'none', background: '#F8FAFC', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <Phone size={24} color="#0056D2" />
                        {t("contactUs")}
                    </button>
                    <button onClick={() => changeTab('help')} style={{ flex: 1, border: 'none', background: '#F8FAFC', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <FileText size={24} color="#64748B" />
                        {t("faq")}
                    </button>
                </div>
            </div>


            <div className="profile-section hover-scale" onClick={handleUpgrade} style={{
                background: userData.isPlus ? 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                padding: '25px', borderRadius: '24px',
                boxShadow: userData.isPlus ? '0 10px 30px rgba(255, 215, 0, 0.4)' : '0 10px 30px rgba(15, 23, 42, 0.3)',
                marginBottom: '20px', color: userData.isPlus ? '#0F172A' : 'white',
                position: 'relative', overflow: 'hidden', cursor: 'pointer'
            }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: userData.isPlus ? '#0F172A' : '#FCD34D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={24} fill={userData.isPlus ? '#0F172A' : '#FCD34D'} /> {userData.isPlus ? "Fixsy Plus Active" : "Fixsy Plus"}
                        </h3>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: userData.isPlus ? '#334155' : '#CBD5E1' }}>{userData.isPlus ? (t("plusActiveDesc") || "You are a VIP member") : (t("plusDesc") || "Unlock premium features")}</p>
                    </div>
                    {userData.isPlus ? (
                        <div style={{ background: 'white', color: '#0F172A', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>✓ VIP</div>
                    ) : (
                        <button style={{ background: '#FCD34D', color: '#0F172A', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {t("upgrade") || "Upgrade"}
                        </button>
                    )}
                </div>
            </div>

            {/* 3.5 كارت الإحالة (Referral) */}
            <div className="profile-section" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)', marginBottom: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                        <Gift size={24} color="#FDE047" /> {t("gift50")}
                    </h3>
                    <p style={{ margin: '0 0 20px 0', opacity: 0.9, fontSize: '0.95rem', color: '#E9D5FF' }}>
                        {t("inviteFriend")}
                    </p>
                    <button onClick={handleShare} style={{ width: '100%', background: 'white', color: '#6D28D9', border: 'none', padding: '12px', borderRadius: '14px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        <Share2 size={20} /> {t("shareCode")}
                    </button>
                    <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>{t("yourCode")}: <strong>{userData.referralCode || "Generating..."}</strong></div>
                </div>
            </div>

            {/* 4. المعلومات القانونية */}
            <div className="profile-section" style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#333' }}>{t("appInfo")} ℹ️</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => changeTab('about')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', background: '#F8FAFC', border: 'none', padding: '15px', borderRadius: '16px', cursor: 'pointer', color: '#334155', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: language === 'ar' ? 'row' : 'row-reverse' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={18} color="#64748B" /> {t("aboutUs")}</div> <ChevronLeft size={16} color="#CBD5E1" style={{ transform: language === 'ar' ? 'rotate(0deg)' : 'rotate(180deg)' }} />
                    </button>
                    <button onClick={() => changeTab('privacy')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', background: '#F8FAFC', border: 'none', padding: '15px', borderRadius: '16px', cursor: 'pointer', color: '#334155', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: language === 'ar' ? 'row' : 'row-reverse' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldAlert size={18} color="#64748B" /> {t("privacyPolicy")}</div> <ChevronLeft size={16} color="#CBD5E1" style={{ transform: language === 'ar' ? 'rotate(0deg)' : 'rotate(180deg)' }} />
                    </button>
                </div>
            </div>

            {/* 5. منطقة الخطر */}
            <div className="profile-section" style={{ background: '#FEF2F2', padding: '25px', borderRadius: '24px', border: '1px solid #FECACA' }}>
                <h3 style={{ color: '#DC2626', fontSize: '1.1rem', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> {t("dangerZone")}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleLogout} style={{ flex: 1, padding: '15px', background: 'white', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                        <LogOut size={18} /> {t("logout")}
                    </button>
                    {userRole !== 'admin' && (
                        <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '15px', background: '#DC2626', border: 'none', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                            <XCircle size={18} /> {t("deleteAccount")}
                        </button>
                    )}
                </div>
            </div>

        </div >
    );
}

export default Profile;
