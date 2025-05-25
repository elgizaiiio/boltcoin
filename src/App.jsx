import React, { Suspense, useState, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Layout from '@/components/layout/Layout';
    import MiningPage from '@/pages/MiningPage';
    import ReferralPage from '@/pages/ReferralPage';
    import WalletConnectPage from '@/pages/WalletConnectPage';
    import TasksPage from '@/pages/TasksPage';
    import GamesPage from '@/pages/GamesPage';
    import AcceptReferralPage from '@/pages/AcceptReferralPage';
    import MembershipPage from '@/pages/MembershipPage';
    import AdminPage from '@/pages/AdminPage';
    import { Toaster } from '@/components/ui/toaster';
    import { I18nextProvider, useTranslation } from 'react-i18next';
    import i18nInstance from '@/i18n'; 
    import { Loader2 } from 'lucide-react';
    import WelcomeModal from '@/components/WelcomeModal';
    import UserProfileSetupModal from '@/components/UserProfileSetupModal';
    import { useUserData } from '@/hooks/useUserData';
    import { TonConnectUIProvider } from '@tonconnect/ui-react';

    const SITE_LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/e6b43cfc-9628-4583-8f76-dfd0720ad94d/1f9520601bfa94932cd0d24590e3f529.png";
    const TONCONNECT_MANIFEST_URL = `${window.location.origin}/tonconnect-manifest.json`;
    const TWA_RETURN_URL_BASE = 'https://t.me/BoltCoinDev_Bot/BoltCoinDevApp';


    const SplashScreen = () => (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center z-[100]">
        <img  src={SITE_LOGO_URL} alt="BoltCoin Logo" class="h-20 w-20 sm:h-24 sm:w-24 animate-pulse mb-4 sm:mb-6" src="https://images.unsplash.com/photo-1658222645815-63222983068e" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">BoltCoin</h1>
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 animate-spin" />
      </div>
    );

    function AppContent() {
      const { i18n } = useTranslation(); 
      const [loading, setLoading] = useState(true);
      const [showWelcomeModal, setShowWelcomeModal] = useState(false);
      const [showProfileSetupModalGlobal, setShowProfileSetupModalGlobal] = useState(false);
      
      const {
        userProfile,
        boltBalance,
        userMembership,
        fetchOrCreateUser,
        updateUserMembership,
        updateBoltBalance,
        handleProfileSetupComplete,
        initializeUser,
      } = useUserData();

      useEffect(() => {
        let isMounted = true;
        
        const initLogic = async () => {
          if (!isMounted) return;

          const selectedBg = localStorage.getItem('selectedBackground') || 'theme-default';
          if (document.body) {
            document.body.className = ''; 
            document.body.classList.add(selectedBg);
          }
          
          const visited = localStorage.getItem('boltCoinVisited');
          if (!visited) {
            setShowWelcomeModal(true);
            localStorage.setItem('boltCoinVisited', 'true');
          }
          
          const { needsProfileSetup } = await initializeUser();
          if (needsProfileSetup && isMounted) {
            setShowProfileSetupModalGlobal(true);
          }
          if (isMounted) {
            setLoading(false);
          }
        };
        
        const onInitialized = () => {
          if (isMounted) {
            initLogic();
          }
        };
        
        if (i18n.isInitialized) {
            onInitialized();
        } else {
            i18n.on('initialized', onInitialized);
        }
        
        const fallbackTimer = setTimeout(() => {
          if (isMounted && loading) { 
            console.warn("i18next initialization timeout. Forcing app load.");
            if(i18n.isInitialized && isMounted) {
              initLogic();
            } else if(isMounted) {
              setLoading(false);
            }
          }
        }, 5000); 

        return () => {
          isMounted = false;
          clearTimeout(fallbackTimer);
          i18n.off('initialized', onInitialized);
        };
      }, [initializeUser, i18n]);

      const onProfileSetupComplete = async (profileData) => {
        const success = await handleProfileSetupComplete(profileData);
        if (success) {
          setShowProfileSetupModalGlobal(false);
        }
      };
      
      if (loading) {
        return <SplashScreen />;
      }

      return (
        <>
          <Layout userMembership={userMembership} boltBalance={boltBalance} userProfile={userProfile} siteLogoUrl={SITE_LOGO_URL}>
            <Routes>
              <Route path="/" element={<Navigate to="/mining" replace />} />
              <Route path="/mining" element={<MiningPage userMembership={userMembership} updateBoltBalance={updateBoltBalance} userProfile={userProfile} />} />
              <Route path="/referral" element={<ReferralPage userMembership={userMembership} userProfile={userProfile} />} />
              <Route path="/wallet" element={<WalletConnectPage />} />
              <Route path="/tasks" element={<TasksPage userMembership={userMembership} updateBoltBalance={updateBoltBalance} userProfile={userProfile} />} />
              <Route path="/games" element={<GamesPage userMembership={userMembership} updateBoltBalance={updateBoltBalance} userProfile={userProfile} />} />
              <Route path="/accept" element={<AcceptReferralPage fetchOrCreateUser={fetchOrCreateUser} />} />
              <Route path="/membership" element={<MembershipPage updateUserMembership={updateUserMembership} userProfile={userProfile} />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Layout>
          <Toaster />
          {showWelcomeModal && <WelcomeModal isOpen={showWelcomeModal} setIsOpen={setShowWelcomeModal} />}
          {showProfileSetupModalGlobal && <UserProfileSetupModal isOpen={showProfileSetupModalGlobal} setIsOpen={setShowProfileSetupModalGlobal} onProfileSetupComplete={onProfileSetupComplete} currentProfile={userProfile} />}
        </>
      );
    }

    function App() {
      return (
        <Suspense fallback={<SplashScreen />}>
          <TonConnectUIProvider 
            manifestUrl={TONCONNECT_MANIFEST_URL}
            actionsConfiguration={{
                twaReturnUrl: `${TWA_RETURN_URL_BASE}?from=default_action` 
            }}
            walletsListConfiguration={{
                includeWallets: [
                    {
                        appName: "tonkeeper",
                        name: "Tonkeeper",
                        imageUrl: "https://s.pvs.io/2/logo_react_tonconnect.png",
                        aboutUrl: "https://tonkeeper.com",
                        universalLink: "https://app.tonkeeper.com/ton-connect",
                        bridgeUrl: "https://bridge.tonapi.io/bridge",
                        jsBridgeKey: "tonkeeper",
                        platforms: ["ios", "android", "chrome", "firefox", "macos", "windows", "linux"]
                    },
                    {
                        appName: "mytonwallet",
                        name: "MyTonWallet",
                        imageUrl: "https://mytonwallet.io/icon-256.png",
                        aboutUrl: "https://mytonwallet.io/",
                        universalLink: "https://mytonwallet.io/ton-connect",
                        bridgeUrl: "https://mytonwallet.io/bridge/rpc",
                        jsBridgeKey: "mytonwallet",
                        platforms: ["chrome", "android", "ios"]
                    },
                    {
                        appName: "tonhub",
                        name: "Tonhub",
                        imageUrl: "https://tonhub.com/apple-touch-icon.png",
                        aboutUrl: "https://tonhub.com",
                        universalLink: "https://tonhub.com/ton-connect",
                        bridgeUrl: "https://connect.tonhubapi.com/tonconnect",
                        jsBridgeKey: "tonhub",
                        platforms: ["ios", "android"]
                    }
                ]
            }}
          >
            <I18nextProvider i18n={i18nInstance}>
              <Router>
                <AppContent />
              </Router>
            </I18nextProvider>
          </TonConnectUIProvider>
        </Suspense>
      );
    }
    
    export default App;