
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import GlobalErrorBoundary from './GlobalErrorBoundary';

interface AppProvidersProps {
    children: React.ReactNode;
}

/**
 * AppProviders - Wraps the application with all necessary context providers
 * Extracted from App.tsx to reduce file size and improve maintainability
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <GlobalErrorBoundary>
            <HelmetProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        {children}
                        <Toaster position="top-center" />
                    </ThemeProvider>
                </LanguageProvider>
            </HelmetProvider>
        </GlobalErrorBoundary>
    );
}

export default AppProviders;
