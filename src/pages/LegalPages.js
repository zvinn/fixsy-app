import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function LegalPages({ page, goBack }) {
  const { t, language } = useLanguage();

  const content = {
    about: {
      title: t("aboutTitle"),
      body: (
        <>
          <p>{t("aboutBody")}</p>
          <h3>{t("ourVision")}</h3>
          <p>{t("visionText")}</p>
          <h3>{t("whyUs")}</h3>
          <ul>
            <li>{t("whyUs1")}</li>
            <li>{t("whyUs2")}</li>
            <li>{t("whyUs3")}</li>
            <li>{t("whyUs4")}</li>
          </ul>
        </>
      )
    },
    privacy: {
      title: t("privacyTitle"),
      body: (
        <>
          <p>{t("privacyIntro")}</p>
          <h3>{t("privacySec1")}</h3>
          <p>{t("privacyText1")}</p>
          <h3>{t("privacySec2")}</h3>
          <p>{t("privacyText2")}</p>
          <h3>{t("privacySec3")}</h3>
          <p>{t("privacyText3")}</p>
        </>
      )
    }
  };

  const current = content[page];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0056D2' }}>{current.title}</h2>
        <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}>{t("back")}</button>
      </div>

      <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', lineHeight: '1.6', color: '#444' }}>
        {current.body}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', color: '#999', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} {t("rightsReserved")}
      </div>
    </div>
  );
}

export default LegalPages;
