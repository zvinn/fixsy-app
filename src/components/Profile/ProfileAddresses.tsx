// src/components/Profile/ProfileAddresses.tsx
// Client addresses management component with ARIA accessibility

import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';

interface Address {
    title?: string;
    detail: string;
}

interface ProfileAddressesProps {
    addresses?: Address[];
    onAddAddress: (address: string) => Promise<boolean>;
    onDeleteAddress: (address: Address) => void;
    t: (key: string) => string;
}

/**
 * ProfileAddresses - Saved addresses section for clients
 * WCAG 2.1 AA Compliant with ARIA labels
 */
const ProfileAddresses: React.FC<ProfileAddressesProps> = ({
    addresses = [],
    onAddAddress,
    onDeleteAddress,
    t
}) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [newAddress, setNewAddress] = useState<string>('');

    const handleAdd = async () => {
        if (!newAddress.trim()) return;
        const success = await onAddAddress(newAddress);
        if (success) {
            setNewAddress('');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
        }
    };

    return (
        <section
            aria-label={t("savedAddresses")}
            className="profile-section"
            style={{
                background: 'var(--bg-secondary)',
                padding: '25px',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                marginBottom: '20px'
            }}
        >
            <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#334155'
            }}>
                <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '10px' }}>
                    <MapPin size={20} color="#2563EB" aria-hidden="true" />
                </div>
                {t("savedAddresses")}
            </h3>

            {/* Address List */}
            {addresses && addresses.length > 0 ? (
                <ul
                    role="list"
                    aria-label={t("savedAddresses")}
                    style={{ display: 'grid', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}
                >
                    {addresses.map((addr, idx) => (
                        <li
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '50%' }}>
                                    <MapPin size={16} color="#2563EB" aria-hidden="true" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#334155' }}>
                                        {addr.title || t("addressTitle")}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                        {addr.detail}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onDeleteAddress(addr)}
                                aria-label={`${t("delete")} ${addr.title || addr.detail}`}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#EF4444',
                                    padding: '8px'
                                }}
                            >
                                <Trash2 size={18} aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    background: '#F8FAFC',
                    padding: '15px',
                    borderRadius: '12px'
                }}>
                    {t("noRequests")}
                </p>
            )}

            {/* Add Address Form */}
            {isAdding ? (
                <div
                    role="form"
                    aria-label={t("addNewAddress")}
                    style={{
                        marginTop: '15px',
                        background: '#F1F5F9',
                        padding: '15px',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0'
                    }}
                >
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>
                        {t("addNewAddress")}
                    </h4>
                    <label htmlFor="new-address-input" className="sr-only">
                        {t("addressDetails")}
                    </label>
                    <input
                        id="new-address-input"
                        type="text"
                        placeholder={t("addressDetails")}
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-describedby="address-hint"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            marginBottom: '10px',
                            fontSize: '1rem'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleAdd}
                            aria-label={t("save")}
                            style={{
                                flex: 1,
                                background: '#10B981',
                                color: 'white',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {t("save")}
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            aria-label={t("cancel")}
                            style={{
                                flex: 1,
                                background: '#E2E8F0',
                                color: '#475569',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    aria-label={t("addNewAddress")}
                    style={{
                        marginTop: '15px',
                        width: '100%',
                        padding: '12px',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '16px',
                        background: '#F8FAFC',
                        color: '#64748B',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: '0.2s'
                    }}
                >
                    <Plus size={18} aria-hidden="true" /> {t("addNewAddress")}
                </button>
            )}
        </section>
    );
};

export default ProfileAddresses;
