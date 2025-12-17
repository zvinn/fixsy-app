/* src/ChatWindow.js - تصميم شات احترافي وسريع */
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db, storage } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Send, Mic, Image as ImageIcon, X, Play, Pause, Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

function ChatWindow({ requestId, currentUser, closeChat }) {
  const [messages, setMessages] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null); // لتشغيل الصوت
  const { t } = useLanguage();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const dummyDiv = useRef(null);
  const chatContainerRef = useRef(null);

  const CLOUD_NAME = "du9zxrsfl";
  const UPLOAD_PRESET = "fixsy_upload";

  // جلب الرسائل
  useEffect(() => {
    if (!requestId) return;
    const q = query(collection(db, "requests", requestId, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setTimeout(() => dummyDiv.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    // Fetch Request Data for AI Context
    getDoc(doc(db, "requests", requestId)).then(snap => {
      if (snap.exists()) setRequestData(snap.data());
    });

    return () => unsubscribe();
  }, [requestId]);

  // أنيميشن دخول الشات
  useEffect(() => {
    gsap.fromTo(chatContainerRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
  }, []);

  const uploadFile = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (error) { console.error(error); setIsUploading(false); return null; }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) await sendMessage(null, url, 'image');
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
        if (url) await sendMessage(null, url, 'audio');
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

  // استدعاء getDoc و doc من firestore مع باقي الـ imports فوق
  // import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore'; 

  const sendMessage = async (e, contentUrl = null, type = 'text') => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !contentUrl) || !currentUser) return;
    try {
      // 1. إرسال الرسالة
      await addDoc(collection(db, "requests", requestId, "messages"), {
        text: type === 'text' ? newMessage : (type === 'image' ? `📷 ${t("image")}` : `🎤 ${t("voice")}`),
        mediaUrl: contentUrl || null,
        mediaType: type,
        senderId: currentUser.email,
        senderName: currentUser.displayName || t("user"),
        createdAt: new Date()
      });

      // 2. إرسال إشعار للطرف الآخر
      const requestRef = doc(db, "requests", requestId);
      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists()) {
        const reqData = requestSnap.data();
        // تحديد المستقبل: لو أنا العميل يبقى ابعت للفني، والعكس
        const recipientEmail = currentUser.email === reqData.client_email
          ? reqData.technician_email
          : reqData.client_email;

        // نتأكد إن فيه إيميل مستقبل (ممكن الفني لسه متقبلش الطلب بس الشات مش هيفتح أصلاً)
        if (recipientEmail) {
          await addDoc(collection(db, "notifications"), {
            userId: recipientEmail,
            message: `${t("newMessageFrom")} ${currentUser.displayName}: ${type === 'text' ? newMessage.substring(0, 30) + (newMessage.length > 30 ? '...' : '') : (type === 'image' ? t("sentImage") : t("sentVoice"))}`,
            type: 'chat',
            targetId: requestId, // عشان لما يضغط عليه يفتح الشات
            read: false,
            date: new Date().toISOString()
          });
        }
      }

      setNewMessage("");
    } catch (error) { console.error(error); }
  };

  // مشغل صوت بسيط
  const toggleAudio = (url) => {
    const audio = document.getElementById(url);
    if (audio.paused) {
      document.querySelectorAll('audio').forEach(a => a.pause()); // وقف الباقي
      audio.play();
      setPlayingAudio(url);
    } else {
      audio.pause();
      setPlayingAudio(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0, zIndex: 999999, background: 'rgba(0,0,0,0.3)' }}>
      <div ref={chatContainerRef} className="modal-content" style={{
        width: '95%', height: '85vh', maxWidth: '500px', margin: '0 auto 20px auto',
        display: 'flex', flexDirection: 'column', padding: 0,
        borderRadius: '24px', overflow: 'hidden', background: '#f8fafc',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>

        {/* الهيدر */}
        <div style={{
          background: 'white', padding: '15px 20px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{currentUser.displayName || t("user")}</h3>
            <span style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></span> {t("onlineNow")}
            </span>
          </div>
          <button onClick={closeChat} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* منطقة الرسائل */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
          {messages.length === 0 && !requestData?.ai_diagnosis && (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30%', opacity: 0.7 }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👋</div>
              <p>{t("startChat")}</p>
            </div>
          )}

          {/* 🤖 AI System Message (Handoff) */}
          {requestData?.ai_diagnosis && (
            <div className="fade-in" style={{ margin: '0 auto 20px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '16px', padding: '15px', maxWidth: '85%', alignSelf: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="#0284C7" />
                <span style={{ fontWeight: 'bold', color: '#0369A1', fontSize: '0.9rem' }}>{t("aiDiagnosis") || "AI Diagnosis"}</span>
              </div>
              <p style={{ margin: '0 0 5px', color: '#334155', fontWeight: 'bold', fontSize: '0.95rem' }}>{requestData.ai_diagnosis.type}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>{requestData.ai_diagnosis.advice}</p>
              {requestData.ai_diagnosis.estimatedPrice && (
                <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '0.85rem', color: '#15803d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  💰 {t("estimatedCost") || "Est. Cost"}: {requestData.ai_diagnosis.estimatedPrice.min} - {requestData.ai_diagnosis.estimatedPrice.max} {requestData.ai_diagnosis.estimatedPrice.currency}
                </div>
              )}
              <button onClick={() => closeChat({ diagnosis: requestData.ai_diagnosis })} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#0284C7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {t("bookNow") || "Book Now"} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {messages.map(msg => {
            const isMe = msg.senderId === currentUser.email;
            return (
              <div key={msg.id} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: '15px'
              }}>
                <div style={{
                  background: isMe ? 'linear-gradient(135deg, #0056D2, #2563EB)' : 'white',
                  color: isMe ? 'white' : '#334155',
                  padding: msg.mediaType === 'image' ? '5px' : '12px 16px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  maxWidth: '75%',
                  boxShadow: isMe ? '0 4px 15px rgba(37,99,235,0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  fontSize: '0.95rem', lineHeight: '1.5'
                }}>
                  {/* الصور */}
                  {msg.mediaType === 'image' && (
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                      <img src={msg.mediaUrl} alt="img" style={{ borderRadius: '14px', maxWidth: '100%', display: 'block' }} />
                    </a>
                  )}

                  {/* الصوت */}
                  {msg.mediaType === 'audio' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px' }}>
                      <button onClick={() => toggleAudio(msg.id)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', color: isMe ? 'white' : '#0056D2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {playingAudio === msg.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                      </button>
                      <div style={{ height: '4px', background: isMe ? 'rgba(255,255,255,0.3)' : '#e2e8f0', flex: 1, borderRadius: '2px' }}></div>
                      <audio id={msg.id} src={msg.mediaUrl} onEnded={() => setPlayingAudio(null)} hidden />
                    </div>
                  )}

                  {/* النصوص */}
                  {msg.mediaType === 'text' && msg.text}
                </div>

                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px', marginInline: '5px' }}>
                  {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            )
          })}
          <div ref={dummyDiv}></div>
        </div>

        {/* خانة الكتابة */}
        <form onSubmit={(e) => sendMessage(e, null, 'text')} style={{ padding: '15px', background: 'white', display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>

          <label style={{ cursor: 'pointer', padding: '10px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', transition: '0.2s' }}>
            <ImageIcon size={22} color="#64748b" />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading || isRecording} />
          </label>

          {!isRecording ? (
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isUploading ? t("uploading") : t("writeMessage")}
              disabled={isUploading}
              style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', background: '#f8fafc' }}
            />
          ) : (
            <div style={{ flex: 1, padding: '12px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center', background: '#fef2f2', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
              {t("recording")}
            </div>
          )}

          {newMessage.trim() ? (
            <button type="submit" style={{ background: '#0056D2', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,86,210,0.3)' }}>
              <Send size={20} style={{ marginLeft: '2px' }} />
            </button>
          ) : (
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              style={{ background: isRecording ? '#ef4444' : '#3b82f6', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', transform: isRecording ? 'scale(1.1)' : 'scale(1)' }}
            >
              <Mic size={22} />
            </button>
          )}
        </form>
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}

export default ChatWindow;
