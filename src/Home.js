/* src/Home.js - الصفحة الرئيسية الجديدة */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, MapPin, Star, Wrench, Zap, Hammer, Wind, PaintBucket, ArrowRight } from 'lucide-react';

function Home({ 
  technicians, 
  selectedTech, 
  setSelectedTech, 
  searchTerm, 
  setSearchTerm, 
  sortOrder, 
  setSortOrder,
  setShowAIModal 
}) {
  
  const containerRef = useRef(null);

  // أنيميشن دخول الصفحة
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const serviceImages = [
    { name: 'سباكة', icon: <Wrench size={24} />, color: '#3B82F6' },
    { name: 'كهرباء', icon: <Zap size={24} />, color: '#F59E0B' },
    { name: 'نجارة', icon: <Hammer size={24} />, color: '#8B5CF6' },
    { name: 'تكييف', icon: <Wind size={24} />, color: '#10B981' },
    { name: 'نقاشة', icon: <PaintBucket size={24} />, color: '#EC4899' }
  ];

  // فلترة الفنيين
  const filteredTechs = technicians
    .filter(tech => 
       tech.name.includes(searchTerm) || 
       tech.specialty.includes(searchTerm)
    )
    .sort((a, b) => {
       if (sortOrder === "low") return (a.price || 0) - (b.price || 0);
       if (sortOrder === "high") return (b.price || 0) - (a.price || 0);
       return 0;
    });

  return (
    <div ref={containerRef} style={{paddingBottom: '100px'}}>
      
      {/* 1. الهيرو سيكشن (الواجهة) */}
      <header className="hero fade-up" style={{
          background: 'linear-gradient(135deg, #0056D2 0%, #002c6b 100%)',
          padding: '40px 20px 60px',
          borderRadius: '0 0 40px 40px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
      }}>
        <div style={{position: 'relative', zIndex: 2}}>
            <h1 style={{margin: '0 0 10px', fontSize: '2rem'}}>صيانة بيتك.. في جيبك 🛠️</h1>
            <p style={{opacity: 0.9, marginBottom: '25px'}}>أفضل الفنيين المحترفين، بضغطة زر واحدة.</p>
            
            <div className="search-box" style={{
                background: 'white', padding: '8px', borderRadius: '50px', 
                display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '500px', margin: '0 auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <Search color="#999" size={20} style={{marginLeft: '10px'}} />
                <input 
                    type="text" 
                    placeholder="بتدور على إيه؟ (سباك، كهربائي...)" 
                    style={{border: 'none', outline: 'none', flex: 1, fontSize: '1rem'}}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={() => setShowAIModal(true)} style={{
                    background: 'linear-gradient(45deg, #7C3AED, #3B82F6)',
                    border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    🤖
                </button>
            </div>
        </div>
        {/* دوائر خلفية للتزيين */}
        <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
        <div style={{position: 'absolute', bottom: '-20px', left: '20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
      </header>

      <div className="container" style={{marginTop: '-30px', position: 'relative', zIndex: 3}}>
        
        {/* 2. الخدمات (أيقونات) */}
        <div className="services-grid fade-up" style={{display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none'}}>
            {serviceImages.map((s) => (
                <div key={s.name} onClick={() => setSearchTerm(s.name)} style={{
                    minWidth: '90px', background: 'white', padding: '15px', borderRadius: '20px',
                    textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{background: `${s.color}20`, width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: s.color}}>
                        {s.icon}
                    </div>
                    <span style={{fontWeight: 'bold', fontSize: '0.9rem', color: '#333'}}>{s.name}</span>
                </div>
            ))}
        </div>

        {/* 3. قسم (كيف يعمل) */}
        <div className="fade-up" style={{margin: '30px 0'}}>
            <h3 className="section-title" style={{fontSize: '1.2rem', marginBottom: '15px'}}>كيف يعمل Fixsy؟</h3>
            <div style={{display: 'flex', gap: '10px', overflowX: 'auto'}}>
                {[
                    {title: 'اختار الخدمة', icon: '🔍', desc: 'حدد العطل أو استخدم الذكاء الاصطناعي'},
                    {title: 'قارن الفنيين', icon: '⭐', desc: 'شوف التقييمات والأسعار والصور'},
                    {title: 'احجز واستريح', icon: '🎉', desc: 'الفني هيجيلك لحد باب البيت'}
                ].map((step, idx) => (
                    <div key={idx} style={{minWidth: '200px', background: '#F8FAFC', padding: '15px', borderRadius: '15px', border: '1px solid #E2E8F0'}}>
                        <div style={{fontSize: '1.5rem', marginBottom: '5px'}}>{step.icon}</div>
                        <h4 style={{margin: '0 0 5px'}}>{step.title}</h4>
                        <p style={{margin: 0, fontSize: '0.8rem', color: '#64748b'}}>{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. قائمة الفنيين (الأهم) */}
        <div className="fade-up">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 className="section-title" style={{margin: 0}}>أفضل الفنيين</h3>
                <select onChange={(e) => setSortOrder(e.target.value)} style={{border: 'none', background: 'white', padding: '5px 10px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '0.8rem'}}>
                    <option value="default">الترتيب الافتراضي</option>
                    <option value="low">الأرخص سعراً</option>
                    <option value="high">الأعلى سعراً</option>
                </select>
            </div>

            <div className="tech-list">
                {filteredTechs.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '40px', width: '100%', gridColumn: '1 / -1'}}>
                        <p style={{color: '#999'}}>لا يوجد فنيين مطابقين للبحث حالياً 😔</p>
                        <button onClick={() => setSearchTerm('')} style={{color: '#0056D2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>عرض الكل</button>
                    </div>
                ) : (
                    filteredTechs.map((tech, index) => (
                        <div key={index} className="tech-card" style={{
                            background: 'white', borderRadius: '20px', padding: '15px', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', gap: '15px', alignItems: 'center',
                            border: '1px solid #f1f5f9', position: 'relative'
                        }}>
                            {tech.isVerified && <span style={{position: 'absolute', top: '10px', left: '10px', fontSize: '0.7rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px'}}>موثق ✅</span>}
                            
                            <img src={tech.img || "https://via.placeholder.com/150"} alt={tech.name} style={{width: '70px', height: '70px', borderRadius: '15px', objectFit: 'cover'}} />
                            
                            <div style={{flex: 1}}>
                                <h3 style={{margin: '0 0 5px', fontSize: '1rem'}}>{tech.name}</h3>
                                <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>{tech.specialty}</p>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', fontSize: '0.8rem'}}>
                                    <span style={{color: '#F59E0B', fontWeight: 'bold'}}>⭐ {tech.rating}</span>
                                    <span style={{color: '#10B981', fontWeight: 'bold'}}>💰 {tech.price ? tech.price + ' ج.م' : '--'}</span>
                                </div>
                            </div>
                            
                            <button onClick={() => setSelectedTech(tech)} style={{
                                background: '#0056D2', color: 'white', border: 'none', 
                                width: '40px', height: '40px', borderRadius: '12px', 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
