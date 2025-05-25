import i18n from 'i18next';
    import { initReactI18next } from 'react-i18next';
    import LanguageDetector from 'i18next-browser-languagedetector';

    import arCommon from '@/locales/ar/common.json';
    import arMining from '@/locales/ar/mining.json';
    import arGames from '@/locales/ar/games.json';
    import arMembership from '@/locales/ar/membership.json';
    import arLayout from '@/locales/ar/layout.json';
    import arTasks from '@/locales/ar/tasks.json';
    import arReferral from '@/locales/ar/referral.json';
    import arWallet from '@/locales/ar/wallet.json';
    import arAdmin from '@/locales/ar/admin.json';
    import arModals from '@/locales/ar/modals.json';

    import enCommon from '@/locales/en/common.json';
    import enMining from '@/locales/en/mining.json';
    import enGames from '@/locales/en/games.json';
    import enMembership from '@/locales/en/membership.json';
    import enLayout from '@/locales/en/layout.json';
    import enTasks from '@/locales/en/tasks.json';
    import enReferral from '@/locales/en/referral.json';
    import enWallet from '@/locales/en/wallet.json';
    import enAdmin from '@/locales/en/admin.json';
    import enModals from '@/locales/en/modals.json';

    const namespaces = ['common', 'mining', 'games', 'membership', 'layout', 'tasks', 'referral', 'wallet', 'admin', 'modals'];

    const resources = {
      ar: {
        common: arCommon, 
        mining: arMining, 
        games: arGames, 
        membership: arMembership, 
        layout: arLayout, 
        tasks: arTasks, 
        referral: arReferral, 
        wallet: arWallet, 
        admin: arAdmin, 
        modals: arModals
      },
      en: {
        common: enCommon, 
        mining: enMining, 
        games: enGames, 
        membership: enMembership, 
        layout: enLayout, 
        tasks: enTasks, 
        referral: enReferral, 
        wallet: enWallet, 
        admin: enAdmin, 
        modals: enModals
      }
    };
    
    const detectionOptions = {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng', 
      checkWhitelist: true, 
    };

    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        supportedLngs: ['en', 'ar'],
        fallbackLng: 'en', 
        defaultNS: 'common', 
        ns: namespaces, 
        interpolation: {
          escapeValue: false 
        },
        detection: detectionOptions,
        debug: import.meta.env.DEV,
        react: {
            useSuspense: true,
        },
        load: 'languageOnly' 
      });

    const setHtmlLangDirAttributes = (lng) => {
      const htmlElement = document.documentElement;
      if (htmlElement) {
        htmlElement.lang = lng;
        htmlElement.dir = i18n.dir(lng);
      }
    };
    
    if (i18n.isInitialized) {
      setHtmlLangDirAttributes(i18n.language);
    } else {
      i18n.on('initialized', () => {
        setHtmlLangDirAttributes(i18n.language);
      });
    }
    
    i18n.on('languageChanged', (lng) => {
      setHtmlLangDirAttributes(lng);
    });

    export default i18n;