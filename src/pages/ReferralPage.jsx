import React, { useState, useEffect, useMemo } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Copy, Share2, Users, Gift } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '@/lib/supabaseClient';

    const ReferralPage = ({ userMembership, userProfile }) => {
      const { t } = useTranslation(['referral', 'common']);
      const { toast } = useToast();
      const [referralCode, setReferralCode] = useState('');
      const [referredUsers, setReferredUsers] = useState([]);
      const [totalBonus, setTotalBonus] = useState(0);

      const botUsername = 'Boltsobot'; 

      const referralLink = useMemo(() => {
        if (!referralCode) return '';
        return `https://t.me/${botUsername}?start=ref_${referralCode}`;
      }, [referralCode, botUsername]);

      useEffect(() => {
        const fetchReferralData = async () => {
          if (userProfile && userProfile.id) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('referral_code')
              .eq('id', userProfile.id)
              .single();

            if (userError) {
              console.error('Error fetching referral code:', userError);
              return;
            }
            if (userData) {
              setReferralCode(userData.referral_code);
            }

            const { data: referralsData, error: referralsError } = await supabase
              .from('referrals')
              .select('*, referred_user_id(username, first_name)')
              .eq('referrer_id', userProfile.id);

            if (referralsError) {
              console.error('Error fetching referred users:', referralsError);
            } else {
              setReferredUsers(referralsData || []);
              const bonus = (referralsData || []).reduce((acc, ref) => acc + (ref.reward_amount || 0), 0);
              setTotalBonus(bonus);
            }
          }
        };

        fetchReferralData();
      }, [userProfile]);


      const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
          toast({
            title: t('common:toast.copied'),
            description: type === 'code' ? t('referral:yourReferralCode') + ' ' + t('common:toast.copied') : t('referral:yourLink') + ' ' + t('common:toast.copied'),
          });
        });
      };

      const shareReferralLink = () => {
        if (navigator.share) {
          navigator.share({
            title: t('referral:title'),
            text: t('referral:description'),
            url: referralLink,
          }).catch(console.error);
        } else {
          copyToClipboard(referralLink, 'link');
        }
      };
      
      const membershipBonusMultiplier = userMembership ? (1 + (userMembership.referralBonus || 0)) : 1;

      return (
        <div className="py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-10"
          >
            <Users className="mx-auto h-10 w-10 sm:h-14 sm:w-14 text-yellow-400 mb-2 sm:mb-3 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 px-2">
              {t('referral:title')}
            </h1>
            <p className="text-sm sm:text-base text-purple-300 mt-1 px-2">
              {t('referral:description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 bg-gray-800/40 backdrop-blur-sm border-purple-500/40 hover:border-emerald-400">
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-lg sm:text-xl text-emerald-300">{t('referral:yourReferralCode')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 pt-0">
                  <div className="flex space-x-1.5 sm:space-x-2">
                    <Input type="text" value={referralCode} readOnly className="bg-gray-700/50 border-purple-600 text-gray-200 focus:ring-emerald-500 text-xs sm:text-sm h-9 sm:h-10" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, 'code')} className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 h-9 w-9 sm:h-10 sm:w-10">
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-purple-400">{t('referral:yourLink')}:</p>
                  <div className="flex space-x-1.5 sm:space-x-2">
                     <Input type="text" value={referralLink} readOnly className="bg-gray-700/50 border-purple-600 text-gray-200 focus:ring-emerald-500 text-[10px] sm:text-xs h-9 sm:h-10" />
                     <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, 'link')} className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 h-9 w-9 sm:h-10 sm:w-10">
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  <Button onClick={shareReferralLink} className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs sm:text-sm py-1.5 sm:py-2 h-9 sm:h-10">
                    <Share2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t('referral:shareLinkButton')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="shadow-lg hover:shadow-teal-500/40 transition-all duration-300 bg-gray-800/40 backdrop-blur-sm border-purple-500/40 hover:border-teal-400">
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="text-lg sm:text-xl text-teal-300">{t('referral:referredUsersTitle')}</CardTitle>
                  <CardDescription className="text-purple-300 text-xs sm:text-sm">
                    {t('referral:totalBonus')}: <span className="font-bold text-yellow-300">{(totalBonus * membershipBonusMultiplier).toFixed(2)} $BOLT</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-48 sm:max-h-60 overflow-y-auto pr-1 sm:pr-2 p-3 sm:p-4 pt-0">
                  {referredUsers.length > 0 ? (
                    <ul className="space-y-1.5 sm:space-y-2">
                      {referredUsers.map((refUser) => (
                        <li key={refUser.id} className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-700/30 rounded-md text-[10px] sm:text-sm">
                          <span className="text-gray-300 truncate max-w-[60%]">{refUser.referred_user_id?.first_name || refUser.referred_user_id?.username || 'Anonymous User'}</span>
                          <span className="text-green-400 font-semibold">+{((refUser.reward_amount || 0) * membershipBonusMultiplier).toFixed(2)} $BOLT</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-purple-400 text-center py-3 sm:py-4 text-xs sm:text-sm">{t('referral:noReferredUsers')}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-6 sm:mt-10">
            <Card className="shadow-xl hover:shadow-purple-500/40 transition-all duration-300 bg-gray-800/60 backdrop-blur-md border-purple-500/50 hover:border-purple-400">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-lg sm:text-xl text-purple-300 flex items-center">
                  <Gift className="mr-1.5 sm:mr-2 h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                  {t('referral:mechanismTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs sm:text-sm text-purple-300 p-3 sm:p-4 pt-0">
                <p>1. {t('referral:step1')}</p>
                <p>2. {t('referral:step2')} <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{botUsername}</a>.</p>
                <p>3. {t('referral:step3')} <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">BoltCoin App</a>.</p>
                <p>4. {t('referral:step4')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    };
    
    const WEB_APP_URL = "https://elgiza.site"; 

    export default ReferralPage;