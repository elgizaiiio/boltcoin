
    import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import MiningUpgradesModal from '@/components/mining/MiningUpgradesModal';
    import MiningHeader from '@/components/mining/subcomponents/MiningHeader';
    import AutoMiningStatus from '@/components/mining/subcomponents/AutoMiningStatus';
    import MiningActions from '@/components/mining/subcomponents/MiningActions';
    import { MINING_SESSION_DURATION, BASE_MINING_AMOUNT_PER_SESSION } from '@/components/mining/miningConfig';
    import { supabase } from '@/lib/supabaseClient';
    
    const MiningPage = ({ userMembership, updateBoltBalance, userProfile }) => {
      const { t, i18n } = useTranslation(['mining', 'common', 'modals', 'wallet']);
      const { toast } = useToast();
      
      const motivationalTexts = useMemo(() => [
        t('motivationalText1', { ns: 'mining' }),
        t('motivationalText2', { ns: 'mining' }),
        t('motivationalText3', { ns: 'mining' })
      ], [t, i18n.language]);

      const [currentMotivationalText, setCurrentMotivationalText] = useState(motivationalTexts[0]);
      const [miningRateMultiplier, setMiningRateMultiplier] = useState(1);
      const [isAutoMiningActive, setIsAutoMiningActive] = useState(false);
      const [autoMiningEndTime, setAutoMiningEndTime] = useState(0);
      const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
      
      const [miningSessionEndTime, setMiningSessionEndTime] = useState(0);
      const [currentMinedAmount, setCurrentMinedAmount] = useState(0);
      const [timeRemaining, setTimeRemaining] = useState(0);

      useEffect(() => {
        if (userProfile) {
          setMiningRateMultiplier(userProfile.mining_rate_multiplier || 1);
          setIsAutoMiningActive(userProfile.auto_mining_end_time ? new Date(userProfile.auto_mining_end_time) > new Date() : false);
          setAutoMiningEndTime(userProfile.auto_mining_end_time ? new Date(userProfile.auto_mining_end_time).getTime() : 0);
        }
        setMiningSessionEndTime(parseInt(localStorage.getItem('miningSessionEndTime') || '0'));
        setCurrentMinedAmount(parseFloat(localStorage.getItem('currentMinedAmount') || '0'));
      }, [userProfile]);

      useEffect(() => {
        localStorage.setItem('miningSessionEndTime', miningSessionEndTime.toString());
        localStorage.setItem('currentMinedAmount', currentMinedAmount.toString());
      }, [miningSessionEndTime, currentMinedAmount]);


      const calculateMiningAmount = useCallback(() => {
        const membershipBonusMultiplier = userMembership ? (1 + userMembership.miningBonus) : 1;
        return BASE_MINING_AMOUNT_PER_SESSION * miningRateMultiplier * membershipBonusMultiplier;
      }, [userMembership, miningRateMultiplier]);

      const handleStartMining = useCallback(() => {
        if (miningSessionEndTime > Date.now()) {
            toast({ title: t('toast.alert', {ns: 'common'}), description: t('miningInProgressButton', {ns: 'mining', amount: currentMinedAmount.toFixed(2)}) });
            return;
        }
        const sessionEndTime = Date.now() + MINING_SESSION_DURATION;
        setMiningSessionEndTime(sessionEndTime);
        const amountToMine = calculateMiningAmount();
        setCurrentMinedAmount(amountToMine);

        toast({
          title: t('toast.success', {ns: 'common'}),
          description: t('miningStarted', {ns: 'mining'}),
        });
      }, [miningSessionEndTime, currentMinedAmount, calculateMiningAmount, t, toast]);

      const handleClaim = useCallback(() => {
        if (miningSessionEndTime > Date.now()) {
            toast({ title: t('toast.alert', {ns: 'common'}), description: t('miningCooldownButtonShort', {ns: 'mining'})});
            return;
        }
        if (currentMinedAmount > 0) {
            updateBoltBalance(currentMinedAmount);
            toast({
                title: t('toast.success', {ns: 'common'}),
                description: t('claimSuccess', {ns: 'mining', amount: currentMinedAmount.toFixed(2) }),
            });
            setCurrentMinedAmount(0);
            setMiningSessionEndTime(0); 
        }
      }, [miningSessionEndTime, currentMinedAmount, updateBoltBalance, t, toast]);
      

      useEffect(() => {
        const interval = setInterval(() => {
          if (miningSessionEndTime > Date.now()) {
            setTimeRemaining(miningSessionEndTime - Date.now());
          } else {
            setTimeRemaining(0);
          }
        }, 1000);
        return () => clearInterval(interval);
      }, [miningSessionEndTime]);


      const handlePurchase = useCallback(async (itemType, itemData, cost, currency) => {
        let translatedItemName = itemData.labelKey ? t(itemData.labelKey, { ns: 'mining'}) : (itemData.nameKey ? t(itemData.nameKey, { ns: 'mining'}) : t('toast.unknownItem', {ns: 'common'}));
        
        if (currency === '$BOLT') {
          if (userProfile.bolt_balance < cost) {
            toast({ title: t('upgradesModal.insufficientFunds.title', {ns: 'mining'}), description: t('upgradesModal.insufficientFunds.descriptionBolt', {ns: 'mining'}), variant: "destructive" });
            return;
          }
          updateBoltBalance(-cost); 
        }
        
        toast({
            title: t('purchaseSuccessful.title', {ns: 'mining'}),
            description: currency === 'TON' 
              ? t('purchaseSuccessful.descriptionTon', {ns: 'mining', item: translatedItemName, cost })
              : t('purchaseSuccessful.description', {ns: 'mining', item: translatedItemName, cost }),
        });

        let newDbValues = {};

        if (itemType === 'autoMining') {
            setIsAutoMiningActive(true);
            const durationMs = itemData.durationDays * 24 * 60 * 60 * 1000;
            const newEndTime = Math.max(Date.now(), autoMiningEndTime) + durationMs;
            setAutoMiningEndTime(newEndTime);
            newDbValues.auto_mining_end_time = new Date(newEndTime).toISOString();
        } else if (itemType === 'background') {
            document.body.className = ''; 
            document.body.classList.add(itemData.className);
            localStorage.setItem('selectedBackground', itemData.className);
            newDbValues.selected_background = itemData.className;
        } else if (itemType === 'speed') {
            const newMultiplier = itemData.multiplier; 
            setMiningRateMultiplier(newMultiplier);
            newDbValues.mining_rate_multiplier = newMultiplier;
        }

        if (userProfile?.id && Object.keys(newDbValues).length > 0) {
          const { error: dbError } = await supabase
            .from('users')
            .update(newDbValues)
            .eq('id', userProfile.id);
          if (dbError) {
            console.error(`Error updating user ${itemType} in DB:`, dbError);
            toast({ title: t('toast.error', {ns: 'common'}), description: t('dbUpdateError', {ns: 'mining'}), variant: 'destructive' });
            
            if (itemType === 'autoMining') setIsAutoMiningActive(false); 
            if (itemType === 'speed') setMiningRateMultiplier(userProfile.mining_rate_multiplier || 1); 
          }
        }
        setIsUpgradeModalOpen(false);
      }, [t, toast, autoMiningEndTime, userProfile, updateBoltBalance, miningRateMultiplier]);
      
      useEffect(() => {
        let autoMineInterval;
        if (isAutoMiningActive && autoMiningEndTime > Date.now()) {
            autoMineInterval = setInterval(() => {
                if (Date.now() < autoMiningEndTime) {
                    const autoMineAmount = (BASE_MINING_AMOUNT_PER_SESSION / (MINING_SESSION_DURATION / (15 * 1000))) ; 
                    const membershipBonusMultiplier = userMembership ? (1 + userMembership.miningBonus) : 1;
                    const totalMined = autoMineAmount * miningRateMultiplier * membershipBonusMultiplier;
                    updateBoltBalance(totalMined);
                } else {
                    setIsAutoMiningActive(false);
                    setAutoMiningEndTime(0);
                    toast({ title: t('autoMiningEnded.title', {ns: 'mining'}), description: t('autoMiningEnded.description', {ns: 'mining'})});
                    if (userProfile?.id) {
                      supabase.from('users').update({ auto_mining_end_time: null }).eq('id', userProfile.id).then();
                    }
                    clearInterval(autoMineInterval);
                }
            }, 15000); 
        } else if (isAutoMiningActive && autoMiningEndTime <= Date.now() && autoMiningEndTime !== 0) { 
            setIsAutoMiningActive(false);
            setAutoMiningEndTime(0);
            toast({ title: t('autoMiningEnded.title', {ns: 'mining'}), description: t('autoMiningEnded.description', {ns: 'mining'})});
            if (userProfile?.id) {
              supabase.from('users').update({ auto_mining_end_time: null }).eq('id', userProfile.id).then();
            }
        }
        return () => clearInterval(autoMineInterval);
      }, [isAutoMiningActive, autoMiningEndTime, miningRateMultiplier, userMembership, updateBoltBalance, t, toast, userProfile]);


      useEffect(() => {
        setCurrentMotivationalText(motivationalTexts[0]); 
        const textIntervalId = setInterval(() => {
          setCurrentMotivationalText(prevText => {
            const currentIndex = motivationalTexts.indexOf(prevText);
            const nextIndex = (currentIndex + 1) % motivationalTexts.length;
            return motivationalTexts[nextIndex];
          });
        }, 7000); 
        return () => clearInterval(textIntervalId);
      }, [motivationalTexts]);

      const isMiningActiveSession = miningSessionEndTime > Date.now();
      const canClaim = !isMiningActiveSession && currentMinedAmount > 0;

      return (
        <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 py-6 sm:py-8">
          <MiningHeader t={t} userProfile={userProfile} currentMotivationalText={currentMotivationalText} />
          <AutoMiningStatus t={t} isAutoMiningActive={isAutoMiningActive} autoMiningEndTime={autoMiningEndTime} />
          <div className="text-xs sm:text-sm text-purple-300">{t('miningSessionDuration', { ns: 'mining' })}</div>
          <MiningActions
            t={t}
            canClaim={canClaim}
            isMiningActiveSession={isMiningActiveSession}
            currentMinedAmount={currentMinedAmount}
            timeRemaining={timeRemaining}
            handleClaim={handleClaim}
            handleStartMining={handleStartMining}
            setIsUpgradeModalOpen={setIsUpgradeModalOpen}
          />
          <MiningUpgradesModal
            isOpen={isUpgradeModalOpen}
            onClose={() => setIsUpgradeModalOpen(false)}
            onPurchase={handlePurchase}
            currentBalance={userProfile?.bolt_balance || 0}
            miningRateMultiplier={miningRateMultiplier}
            userProfile={userProfile}
          />
        </div>
      );
    };

    export default MiningPage;
  