import React, { useState, useEffect } from 'react';
    import { NavLink, useLocation } from 'react-router-dom';
    import { Home, Users, Wallet, CheckSquare, Gamepad2, Crown, Settings, UserCircle, LogOut, Languages, Edit3 } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { Button } from "@/components/ui/button";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
      DropdownMenuSub,
      DropdownMenuSubTrigger,
      DropdownMenuSubContent,
      DropdownMenuPortal
    } from "@/components/ui/dropdown-menu";
    import UserProfileSetupModal from '@/components/UserProfileSetupModal';
    import { useUserData } from '@/hooks/useUserData';

    const appLanguages = [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    const Layout = ({ children, userMembership, boltBalance, userProfile, siteLogoUrl }) => {
      const { t, i18n } = useTranslation(['layout', 'common', 'modals']);
      const location = useLocation();
      const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState(false);
      const { handleProfileSetupComplete } = useUserData();

      const navItems = [
        { path: '/mining', icon: Home, label: t('nav.mining') },
        { path: '/referral', icon: Users, label: t('nav.referral') },
        { path: '/wallet', icon: Wallet, label: t('nav.wallet') },
        { path: '/tasks', icon: CheckSquare, label: t('nav.tasks') },
        { path: '/games', icon: Gamepad2, label: t('nav.games') },
        { path: '/membership', icon: Crown, label: t('nav.membership') },
      ];

      if (userProfile?.is_admin) {
        navItems.push({ path: '/admin', icon: Settings, label: t('nav.admin') });
      }
      
      const onProfileSetupCompleteInternal = async (profileData) => {
        const success = await handleProfileSetupComplete(profileData);
        if (success) {
          setIsProfileSetupModalOpen(false);
        }
      };

      const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
      };

      const getInitials = (name) => {
        if (!name) return <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />;
        const names = name.split(' ');
        if (names.length > 1) {
          return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      return (
        <div className="flex flex-col min-h-screen text-gray-100">
          <header className="sticky top-0 z-50 bg-gray-900/70 backdrop-blur-lg shadow-lg">
            <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img src={siteLogoUrl} alt="BoltCoin Logo" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400">
                  BoltCoin
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-semibold text-yellow-400">{boltBalance !== null ? boltBalance.toFixed(2) : '0.00'} $BOLT</span>
                  <span className="text-purple-300">{userMembership?.name || t('guest')}</span>
                </div>
                <DropdownMenu dir={i18n.dir()}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-purple-500">
                        <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.first_name || 'User'} />
                        <AvatarFallback className="bg-purple-600 text-white text-sm sm:text-base">
                          {getInitials(userProfile?.first_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 sm:w-56 bg-gray-800 border-purple-600 text-gray-200 shadow-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal px-2 py-1.5 sm:px-3 sm:py-2">
                      <div className="flex flex-col space-y-0.5 sm:space-y-1">
                        <p className="text-xs sm:text-sm font-medium leading-none">{userProfile?.first_name || t('guest')}</p>
                        <p className="text-[10px] sm:text-xs leading-none text-purple-400">{userProfile?.telegram_id ? `@${userProfile.username}` : t('common:toast.notAvailable')}</p>
                        <div className="sm:hidden text-[10px] mt-0.5">
                          <span className="font-semibold text-yellow-400">{boltBalance !== null ? boltBalance.toFixed(2) : '0.00'} $BOLT</span>
                          <span className="text-purple-300 ml-1.5">{userMembership?.name || t('guest')}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-purple-600/50" />
                    <DropdownMenuItem onClick={() => setIsProfileSetupModalOpen(true)} className="cursor-pointer hover:bg-purple-700/50 focus:bg-purple-700/50 text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
                      <Edit3 className={`mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 ${i18n.dir() === 'rtl' ? 'ml-2 mr-0' : 'mr-2'}`} />
                      {t('editProfile')}
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer hover:bg-purple-700/50 focus:bg-purple-700/50 text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
                        <Languages className={`mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 ${i18n.dir() === 'rtl' ? 'ml-2 mr-0' : 'mr-2'}`} />
                        {t('changeLanguage')}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-gray-800 border-purple-600 text-gray-200 shadow-lg p-1 sm:p-1.5 max-h-60 overflow-y-auto">
                          <DropdownMenuLabel className="text-xs text-purple-400 px-1.5 sm:px-2 py-1">{t('selectLanguageTitle')}</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-purple-600/30 my-0.5 sm:my-1" />
                          {appLanguages.map((lang) => (
                            <DropdownMenuItem 
                              key={lang.code} 
                              onClick={() => changeLanguage(lang.code)}
                              className={`cursor-pointer hover:bg-purple-700/50 focus:bg-purple-700/50 text-xs sm:text-sm px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-sm ${i18n.language === lang.code ? 'bg-purple-700/70' : ''}`}
                            >
                              <span className={`mr-1.5 sm:mr-2 text-sm sm:text-base ${i18n.dir() === 'rtl' ? 'ml-1.5 sm:ml-2 mr-0' : 'mr-1.5 sm:mr-2'}`}>{lang.flag}</span> {lang.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSeparator className="bg-purple-600/50" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-red-700/50 focus:bg-red-700/50 text-red-400 text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">
                      <LogOut className={`mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 ${i18n.dir() === 'rtl' ? 'ml-2 mr-0' : 'mr-2'}`} />
                      {t('logoutButton')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-3 sm:px-4 py-3 sm:py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          <nav className="sticky bottom-0 z-50 bg-gray-900/80 backdrop-blur-md shadow-top-lg">
            <div className="container mx-auto px-1 sm:px-2 h-14 sm:h-[68px] flex justify-around items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-md transition-all duration-200 ease-in-out w-[calc(100%/${navItems.length})] max-w-[70px] sm:max-w-[80px] h-full relative group ${
                      isActive ? 'text-yellow-400' : 'text-purple-300 hover:text-yellow-300'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5 sm:mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] leading-tight font-medium truncate max-w-full text-center">{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 sm:h-1 w-8 sm:w-10 bg-yellow-400 rounded-full"
                    />
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
          {isProfileSetupModalOpen && (
            <UserProfileSetupModal 
              isOpen={isProfileSetupModalOpen} 
              setIsOpen={setIsProfileSetupModalOpen} 
              onProfileSetupComplete={onProfileSetupCompleteInternal}
              currentProfile={userProfile}
            />
          )}
        </div>
      );
    };

    export default Layout;