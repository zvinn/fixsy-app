/* src/ChatWindow.js - شات كامل (نص + صور + صوت) */
import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

function ChatWindow({ requestId, currentUser, closeChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // 👇 متغيرات التسجيل الصوتي 👇
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const dummyDiv = useRef(null);
  
  const CLOUD_NAME = "du9zxrsfl";
  const UPLOAD_PRESET = "fixsy_upload";

  useEffect(() => {
    if (!requestId) return;
    const q = query(collection(db, "requests", requestId, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setTimeout(() => dummyDiv.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [requestId]);

  // ☁️ دالة رفع الملفات (صور أو صوت)
  const uploadFile = async (file, resourceType = 'image') => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      // لاحظ: غيرنا الرابط لـ 'auto' عشان يقبل صوت وفيديو وصور
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setIsUploading(false);
      return data.secure_url;
    } catch (error) {
      console.error(error);
      toast.error("فشل الرفع");
      setIsUploading(false);
      return null;
    }
  };

  // 📷 معالجة الصورة
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file, 'image');
    if(url) await sendMessage(null, url, 'image');
  };

  // 🎙️ بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // رفع الصوت
        const url = await uploadFile(audioBlob, 'video'); // Cloudinary بيعامل الصوت معاملة الفيديو
        if(url) await sendMessage(null, url, 'audio');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast("جاري التسجيل... 🎙️", { icon: '🔴' });
    } catch (err) {
      toast.error("لا يمكن الوصول للميكروفون");
    }
  };

  // ⏹️ إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 📩 إرسال الرسالة (نص، صورة، أو صوت)
  const sendMessage = async (e, contentUrl = null, type = 'text') => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !contentUrl) || !currentUser) return;

    try {
      await addDoc(collection(db, "requests", requestId, "messages"), {
        text: type === 'text' ? newMessage : (type === 'image' ? '📷 صورة' : '🎤 رسالة صوتية'),
        mediaUrl: contentUrl || null,
        mediaType: type, // 'text', 'image', 'audio'
        sender: currentUser.displayName || currentUser.email || "مستخدم",
        senderId: currentUser.email,
        createdAt: new Date()
      });
      setNewMessage("");
    } catch (error) { console.error(error); }
  };

  if (!currentUser) return null;

  return (
    <div className="modal-overlay" style={{alignItems: 'flex-end', paddingBottom: '0', zIndex: '999999'}}> 
      <div className="modal-content" style={{width: '100%', height: '85vh', maxWidth: '600px', display: 'flex', flexDirection: 'column', padding: '0', borderRadius: '20px 20px 0 0', overflow:'hidden'}}>
        
        <div style={{background: '#0056D2', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{margin: 0}}>💬 المحادثة</h3>
          <button onClick={closeChat} style={{background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer'}}>✕</button>
        </div>

        <div style={{flex: 1, overflowY: 'auto', padding: '15px', background: '#f5f5f5'}}>
          {messages.length === 0 && <p style={{textAlign:'center', color:'#999', marginTop:'20px'}}>👋 ..ابدأ الحديث الآن</p>}
          
          {messages.map(msg => {
            const isMe = msg.senderId === currentUser.email;
            return (
              <div key={msg.id} style={{display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '10px'}}>
                <div style={{background: isMe ? '#0056D2' : 'white', color: isMe ? 'white' : '#333', padding: '10px 15px', borderRadius: '15px', borderBottomRightRadius: isMe ? '0' : '15px', borderBottomLeftRadius: isMe ? '15px' : '0', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', wordBreak: 'break-word'}}>
                  <div style={{fontSize: '0.7rem', opacity: 0.7, marginBottom: '3px'}}>{msg.sender}</div>
                  
                  {/* 👇 عرض المحتوى حسب نوعه 👇 */}
                  {msg.mediaType === 'image' ? (
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer"><img src={msg.mediaUrl} alt="sent" style={{maxWidth: '100%', borderRadius: '10px', marginTop:'5px'}} /></a>
                  ) : msg.mediaType === 'audio' ? (
                    <audio controls src={msg.mediaUrl} style={{maxWidth: '200px', marginTop:'5px'}} />
                  ) : (
                    // دعم للرسائل القديمة (اللي كانت image بس)
                    msg.image ? <a href={msg.image} target="_blank" rel="noreferrer"><img src={msg.image} alt="sent" style={{maxWidth: '100%', borderRadius: '10px', marginTop:'5px'}} /></a> 
                    : <span>{msg.text}</span>
                  )}
                  
                  <div style={{fontSize: '0.6rem', opacity: 0.6, marginTop: '5px', textAlign: 'right'}}>{msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                </div>
              </div>
            )
          })}
          <div ref={dummyDiv}></div>
        </div>

        {/* منطقة الكتابة والتسجيل */}
        <form onSubmit={(e) => sendMessage(e, null, 'text')} style={{padding: '10px', borderTop: '1px solid #ddd', display: 'flex', gap: '10px', alignItems: 'center', background: 'white'}}>
          
          {/* زرار الصور */}
          <label style={{cursor: 'pointer', padding: '10px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center'}}>
            <span style={{fontSize: '1.2rem'}}>📷</span>
            <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleImageUpload} disabled={isUploading || isRecording} />
          </label>

          {/* خانة الكتابة (تختفي وقت التسجيل) */}
          {!isRecording ? (
            <input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder={isUploading ? "جاري الرفع..." : "اكتب رسالة..."} 
                disabled={isUploading} 
                style={{flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none'}} 
            />
          ) : (
            <div style={{flex: 1, padding: '12px', color: 'red', fontWeight: 'bold', textAlign: 'center', background: '#ffebeb', borderRadius: '25px'}}>
                جاري التسجيل... 🎙️
            </div>
          )}
          
          {/* زرار الميكروفون / الإرسال */}
          {newMessage.trim() ? (
              <button type="submit" style={{background: '#10B981', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>🚀</button>
          ) : (
              <button 
                type="button" 
                onMouseDown={startRecording} 
                onMouseUp={stopRecording} 
                onTouchStart={startRecording} // للموبايل
                onTouchEnd={stopRecording}   // للموبايل
                style={{background: isRecording ? '#DC2626' : '#3B82F6', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', transform: isRecording ? 'scale(1.2)' : 'scale(1)'}}
              >
                🎙️
              </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
