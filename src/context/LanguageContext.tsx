import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from './translations';
import safeLocalStorage from '../utils/safeLocalStorage';

type Language = 'ar' | 'en';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = safeLocalStorage.getItem('lang');
        return (saved === 'ar' || saved === 'en') ? saved : 'ar';
    });

    useEffect(() => {
        safeLocalStorage.setItem('lang', language);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string, params?: Record<string, any>): string => {
        let translation = translations[language][key] || key;

        if (params) {
            Object.keys(params).forEach(param => {
                translation = translation.replace(`{${param}}`, params[param]);
            });
        }

        return translation;
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
