import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import '../LegalPages.css';

const CookiePolicy = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';

  return (
    <div className="legal-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="legal-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="legal-header"
        >
          <h1 className="legal-title">{t('legal.cookies.title')}</h1>
          <p className="legal-updated">{t('legal.lastUpdated')}: December 2024</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="legal-content"
        >
          {/* What Are Cookies */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.cookies.what.title')}</h2>
            <p className="section-text">{t('legal.cookies.what.text')}</p>
          </section>

          {/* Types of Cookies */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.cookies.types.title')}</h2>
            
            <h3 className="subsection-title">{t('legal.cookies.types.essential.title')}</h3>
            <p className="section-text">{t('legal.cookies.types.essential.text')}</p>

            <h3 className="subsection-title">{t('legal.cookies.types.analytics.title')}</h3>
            <p className="section-text">{t('legal.cookies.types.analytics.text')}</p>

            <h3 className="subsection-title">{t('legal.cookies.types.marketing.title')}</h3>
            <p className="section-text">{t('legal.cookies.types.marketing.text')}</p>
          </section>

          {/* Third-Party Cookies */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.cookies.thirdparty.title')}</h2>
            <ul className="legal-list">
              <li>{t('legal.cookies.thirdparty.item1')}</li>
              <li>{t('legal.cookies.thirdparty.item2')}</li>
              <li>{t('legal.cookies.thirdparty.item3')}</li>
            </ul>
          </section>

          {/* Managing Cookies */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.cookies.manage.title')}</h2>
            <p className="section-text">{t('legal.cookies.manage.text')}</p>
          </section>

          {/* Contact */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.contact.title')}</h2>
            <p className="section-text">
              {t('legal.contact.text')}
              <br />
              <a href="mailto:info@allinrealestate.net" className="legal-link">
                info@allinrealestate.net
              </a>
              <br />
              {t('legal.contact.phone')}: 04-6666599
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicy;