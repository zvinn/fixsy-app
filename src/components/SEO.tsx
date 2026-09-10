// src/components/SEO.tsx

import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url, keywords }) => {
    const { language } = useLanguage();
    const siteTitle = "Fixsy | صيانة منزلك في ثواني";
    const defaultDescription = language === 'ar'
        ? "أفضل فنيين سباكة، كهرباء، وتكييف بابك. حمل التطبيق دلوقتي!"
        : "Best home maintenance app. Plumbing, electrical, and AC repair at your doorstep.";
    const defaultKeywords = language === 'ar'
        ? "صيانة منزلية، سباكة، كهرباء، تكييف، فني، إصلاح، مصر، تطبيق"
        : "home maintenance, plumbing, electrical, AC repair, technician, Egypt, app";

    const currentTitle = title ? `${title} | Fixsy` : siteTitle;
    const currentDesc = description || defaultDescription;
    const currentImage = image || "https://images.unsplash.com/photo-1581578731117-10d52143b1e8?fit=crop&w=1200&h=630&q=80";
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const currentKeywords = keywords || defaultKeywords;

    // JSON-LD Structured Data for Local Business
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "name": "Fixsy",
        "description": currentDesc,
        "url": currentUrl,
        "logo": "https://fixsy-app.web.app/logo192.png",
        "image": currentImage,
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "EG"
        },
        "areaServed": {
            "@type": "Country",
            "name": "Egypt"
        },
        "serviceType": ["Plumbing", "Electrical", "AC Repair", "Home Maintenance"],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250"
        }
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{currentTitle}</title>
            <meta name="description" content={currentDesc} />
            <meta name="keywords" content={currentKeywords} />
            <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />

            {/* Canonical URL */}
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={currentTitle} />
            <meta property="og:description" content={currentDesc} />
            <meta property="og:image" content={currentImage} />
            <meta property="og:site_name" content="Fixsy" />
            <meta property="og:locale" content={language === 'ar' ? 'ar_EG' : 'en_US'} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={currentTitle} />
            <meta property="twitter:description" content={currentDesc} />
            <meta property="twitter:image" content={currentImage} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
