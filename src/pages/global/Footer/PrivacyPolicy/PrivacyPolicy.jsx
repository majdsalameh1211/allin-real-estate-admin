import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import '../LegalPages.css';

const PrivacyPolicy = () => {
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
          <h1 className="legal-title">{t('legal.privacy.title')}</h1>
          <p className="legal-updated">{t('legal.lastUpdated')}: December 2024</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="legal-content"
        >
          {/* Introduction */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.privacy.intro.title')}</h2>
            <p className="section-text">
              {t('legal.privacy.intro.text')}
            </p>
          </section>

          {/* Information We Collect */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.privacy.collect.title')}</h2>
            <p className="section-text">{t('legal.privacy.collect.intro')}</p>
            <ul className="legal-list">
              <li>{t('legal.privacy.collect.item1')}</li>
              <li>{t('legal.privacy.collect.item2')}</li>
              <li>{t('legal.privacy.collect.item3')}</li>
              <li>{t('legal.privacy.collect.item4')}</li>
              <li>{t('legal.privacy.collect.item5')}</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.privacy.use.title')}</h2>
            <ul className="legal-list">
              <li>{t('legal.privacy.use.item1')}</li>
              <li>{t('legal.privacy.use.item2')}</li>
              <li>{t('legal.privacy.use.item3')}</li>
              <li>{t('legal.privacy.use.item4')}</li>
              <li>{t('legal.privacy.use.item5')}</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.privacy.sharing.title')}</h2>
            <p className="section-text">{t('legal.privacy.sharing.text')}</p>
            <ul className="legal-list">
              <li>{t('legal.privacy.sharing.item1')}</li>
              <li>{t('legal.privacy.sharing.item2')}</li>
              <li>{t('legal.privacy.sharing.item3')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.privacy.security.title')}</h2>
            <p className="section-text">{t('legal.privacy.security.text')}</p>
          </section>

          {/* Your Rights */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.privacy.rights.title')}</h2>
            <ul className="legal-list">
              <li>{t('legal.privacy.rights.item1')}</li>
              <li>{t('legal.privacy.rights.item2')}</li>
              <li>{t('legal.privacy.rights.item3')}</li>
              <li>{t('legal.privacy.rights.item4')}</li>
            </ul>
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

export default PrivacyPolicy;