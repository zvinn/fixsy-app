/* src/UserBookings.js - (عرض المواعيد المجدولة للعميل) */
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import ChatWindow from './ChatWindow';

function UserBookings({ user, goBack }) {
  const [myRequests, setMyRequests] = useState([]);
  const [chatRequestId, setChatRequestId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "requests"), where("client_email", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
                                     .sort((a, b) => new Date(b.date) - new Date(a.date));
      setMyRequests(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleRate = async (requestId, ratingValue) => {
    try {
      await updateDoc(doc(db, "requests", requestId), { client_rating: ratingValue });
      alert("شكراً لتقييمك! ⭐");
    } catch (error) { console.error(error); }
  };

  const renderTimeline = (status) => {
    const steps = ['pending', 'accepted', 'on_way', 'arrived', 'in_progress', 'completed'];
    const currentStepIndex = steps.indexOf(status);
    return (
      <div style={{display: 'flex', justifyContent: 'space-between', margin: '20px 0', position: 'relative'}}>
        <div style={{position: 'absolute', top: '12px', left: '0', right: '0', height: '3px', background: '#eee', zIndex: 0}}></div>
        <div style={{position: 'absolute', top: '12px', right: '0', height: '3px', background: '#10B981', zIndex: 0, width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, transition: 'width 0.5s'}}></div>
        {steps.map((step, index) => (
            <div key={step} style={{zIndex: 1, textAlign: 'center'}}>
                <div style={{width: '25px', height: '25px', borderRadius: '50%', background: index <= currentStepIndex ? '#10B981' : '#eee', color: index <= currentStepIndex ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.8rem', border: '2px solid white'}}>
                    {index <= currentStepIndex ? ({'pending':'⏳','accepted':'✅','on_way':'🚗','arrived':'📍','in_progress':'🛠️','completed':'🏁'}[step]) : '•'}
                </div>
                <span style={{fontSize: '0.6rem', color: '#333'}}>{step === 'on_way' ? 'في الطريق' : step === 'in_progress' ? 'جاري العمل' : step === 'completed' ? 'انتهى' : ''}</span>
            </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {chatRequestId && <ChatWindow requestId={chatRequestId} currentUser={user} closeChat={() => setChatRequestId(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0056D2' }}>📦 تتبع طلباتي</h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}>الرجوع</button>
      </div>

      {myRequests.length === 0 ? <p style={{textAlign:'center'}}>لا توجد طلبات حالياً.</p> : 
       myRequests.map((req) => (
        <div key={req.id} style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
             <h3 style={{margin:0}}>صيانة {req.technician_name}</h3>
             <strong style={{color: '#10B981'}}>💰 {req.price} ج.م</strong>
          </div>

          {/* 👇👇 التاريخ والوقت ظاهرين للعميل 👇👇 */}
          <div style={{background: '#F3F4F6', padding: '8px', borderRadius: '5px', marginTop: '10px', fontSize: '0.9rem', color: '#0056D2', fontWeight: 'bold'}}>
             📅 موعد الزيارة: {new Date(req.scheduledDate || req.date).toLocaleString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' })}
          </div>
          {/* 👆👆 ------------------------------- 👆👆 */}

          {renderTimeline(req.status)}
          
          <p style={{background: '#F9FAFB', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', color: '#555'}}>📝 {req.problem_desc}</p>

          {req.problem_image && (
            <div style={{marginTop:'10px'}}>
                <a href={req.problem_image} target="_blank" rel="noreferrer">
                    <img src={req.problem_image} alt="Problem" style={{width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'10px'}} />
                </a>
            </div>
          )}

          <div style={{marginTop: '15px', display:'flex', gap:'10px'}}>
            {req.status !== 'pending' && <button onClick={() => setChatRequestId(req.id)} style={{flex:1, background: '#0056D2', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer'}}>💬 كلم الفني</button>}
          </div>

          {req.status === 'completed' && (
            <div style={{textAlign: 'center', marginTop: '15px'}}>
              <p style={{margin: '0 0 5px 0', fontSize: '0.8rem', color: '#888'}}>قيم الخدمة:</p>
              {req.client_rating ? <div style={{color: '#F59E0B', fontSize: '1.5rem'}}>{"★".repeat(req.client_rating)}</div> : 
                <div style={{display: 'inline-flex', gap: '10px'}}>{[1, 2, 3, 4, 5].map((star) => <span key={star} onClick={() => handleRate(req.id, star)} style={{cursor: 'pointer', fontSize: '2rem', color: '#ddd'}}>★</span>)}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default UserBookings;
