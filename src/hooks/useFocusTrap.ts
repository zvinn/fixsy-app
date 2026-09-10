import { useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a container element.
 * Useful for modals and dialogs to ensure keyboard navigation stays within the component.
 * @param ref Ref to the container element
 * @param isActive Whether the trap is active
 */
export const useFocusTrap = <T extends HTMLElement>(
    ref: React.RefObject<T | null>,
    isActive: boolean,
    onEscape?: () => void
) => {
    const previousFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isActive) return;

        // Store previously focused element
        previousFocus.current = document.activeElement as HTMLElement;

        const element = ref.current;
        if (!element) return;

        // Find focusable elements
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Focus the first element initially
        if (firstElement) {
            firstElement.focus();
        }

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Optional: Handle Escape key if needed, or rely on parent onClose
            }
            handleTabKey(e);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus
            if (previousFocus.current) {
                previousFocus.current.focus();
            }
        };
    }, [isActive, ref]);
};
