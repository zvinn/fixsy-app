// src/components/ChatWindow.tsx
import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Send, Mic, Image as ImageIcon, X, Play, Pause, Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { User } from 'firebase/auth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import './ChatWindow.css';
import { env } from '../config/env';

interface ChatWindowProps {
    requestId: string;
    currentUser: User | null;
    closeChat: (data?: unknown) => void;
}

interface Message {
    id: string;
    text?: string;
    mediaUrl?: string | null;
    mediaType: 'text' | 'image' | 'audio';
    senderId: string;
    senderName: string;
    createdAt: { seconds: number; nanoseconds: number } | Date;
}

interface RequestData {
    client_email?: string;
    technician_email?: string;
    ai_diagnosis?: {
        type: string;
        advice: string;
        estimatedPrice?: {
            min: number;
            max: number;
            currency: string;
        };
    };
    [key: string]: unknown;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ requestId, currentUser, closeChat }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [requestData, setRequestData] = useState<RequestData | null>(null);
    const [newMessage, setNewMessage] = useState<string>("");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const { t } = useLanguage();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const dummyDiv = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!requestId) return;
        const q = query(collection(db, "requests", requestId, "messages"), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
            setMessages(msgs);
            setTimeout(() => dummyDiv.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        getDoc(doc(db, "requests", requestId)).then(snap => {
            if (snap.exists()) setRequestData(snap.data() as RequestData);
        });

        return () => unsubscribe();
    }, [requestId]);

    useEffect(() => {
        if (chatContainerRef.current) {
            gsap.fromTo(chatContainerRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
        }
    }, []);

    const uploadFile = async (file: File | Blob): Promise<string | null> => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", env.cloudinary.uploadPreset || 'fixsy');

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/auto/upload`, { method: "POST", body: formData });
            const data = await res.json();
            setIsUploading(false);
            return data.secure_url;
        } catch (error) {
            console.error(error);
            setIsUploading(false);
            return null;
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        if (url) await sendMessage(undefined, url, 'image');
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = await uploadFile(audioBlob);
                if (url) await sendMessage(undefined, url, 'audio');
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast(t("recording") + " 🎙️");
        } catch (err) { toast.error(t("micUnavailable")); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendMessage = async (e?: FormEvent, contentUrl: string | null = null, type: 'text' | 'image' | 'audio' = 'text') => {
        if (e) e.preventDefault();

        // Validation with user feedback
        if (!currentUser || !currentUser.email) {
            toast.error(t("loginRequired") || "يجب تسجيل الدخول أولاً");
            return;
        }

        if (!newMessage.trim() && !contentUrl) {
            toast.error(t("emptyMessage") || "الرسالة فارغة");
            return;
        }

        // Prevent duplicate sends
        if (isSending) {
            return;
        }

        setIsSending(true);
        const messageText = newMessage; // Save before clearing

        try {
            await addDoc(collection(db, "requests", requestId, "messages"), {
                text: type === 'text' ? messageText : (type === 'image' ? `📷 ${t("image")}` : `🎤 ${t("voice")}`),
                mediaUrl: contentUrl || null,
                mediaType: type,
                senderId: currentUser.email,
                senderName: currentUser.displayName || t("user"),
                createdAt: new Date()
            });

            // Clear input immediately after successful send
            setNewMessage("");

            // Notification logic
            const requestRef = doc(db, "requests", requestId);
            const requestSnap = await getDoc(requestRef);
            if (requestSnap.exists()) {
                const reqData = requestSnap.data() as RequestData;
                const recipientEmail = currentUser.email === reqData.client_email ? reqData.technician_email : reqData.client_email;
                if (recipientEmail) {
                    await addDoc(collection(db, "notifications"), {
                        userId: recipientEmail,
                        message: `${t("newMessageFrom")} ${currentUser.displayName}: ${type === 'text' ? messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '') : (type === 'image' ? t("sentImage") : t("sentVoice"))}`,
                        type: 'chat',
                        targetId: requestId,
                        read: false,
                        date: new Date().toISOString()
                    });
                }
            }

            // Success feedback (subtle, no toast to avoid spam)
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(t("messageSendError") || "فشل إرسال الرسالة. حاول مرة أخرى");
            // Restore message on error
            if (type === 'text') {
                setNewMessage(messageText);
            }
        } finally {
            setIsSending(false);
        }
    };

    const toggleAudio = (url: string) => {
        const audio = document.getElementById(url) as HTMLAudioElement;
        if (audio.paused) {
            document.querySelectorAll('audio').forEach(a => a.pause());
            audio.play();
            setPlayingAudio(url);
        } else {
            audio.pause();
            setPlayingAudio(null);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="modal-overlay chat-overlay" role="dialog" aria-modal="true" aria-label={t("chatWindow")}>
            <div ref={chatContainerRef} className="chat-container">

                {/* Header */}
                <header className="chat-header">
                    <div>
                        <h3 className="text-lg text-primary">{currentUser.displayName || t("user")}</h3>
                        <span className="online-indicator">
                            <span className="online-dot" aria-hidden="true"></span> {t("onlineNow")}
                        </span>
                    </div>
                    <button onClick={() => closeChat()} aria-label={t("close")} className="close-chat-btn">
                        <X size={20} color="#64748b" aria-hidden="true" />
                    </button>
                </header>

                {/* Messages Area */}
                <div className="messages-area" role="log" aria-live="polite">
                    {messages.length === 0 && !requestData?.ai_diagnosis && (
                        <div className="empty-chat">
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👋</div>
                            <p>{t("startChat")}</p>
                        </div>
                    )}

                    {/* AI System Message (Handoff) */}
                    {requestData?.ai_diagnosis && (
                        <div className="ai-diagnosis-card fade-in">
                            <div className="ai-card-title">
                                <Sparkles size={16} color="#0284C7" aria-hidden="true" />
                                <span>{t("aiDiagnosis") || "AI Diagnosis"}</span>
                            </div>
                            <p style={{ margin: '0 0 5px', color: '#334155', fontWeight: 'bold', fontSize: '0.95rem' }}>{requestData.ai_diagnosis.type}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>{requestData.ai_diagnosis.advice}</p>
                            {requestData.ai_diagnosis.estimatedPrice && (
                                <div className="ai-price-tag">
                                    💰 {t("estimatedCost")}: {requestData.ai_diagnosis.estimatedPrice.min} - {requestData.ai_diagnosis.estimatedPrice.max} {requestData.ai_diagnosis.estimatedPrice.currency}
                                </div>
                            )}
                            <Button variant="primary" onClick={() => closeChat({ diagnosis: requestData.ai_diagnosis })} style={{ width: '100%', marginTop: '10px' }}>
                                {t("bookNow")} <ArrowRight size={16} />
                            </Button>
                        </div>
                    )}

                    {messages.map(msg => {
                        const isMe = msg.senderId === currentUser.email;
                        return (
                            <div key={msg.id} className={`message-row ${isMe ? 'me' : 'other'}`}>
                                <div className={`message-bubble ${isMe ? 'me' : 'other'} ${msg.mediaType === 'image' ? 'image-bubble' : ''}`}>
                                    {/* Images */}
                                    {msg.mediaType === 'image' && msg.mediaUrl && (
                                        <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                                            <img src={msg.mediaUrl} alt="sent by user" style={{ borderRadius: '14px', maxWidth: '100%', display: 'block' }} />
                                        </a>
                                    )}

                                    {/* Audio */}
                                    {msg.mediaType === 'audio' && msg.mediaUrl && (
                                        <div className="audio-player">
                                            <button
                                                onClick={() => toggleAudio(msg.id)}
                                                aria-label={playingAudio === msg.id ? "Pause" : "Play"}
                                                className="play-btn"
                                            >
                                                {playingAudio === msg.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                            </button>
                                            <div style={{ height: '4px', background: isMe ? 'rgba(255,255,255,0.3)' : '#e2e8f0', flex: 1, borderRadius: '2px' }}></div>
                                            <audio id={msg.id} src={msg.mediaUrl} onEnded={() => setPlayingAudio(null)} hidden />
                                        </div>
                                    )}

                                    {/* Text */}
                                    {msg.mediaType === 'text' && msg.text}
                                </div>


                                <span className="time-stamp">
                                    {msg.createdAt && typeof msg.createdAt === 'object' && 'seconds' in msg.createdAt
                                        ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : msg.createdAt instanceof Date
                                            ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                </span>
                            </div>
                        )
                    })}
                    <div ref={dummyDiv}></div>
                </div>

                {/* Input Area */}
                <form onSubmit={(e) => sendMessage(e, null, 'text')} className="chat-input-form">
                    <label aria-label={t("uploadImage")} className="upload-btn">
                        <ImageIcon size={22} color="#64748b" />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading || isRecording} />
                    </label>

                    {!isRecording ? (
                        <div style={{ flex: 1 }}>
                            <Input
                                value={newMessage}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                                placeholder={isUploading ? t("uploading") : t("writeMessage")}
                                disabled={isUploading}
                                className="chat-input"
                                style={{ borderRadius: '30px', padding: '12px 20px' }}
                            />
                        </div>
                    ) : (
                        <div className="recording-indicator">
                            <span className="recording-dot"></span>
                            {t("recording")}
                        </div>
                    )}

                    {newMessage.trim() ? (
                        <button
                            type="submit"
                            aria-label={t("send")}
                            className="send-btn"
                            disabled={isSending || isUploading}
                            style={{ opacity: isSending || isUploading ? 0.5 : 1, cursor: isSending || isUploading ? 'not-allowed' : 'pointer' }}
                        >
                            {isSending ? (
                                <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                            ) : (
                                <Send size={20} style={{ marginLeft: '2px' }} />
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            aria-label={t("recordVoice")}
                            className={`mic-btn ${isRecording ? 'recording' : ''}`}
                        >
                            <Mic size={22} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ChatWindow;
