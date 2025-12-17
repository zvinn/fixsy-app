import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { User, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../logo.png';

export default function LoginPage({ onLogin }) {
    const { t, language } = useLanguage();
    // Default to 'client' but user can switch. This sets the "intent"
    const [selectedRole, setSelectedRole] = useState('client');

    useEffect(() => {
        // Simple entry animation
        gsap.fromTo(".login-card", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    }, []);

    const handleLoginClick = () => {
        // Pass the selected role preference to the login handler (optional, but good for UX context)
        onLogin(selectedRole);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Cairo, sans-serif',
            direction: language === 'ar' ? 'rtl' : 'ltr',
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', // Light Premium Background
            overflow: 'hidden',
            position: 'relative'
        }}>

            {/* Background Blobs for specific premium feel */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(0, 86, 210, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

            <div className="login-card glass-panel" style={{
                width: '90%',
                maxWidth: '450px',
                padding: '40px',
                borderRadius: '30px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                background: 'rgba(255, 255, 255, 0.9)'
            }}>
                <img src={logo} alt="Fixsy" style={{ width: '100px', marginBottom: '20px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />

                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '5px' }}>Fixsy</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>{t("loginSubtitle")}</p>

                {/* Simplified Role Selection */}
                <div style={{ marginBottom: '30px', textAlign: language === 'ar' ? 'right' : 'left' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)' }}>{t("selectRole")}</p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div
                            onClick={() => setSelectedRole('client')}
                            className={selectedRole === 'client' ? 'hover-scale' : ''}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: selectedRole === 'client' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                background: selectedRole === 'client' ? 'rgba(0, 86, 210, 0.05)' : 'transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            <User size={24} color={selectedRole === 'client' ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '5px' }} />
                            <div style={{ fontWeight: 'bold', color: selectedRole === 'client' ? 'var(--primary)' : 'var(--text-secondary)' }}>{t("clientRole")}</div>
                        </div>

                        <div
                            onClick={() => setSelectedRole('tech')}
                            className={selectedRole === 'tech' ? 'hover-scale' : ''}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: selectedRole === 'tech' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                background: selectedRole === 'tech' ? 'rgba(0, 86, 210, 0.05)' : 'transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Wrench size={24} color={selectedRole === 'tech' ? 'var(--primary)' : 'var(--text-secondary)'} style={{ marginBottom: '5px' }} />
                            <div style={{ fontWeight: 'bold', color: selectedRole === 'tech' ? 'var(--primary)' : 'var(--text-secondary)' }}>{t("techRole")}</div>
                        </div>
                    </div>
                </div>

                <button onClick={handleLoginClick} className="submit-btn" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    fontSize: '1.1rem', padding: '16px', borderRadius: '18px'
                }}>
                    <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: '24px', filter: 'brightness(0) invert(1)' }} />
                    {t("loginGoogle")}
                </button>

                <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94A3B8' }}>
                    {t("loginSlogan")}
                </p>
            </div>
        </div>
    );
}


