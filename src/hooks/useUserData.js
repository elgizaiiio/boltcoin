import { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import i18n from '@/i18n';
    import { fetchUser, createUser, updateUser } from '@/services/userService';

    export function useUserData() {
      const [userProfile, setUserProfile] = useState({ id: null, name: '', avatar: null, telegram_id: null });
      const [boltBalance, setBoltBalance] = useState(0);
      const [userMembership, setUserMembership] = useState(null);
      const { toast } = useToast();

      const fetchOrCreateUser = useCallback(async (telegramUser) => {
        if (!telegramUser || !telegramUser.id) {
          const localProfile = localStorage.getItem('userProfile');
          if (localProfile) {
            const parsedProfile = JSON.parse(localProfile);
            setUserProfile(parsedProfile);
            setBoltBalance(parseFloat(localStorage.getItem('boltBalance') || '0'));
            const storedMembership = localStorage.getItem('userMembership');
            if (storedMembership) setUserMembership(JSON.parse(storedMembership));
          }
          return { profileExists: !!localProfile, profile: localProfile ? JSON.parse(localProfile) : null };
        }

        const { user: existingUser, error: fetchError } = await fetchUser(telegramUser.id);

        if (fetchError) {
          toast({ title: i18n.t('toast.error'), description: i18n.t('toastMessages.fetchUserError'), variant: "destructive" });
          return { profileExists: false, profile: null };
        }

        if (existingUser) {
          setUserProfile({
            id: existingUser.id,
            name: existingUser.first_name || existingUser.username || 'User',
            avatar: existingUser.avatar_url || null,
            telegram_id: existingUser.telegram_id,
          });
          setBoltBalance(existingUser.bolt_balance || 0);
          if (existingUser.user_language_code && i18n.language !== existingUser.user_language_code) {
            i18n.changeLanguage(existingUser.user_language_code);
            document.documentElement.lang = existingUser.user_language_code;
            document.documentElement.dir = i18n.dir(existingUser.user_language_code);
          }
          return { profileExists: true, profile: existingUser };
        } else {
          const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newUserPayload = {
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            bolt_balance: 0,
            referral_code: referralCode,
            user_language_code: i18n.language,
            last_known_chat_id: telegramUser.chat_id 
          };
          const { user: newUser, error: insertError } = await createUser(newUserPayload);

          if (insertError) {
            toast({ title: i18n.t('toast.error'), description: i18n.t('toastMessages.createUserError'), variant: "destructive" });
            return { profileExists: false, profile: null };
          }
          setUserProfile({
            id: newUser.id,
            name: newUser.first_name || newUser.username || 'User',
            avatar: newUser.avatar_url || null,
            telegram_id: newUser.telegram_id,
          });
          setBoltBalance(0);
          return { profileExists: false, profile: newUser };
        }
      }, [i18n, toast]);

      const updateUserMembershipState = async (membership) => {
        setUserMembership(membership);
        localStorage.setItem('userMembership', JSON.stringify(membership));
        if (userProfile && userProfile.id) {
          const { error } = await updateUser(userProfile.id, { active_membership_id: membership.id });
          if (error) console.error("Error updating membership in Supabase:", error);
        }
      };

      const updateBoltBalanceState = async (amount) => {
        const newBalance = boltBalance + amount;
        setBoltBalance(newBalance);
        localStorage.setItem('boltBalance', newBalance.toString());
        if (userProfile && userProfile.id) {
          const { error } = await updateUser(userProfile.id, { bolt_balance: newBalance });
          if (error) {
            console.error("Error updating balance in Supabase:", error);
            toast({ title: i18n.t('toast.syncErrorTitle'), description: i18n.t('toastMessages.syncBalanceError'), variant: "destructive" });
            setBoltBalance(prev => prev - amount); 
            localStorage.setItem('boltBalance', (newBalance - amount).toString());
          }
        }
      };

      const handleProfileSetupCompleteState = async (profileData) => {
        const newProfile = { ...userProfile, ...profileData };
        setUserProfile(newProfile);
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        localStorage.setItem('boltCoinProfileSaved', 'true');

        const updatePayload = { 
          first_name: newProfile.name, 
          avatar_url: newProfile.avatar,
          user_language_code: i18n.language 
        };

        let updatedUser;
        let error;

        if (newProfile.id) {
          ({ user: updatedUser, error } = await updateUser(newProfile.id, updatePayload));
        } else if (newProfile.telegram_id) {
           ({ user: updatedUser, error } = await updateUser(newProfile.telegram_id, updatePayload, 'telegram_id'));
        }

        if (error) {
          console.error("Error updating profile in Supabase:", error);
          toast({ title: i18n.t('toast.profileErrorTitle'), description: i18n.t('toastMessages.profileSaveError'), variant: "destructive" });
        } else if (updatedUser) {
          if(!newProfile.id && updatedUser.id) {
             setUserProfile(prev => ({...prev, id: updatedUser.id}));
          }
          toast({ title: i18n.t('toast.profileSavedTitle'), description: i18n.t('toastMessages.profileUpdated') });
        }
        return !error;
      };
      
      const initializeUser = useCallback(async () => {
        let userToSetup = null;
        let needsSetupModal = false;

        if (window.Telegram && window.Telegram.WebApp) {
            try {
                await new Promise(resolve => window.Telegram.WebApp.ready(resolve));
                const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
                const tgChat = window.Telegram.WebApp.initDataUnsafe?.chat;

                if (tgUser) {
                    const { profileExists, profile } = await fetchOrCreateUser({ ...tgUser, chat_id: tgChat?.id });
                    userToSetup = profile;
                    needsSetupModal = !profileExists && !!profile;
                } else {
                    const localProfile = localStorage.getItem('userProfile');
                    if (localProfile) {
                        userToSetup = JSON.parse(localProfile);
                        setBoltBalance(parseFloat(localStorage.getItem('boltBalance') || '0'));
                    } else {
                        needsSetupModal = true; 
                    }
                }
            } catch (e) {
                console.error("Telegram WebApp SDK error:", e);
                const localProfile = localStorage.getItem('userProfile');
                if (localProfile) {
                    userToSetup = JSON.parse(localProfile);
                    setBoltBalance(parseFloat(localStorage.getItem('boltBalance') || '0'));
                } else {
                    needsSetupModal = true;
                }
            }
        } else {
            const localProfile = localStorage.getItem('userProfile');
            if (localProfile) {
                userToSetup = JSON.parse(localProfile);
                setBoltBalance(parseFloat(localStorage.getItem('boltBalance') || '0'));
            } else {
                needsSetupModal = true;
            }
        }
        
        if (userToSetup) {
          setUserProfile(prev => ({...prev, ...userToSetup}));
        }
        return { needsProfileSetup: needsSetupModal && (!userToSetup || !userToSetup.id) };

    }, [fetchOrCreateUser]);


      return {
        userProfile,
        boltBalance,
        userMembership,
        fetchOrCreateUser,
        updateUserMembership: updateUserMembershipState,
        updateBoltBalance: updateBoltBalanceState,
        handleProfileSetupComplete: handleProfileSetupCompleteState,
        initializeUser,
        setUserProfile
      };
    }