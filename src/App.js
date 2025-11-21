/* src/App.js - النسخة النهائية الخالية من الأخطاء (شاملة كل الميزات) */
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { db, auth } from './firebase'; 
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';
import { Home, Store, ClipboardList, Zap, ShieldCheck, User, LogIn, Search, MapPin, Wrench, Camera, MessageCircle, Tag } from 'lucide-react';

import TechDashboard from './TechDashboard';
import UserBookings from './UserBookings';
import AdminPanel from './AdminPanel';
import Profile from './Profile';
import JobMarket from './JobMarket';
import LegalPages from './LegalPages';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // 👇 المتغير الوحيد للتحكم في الصفحات 👇
  const [activeTab, setActiveTab] = useState('home'); 

  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const techsRef = useRef(null);

  const WHATSAPP_NUMBER = "201000000000"; 

  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState(null);
  const [formData, setFormData] = useState({ address: '', problem: '', location: null, scheduledTime: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [newTechData, setNewTechData] = useState({ specialty: 'سباكة', price: '' });
  const [problemFile, setProblemFile] = useState(null);
  
  // الكوبونات
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // AI
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const CLOUD_NAME = "du9zxrsfl";
  const UPLOAD_PRESET = "fixsy_upload";

  const serviceImages = {
    'سباكة': 'https://cdn-icons-png.flaticon.com/512/1518/1518964.png',
    'كهرباء': 'https://cdn-icons-png.flaticon.com/512/2933/2933864.png',
    'نجارة': 'https://cdn-icons-png.flaticon.com/512/2979/2979430.png',
    'تكييف': 'https://cdn-icons-png.flaticon.com/512/3662/3662584.png',
    'نقاشة': 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png'
  };

  // أنيميشن GSAP
  useEffect(() => {
    if (activeTab === 'home') {
        const ctx = gsap.context(() => {
            gsap.from(".hero-anim", { y: -50, opacity: 0, duration: 0.8, ease: "power3.out" });
            gsap.from(".service-card-anim", { y: 30, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.3 });
            gsap.from(".tech-card-anim", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.5 });
        });
        return () => ctx.revert();
    }
  }, [activeTab, technicians]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkUserRole(currentUser.email);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try { await signInWithPopup(auth, provider); toast.success("أهلاً بيك! 👋"); } catch (error) { toast.error("فشل الدخول"); }
  };

  const checkUserRole = async (email) => {
    if(email === "mhamed.saad.ibrahim@gmail.com") { setUserRole('admin'); return; }
    const techQuery = query(collection(db, "technicians"), where("email", "==", email));
    const techSnapshot = await getDocs(techQuery);
    if (!techSnapshot.empty) { setUserRole('tech'); return; }
    const clientQuery = query(collection(db, "clients"), where("email", "==", email));
    const clientSnapshot = await getDocs(clientQuery);
    if (!clientSnapshot.empty) { setUserRole('client'); return; }
    setUserRole('new');
  };

  const registerAsClient = async () => {
    try { await addDoc(collection(db, "clients"), { email: user.email, name: user.displayName, role: 'client' }); setUserRole('client'); toast.success("تم التسجيل!"); } catch (error) { toast.error("خطأ"); }
  };

  const registerAsTech = async (e) => {
    e.preventDefault();
    if(!newTechData.price) return toast.error("حدد السعر");
    try {
        await addDoc(collection(db, "technicians"), {
            email: user.email, name: user.displayName, img: user.photoURL,
            specialty: newTechData.specialty, price: Number(newTechData.price), rating: 5, role: 'tech',
            earnings: 0, debt: 0, unpaidOrdersCount: 0, isFirstOrderDone: false, isVerified: false
        });
        setUserRole('tech'); toast.success("تم التسجيل!");
    } catch (error) { toast.error("خطأ"); }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null); setUserRole(null); 
    setActiveTab('home'); // 👇 رجوع للرئيسية
    toast("تم الخروج");
  };

  useEffect(() => {
    const getTechnicians = async () => {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      setTechnicians(querySnapshot.docs.map(doc => doc.data()));
    };
    getTechnicians();
  }, []);

  const getCurrentLocation = () => {
    const loadingToast = toast.loading("تحديد الموقع...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({...prev, address: `تم تحديد الموقع GPS ✅`, location: { lat: latitude, lng: longitude }}));
        toast.dismiss(loadingToast); toast.success("تم!");
      }, () => { toast.dismiss(loadingToast); toast.error("فشل"); });
    } else { toast.error("لا يوجد GPS"); }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      return data.secure_url;
    } catch (error) { console.error(error); return null; }
  };

  const applyCoupon = async () => {
    if (!couponCode) return toast.error("اكتب كود الخصم");
    const loadingToast = toast.loading("جاري التحقق...");
    try {
        const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()));
        const snapshot = await getDocs(q);
        toast.dismiss(loadingToast);
        if (snapshot.empty) { setDiscount(0); return toast.error("كود غير صحيح ❌"); }
        const couponData = snapshot.docs[0].data();
        if (!couponData.isActive) return toast.error("الكوبون غير مفعل");
        setDiscount(couponData.discount);
        toast.success(`تم خصم ${couponData.discount} ج.م 🎉`);
    } catch (error) { toast.dismiss(loadingToast); toast.error("خطأ"); }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if(!user) return toast.error("سجل دخولك الأول!");
    
    const appointmentTime = formData.scheduledTime || new Date().toISOString();
    const finalPrice = Math.max(0, (selectedTech.price || 0) - discount);

    const loadingToast = toast.loading("جاري الحجز...");
    try {
      let imageUrl = null;
      if (problemFile) imageUrl = await uploadImage(problemFile);

      await addDoc(collection(db, "requests"), {
        technician_name: selectedTech.name, technician_email: selectedTech.email,
        client_name: user.displayName, client_email: user.email,
        client_address: formData.address, location: formData.location || null,
        problem_desc: formData.problem, problem_image: imageUrl,
        original_price: selectedTech.price, discount: discount, price: finalPrice, coupon_used: discount > 0 ? couponCode : null,
        status: "pending", scheduledDate: appointmentTime, date: new Date().toISOString()
      });
      toast.dismiss(loadingToast); toast.success("تم الحجز بنجاح! 🎉");
      setSelectedTech(null); setFormData({ address: '', problem: '', location: null, scheduledTime: '' }); setProblemFile(null); setCouponCode(""); setDiscount(0);
      setActiveTab('my_requests');
    } catch (error) { toast.dismiss(loadingToast); toast.error("خطأ"); }
  };

  const analyzeProblem = () => {
    if (!aiQuery) return toast.error("اكتب وصف المشكلة");
    const text = aiQuery.toLowerCase();
    let suggestion = null;
    if (text.match(/ميه|مية|حنفية|حوض|تسريب|بلاعة|سباكة|مواسير/)) suggestion = { type: 'سباكة', icon: '🚿', advice: 'مشكلة سباكة. اقفل المحبس الرئيسي.' };
    else if (text.match(/نور|لمبة|فيشة|سلك|كهرباء|قفلة|مفتاح/)) suggestion = { type: 'كهرباء', icon: '💡', advice: 'افصل الكهرباء فوراً.' };
    else if (text.match(/خشب|باب|شباك|سرير|دولاب|نجار|كسر/)) suggestion = { type: 'نجارة', icon: '🪑', advice: 'احتفظ بالأجزاء المكسورة.' };
    else if (text.match(/تكييف|سخن|بارد|فريون|تنقيط|صوت/)) suggestion = { type: 'تكييف', icon: '❄️', advice: 'افصل التكييف ونظف الفلاتر.' };
    else if (text.match(/دهان|لون|حيطة|نقاش|تقشير/)) suggestion = { type: 'نقاشة', icon: '🎨', advice: 'تأكد من جفاف الحائط.' };
    if (suggestion) setAiResult(suggestion);
    else setAiResult({ type: 'عام', icon: '🔧', advice: 'لم نستطع التحديد بدقة.' });
  };

  const applyAISuggestion = () => {
      if (aiResult && aiResult.type !== 'عام') {
          setSearchTerm(aiResult.type); 
          toast.success(`تم التصفية: ${aiResult.type}`);
          setShowAIModal(false); setAiQuery(""); setAiResult(null);
      } else { toast("حاول البحث يدوياً"); setShowAIModal(false); }
  };

  const renderContent = () => {
    if (user && userRole === 'new') return (
        <div className="modal-overlay" style={{display: 'flex', background: '#0056D2'}}>
             <div className="modal-content" style={{maxWidth: '500px', textAlign: 'center'}}>
                <h3>أكمل تسجيلك</h3>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                    <button onClick={registerAsClient} style={{padding:'10px 20px'}}>أنا عميل</button>
                    <div style={{border:'1px solid #ddd', padding:'10px'}}>
                        <form onSubmit={registerAsTech}>
                            <input type="number" placeholder="سعر الكشف" onChange={e=>setNewTechData({...newTechData, price: e.target.value})} style={{width:'100px'}}/>
                            <button type="submit">تسجيل</button>
                        </form>
                    </div>
                </div>
             </div>
        </div>
    );

    switch (activeTab) {
        case 'market': return <JobMarket user={user} userRole={userRole} goBack={() => setActiveTab('home')} />;
        case 'my_requests': return <UserBookings user={user} goBack={() => setActiveTab('home')} />;
        case 'profile': return <Profile user={user} userRole={userRole} goBack={() => setActiveTab('home')} changeTab={setActiveTab} />;
        case 'tech_panel': return <TechDashboard user={user} goBack={() => setActiveTab('home')} />;
        case 'admin': return <AdminPanel goBack={() => setActiveTab('home')} />;
        case 'about': return <LegalPages page="about" goBack={() => setActiveTab('profile')} />;
        case 'privacy': return <LegalPages page="privacy" goBack={() => setActiveTab('profile')} />;
        default: return (
            <>
              <header className="hero hero-anim" ref={heroRef}>
                <h1>صيانة بيتك.. أسهل وأسرع</h1>
                <div className="search-box" style={{display: 'flex', justifyContent: 'center', gap: '10px', alignItems:'center'}}>
                  <Search size={20} color="#0056D2" style={{marginLeft:'10px'}} />
                  <input type="text" placeholder="بتدور على صنايعي إيه؟" className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                  <button onClick={() => setShowAIModal(true)} style={{background:'white', border:'none', borderRadius:'50%', width:'40px', height:'40px', cursor:'pointer', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center'}} title="AI Fix">
                    <span style={{fontSize:'1.2rem'}}>🤖</span>
                  </button>
                </div>
              </header>
              <div className="container">
                <h3 className="section-title"><Wrench size={20} /> الخدمات المتاحة</h3>
                <div className="services-grid" ref={servicesRef}>
                  {Object.keys(serviceImages).map((service) => (
                    <div className="service-card service-card-anim" key={service} onClick={() => setSearchTerm(service === 'سباكة' ? 'سباكة' : service)}>
                      <img src={serviceImages[service]} alt={service} style={{width: '40px', marginBottom:'5px'}}/>
                      <h4>{service}</h4>
                    </div>
                  ))}
                </div>
                <h3 className="section-title"><User size={20} /> أفضل الفنيين</h3>
                <div className="tech-list" ref={techsRef}>
                  {technicians.filter(tech => tech.specialty.includes(searchTerm) || tech.name.includes(searchTerm))
                    .sort((a, b) => sortOrder === "low" ? (a.price - b.price) : sortOrder === "high" ? (b.price - a.price) : 0)
                    .map((tech, index) => (
                    <div className="tech-card tech-card-anim" key={index}>
                      <img src={tech.img || "https://via.placeholder.com/150"} alt={tech.name} style={{width: '70px', height:'70px', borderRadius: '15px', marginLeft: '15px'}}/>
                      <div className="tech-info">
                          <h3>{tech.name}</h3>
                          <p style={{color:'#64748b'}}>{tech.specialty}</p>
                          <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                             <span style={{color:'#F59E0B'}}>⭐ {tech.rating}</span>
                             <span style={{color:'#10B981', fontWeight:'bold'}}>• {tech.price} ج.م</span>
                          </div>
                      </div>
                      <button className="book-btn" onClick={() => {setSelectedTech(tech); setDiscount(0); setCouponCode("");}}>حجز</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
        );
    }
  };

  return (
    <div className="App">
      <Toaster position="top-center" />
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{position: 'fixed', bottom: '90px', right: '20px', backgroundColor: '#25D366', color: 'white', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)', zIndex: 10000, textDecoration: 'none', transition:'transform 0.3s'}}><MessageCircle size={28} /></a>
      
      {showAIModal && (<div className="modal-overlay"><div className="modal-content" style={{textAlign:'center', maxWidth:'400px'}}><button className="close-btn" onClick={() => {setShowAIModal(false); setAiResult(null);}}>✕</button><h2 style={{color:'#0056D2'}}>🤖 مساعد Fixsy</h2>{!aiResult ? (<><textarea placeholder="اوصف المشكلة..." className="form-input" rows="3" value={aiQuery} onChange={e=>setAiQuery(e.target.value)}></textarea><button onClick={analyzeProblem} className="submit-btn" style={{background:'#7C3AED'}}>تحليل العطل ✨</button></>) : (<div style={{background:'#F3F4F6', padding:'20px', borderRadius:'15px', marginTop:'10px'}}><div style={{fontSize:'3rem'}}>{aiResult.icon}</div><h3 style={{margin:'10px 0'}}>{aiResult.type}</h3><p style={{color:'#666'}}>{aiResult.advice}</p><button onClick={applyAISuggestion} className="submit-btn" style={{background:'#10B981'}}>عرض فنيين {aiResult.type}</button></div>)}</div></div>)}
      
      {selectedTech && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedTech(null)}>✕</button>
            <h3>حجز مع {selectedTech.name}</h3>
            {!user ? <button onClick={handleGoogleLogin} className="submit-btn" style={{background:'#4285F4'}}>دخول بجوجل</button> : 
             (userRole === 'client' || userRole === 'admin') ? (
                <form onSubmit={handleBookingSubmit}>
                    <div style={{marginBottom:'15px', padding:'15px', background:'#F8FAFC', borderRadius:'15px', border:'1px solid #e2e8f0'}}>
                        <div style={{display:'flex', justifyContent:'space-between', color:'#64748b'}}><span>السعر الأساسي:</span><span style={{textDecoration: discount > 0 ? 'line-through' : 'none'}}>{selectedTech.price || 0} ج.م</span></div>
                        {discount > 0 && <div style={{display:'flex', justifyContent:'space-between', color:'#EF4444', marginTop:'5px'}}><span>خصم الكوبون:</span><span>-{discount} ج.م</span></div>}
                        <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.1rem', marginTop:'10px', borderTop:'1px solid #e2e8f0', paddingTop:'10px'}}><span>الإجمالي:</span><span style={{color:'#10B981'}}>{Math.max(0, (selectedTech.price || 0) - discount)} ج.م</span></div>
                    </div>

                    <button type="button" onClick={getCurrentLocation} style={{background:'#3B82F6', color:'white', border:'none', padding:'10px', borderRadius:'10px', width:'100%', marginBottom:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}><MapPin size={16} /> استخدم موقعي الحالي</button>
                    <input type="text" placeholder="أو اكتب العنوان" className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    <textarea placeholder="وصف المشكلة..." className="form-input" rows="3" value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} ></textarea>
                    
                    <div style={{margin:'10px 0'}}><label style={{display:'block', color:'#666', marginBottom:'5px', fontSize:'0.9rem'}}>📅 موعد الزيارة</label><input type="datetime-local" className="form-input" value={formData.scheduledTime} onChange={e => setFormData({...formData, scheduledTime: e.target.value})} style={{marginTop:0}} /></div>
                    
                    <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                        <div style={{position:'relative', flex:1}}>
                            <Tag size={18} style={{position:'absolute', top:'14px', left:'10px', color:'#94a3b8'}} />
                            <input type="text" placeholder="كود الخصم" className="form-input" style={{margin:0, paddingLeft:'35px'}} value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                        </div>
                        <button type="button" onClick={applyCoupon} style={{background:'#F59E0B', color:'white', border:'none', padding:'0 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold'}}>تطبيق</button>
                    </div>
                    
                    <div style={{marginTop:'10px', border:'2px dashed #ccc', padding:'10px', borderRadius:'10px', textAlign:'center', cursor:'pointer', background:'#f9f9f9'}}><label style={{cursor:'pointer', display:'block'}}><Camera size={24} color="#666"/> <br/><span style={{fontSize:'0.9rem', color:'#666'}}>صورة (اختياري)</span><input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => setProblemFile(e.target.files[0])} /></label>{problemFile && <p style={{color:'green', fontSize:'0.8rem', margin:'5px 0'}}>تم: {problemFile.name}</p>}</div>
                    <button type="submit" className="submit-btn">تأكيد الحجز</button>
                </form>
             ) : <p style={{color:'red'}}>حساب الفني للاستقبال فقط</p>}
          </div>
        </div>
      )}

      <nav className="header" style={{justifyContent:'center'}}><h2>Fixsy 🛠️</h2></nav>
      <div style={{paddingBottom: '80px'}}>{renderContent()}</div>
      
      {/* 👇👇 الشريط السفلي السليم (بيستخدم activeTab بس) 👇👇 */}
      <div className="bottom-nav-container" style={{position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 99999, borderTopLeftRadius: '20px', borderTopRightRadius: '20px'}}>
        <button onClick={() => setActiveTab('home')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? '#0056D2' : '#94a3b8', cursor: 'pointer'}}>
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span style={{fontSize: '0.65rem', marginTop:'2px', fontWeight: activeTab === 'home' ? 'bold' : 'normal'}}>الرئيسية</span>
        </button>
        
        <button onClick={() => setActiveTab('market')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'market' ? '#0056D2' : '#94a3b8', cursor: 'pointer'}}>
            <Store size={24} strokeWidth={activeTab === 'market' ? 2.5 : 2} />
            <span style={{fontSize: '0.65rem', marginTop:'2px', fontWeight: activeTab === 'market' ? 'bold' : 'normal'}}>السوق</span>
        </button>
        
        {(userRole === 'client' || userRole === 'admin') && (
            <button onClick={() => setActiveTab('my_requests')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'my_requests' ? '#0056D2' : '#94a3b8', cursor: 'pointer'}}>
                <ClipboardList size={24} strokeWidth={activeTab === 'my_requests' ? 2.5 : 2} />
                <span style={{fontSize: '0.65rem', marginTop:'2px', fontWeight: activeTab === 'my_requests' ? 'bold' : 'normal'}}>طلباتي</span>
            </button>
        )}

        {(userRole === 'tech' || userRole === 'admin') && (
            <button onClick={() => setActiveTab('tech_panel')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'tech_panel' ? '#0056D2' : '#94a3b8', cursor: 'pointer'}}>
                <Zap size={24} strokeWidth={activeTab === 'tech_panel' ? 2.5 : 2} />
                <span style={{fontSize: '0.65rem', marginTop:'2px', fontWeight: activeTab === 'tech_panel' ? 'bold' : 'normal'}}>مهامي</span>
            </button>
        )}

        {userRole === 'admin' && (
            <button onClick={() => setActiveTab('admin')} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'admin' ? '#DC2626' : '#94a3b8', cursor: 'pointer'}}>
                <ShieldCheck size={24} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
                <span style={{fontSize: '0.65rem', marginTop:'2px', fontWeight: activeTab === 'admin' ? 'bold' : 'normal'}}>الإدارة</span>
            </button>
        )}

        <button onClick={() => user ? setActiveTab('profile') : handleGoogleLogin()} style={{background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'profile' ? '#0056D2' : '#94a3b8', cursor: 'pointer'}}>
            {user ? <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} /> : <LogIn size={24} />}
            <span style={{fontSize: '0.65rem', marginTop:'2px', fontWeight: activeTab === 'profile' ? 'bold' : 'normal'}}>{user ? 'حسابي' : 'دخول'}</span>
        </button>
      </div>
    </div>
  );
}

export default App;
