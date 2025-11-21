/* src/Notifications.js */
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';

function Notifications({ user, goBack }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // جلب الإشعارات الخاصة بالمستخدم الحالي
    const q = query(
      collection(db, "notifications"), 
      where("userId", "==", user.email)
      // ملحوظة: الترتيب بيحتاج Index في فايربيس، لو طلع خطأ هنشيله مؤقتاً
      // orderBy("date", "desc") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
                                     .sort((a, b) => new Date(b.date) - new Date(a.date)); // ترتيب يدوي
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user]);

  // دالة "تحديد الكل كمقروء"
  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach(notif => {
      if (!notif.read) {
        const ref = doc(db, "notifications", notif.id);
        batch.update(ref, { read: true });
      }
    });
    await batch.commit();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0056D2' }}>🔔 الإشعارات</h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}>الرجوع</button>
      </div>

      <button onClick={markAllAsRead} style={{marginBottom: '20px', background: 'none', border: 'none', color: '#0056D2', cursor: 'pointer', textDecoration: 'underline'}}>تحديد الكل كمقروء ✔️</button>

      {notifications.length === 0 ? (
        <div style={{textAlign: 'center', padding: '50px', color: '#888'}}>
            <span style={{fontSize: '3rem'}}>🔕</span>
            <p>لا توجد إشعارات جديدة</p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div key={notif.id} style={{
              background: notif.read ? 'white' : '#EBF5FF', // المقروء أبيض، الجديد أزرق فاتح
              padding: '15px', 
              borderRadius: '10px', 
              marginBottom: '10px', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              borderLeft: notif.read ? '5px solid #ccc' : '5px solid #0056D2',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
          }}>
            <div style={{fontSize: '1.5rem'}}>{notif.icon || '📢'}</div>
            <div style={{flex: 1}}>
                <p style={{margin: '0', fontWeight: notif.read ? 'normal' : 'bold', color: '#333'}}>{notif.message}</p>
                <span style={{fontSize: '0.7rem', color: '#888'}}>{new Date(notif.date).toLocaleString('ar-EG')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;