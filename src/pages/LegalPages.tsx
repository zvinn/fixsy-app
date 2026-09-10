// src/pages/LegalPages.tsx

import { useLanguage } from '../context/LanguageContext';

type PageType = 'about' | 'privacy';

interface LegalPagesProps {
    page: PageType;
    goBack: () => void;
}

interface PageContent {
    title: string;
    body: React.ReactNode;
}

const LegalPages: React.FC<LegalPagesProps> = ({ page, goBack }) => {
    const { t, language } = useLanguage();

    const content: Record<PageType, PageContent> = {
        about: {
            title: t("aboutTitle"),
            body: (
                <>
                    <p>{t("aboutBody")}</p>
                    <h3>{t("ourVision")}</h3>
                    <p>{t("visionText")}</p>
                    <h3>{t("whyUs")}</h3>
                    <ul>
                        <li>{t("whyUs1")}</li>
                        <li>{t("whyUs2")}</li>
                        <li>{t("whyUs3")}</li>
                        <li>{t("whyUs4")}</li>
                    </ul>
                </>
            )
        },
        privacy: {
            title: t("privacyTitle"),
            body: (
                <>
                    <p>{t("privacyIntro")}</p>
                    <h3>{t("privacySec1")}</h3>
                    <p>{t("privacyText1")}</p>
                    <h3>{t("privacySec2")}</h3>
                    <p>{t("privacyText2")}</p>
                    <h3>{t("privacySec3")}</h3>
                    <p>{t("privacyText3")}</p>
                </>
            )
        }
    };

    const current = content[page];

    return (
        <main
            style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', direction: language === 'ar' ? 'rtl' : 'ltr' }}
            role="main"
            aria-labelledby="page-title"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 id="page-title" style={{ color: '#0056D2' }}>{current.title}</h2>
                <button
                    onClick={goBack}
                    style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}
                    aria-label={t("back")}
                >
                    {t("back")}
                </button>
            </div>

            <article style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', lineHeight: '1.6', color: '#444' }}>
                {current.body}
            </article>

            <footer style={{ textAlign: 'center', marginTop: '30px', color: '#999', fontSize: '0.8rem' }}>
                &copy; {new Date().getFullYear()} {t("rightsReserved")}
            </footer>
        </main>
    );
};

export default LegalPages;
