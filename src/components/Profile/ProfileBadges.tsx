// src/components/Profile/ProfileBadges.tsx
// Gamification badges display component


import { Award, Flame, Shield, Star, Gift, Building, Zap, Lock } from 'lucide-react';

interface UserData {
    streak?: number;
    isVerified?: boolean | string;
    rating?: number;
    referralCount?: number;
    id?: string;
}

interface Badge {
    icon: React.ReactNode;
    label: string;
    desc: string;
    bg: string;
}

interface ProfileBadgesProps {
    userData: UserData;
    userRole: string;
    t: (key: string) => string;
}

/**
 * Get user badges based on their data
 */
export const getBadges = (userData: UserData, userRole: string, t: (key: string) => string): Badge[] => {
    const badges: Badge[] = [];

    // 1. Streak Badge
    if (userData?.streak && userData.streak >= 3) {
        badges.push({
            icon: <Flame color="#EF4444" fill="#EF4444" aria-hidden="true" />,
            label: t("badgeOnFire") || "On Fire!",
            desc: `${userData.streak} Day Streak`,
            bg: '#FEF2F2'
        });
    }

    // 2. Verified Badge
    if (userData?.isVerified === true || userData?.isVerified === 'approved') {
        badges.push({
            icon: <Shield color="#10B981" fill="#10B981" aria-hidden="true" />,
            label: t("badgeVerified") || "Verified",
            desc: "Trusted User",
            bg: '#ECFDF5'
        });
    }

    // 3. Rating Badge (Tech only)
    if (userRole === 'tech' && userData?.rating && userData.rating >= 4.8) {
        badges.push({
            icon: <Star color="#F59E0B" fill="#F59E0B" aria-hidden="true" />,
            label: "Top Rated",
            desc: "Elite Tech",
            bg: '#FFFBEB'
        });
    }

    // 4. Referral Badge
    if (userData?.referralCount && userData.referralCount >= 1) {
        badges.push({
            icon: <Gift color="#ec4899" fill="#ec4899" aria-hidden="true" />,
            label: "Inviter",
            desc: "Shared the Love",
            bg: '#FDF2F8'
        });
    }

    // 5. Early Adopter
    if (userData?.id && userData.id.length > 5) {
        badges.push({
            icon: <Building color="#8B5CF6" fill="#8B5CF6" aria-hidden="true" />,
            label: "Founder",
            desc: "Early Member",
            bg: '#F5F3FF'
        });
    }

    // New User Badge as fallback
    if (!badges.length) {
        badges.push({
            icon: <Zap color="#6366F1" fill="#6366F1" aria-hidden="true" />,
            label: "Rookie",
            desc: "Just Started",
            bg: '#EEF2FF'
        });
    }

    return badges;
};

/**
 * ProfileBadges - Displays user achievement badges
 * WCAG 2.1 AA Compliant
 */
const ProfileBadges: React.FC<ProfileBadgesProps> = ({ userData, userRole, t }) => {
    const badges = getBadges(userData, userRole, t);

    return (
        <section aria-label={t("achievements")}>
            <h3 style={{
                margin: '0 0 15px',
                padding: '0 10px',
                fontSize: '1.2rem',
                color: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Award size={22} color="#F59E0B" aria-hidden="true" /> {t("achievements")}
            </h3>

            <ul
                role="list"
                aria-label={t("achievements")}
                style={{
                    display: 'flex',
                    gap: '15px',
                    overflowX: 'auto',
                    padding: '10px 5px 20px',
                    marginBottom: '20px',
                    listStyle: 'none',
                    margin: 0
                }}
                className="hide-scrollbar"
            >
                {badges.map((badge, index) => (
                    <li
                        key={index}
                        className="badge-card"
                        aria-label={`${badge.label}: ${badge.desc}`}
                        style={{
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
                        }}
                    >
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
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B', marginBottom: '3px' }}>
                            {badge.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: '1.3' }}>
                            {badge.desc}
                        </div>
                    </li>
                ))}

                {/* Locked Badge Teaser */}
                <li
                    aria-label={t("moreToUnlock")}
                    style={{
                        minWidth: '110px',
                        background: '#F1F5F9',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.6,
                        padding: '15px 10px'
                    }}
                >
                    <Lock size={20} color="#94A3B8" aria-hidden="true" />
                    <span style={{ fontSize: '0.75rem', marginTop: '5px', color: '#64748B' }}>
                        {t("moreToUnlock")}
                    </span>
                </li>
            </ul>
        </section>
    );
};

export default ProfileBadges;
