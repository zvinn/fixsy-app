// src/pages/Tips.tsx

import { useLanguage } from '../context/LanguageContext';
import { Lightbulb, Wrench, Zap, Droplet, Thermometer, Shield, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface TipsProps {
    goBack: () => void;
}

interface TipItem {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    category: string;
    color: string;
    bg: string;
}

const Tips: React.FC<TipsProps> = ({ goBack }) => {
    const { t } = useLanguage();

    const tips: TipItem[] = [
        {
            id: 1,
            icon: <Droplet size={24} />,
            title: t("tipPlumbing1Title") || "فحص التسريبات شهرياً",
            description: t("tipPlumbing1Desc") || "افحص الحنفيات والمواسير شهرياً لتجنب مشاكل التسريب الكبيرة",
            category: t("plumbing") || "سباكة",
            color: "#0EA5E9",
            bg: "#E0F2FE"
        },
        {
            id: 2,
            icon: <Zap size={24} />,
            title: t("tipElectric1Title") || "لا تحمّل الفيش الكثير",
            description: t("tipElectric1Desc") || "تجنب توصيل أجهزة كثيرة في فيشة واحدة لمنع الحرائق",
            category: t("electricity") || "كهرباء",
            color: "#EAB308",
            bg: "#FEF9C3"
        },
        {
            id: 3,
            icon: <Thermometer size={24} />,
            title: t("tipAC1Title") || "نظّف فلتر التكييف",
            description: t("tipAC1Desc") || "نظّف فلتر التكييف كل 2-3 أسابيع للحفاظ على كفاءته",
            category: t("ac") || "تكييف",
            color: "#10B981",
            bg: "#D1FAE5"
        },
        {
            id: 4,
            icon: <Wrench size={24} />,
            title: t("tipGeneral1Title") || "احتفظ بأدوات أساسية",
            description: t("tipGeneral1Desc") || "مفك، كماشة، شريط لاصق - أدوات تنقذك في الطوارئ",
            category: t("general") || "عام",
            color: "#8B5CF6",
            bg: "#EDE9FE"
        },
        {
            id: 5,
            icon: <Shield size={24} />,
            title: t("tipSafety1Title") || "اعرف مكان المفاتيح",
            description: t("tipSafety1Desc") || "تأكد من معرفة مكان قاطع الكهرباء الرئيسي ومحبس المياه",
            category: t("safety") || "سلامة",
            color: "#EF4444",
            bg: "#FEE2E2"
        },
        {
            id: 6,
            icon: <Clock size={24} />,
            title: t("tipMaintenance1Title") || "الصيانة الدورية أرخص",
            description: t("tipMaintenance1Desc") || "الصيانة الوقائية توفر لك 70% من تكاليف الإصلاح",
            category: t("maintenance") || "صيانة",
            color: "#F97316",
            bg: "#FFEDD5"
        }
    ];

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '25px',
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                padding: '20px',
                borderRadius: '20px'
            }}>
                <div style={{
                    background: '#FCD34D',
                    padding: '15px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Lightbulb size={32} color="#92400E" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#92400E' }}>
                        {t("tipsTitle") || "نصائح وحيل"}
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#B45309', opacity: 0.8 }}>
                        {t("tipsSubtitle") || "اعرف أكتر عن صيانة بيتك"}
                    </p>
                </div>
            </div>

            {/* Tips Grid */}
            <div style={{ display: 'grid', gap: '15px' }}>
                {tips.map((tip) => (
                    <Card
                        key={tip.id}
                        style={{
                            padding: '16px',
                            display: 'flex',
                            gap: '15px',
                            alignItems: 'flex-start',
                            border: `1px solid ${tip.bg}`,
                            background: 'var(--bg-primary)'
                        }}
                    >
                        <div style={{
                            background: tip.bg,
                            padding: '12px',
                            borderRadius: '14px',
                            color: tip.color,
                            flexShrink: 0
                        }}>
                            {tip.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '6px'
                            }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    background: tip.bg,
                                    color: tip.color,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontWeight: '600'
                                }}>
                                    {tip.category}
                                </span>
                            </div>
                            <h3 style={{
                                margin: '0 0 6px 0',
                                fontSize: '1rem',
                                color: 'var(--text)',
                                fontWeight: '700'
                            }}>
                                {tip.title}
                            </h3>
                            <p style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5
                            }}>
                                {tip.description}
                            </p>
                        </div>
                        <CheckCircle size={18} color={tip.color} style={{ opacity: 0.5, flexShrink: 0 }} />
                    </Card>
                ))}
            </div>

            {/* CTA */}
            <div style={{
                marginTop: '25px',
                padding: '20px',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                borderRadius: '16px',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, color: '#1E40AF', fontWeight: '600' }}>
                    {t("tipsCTA") || "محتاج مساعدة؟ احجز فني متخصص الآن!"}
                </p>
            </div>
        </div>
    );
};

export default Tips;
