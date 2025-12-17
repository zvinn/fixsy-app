import { render, screen } from '@testing-library/react';
import App from './App';
import { db } from './services/firebase';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

test('renders Fixsy header', () => {
  render(
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  );
  // Note: 'Fixsy' might be translated. In 'ar' (default), it's 'Fixsy 🛠️'.
  // Depending on default, we might need a regex. L8 in translations says "Fixsy" is part of it.
  // Use getAllByText because Fixsy appears in title, logo alt, slogan etc.
  // Or better, find the main heading
  const headings = screen.getAllByText(/Fixsy/i);
  expect(headings.length).toBeGreaterThan(0);
});
