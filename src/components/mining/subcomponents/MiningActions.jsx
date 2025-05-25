import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Zap, Gift, Clock, ArrowUpCircle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { formatTime } from '@/lib/utils';
    import { useTranslation } from 'react-i18next';

    const MiningActions = ({
      canClaim,
      isMiningActiveSession,
      currentMinedAmount,
      timeRemaining,
      handleClaim,
      handleStartMining,
      setIsUpgradeModalOpen,
    }) => {
      const { t } = useTranslation(['mining']);
      return (
        <motion.div
            className="space-y-3 sm:space-y-3.5 w-full max-w-xs sm:max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
             {canClaim ? (
                <Button 
                    onClick={handleClaim} 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base py-2 sm:py-2.5 shadow-lg transform hover:scale-105 transition-transform duration-200 h-11 sm:h-12"
                >
                    <Gift className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {t('miningPage.claimButton', { amount: currentMinedAmount.toFixed(2) })}
                </Button>
            ) : isMiningActiveSession ? (
                <Button 
                    disabled 
                    size="lg" 
                    className="w-full bg-gray-600 text-gray-300 font-bold text-sm sm:text-base py-2 sm:py-2.5 shadow-lg opacity-70 cursor-not-allowed h-11 sm:h-12"
                >
                    <Clock className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    {t('miningPage.miningCooldownButton', { time: formatTime(timeRemaining) })}
                </Button>
            ) : (
                <Button 
                    onClick={handleStartMining} 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base py-2 sm:py-2.5 shadow-lg transform hover:scale-105 transition-transform duration-200 h-11 sm:h-12"
                >
                    <Zap className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {t('miningPage.startMiningButton')}
                </Button>
            )}

            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 font-bold text-sm sm:text-base py-2 sm:py-2.5 shadow-md transform hover:scale-105 transition-transform duration-200 h-11 sm:h-12"
            >
              <ArrowUpCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t('miningPage.upgradesButton')}
            </Button>
          </motion.div>
      );
    };
    
    export default MiningActions;