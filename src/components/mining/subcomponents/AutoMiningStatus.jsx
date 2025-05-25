import React from 'react';
    import { motion } from 'framer-motion';
    import { formatTime } from '@/lib/utils';
    import { useTranslation } from 'react-i18next';

    const AutoMiningStatus = ({ isAutoMiningActive, autoMiningEndTime }) => {
      const { t } = useTranslation(['mining']);
      if (!isAutoMiningActive || autoMiningEndTime <= Date.now()) {
        return null;
      }

      return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 sm:p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-xs sm:text-sm"
        >
            <p className="font-semibold">{t('miningPage.autoMiningActive.title')}</p>
            <p className="text-[11px] sm:text-xs">{t('miningPage.autoMiningActive.description', { time: formatTime(autoMiningEndTime - Date.now()) })}</p>
        </motion.div>
      );
    };

    export default AutoMiningStatus;