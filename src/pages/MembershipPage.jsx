import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import MembershipCard from '@/components/membership/MembershipCard';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

const initialMembershipTiersData = [
  {
    id: 'bronze',
    nameKey: 'membership:bronze.name',
    price: 0.5,
    color: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    bgColor: 'bg-orange-500/10',
    buttonGradient: 'from-orange-500 to-yellow-500',
    features: [
      { textKey: 'membership:bronze.feature1', iconKey: 'Zap' },
      { textKey: 'membership:bronze.feature2', iconKey: 'CheckSquare' },
      { textKey: 'membership:bronze.feature3', iconKey: 'Users' },
      { textKey: 'membership:bronze.feature4', iconKey: 'Gamepad2' },
    ],
    miningBonus: 0.1,
    taskBonus: 0.1,
    referralBonus: 0.1,
    dailySpinTickets: 1,
  },
  {
    id: 'silver',
    nameKey: 'membership:silver.name',
    price: 1,
    color: 'text-slate-400',
    borderColor: 'border-slate-500/50',
    bgColor: 'bg-slate-500/10',
    buttonGradient: 'from-slate-500 to-gray-500',
    features: [
      { textKey: 'membership:silver.feature1', iconKey: 'Zap' },
      { textKey: 'membership:silver.feature2', iconKey: 'CheckSquare' },
      { textKey: 'membership:silver.feature3', iconKey: 'Users' },
      { textKey: 'membership:silver.feature4', iconKey: 'Gamepad2' },
    ],
    miningBonus: 0.25,
    taskBonus: 0.25,
    referralBonus: 0.25,
    dailySpinTickets: 2,
  },
  {
    id: 'gold',
    nameKey: 'membership:gold.name',
    price: 2.5,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-500/10',
    buttonGradient: 'from-yellow-500 to-amber-500',
    features: [
      { textKey: 'membership:gold.feature1', iconKey: 'Zap' },
      { textKey: 'membership:gold.feature2', iconKey: 'CheckSquare' },
      { textKey: 'membership:gold.feature3', iconKey: 'Users' },
      { textKey: 'membership:gold.feature4', iconKey: 'Gamepad2' },
      { textKey: 'membership:gold.feature5', iconKey: 'ShieldCheck' },
    ],
    miningBonus: 0.5,
    taskBonus: 0.5,
    referralBonus: 0.5,
    dailySpinTickets: 5,
  },
];

const BOLTCOIN_TREASURY_WALLET = 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R';
const TWA_RETURN_URL_BASE = 'https://t.me/BoltCoinDev_Bot/BoltCoinDevApp';

const MembershipPage = ({ updateUserMembership, userProfile }) => {
  const { t } = useTranslation(['membership', 'wallet', 'common']);
  const { toast } = useToast();
  const [currentMembershipId, setCurrentMembershipId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  const wallet = useTonWallet();
  const [tonConnectUI, setOptions] = useTonConnectUI();

  useEffect(() => {
    if (userProfile?.membership_tier) {
      setCurrentMembershipId(userProfile.membership_tier);
    } else {
      const storedMembership = localStorage.getItem('userMembership');
      if (storedMembership) {
        const parsedMembership = JSON.parse(storedMembership);
        setCurrentMembershipId(parsedMembership.id);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (tonConnectUI) {
      setOptions({
        actionsConfiguration: {
          twaReturnUrl: `${TWA_RETURN_URL_BASE}?from=membership_purchase`,
        },
      });
    }
  }, [tonConnectUI, setOptions]);

  const onSubscribe = async (tier, currency) => {
    if (!wallet) {
      toast({
        title: t('wallet:connectWalletTitle'),
        description: t('wallet:connectWalletDescription'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessingPayment(tier.id);

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: BOLTCOIN_TREASURY_WALLET,
            amount: (tier.price * 1e9).toString(),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);

      await supabase
        .from('profiles')
        .update({ membership_tier: tier.id })
        .eq('id', userProfile.id);

      updateUserMembership(tier.id);
      setCurrentMembershipId(tier.id);
      localStorage.setItem('userMembership', JSON.stringify({ id: tier.id }));

      toast({
        title: t('membership:purchaseSuccessTitle'),
        description: t('membership:purchaseSuccessDescription'),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: t('membership:purchaseErrorTitle'),
        description: t('membership:purchaseErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  return (
    <div className="py-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-12"
      >
        <Crown className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 mb-3 sm:mb-4 animate-pulse" />
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 px-2">
          {t('mainTitle')}
        </h1>
        <p className="text-base sm:text-lg text-purple-300 mt-1 sm:mt-2 px-2">
          {t('mainDescription')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {initialMembershipTiersData.map((tier, index) => (
          <MembershipCard
            key={tier.id}
            tier={tier}
            index={index}
            t={t}
            currentMembershipId={currentMembershipId}
            processingPayment={processingPayment}
            onSubscribe={onSubscribe}
            isWalletConnected={!!wallet}
          />
        ))}
      </div>
    </div>
  );
};

export default MembershipPage;