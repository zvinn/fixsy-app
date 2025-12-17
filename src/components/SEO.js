import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

const SEO = ({ title, description, image, url }) => {
    const { language } = useLanguage();
    const siteTitle = "Fixsy | صيانة منزلك في ثواني";
    const defaultDescription = language === 'ar'
        ? "أفضل فنيين سباكة، كهرباء، وتكييف بابك. حمل التطبيق دلوقتي!"
        : "Best home maintenance app. Plumbing, electrical, and AC repair at your doorstep.";

    const currentTitle = title ? `${title} | Fixsy` : siteTitle;
    const currentDesc = description || defaultDescription;
    const currentImage = image || "https://images.unsplash.com/photo-1581578731117-10d52143b1e8?fit=crop&w=1200&h=630&q=80";
    const currentUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{currentTitle}</title>
            <meta name="description" content={currentDesc} />
            <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={currentTitle} />
            <meta property="og:description" content={currentDesc} />
            <meta property="og:image" content={currentImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={currentTitle} />
            <meta property="twitter:description" content={currentDesc} />
            <meta property="twitter:image" content={currentImage} />
        </Helmet>
    );
};

export default SEO;
