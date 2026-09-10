// src/components/Profile/ProfileHeader.tsx
// Profile header component with avatar and role badge


import { User, Wrench, ShieldAlert, Camera } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage';

interface UserData {
    name: string;
    photoURL?: string;
    level?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
}

interface EditForm {
    name?: string;
}

interface ProfileHeaderProps {
    userData: UserData;
    userRole: string;
    isEditing: boolean;
    editForm: EditForm;
    setEditForm: (form: EditForm) => void;
    isUploadingProfile: boolean;
    onProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    t: (key: string) => string;
}

/**
 * ProfileHeader - Displays user avatar, name, role badge, and level
 * WCAG 2.1 AA Compliant
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    userData,
    userRole,
    isEditing,
    editForm,
    setEditForm,
    isUploadingProfile,
    onProfileImageChange,
    t
}) => {
    return (
        <header
            className="profile-card glass-panel"
            aria-label={t("profileHeader") || "Profile header"}
            style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}
        >
            {/* Header gradient */}
            <div style={{ height: '120px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }} aria-hidden="true"></div>

            <div style={{ padding: '0 25px 25px', marginTop: '-60px', textAlign: 'center', position: 'relative' }}>
                {/* Avatar */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '6px solid white',
                    margin: '0 auto',
                    position: 'relative',
                    background: 'var(--bg-secondary)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                }}>
                    <OptimizedImage
                        src={userData.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`}
                        alt={`${userData.name} profile picture`}
                        className="profile-avatar"
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    />
                    {isEditing && (
                        <label
                            aria-label={t("changeProfilePhoto") || "Change profile photo"}
                            style={{
                                position: 'absolute',
                                bottom: '5px',
                                left: '5px',
                                background: '#F59E0B',
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                border: '2px solid white'
                            }}
                        >
                            {isUploadingProfile ? (
                                <div className="spinner" style={{ width: '15px', height: '15px', borderTopColor: 'white' }} aria-label="Uploading..."></div>
                            ) : (
                                <Camera size={18} color="white" aria-hidden="true" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={onProfileImageChange}
                                disabled={isUploadingProfile}
                                aria-label={t("uploadProfilePhoto") || "Upload profile photo"}
                            />
                        </label>
                    )}
                </div>

                {/* Name */}
                {isEditing ? (
                    <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        aria-label={t("editName") || "Edit name"}
                        style={{
                            display: 'block',
                            margin: '15px auto 5px',
                            padding: '8px',
                            fontSize: '1.3rem',
                            textAlign: 'center',
                            border: '1px solid #ddd',
                            borderRadius: '10px',
                            width: '80%',
                            fontWeight: 'bold',
                            color: '#1e293b'
                        }}
                    />
                ) : (
                    <h2 style={{ margin: '15px 0 5px', color: '#1e293b', fontSize: '1.6rem' }}>
                        {userData.name}
                    </h2>
                )}

                {/* Role Badge */}
                <span
                    role="status"
                    aria-label={`Role: ${userRole === 'tech' ? t("proTech") : userRole === 'admin' ? t("systemManager") : t("vipClient")}`}
                    style={{
                        background: userRole === 'tech' ? '#EFF6FF' : '#F0FDF4',
                        color: userRole === 'tech' ? '#0056D2' : '#166534',
                        padding: '6px 15px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    {userRole === 'tech' ? <Wrench size={14} aria-hidden="true" /> : userRole === 'admin' ? <ShieldAlert size={14} aria-hidden="true" /> : <User size={14} aria-hidden="true" />}
                    {userRole === 'tech' ? t("proTech") : userRole === 'admin' ? t("systemManager") : t("vipClient")}
                </span>

                {/* Level Indicator */}
                {userData.level && (
                    <div style={{ marginTop: '15px' }}>
                        <span
                            role="status"
                            aria-label={`Level: ${userData.level}`}
                            style={{
                                background: userData.level === 'Platinum' ? '#E5E4E2' :
                                    userData.level === 'Gold' ? '#FFD700' :
                                        userData.level === 'Silver' ? '#C0C0C0' : '#CD7F32',
                                color: 'white',
                                padding: '6px 15px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            <span aria-hidden="true">
                                {userData.level === 'Platinum' ? '💎' :
                                    userData.level === 'Gold' ? '🥇' :
                                        userData.level === 'Silver' ? '🥈' : '🥉'}
                            </span>
                            {userData.level} Member
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default ProfileHeader;
