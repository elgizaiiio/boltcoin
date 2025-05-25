
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Zap, Clock, Image as ImageIcon, ShoppingCart, Loader2 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
    import { useTranslation } from 'react-i18next';
    
    const BOLTCOIN_TREASURY_WALLET = 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R';
    const TWA_RETURN_URL_BASE = 'https://t.me/BoltCoinDev_Bot/BoltCoinDevApp';

    const UpgradeCard = ({ item, onPurchase, itemType, currentMiningRateMultiplier, userProfile }) => {
      const { t } = useTranslation(['mining', 'common', 'wallet']);
      const { toast } = useToast();
      const wallet = useTonWallet();
      const [tonConnectUI, setOptions] = useTonConnectUI();
      const [isProcessingPayment, setIsProcessingPayment] = useState(false);
      
      useEffect(() => {
        if (tonConnectUI) {
          const fromParam = `from=purchase_${itemType}_${item.id || item.labelKey.replace(/\./g, '_')}`;
          setOptions({
            actionsConfiguration: {
              twaReturnUrl: `${TWA_RETURN_URL_BASE}?${fromParam}`
            }
          });
        }
      }, [tonConnectUI, setOptions, itemType, item.id, item.labelKey]);

      const isSpeedUpgradeAlreadyMax = itemType === 'speed' && currentMiningRateMultiplier >= item.multiplier;
      const isDefaultBackground = itemType === 'background' && item.costBolt === 0;


      const handlePurchaseClick = async () => {
        if (isSpeedUpgradeAlreadyMax && itemType === 'speed') {
           toast({ title: t('upgradesModal.alreadyPurchased', { ns: 'mining' }), description: t('upgradesModal.speedAlreadyMax', { ns: 'mining' }), variant: "warning" });
           return;
        }
        if (isDefaultBackground) {
            onPurchase(itemType, item, 0, '$BOLT', null); 
            return;
        }
        
        setIsProcessingPayment(true);

        if (!wallet) {
          toast({ title: t('wallet:notConnected'), description: t('wallet:connectToProceed'), variant: 'destructive' });
          if (tonConnectUI) tonConnectUI.openModal();
          setIsProcessingPayment(false);
          return;
        }
        
        const payloadComment = `purchase_${itemType}_${item.id || item.labelKey}_user_${userProfile?.id || 'unknown_user'}_time_${Date.now()}`;
        
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 600, 
          messages: [
            {
              address: BOLTCOIN_TREASURY_WALLET,
              amount: (item.costTon * 1_000_000_000).toString(), 
              payload: btoa(payloadComment)
            },
          ],
        };

        try {
          toast({
            title: t('upgradesModal.processingTonPayment.title', { ns: 'mining' }),
            description: t('upgradesModal.processingTonPayment.description', { ns: 'mining', item: t(item.labelKey, { ns: 'mining' }), cost: item.costTon }),
          });
          const result = await tonConnectUI.sendTransaction(transaction);
          
          const boc = result.boc; 
          
          onPurchase(itemType, item, item.costTon, 'TON', boc); 
        } catch (error) {
          console.error('TON Transaction Error for upgrade:', error);
          let errorMessage = t('transactionFailed', { ns: 'mining' });
          if (error && typeof error === 'object' && 'message' in error) {
              errorMessage = error.message;
              if (error.message.toLowerCase().includes('user rejected') || error.message.toLowerCase().includes('user declined')) {
                  errorMessage = t('common:toastMessages.userRejectedTransaction');
              } else if (error.message.toLowerCase().includes('insufficient funds') || error.message.toLowerCase().includes('not enough balance')) {
                  errorMessage = t('common:toastMessages.insufficientTonBalance');
              } else if (error.message.toLowerCase().includes("popup_closed") || error.message.toLowerCase().includes("window was closed")) {
                  errorMessage = t('common:toastMessages.popupClosed');
              } else if (error.message.toLowerCase().includes("timeout") || error.message.toLowerCase().includes("expired")) {
                  errorMessage = t('common:toastMessages.transactionExpired');
              } else {
                  errorMessage = t('common:toastMessages.genericError');
              }
          } else if (typeof error === 'string') {
              errorMessage = error;
          }
          toast({ title: t('purchaseError.title', { ns: 'mining' }), description: errorMessage, variant: 'destructive' });
        } finally {
          setIsProcessingPayment(false);
        }
      };
      
      const canPurchaseWithTon = item.costTon !== undefined;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <Card className={`shadow-md transition-all duration-300 ${isSpeedUpgradeAlreadyMax && itemType === 'speed' ? 'bg-green-800/40 border-green-600/60' : (isDefaultBackground ? 'bg-blue-800/40 border-blue-600/60' : 'bg-gray-700/40 border-purple-600/60 hover:border-purple-500')}`}>
            <CardHeader className="pb-2 pt-3 sm:pb-3 sm:pt-4 px-3 sm:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base text-purple-300">{t(item.labelKey, { ns: 'mining' })}</CardTitle>
                {itemType === 'speed' && item.icon && <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />}
                {itemType === 'autoMining' && item.icon && <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />}
                {itemType === 'background' && item.icon && <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />}
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4 px-3 sm:px-4">
              <CardDescription className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 min-h-[2.5em]">
                 {itemType === 'speed' && t('upgradesModal.speedDescription', { ns: 'mining', multiplier: item.multiplier })}
                 {itemType === 'autoMining' && t('upgradesModal.autoMiningDescription', { ns: 'mining', duration: item.durationDays })}
                 {itemType === 'background' && t(item.descriptionKey, { ns: 'mining' })}
              </CardDescription>
              <div className="flex flex-col space-y-2">
                {isSpeedUpgradeAlreadyMax && itemType === 'speed' ? (
                     <Button
                        disabled={true}
                        className="w-full text-xs sm:text-sm py-1 sm:py-1.5 h-auto bg-green-600 hover:bg-green-700 cursor-not-allowed"
                    >
                        <ShoppingCart className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {t('upgradesModal.purchased', { ns: 'mining' })}
                    </Button>
                ) : isDefaultBackground ? (
                    <Button
                        onClick={handlePurchaseClick}
                        disabled={isProcessingPayment}
                        className="w-full text-xs sm:text-sm py-1 sm:py-1.5 h-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                        {isProcessingPayment ? <Loader2 className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> : <ShoppingCart className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                        {t('upgradesModal.selectTheme', { ns: 'mining' })}
                    </Button>
                ) : (
                    <>
                        {canPurchaseWithTon && (
                             <Button
                                onClick={handlePurchaseClick}
                                disabled={isProcessingPayment || !wallet}
                                className={`w-full text-xs sm:text-sm py-1 sm:py-1.5 h-auto ${
                                wallet
                                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white'
                                    : 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                                }`}
                            >
                                {isProcessingPayment ? <Loader2 className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> : <ShoppingCart className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                                {`${item.costTon} TON`}
                            </Button>
                        )}
                         {!canPurchaseWithTon && !isDefaultBackground && (
                             <Button
                                disabled={true}
                                className="w-full text-xs sm:text-sm py-1 sm:py-1.5 h-auto bg-gray-600 cursor-not-allowed"
                            >
                                {t('common:unavailable')}
                            </Button>
                        )}
                    </>
                )}
               
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default UpgradeCard;
  