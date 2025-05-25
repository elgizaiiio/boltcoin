import React from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Crown, Zap, Users, CheckSquare, Gamepad2, ShieldCheck, Loader2 } from 'lucide-react';
    import { motion } from 'framer-motion';

    const iconMap = {
        Zap,
        CheckSquare,
        Users,
        Gamepad2,
        ShieldCheck,
        Crown
    };

    const MembershipCard = ({ tier, index, t, currentMembershipId, processingPayment, onSubscribe, isWalletConnected }) => {
      const MainIcon = iconMap[tier.features[0]?.iconKey || 'Crown'];
      
      const priceDisplay = [];
      if (tier.price) priceDisplay.push(`${tier.price} TON`);
      if (priceDisplay.length === 0) priceDisplay.push(t('common:free'));


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex"
        >
          <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${tier.bgColor} ${tier.borderColor} overflow-hidden flex flex-col h-full w-full transform hover:-translate-y-1`}>
            <CardHeader className="p-5 sm:p-6 text-center">
              <MainIcon className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 ${tier.color}`} />
              <CardTitle className={`text-2xl sm:text-3xl font-bold ${tier.color}`}>{t(tier.nameKey)}</CardTitle>
              <CardDescription className="text-base sm:text-lg font-semibold text-gray-300 mt-1">
                {priceDisplay.join(' / ')} <span className="text-xs sm:text-sm">/ {t('month')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-3 sm:space-y-4 flex-grow">
              <ul className="space-y-2 sm:space-y-3">
                {tier.features.map((feature, fIndex) => {
                  const FeatureIcon = iconMap[feature.iconKey];
                  return (
                    <li key={fIndex} className="flex items-center text-sm sm:text-base text-gray-300">
                      {FeatureIcon && <FeatureIcon className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 ${tier.color}`} />}
                      {t(feature.textKey)}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter className="p-5 sm:p-6 mt-auto">
              {currentMembershipId === tier.id ? (
                <Button 
                  disabled={true}
                  className={`w-full font-bold text-base sm:text-lg py-2.5 sm:py-3 shadow-md bg-green-600 hover:bg-green-700 text-white cursor-not-allowed`}
                >
                  {t('subscribedButton')}
                </Button>
              ) : (
                <div className="w-full space-y-2">
                  {tier.price !== undefined && (
                     <Button 
                      onClick={() => onSubscribe(tier, 'TON')}
                      disabled={processingPayment === `${tier.id}-TON` || !isWalletConnected}
                      className={`w-full font-bold text-sm sm:text-base py-2 sm:py-2.5 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-sky-500 to-cyan-500 text-white disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {processingPayment === `${tier.id}-TON` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {processingPayment === `${tier.id}-TON` ? t('common:processing') : `${t('subscribeButton')} (${tier.price} TON)`}
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default MembershipCard;