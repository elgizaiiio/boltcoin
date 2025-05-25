import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Zap, Clock, Image as ImageIcon, ArrowUpCircle } from 'lucide-react';
    import { SPEED_UPGRADES, AUTO_MINING_UPGRADES, BACKGROUND_UPGRADES } from './miningConfig';
    import UpgradeCard from './subcomponents/UpgradeCard';
    import { useTranslation } from 'react-i18next';

    const MiningUpgradesModal = ({ isOpen, onClose, onPurchase, currentBalance, miningRateMultiplier, userProfile }) => {
      const { t } = useTranslation(['mining', 'common']);
      const tabConfig = [
        { value: 'speed', labelKey: 'upgradesModal.speedTab', icon: Zap, data: SPEED_UPGRADES, itemType: 'speed' },
        { value: 'auto', labelKey: 'upgradesModal.autoMiningTab', icon: Clock, data: AUTO_MINING_UPGRADES, itemType: 'autoMining' },
        { value: 'backgrounds', labelKey: 'upgradesModal.backgroundsTab', icon: ImageIcon, data: BACKGROUND_UPGRADES, itemType: 'background' },
      ];

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl w-[95vw] p-0 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 border-purple-700 text-white flex flex-col max-h-[90vh]">
            <DialogHeader className="p-4 sm:p-6 bg-gray-800/50 rounded-t-lg">
              <DialogTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center">
                <ArrowUpCircle className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                {t('upgradesModal.title', { ns: 'mining' })}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-purple-300">
                {t('upgradesModal.description', { ns: 'mining' })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow overflow-y-auto p-3 sm:p-4">
              <Tabs defaultValue="speed" className="w-full">
                <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2 bg-purple-900/30 p-1 h-auto">
                  {tabConfig.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                      <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300 hover:bg-purple-700/50 text-xs sm:text-sm py-1.5 sm:py-2 px-1 flex items-center justify-center flex-col sm:flex-row">
                        <TabIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5 sm:mb-0 sm:mr-1.5" />
                        {t(tab.labelKey, { ns: 'mining' })}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                {tabConfig.map(tab => (
                  <TabsContent key={tab.value} value={tab.value} className="mt-3 sm:mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                       {tab.data.map((item) => (
                        <UpgradeCard
                          key={item.id || item.labelKey}
                          item={item}
                          onPurchase={onPurchase}
                          itemType={tab.itemType}
                          currentBalance={currentBalance}
                          currentMiningRateMultiplier={miningRateMultiplier}
                          userProfile={userProfile}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <DialogFooter className="p-4 sm:p-6 bg-gray-800/50 rounded-b-lg">
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-gray-500 text-gray-300 hover:bg-gray-700 text-sm sm:text-base py-1.5 sm:py-2">
                {t('upgradesModal.closeButton', { ns: 'mining' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default MiningUpgradesModal;