import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'EN', dir: 'ltr' },
    { code: 'he', label: 'עב', dir: 'rtl' },
    { code: 'ar', label: 'AR', dir: 'rtl' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode, direction) => {
    i18n.changeLanguage(langCode);
    document.documentElement.setAttribute('lang', langCode);
    document.documentElement.setAttribute('dir', direction);
    localStorage.setItem('language', langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-luxury-gold/30 
                   hover:border-luxury-gold hover:bg-luxury-gold/10 transition-all duration-300"
      >
        <span className="font-accent text-luxury-gold">{currentLanguage.label}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-4 h-4 text-luxury-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 bg-luxury-charcoal border border-luxury-gold/30 
                       rounded-lg overflow-hidden shadow-2xl min-w-[100px] z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code, lang.dir)}
                className={`w-full px-6 py-3 text-left font-accent transition-all duration-200
                  ${i18n.language === lang.code 
                    ? 'bg-luxury-gold text-luxury-black' 
                    : 'text-luxury-gold hover:bg-luxury-gold/10'}`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;