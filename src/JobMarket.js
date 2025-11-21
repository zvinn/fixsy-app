/* src/JobMarket.js */
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

function JobMarket({ user, userRole, goBack }) {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', desc: '' });
  const [offerPrice, setOfferPrice] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);

  // 1. جلب الوظائف المفتوحة
  useEffect(() => {
    const q = userRole === 'client' 
        ? query(collection(db, "market_jobs"), where("client_email", "==", user.email), where("status", "==", "open"))
        : query(collection(db, "market_jobs"), where("status", "==", "open"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setJobs(data);
    });
    return () => unsubscribe();
  }, [user, userRole]);

  // 2. نشر وظيفة (للعميل)
  const postJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.desc) return toast.error("اكتب التفاصيل");
    try {
      await addDoc(collection(db, "market_jobs"), {
        title: newJob.title,
        desc: newJob.desc,
        client_name: user.displayName,
        client_email: user.email,
        status: "open",
        date: new Date().toISOString(),
        offers: []
      });
      toast.success("تم النشر في السوق! 📢");
      setNewJob({ title: '', desc: '' });
    } catch (error) { toast.error("خطأ"); }
  };

  // 3. تقديم عرض (للفني)
  const submitOffer = async (job) => {
    if (!offerPrice) return toast.error("حط سعرك");
    try {
      const jobRef = doc(db, "market_jobs", job.id);
      const newOffer = {
        tech_name: user.displayName,
        tech_email: user.email,
        price: Number(offerPrice),
        date: new Date().toISOString()
      };
      const updatedOffers = [...(job.offers || []), newOffer];
      await updateDoc(jobRef, { offers: updatedOffers });
      
      toast.success("تم تقديم العرض! 💸");
      setSelectedJobId(null); setOfferPrice('');
    } catch (error) { toast.error("فشل"); }
  };

  // 4. قبول عرض (للعميل)
  const acceptOffer = async (job, offer) => {
    try {
      await addDoc(collection(db, "requests"), {
        technician_name: offer.tech_name,
        technician_email: offer.tech_email,
        client_name: user.displayName,
        client_email: user.email,
        client_address: "تم الاتفاق في المناقصة",
        location: null,
        problem_desc: `[مناقصة] ${job.title}: ${job.desc}`,
        price: offer.price,
        status: "accepted",
        date: new Date().toISOString()
      });
      await updateDoc(doc(db, "market_jobs", job.id), { status: "closed" });
      toast.success(`تم الاتفاق مع ${offer.tech_name} ✅`);
    } catch (error) { toast.error("خطأ"); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0056D2' }}>📢 سوق الطلبات</h2>
      </div>

      {userRole === 'client' && (
        <div style={{background: '#f0f9ff', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #bae6fd'}}>
            <h3 style={{marginTop:0, color:'#0284c7'}}>➕ اطلب عرض سعر</h3>
            <form onSubmit={postJob} style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <input placeholder="عنوان (مثلاً: تشطيب حمام)" value={newJob.title} onChange={e=>setNewJob({...newJob, title:e.target.value})} style={{flex:1, padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
                <input placeholder="تفاصيل..." value={newJob.desc} onChange={e=>setNewJob({...newJob, desc:e.target.value})} style={{flex:2, padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
                <button type="submit" style={{background:'#0284c7', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer'}}>نشر</button>
            </form>
        </div>
      )}

      {jobs.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>لا توجد مناقصات مفتوحة 💤</p> : 
       jobs.map(job => (
          <div key={job.id} className="market-card">
              <div className="market-badge">مفتوح</div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop: '25px'}}>
                  <h3 style={{margin:0}}>{job.title}</h3>
                  <span style={{fontSize:'0.8rem', background:'#eee', padding:'2px 8px', borderRadius:'10px'}}>بواسطة: {job.client_name}</span>
              </div>
              <p style={{color:'#666'}}>{job.desc}</p>
              
              <div style={{marginTop:'15px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                  <strong>العروض ({job.offers ? job.offers.length : 0}):</strong>
                  
                  {userRole === 'client' && job.offers && job.offers.map((offer, idx) => (
                      <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f9f9f9', padding:'10px', marginTop:'5px', borderRadius:'5px'}}>
                          <span>👤 {offer.tech_name}: <b style={{color:'green'}}>{offer.price} ج.م</b></span>
                          <button onClick={() => acceptOffer(job, offer)} style={{background:'#10B981', color:'white', border:'none', padding:'5px 15px', borderRadius:'5px', cursor:'pointer'}}>قبول ✅</button>
                      </div>
                  ))}

                  {userRole === 'tech' && (
                      <div style={{marginTop:'10px'}}>
                          {selectedJobId === job.id ? (
                              <div style={{display:'flex', gap:'10px'}}>
                                  <input type="number" placeholder="سعر العرض" value={offerPrice} onChange={e=>setOfferPrice(e.target.value)} style={{padding:'5px', borderRadius:'5px', border:'1px solid #ccc'}} />
                                  <button onClick={() => submitOffer(job)} style={{background:'#10B981', color:'white', border:'none', padding:'5px', borderRadius:'5px', cursor:'pointer'}}>إرسال</button>
                                  <button onClick={() => setSelectedJobId(null)} style={{background:'#ccc', border:'none', padding:'5px', borderRadius:'5px', cursor:'pointer'}}>إلغاء</button>
                              </div>
                          ) : (
                              <button onClick={() => setSelectedJobId(job.id)} style={{background:'#0056D2', color:'white', border:'none', padding:'8px 20px', borderRadius:'5px', cursor:'pointer'}}>💸 تقديم عرض</button>
                          )}
                      </div>
                  )}
              </div>
          </div>
       ))
      }
    </div>
  );
}

export default JobMarket;
