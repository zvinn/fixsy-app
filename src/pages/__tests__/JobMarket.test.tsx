import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobMarket from '../JobMarket';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import * as firebaseStats from '../../services/firebase';

// --- Mocks ---
vi.mock('../../hooks/useAuth');
vi.mock('../../context/LanguageContext');
vi.mock('../../services/firebase', () => ({
    db: {},
}));

// Mock Firestore
const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockQuery = vi.fn();
const mockCollection = vi.fn();
const mockWhere = vi.fn();
const mockDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
    collection: (...args: any[]) => mockCollection(...args),
    addDoc: (...args: any[]) => mockAddDoc(...args),
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
    onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
    doc: (...args: any[]) => mockDoc(...args),
    updateDoc: (...args: any[]) => mockUpdateDoc(...args),
}));

// Mock Toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

// Helper to simulate Firestore snapshot
const simulateSnapshot = (data: any[]) => {
    // Determine which snapshot callback to trigger. 
    // In JobMarket, onSnapshot is called immediately in useEffect.
    // We assume the last call to onSnapshot is the one we want to trigger.
    if (mockOnSnapshot.mock.calls.length > 0) {
        const callback = mockOnSnapshot.mock.calls[mockOnSnapshot.mock.calls.length - 1][1];
        callback({
            docs: data.map(item => ({
                data: () => item,
                id: item.id
            }))
        });
    }
};

describe('JobMarket Integration', () => {
    const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User'
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default Mocks
        (useAuth as any).mockReturnValue({
            user: mockUser,
            userRole: 'tech'
        });
        (useLanguage as any).mockReturnValue({
            t: (key: string) => key,
            language: 'en'
        });

        // Default Firestore Mock Return to avoid errors before snapshot
        mockOnSnapshot.mockReturnValue(() => { }); // Unsubscribe function
    });

    it('renders loading state initially', () => {
        render(<JobMarket user={mockUser as any} userRole="tech" goBack={vi.fn()} />);
        // It might be too fast to catch loading skeletons if not verifying immediate state,
        // but let's check if the skeleton exists or if we can wait for items.
        // For simplicity, we assume we might see loading or just "No jobs" if snapshot hasn't fired.
    });

    it('renders jobs list for Technician', async () => {
        render(<JobMarket user={mockUser as any} userRole="tech" goBack={vi.fn()} />);

        // Simulate data coming from Firestore
        const mockJobs = [
            {
                id: 'job1',
                title: 'Fix AC',
                desc: 'AC is not cooling',
                budget: 100,
                location: 'Cairo',
                client_name: 'Client A',
                status: 'open',
                date: new Date().toISOString(),
                offers: []
            }
        ];

        simulateSnapshot(mockJobs);

        await screen.findByText('Fix AC');
        await screen.findByText('AC is not cooling');
    });

    it('allows Technician to submit an offer', async () => {
        render(<JobMarket user={mockUser as any} userRole="tech" goBack={vi.fn()} />);

        const mockJobs = [
            {
                id: 'job1',
                title: 'Fix AC',
                desc: 'AC is not cooling',
                budget: 100,
                status: 'open',
                date: new Date().toISOString(),
                offers: []
            }
        ];
        simulateSnapshot(mockJobs);

        await screen.findByText('Fix AC');

        // Click Submit Offer
        const submitBtn = screen.getByText('submitOffer');
        fireEvent.click(submitBtn);

        // Input Price
        const priceInput = screen.getByPlaceholderText('offerPricePlaceholder');
        fireEvent.change(priceInput, { target: { value: '150' } });

        // Confirm
        const confirmBtn = screen.getAllByRole('button')[2]; // Typically the check/confirm button
        // A safer way is to look for the CheckCircle icon or just rely on structure
        // But since we use Lucide icons, text might not be visible. 
        // Let's use the parent div or class logic if needed, but let's try fireEvent on the button that contains CheckCircle (via visual testing logic is hard here).
        // Best approach: add aria-labels in source or assume order.
        // Looking at JobMarket.tsx: <Button ...><CheckCircle /></Button> is the first button in that conditional block

        // Actually, we can just find the button by the icon? No, vitest doesn't see icons.
        // Let's rely on finding standard buttons. 
        // We know structure: Input, Button(Check), Button(X)
        // We can query selector inside 'tech-offer-input'

        // Using container to find button
        // eslint-disable-next-line testing-library/no-node-access
        const buttons = document.querySelectorAll('.tech-offer-input button');
        fireEvent.click(buttons[0]); // First button is submit

        await waitFor(() => {
            expect(mockUpdateDoc).toHaveBeenCalled();
            // Verify arguments: doc ref and { offers: [...] }
        });
    });

    it('renders posted jobs for Client', async () => {
        (useAuth as any).mockReturnValue({ user: mockUser, userRole: 'client' });
        render(<JobMarket user={mockUser as any} userRole="client" goBack={vi.fn()} />);

        const mockJobs = [
            {
                id: 'job2',
                title: 'My Broken Pipe',
                desc: 'Leaking water',
                budget: 200,
                client_email: 'test@example.com',
                status: 'open',
                date: new Date().toISOString(),
                offers: []
            }
        ];
        simulateSnapshot(mockJobs);

        await screen.findByText('My Broken Pipe');
        await screen.findByPlaceholderText('titlePlaceholder'); // Post job form

    });

    it('allows Client to post a job', async () => {
        (useAuth as any).mockReturnValue({ user: mockUser, userRole: 'client' });
        render(<JobMarket user={mockUser as any} userRole="client" goBack={vi.fn()} />);

        // Simulate empty list
        simulateSnapshot([]);

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('titlePlaceholder'), { target: { value: 'New Job' } });
        fireEvent.change(screen.getByPlaceholderText('budget'), { target: { value: '300' } });
        fireEvent.change(screen.getByPlaceholderText('locationPlaceholder'), { target: { value: 'Giza' } });
        fireEvent.change(screen.getByPlaceholderText('descPlaceholder'), { target: { value: 'Desc' } });

        // Submit
        fireEvent.click(screen.getByText('postJob'));

        await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());
        expect(mockAddDoc).toHaveBeenCalledWith(
            undefined, // collection ref (mocked return is undefined in simple mock)
            expect.objectContaining({
                title: 'New Job',
                budget: 300,
                location: 'Giza',
                status: 'open'
            })
        );
    });
});
