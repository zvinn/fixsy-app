// src/components/__tests__/GlobalErrorBoundary.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalErrorBoundary from '../GlobalErrorBoundary';


// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('GlobalErrorBoundary', () => {
    // Suppress console.error for cleaner test output
    const originalError = console.error;
    beforeAll(() => {
        console.error = vi.fn();
    });

    afterAll(() => {
        console.error = originalError;
    });

    it('should render children when there is no error', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={false} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should render fallback UI when an error occurs', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText(/حدث خطأ/)).toBeInTheDocument();
    });

    it('should display error message in fallback UI', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });

    it('should provide reload button', () => {
        render(
            <GlobalErrorBoundary>
                <ThrowError shouldThrow={true} />
            </GlobalErrorBoundary>
        );

        const reloadButton = screen.getByRole('button', { name: /إعادة تحميل/i });
        expect(reloadButton).toBeInTheDocument();
    });
});
