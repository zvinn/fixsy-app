/* src/AdminPanel.js - لوحة التحكم الشاملة (تبويبات) */
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';

function AdminPanel({ goBack }) {
  const [activeTab, setActiveTab] = useState('verification'); // verification | finance | admins
  const [pendingTechs, setPendingTechs] = useState([]);
  const [debtors, setDebtors] = useState([]); 
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // 1. جلب البيانات حسب التبويب
  useEffect(() => {
    if (activeTab === 'verification') fetchPendingTechs();
    if (activeTab === 'finance') fetchDebtors();
    if (activeTab === 'admins') fetchAdmins();
  }, [activeTab]);

  const fetchPendingTechs = async () => {
    const q = query(collection(db, "technicians"), where("isVerified", "==", "pending"));
    const snap = await getDocs(q);
    setPendingTechs(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const fetchDebtors = async () => {
    // هات الفنيين اللي عليهم فلوس أكتر من 0
    const q = query(collection(db, "technicians"), where("debt", ">", 0), orderBy("debt", "desc"));
    const snap = await getDocs(q);
    setDebtors(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const fetchAdmins = async () => {
    const snap = await getDocs(collection(db, "admins"));
    setAdmins(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  // --- عمليات التوثيق ---
  const verifyTech = async (id, status) => {
    const techRef = doc(db, "technicians", id);
    await updateDoc(techRef, { isVerified: status === 'approve' ? true : false });
    alert(status === 'approve' ? "تم التوثيق ✅" : "تم الرفض ❌");
    fetchPendingTechs();
  };

  // --- عمليات المالية (تصفير المديونية) 💰 ---
  const settleDebt = async (tech) => {
    if(!window.confirm(`هل استلمت مبلغ ${tech.debt} ج.م من الفني ${tech.name}؟`)) return;
    
    await updateDoc(doc(db, "technicians", tech.id), { 
        debt: 0, 
        unpaidOrdersCount: 0 // تصفير العداد كمان عشان يفك الحظر
    });
    alert("تم تصفير الحساب وفك الحظر بنجاح! 💵");
    fetchDebtors();
  };

  // --- عمليات الأدمن ---
  const addNewAdmin = async (e) => {
    e.preventDefault();
    if(!newAdminEmail) return;
    await addDoc(collection(db, "admins"), { email: newAdminEmail });
    setNewAdminEmail('');
    alert("تم إضافة أدمن جديد");
    fetchAdmins();
  };

  const tabStyle = (isActive) => ({
    background: isActive ? '#DC2626' : '#eee',
    color: isActive ? 'white' : '#333',
    border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', flex: 1
  });

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{ color: '#DC2626' }}>👮‍♂️ لوحة الإدارة المركزية</h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer' }}>خروج</button>
      </div>

      {/* التبويبات */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
        <button onClick={() => setActiveTab('verification')} style={tabStyle(activeTab === 'verification')}>📝 التوثيق</button>
        <button onClick={() => setActiveTab('finance')} style={tabStyle(activeTab === 'finance')}>💰 المالية</button>
        <button onClick={() => setActiveTab('admins')} style={tabStyle(activeTab === 'admins')}>👥 الإدارة</button>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'verification' && (
          <div>
             <h3 style={{color: '#555'}}>طلبات التوثيق المعلقة ({pendingTechs.length})</h3>
             {pendingTechs.length === 0 ? <p style={{color:'#888', textAlign:'center'}}>لا يوجد طلبات جديدة ✅</p> : 
             pendingTechs.map(tech => (
                 <div key={tech.id} style={{background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                    <div style={{flex: '0 0 150px'}}>
                        {tech.idCardImage ? (
                            <a href={tech.idCardImage} target="_blank" rel="noreferrer">
                                <img src={tech.idCardImage} alt="ID" style={{width: '100%', borderRadius: '5px', border: '1px solid #ddd'}} />
                                <div style={{textAlign:'center', fontSize:'0.8rem', color:'blue'}}>تكبير الصورة 🔍</div>
                            </a>
                        ) : <div style={{height:'100px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>لا توجد صورة</div>}
                    </div>
                    <div style={{flex: 1}}>
                        <h4>{tech.name} <span style={{fontSize:'0.8rem', color:'#888'}}>({tech.specialty})</span></h4>
                        <p><strong>الرقم القومي:</strong> {tech.nationalId}</p>
                        <div style={{marginTop:'10px'}}>
                            <button onClick={() => verifyTech(tech.id, 'approve')} style={{marginRight:'10px', background:'#10B981', color:'white', border:'none', padding:'8px 20px', borderRadius:'5px', cursor:'pointer'}}>✅ قبول وتوثيق</button>
                            <button onClick={() => verifyTech(tech.id, 'reject')} style={{background:'#EF4444', color:'white', border:'none', padding:'8px 20px', borderRadius:'5px', cursor:'pointer'}}>❌ رفض</button>
                        </div>
                    </div>
                 </div>
             ))}
          </div>
      )}

      {activeTab === 'finance' && (
          <div>
              <h3 style={{color: '#555'}}>المطلوب تحصيله: <span style={{color:'#DC2626'}}>{debtors.reduce((acc, curr) => acc + curr.debt, 0)} ج.م</span></h3>
              {debtors.length === 0 ? <p style={{color:'#888', textAlign:'center'}}>لا توجد مديونيات.</p> : debtors.map(tech => (
                 <div key={tech.id} style={{background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: tech.debt >= 200 ? '5px solid red' : '5px solid #ddd'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h4>{tech.name}</h4>
                        <span style={{color: '#DC2626', fontWeight:'bold', fontSize:'1.2rem'}}>{tech.debt} ج.م</span>
                    </div>
                    <p>عدد الطلبات غير المدفوعة: {tech.unpaidOrdersCount}</p>
                    <button onClick={() => settleDebt(tech)} style={{width:'100%', background:'#0056D2', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer', marginTop:'10px'}}>
                        💵 استلام المبلغ وتصفير الحساب
                    </button>
                 </div>
             ))}
          </div>
      )}

      {activeTab === 'admins' && (
          <div>
              <h3 style={{color: '#555'}}>فريق الإدارة</h3>
              <form onSubmit={addNewAdmin} style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
                  <input type="email" placeholder="إيميل الأدمن الجديد" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} required />
                  <button type="submit" style={{background:'#333', color:'white', border:'none', padding:'0 20px', borderRadius:'5px', cursor:'pointer'}}>إضافة</button>
              </form>
              {admins.map(admin => (
                  <div key={admin.id} style={{padding:'15px', background:'white', marginBottom:'5px', borderRadius:'5px', border:'1px solid #eee', display:'flex', alignItems:'center', gap:'10px'}}>
                      <span>👤</span> {admin.email}
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}

export default AdminPanel;
