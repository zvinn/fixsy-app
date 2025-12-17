import React, { useState } from 'react';
import { Camera, UploadCloud, CheckCircle, AlertCircle, Wrench, DollarSign, Phone } from 'lucide-react';
import { db, storage, auth } from '../services/firebase';
import { addDoc, collection } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

export default function TechOnboarding({ user, onComplete }) {
    const { t, language } = useLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        specialty: 'plumbing',
        price: '',
        phone: '',
        experience: '',
        idImage: null,
        portfolio: []
    });

    const CLOUD_NAME = "du9zxrsfl";
    const UPLOAD_PRESET = "fixsy_upload";

    const specialties = [
        'plumbing', 'electricity', 'carpentry', 'ac',
        'painting', 'appliances', 'dish', 'alumetal'
    ];

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            return data.secure_url;
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading(t("registering"));

        try {
            // 1. Upload ID Image
            let idImageUrl = "";
            if (formData.idImage) {
                idImageUrl = await uploadToCloudinary(formData.idImage);
            }

            // 2. Upload Portfolio Images
            const portfolioUrls = [];
            for (const file of formData.portfolio) {
                const url = await uploadToCloudinary(file);
                portfolioUrls.push(url);
            }

            // 3. Save to Firestore
            const techData = {
                email: user.email,
                name: user.displayName,
                img: user.photoURL,
                phone: formData.phone,
                specialty: formData.specialty,
                price: Number(formData.price),
                experience: formData.experience,
                idCardUrl: idImageUrl,
                portfolio: portfolioUrls,
                rating: 5,
                role: 'tech',
                earnings: 0,
                debt: 0,
                unpaidOrdersCount: 0,
                isFirstOrderDone: false,
                isVerified: 'pending', // Set to pending for Admin review
                joinedAt: new Date().toISOString()
            };

            // Add to 'technicians' collection
            await addDoc(collection(db, "technicians"), techData);

            toast.dismiss(loadingToast);
            toast.success(t("registrationSuccess"));

            if (onComplete) onComplete();

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error(t("uploadError"));
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        if (type === 'id') {
            setFormData({ ...formData, idImage: e.target.files[0] });
        } else if (type === 'portfolio') {
            setFormData({ ...formData, portfolio: [...formData.portfolio, ...Array.from(e.target.files)] });
        }
    };

    return (
        <div className="onboarding-container fade-in" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '10px', color: 'var(--primary)' }}>{t("welcomeTech")}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>{t("welcomeTechSubtitle")}</p>

                <form onSubmit={handleSubmit}>

                    {/* Section 1: Basic Info */}
                    <div style={{ textAlign: language === 'ar' ? 'right' : 'left', marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{t("specialtyLabel")}</label>
                        <div style={{ position: 'relative' }}>
                            <Wrench size={18} style={{ position: 'absolute', top: '12px', right: language === 'ar' ? 'auto' : '10px', left: language === 'ar' ? '10px' : 'auto', color: '#64748B' }} />
                            <select
                                className="form-input"
                                style={{ paddingRight: language === 'ar' ? '35px' : '10px', paddingLeft: language === 'ar' ? '10px' : '35px' }}
                                value={formData.specialty}
                                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                            >
                                {specialties.map(s => <option key={s} value={s}>{t(s)}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1, textAlign: language === 'ar' ? 'right' : 'left', marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{t("inspectionPriceLabel")}</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={18} style={{ position: 'absolute', top: '12px', right: language === 'ar' ? 'auto' : '10px', left: language === 'ar' ? '10px' : 'auto', color: '#64748B' }} />
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ paddingRight: language === 'ar' ? '35px' : '10px', paddingLeft: language === 'ar' ? '10px' : '35px' }}
                                    placeholder={t("pricePlaceholder")}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1, textAlign: language === 'ar' ? 'right' : 'left', marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{t("phoneLabel")}</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', top: '12px', right: language === 'ar' ? 'auto' : '10px', left: language === 'ar' ? '10px' : 'auto', color: '#64748B' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingRight: language === 'ar' ? '35px' : '10px', paddingLeft: language === 'ar' ? '10px' : '35px' }}
                                    placeholder={t("phonePlaceholder")}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Verification */}
                    <div style={{ textAlign: language === 'ar' ? 'right' : 'left', marginBottom: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <AlertCircle size={20} color="var(--accent)" /> {t("verificationSection")}
                        </h4>

                        {/* ID Upload */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t("idCardLabel")}</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '15px', textAlign: 'center', background: 'var(--glass)', cursor: 'pointer', position: 'relative' }}>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'id')} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} required />
                                {formData.idImage ? (
                                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><CheckCircle size={16} /> {t("idSelected")} {formData.idImage.name}</span>
                                ) : (
                                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><UploadCloud size={18} /> {t("clickToUploadID")}</span>
                                )}
                            </div>
                        </div>

                        {/* Portfolio Upload */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t("portfolioLabel")}</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '15px', textAlign: 'center', background: 'var(--glass)', cursor: 'pointer', position: 'relative' }}>
                                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'portfolio')} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Camera size={18} /> {formData.portfolio.length > 0 ? t("portfolioSelected", { count: formData.portfolio.length }) : t("clickToUploadPortfolio")}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                        style={{ marginTop: '10px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? t("registering") : t("confirmAndStart")}
                    </button>

                </form>
            </div>
        </div>
    );
}
