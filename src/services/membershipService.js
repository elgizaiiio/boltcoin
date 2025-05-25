
    export const handleMembershipPurchase = async ({
        tier,
        currency,
        userProfile,
        wallet,
        tonConnectUI,
        BOLTCOIN_TREASURY_WALLET,
        setProcessingPayment,
        updateUserMembership,
        setCurrentMembershipId,
        toast,
        t,
        supabase
    }) => {
        setProcessingPayment(`${tier.id}-${currency}`);

        if (currency === 'TON') {
            if (!wallet) {
              toast({ title: t('wallet:notConnected'), description: t('wallet:connectToProceed'), variant: 'destructive' });
              if (tonConnectUI) tonConnectUI.openModal();
              setProcessingPayment(null);
              return;
            }
            
            const payloadComment = `subscribe_membership_${tier.id}_user_${userProfile?.id || 'unknown_user'}_time_${Date.now()}`;
            const transaction = {
              validUntil: Math.floor(Date.now() / 1000) + 600, 
              messages: [ { address: BOLTCOIN_TREASURY_WALLET, amount: (tier.price * 1_000_000_000).toString(), payload: btoa(payloadComment) } ],
            };

            try {
              toast({ title: t('membership:purchaseToast.title', { tierName: t(tier.nameKey, { ns: 'membership' }) }), description: t('membership:purchaseToast.description', { price: tier.price, ns: 'membership' }) });
              const result = await tonConnectUI.sendTransaction(transaction);
              
              updateUserMembership(tier); 
              setCurrentMembershipId(tier.id);
              localStorage.setItem('userMembership', JSON.stringify(tier));

              if (userProfile?.id) {
                const { error: dbError } = await supabase
                  .from('users')
                  .update({ membership_tier: tier.id, membership_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }) 
                  .eq('id', userProfile.id);
                if (dbError) {
                  console.error('Error updating user membership (TON) in DB:', dbError);
                  toast({ title: t('common:toast.errorTitle'), description: t('membership:dbUpdateError'), variant: 'destructive' });
                } else {
                  toast({ title: t('membership:activationSuccess'), description: t('membership:enjoyBenefits', { tierName: t(tier.nameKey, { ns: 'membership' }) }), variant: 'success' });
                }
              }
            } catch (error) {
              console.error('TON Transaction Error for membership:', error);
              let errorMessage = t('membership:transactionFailed');
              if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = error.message;
                if (error.message.toLowerCase().includes('user rejected') || error.message.toLowerCase().includes('user declined')) errorMessage = t('common:toastMessages.userRejectedTransaction');
                else if (error.message.toLowerCase().includes('insufficient funds') || error.message.toLowerCase().includes('not enough balance')) errorMessage = t('common:toastMessages.insufficientTonBalance');
                else if (error.message.toLowerCase().includes("popup_closed") || error.message.toLowerCase().includes("window was closed")) errorMessage = t('common:toastMessages.popupClosed');
                else if (error.message.toLowerCase().includes("timeout") || error.message.toLowerCase().includes("expired")) errorMessage = t('common:toastMessages.transactionExpired');
                else errorMessage = t('common:toastMessages.genericError');
              } else if (typeof error === 'string') {
                errorMessage = error;
              }
              toast({ title: t('membership:activationError'), description: errorMessage, variant: 'destructive' });
            } finally {
              setProcessingPayment(null);
            }
        } else {
            setProcessingPayment(null);
            console.warn("Unsupported currency for membership purchase:", currency);
            toast({ title: t('common:toast.errorTitle'), description: "Unsupported currency.", variant: 'destructive' });
        }
    };