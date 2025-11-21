/* src/Profile.js - مع الصفحات القانونية */
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

function Profile({ user, userRole, goBack, changeTab }) { // 👇 ضفنا changeTab هنا
  const [userData, setUserData] = useState(null);
  const [docId, setDocId] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      if (userRole === 'admin') {
          setUserData({ name: user.displayName || 'المدير العام', email: user.email, phone: 'غير متاح', role: 'admin' });
          return;
      }
      const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
      try {
          const q = query(collection(db, collectionName), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            setUserData(docData.data()); setDocId(docData.id); setEditForm(docData.data());
          } else {
            setUserData({ name: user.displayName, email: user.email, phone: '' });
          }
      } catch (error) { setUserData({ name: user.displayName, email: user.email }); }
    };
    fetchData();
  }, [user, userRole]);

  const handleSave = async () => {
    if (userRole === 'admin') return alert("لا يمكن تعديل بيانات الأدمن");
    if (!docId) return alert("لا يوجد سجل");
    try {
      const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
      const userRef = doc(db, collectionName, docId);
      await updateDoc(userRef, { name: editForm.name, phone: editForm.phone || '' });
      setUserData(editForm); setIsEditing(false); alert("✅ تم التحديث");
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDeleteAccount = async () => {
    if (userRole === 'admin') return alert("لا يمكن حذف الأدمن!");
    if (userRole === 'tech' && userData.debt > 0) return alert(`⛔ عليك مديونية ${userData.debt} ج.م`);
    if (!window.confirm("هل أنت متأكد؟")) return;
    try {
      const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
      if (docId) await deleteDoc(doc(db, collectionName, docId));
      await deleteUser(auth.currentUser);
      alert("تم الحذف 👋"); window.location.reload();
    } catch (error) { alert("سجل خروج وحاول تاني"); }
  };

  const handleLogout = () => { signOut(auth); window.location.reload(); };

  if (!userData) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#0056D2' }}>👤 الملف الشخصي</h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}>الرجوع</button>
      </div>

      <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}&backgroundColor=0056D2,10B981,F59E0B`} alt="user" style={{width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #eee'}}/>
            {isEditing ? <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{display: 'block', margin: '10px auto', padding: '8px', border: '1px solid #ddd', borderRadius: '5px'}} /> : <h2 style={{margin: '10px 0', color: '#333'}}>{userData.name}</h2>}
            <span style={{background: '#EFF6FF', color: '#1E40AF', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem'}}>{userRole === 'tech' ? 'فني محترف 🛠️' : userRole === 'admin' ? 'Admin 👮‍♂️' : 'عميل مميز 🏠'}</span>
        </div>

        <div style={{marginBottom: '20px'}}><label style={{color: '#888', fontSize: '0.9rem'}}>البريد الإلكتروني</label><div style={{padding: '10px', background: '#f9f9f9', borderRadius: '5px', marginTop: '5px', color: '#555'}}>{userData.email}</div></div>
        
        {userRole !== 'admin' && (
            <div style={{marginBottom: '20px'}}>
                <label style={{color: '#888', fontSize: '0.9rem'}}>رقم الهاتف</label>
                {isEditing ? <input type="text" value={editForm.phone || ''} placeholder="رقم الهاتف" onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px'}} /> : <div style={{padding: '10px', background: '#f9f9f9', borderRadius: '5px', marginTop: '5px', color: '#333'}}>{userData.phone || 'لا يوجد'}</div>}
            </div>
        )}

        <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
            {userRole !== 'admin' && (isEditing ? <><button onClick={handleSave} style={{flex: 1, background: '#10B981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer'}}>حفظ 💾</button><button onClick={() => setIsEditing(false)} style={{flex: 1, background: '#6B7280', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer'}}>إلغاء</button></> : <button onClick={() => setIsEditing(true)} style={{flex: 1, background: '#0056D2', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer'}}>تعديل البيانات ✏️</button>)}
        </div>
      </div>

      {/* 👇👇 قسم المعلومات القانونية الجديد 👇👇 */}
      <div style={{marginTop: '20px', background: 'white', padding: '20px', borderRadius: '15px'}}>
          <h3 style={{margin: '0 0 15px 0', color: '#333'}}>معلومات التطبيق ℹ️</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <button onClick={() => changeTab('about')} style={{textAlign: 'right', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#333'}}>🏢 من نحن</button>
              <button onClick={() => changeTab('privacy')} style={{textAlign: 'right', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#333'}}>🛡️ سياسة الخصوصية</button>
          </div>
      </div>
      {/* 👆👆 ------------------------------ 👆👆 */}

      <div style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
        <h3 style={{color: '#DC2626', fontSize: '1rem'}}>منطقة الخطر ⚠️</h3>
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button onClick={handleLogout} style={{padding: '10px 20px', background: 'white', border: '1px solid #666', color: '#666', borderRadius: '5px', cursor: 'pointer'}}>خروج</button>
            {userRole !== 'admin' && <button onClick={handleDeleteAccount} style={{padding: '10px 20px', background: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '5px', cursor: 'pointer'}}>حذف الحساب</button>}
        </div>
      </div>
    </div>
  );
}

export default Profile;
