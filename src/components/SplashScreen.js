import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import logo from '../logo.png';

const SplashScreen = ({ onComplete }) => {
    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: onComplete
            });

            // Initial State
            gsap.set(logoRef.current, { scale: 0, opacity: 0 });
            gsap.set(textRef.current, { y: 20, opacity: 0 });

            // Animation Sequence
            tl.to(logoRef.current, {
                scale: 1,
                rotation: 360,
                opacity: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.3)"
            })
                .to(textRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out"
                }, "-=0.5")
                .to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    delay: 1, // Stay visible for a second
                    ease: "power2.in"
                });

        }, containerRef);

        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div ref={containerRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            color: 'white'
        }}>
            <div ref={logoRef} style={{
                width: '120px',
                height: '120px',
                background: 'white',
                borderRadius: '24px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                {/* Simple Logo SVG Placeholder */}
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
            </div>
            <h1 ref={textRef} style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                margin: 0,
                letterSpacing: '2px'
            }}>
                FIXSY
            </h1>
            <p style={{
                marginTop: '10px',
                opacity: 0.8,
                fontSize: '1rem',
                letterSpacing: '1px'
            }}>
                Smart Home Services
            </p>
        </div>
    );
};

export default SplashScreen;
