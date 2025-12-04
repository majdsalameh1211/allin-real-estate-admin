import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import '../LegalPages.css';

const TermsOfUse = () => {
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
          <h1 className="legal-title">{t('legal.terms.title')}</h1>
          <p className="legal-updated">{t('legal.lastUpdated')}: December 2024</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="legal-content"
        >
          {/* Acceptance */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.acceptance.title')}</h2>
            <p className="section-text">{t('legal.terms.acceptance.text')}</p>
          </section>

          {/* Services */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.services.title')}</h2>
            <p className="section-text">{t('legal.terms.services.text')}</p>
          </section>

          {/* Property Listings */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.listings.title')}</h2>
            <p className="section-text">{t('legal.terms.listings.text')}</p>
          </section>

          {/* User Conduct */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.conduct.title')}</h2>
            <ul className="legal-list">
              <li>{t('legal.terms.conduct.item1')}</li>
              <li>{t('legal.terms.conduct.item2')}</li>
              <li>{t('legal.terms.conduct.item3')}</li>
              <li>{t('legal.terms.conduct.item4')}</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.ip.title')}</h2>
            <p className="section-text">{t('legal.terms.ip.text')}</p>
          </section>

          {/* Limitation of Liability */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.liability.title')}</h2>
            <p className="section-text">{t('legal.terms.liability.text')}</p>
          </section>

          {/* Governing Law */}
          <section className="legal-section">
            <h2 className="section-title">{t('legal.terms.law.title')}</h2>
            <p className="section-text">{t('legal.terms.law.text')}</p>
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

export default TermsOfUse;