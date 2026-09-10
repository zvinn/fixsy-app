// src/components/Stories.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { Plus, X, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, storage } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { User } from 'firebase/auth';

interface Story {
    id: string;
    techId: string;
    techName: string;
    techImg: string;
    media: string;
    type: 'image' | 'video';
    timestamp: number;
}

interface StoriesProps {
    user: User | null;
    userRole: string | null;
}

const Stories: React.FC<StoriesProps> = ({ user, userRole }) => {
    const { t } = useLanguage();
    const [stories, setStories] = useState<Story[]>([]);
    const [activeStory, setActiveStory] = useState<Story | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // Fetch Stories (last 24 hours)
    useEffect(() => {
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        const q = query(
            collection(db, "stories"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedStories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Story)).filter(s => s.timestamp > twentyFourHoursAgo);
            setStories(fetchedStories);
        });

        return () => unsubscribe();
    }, []);

    // Auto-advance progress for active story
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (activeStory) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setActiveStory(null);
                        return 0;
                    }
                    return prev + 2;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [activeStory]);

    const handleAddStory = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large (max 5MB)");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading(t("uploadingStory") || "Uploading story...");

        try {
            const storageRef = ref(storage, `stories/${user.uid}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, "stories"), {
                techId: user.uid,
                techName: user.displayName || 'Technician',
                techImg: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                media: downloadURL,
                type: 'image',
                timestamp: Date.now()
            });

            toast.success(t("storyAdded") || "Story added!", { id: toastId });
        } catch (error) {
            console.error("Error upload story:", error);
            toast.error("Failed to upload story", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    if (stories.length === 0 && userRole !== 'tech') {
        return null;
    }

    return (
        <div
            className="stories-container"
            style={{ padding: '15px 0', borderBottom: '1px solid var(--border, #f1f5f9)', background: 'var(--bg-primary, white)', marginBottom: '10px' }}
            role="region"
            aria-label={t("stories") || "Stories"}
        >
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '0 20px' }} className="hide-scrollbar" role="list">

                {/* Add Story Button (Tech Only) */}
                {userRole === 'tech' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }} role="listitem">
                        <label
                            style={{
                                width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed #3B82F6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
                                opacity: isUploading ? 0.5 : 1
                            }}
                            aria-label={t("addStory") || "Add Story"}
                        >
                            {isUploading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <Plus size={24} color="#3B82F6" />}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAddStory} disabled={isUploading} />
                            {!isUploading && (
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#3B82F6', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                                    <Camera size={12} color="white" />
                                </div>
                            )}
                        </label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748B)' }}>{t("addStory") || "Add Story"}</span>
                    </div>
                )}

                {/* Stories List */}
                {stories.map(story => (
                    <div
                        key={story.id}
                        onClick={() => setActiveStory(story)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                        role="listitem"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setActiveStory(story)}
                        aria-label={`${story.techName}'s story`}
                    >
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', padding: '2px',
                            background: 'linear-gradient(45deg, #F59E0B, #EC4899)'
                        }}>
                            <img src={story.techImg} alt={story.techName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-primary, #334155)', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {story.techName.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Story Viewer Overlay */}
            {activeStory && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'black', zIndex: 99999,
                        display: 'flex', flexDirection: 'column'
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activeStory.techName}'s story`}
                >
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', gap: '5px', padding: '10px 10px 0' }}>
                        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'white', width: `${progress}%`, transition: 'width 50ms linear' }}></div>
                        </div>
                    </div>

                    {/* Header */}
                    <div style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={activeStory.techImg} alt="tech" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{activeStory.techName}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                    {Math.floor((Date.now() - activeStory.timestamp) / 3600000)}h ago
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveStory(null)}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                            aria-label={t("close") || "Close"}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                        <img src={activeStory.media} alt="Story" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                </div>
            )}
        </div>
    );
};

export default Stories;
