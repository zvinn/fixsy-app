/* src/Notifications.js - تصميم احترافي مع التوجيه */
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Bell, ChevronLeft, MessageCircle, Briefcase } from 'lucide-react';
import gsap from 'gsap';

function Notifications({ user, goBack, onSelectNotif }) {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("userId", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setNotifications(data);

      // أنيميشن دخول
      gsap.fromTo(".notif-card", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 });
    });
    return () => unsubscribe();
  }, [user]);

  const handleClick = async (notif) => {
    // 1. تحديد كمقروء
    if (!notif.read) {
      await writeBatch(db).update(doc(db, "notifications", notif.id), { read: true }).commit();
    }
    // 2. التوجيه للطلب (لو الإشعار مرتبط بطلب)
    if (onSelectNotif && notif.targetId) {
      onSelectNotif(notif.targetId, notif.type); // type: 'request' or 'chat'
    }
  };

  const markAllRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach(n => { if (!n.read) batch.update(doc(db, "notifications", n.id), { read: true }); });
    await batch.commit();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>

      {/* الهيدر */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', padding: '15px 20px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#0056D2', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={24} /> {t("notificationsTitle")}
        </h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {t("back")} <ChevronLeft size={16} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#0056D2', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>{t("markAllRead")}</button>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <Bell size={60} style={{ marginBottom: '15px', opacity: 0.2 }} />
          <p>{t("noNotifications")}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div key={notif.id} onClick={() => handleClick(notif)} className="notif-card" style={{
              background: notif.read ? 'white' : '#EFF6FF',
              padding: '15px', borderRadius: '16px', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', gap: '15px', position: 'relative',
              borderRight: notif.read ? 'none' : '4px solid #0056D2'
            }}>
              {/* الأيقونة حسب النوع */}
              <div style={{
                width: '45px', height: '45px', borderRadius: '12px',
                background: notif.type === 'chat' ? '#ECFDF5' : '#F0F9FF',
                color: notif.type === 'chat' ? '#059669' : '#0056D2',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {notif.type === 'chat' ? <MessageCircle size={22} /> : <Briefcase size={22} />}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 5px', fontWeight: notif.read ? '500' : 'bold', color: '#1e293b', fontSize: '0.95rem' }}>
                  {notif.message}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ClockIcon /> {new Date(notif.date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              {!notif.read && <div style={{ width: '10px', height: '10px', background: '#EF4444', borderRadius: '50%' }}></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export default Notifications;
