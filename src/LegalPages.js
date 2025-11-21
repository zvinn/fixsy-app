/* src/LegalPages.js */
import React from 'react';

function LegalPages({ page, goBack }) {
  
  const content = {
    about: {
      title: "من نحن ℹ️",
      body: (
        <>
          <p><strong>Fixsy</strong> هي المنصة المصرية الأولى الرائدة في مجال الخدمات المنزلية، نهدف إلى تسهيل حياة عملائنا من خلال ربطهم بأمهر الفنيين المحترفين في دقائق.</p>
          <h3>رؤيتنا 👁️</h3>
          <p>أن نكون التطبيق رقم 1 في مصر والشرق الأوسط لخدمات الصيانة، مع ضمان الجودة والأمان لكل بيت.</p>
          <h3>لماذا نحن؟ 🌟</h3>
          <ul>
            <li>فنيين تم التحقق من هويتهم (فيش وتشبيه).</li>
            <li>أسعار شفافة وتنافسية.</li>
            <li>ضمان على الخدمات المقدمة.</li>
            <li>دعم فني 24/7.</li>
          </ul>
        </>
      )
    },
    privacy: {
      title: "سياسة الخصوصية 🛡️",
      body: (
        <>
          <p>في <strong>Fixsy</strong>، نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمع واستخدام بياناتك.</p>
          <h3>1. البيانات التي نجمعها</h3>
          <p>نقوم بجمع الاسم، البريد الإلكتروني، ورقم الهاتف، بالإضافة إلى الموقع الجغرافي (GPS) لتسهيل وصول الفني إليك.</p>
          <h3>2. استخدام الموقع الجغرافي 📍</h3>
          <p>يتم استخدام إحداثيات موقعك فقط أثناء طلب الخدمة لتوجيه الفني لأقرب نقطة لك، ولا يتم مشاركتها مع أطراف خارجية لأغراض دعائية.</p>
          <h3>3. أمان البيانات 🔐</h3>
          <p>جميع بياناتك مشفرة ومحفوظة على خوادم آمنة (Google Firebase).</p>
        </>
      )
    }
  };

  const current = content[page];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0056D2' }}>{current.title}</h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}>الرجوع</button>
      </div>
      
      <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', lineHeight: '1.6', color: '#444'}}>
        {current.body}
      </div>
      
      <div style={{textAlign:'center', marginTop:'30px', color:'#999', fontSize:'0.8rem'}}>
        &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لـ Fixsy Egypt
      </div>
    </div>
  );
}

export default LegalPages;
