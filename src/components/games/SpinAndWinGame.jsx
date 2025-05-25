import React, { useState, useEffect, useRef } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import Wheel from './spinAndWin/subcomponents/Wheel';
    import TicketManager from './spinAndWin/subcomponents/TicketManager';
    import BuyTicketsModal from './spinAndWin/subcomponents/BuyTicketsModal';
    import { supabase } from '@/lib/supabaseClient';
    import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
    import { 
      TICKET_PRICE_TON,
      fetchSpinTickets, 
      updateTicketsInDB,
      determineWinningSegment,
      processSpinWin,
      segments,
      createBuyTicketsTransactionTon
    } from './spinAndWin/SpinAndWinGameLogic';

    const TWA_RETURN_URL_BASE = 'https://t.me/BoltCoinDev_Bot/BoltCoinDevApp';

    const SpinAndWinGame = ({ t, onGameEnd, updateBoltBalance, userProfile }) => {
      const { toast } = useToast();
      const [spinning, setSpinning] = useState(false);
      const [rotation, setRotation] = useState(0);
      const [tickets, setTickets] = useState(1); 
      const [isBuyTicketsModalOpen, setIsBuyTicketsModalOpen] = useState(false);
      const [buyAmount, setBuyAmount] = useState(1);
      const [boltBalance, setBoltBalance] = useState(0); 
      const [tonBalance, setTonBalance] = useState(0);
      const [isProcessingPayment, setIsProcessingPayment] = useState(false);

      const wheelRef = useRef(null);
      const wallet = useTonWallet();
      const [tonConnectUI, setOptions] = useTonConnectUI();

      useEffect(() => {
        fetchSpinTickets(userProfile, setTickets);
        if (userProfile?.bolt_balance !== undefined) {
          setBoltBalance(userProfile.bolt_balance);
        }
      }, [userProfile]);

      useEffect(() => {
        const fetchUserTonBalance = async () => {
          if (wallet?.account?.balance) {
            setTonBalance(parseFloat(wallet.account.balance) / 1_000_000_000);
          } else {
            setTonBalance(0);
          }
        };
        if (wallet) {
          fetchUserTonBalance();
        } else {
          setTonBalance(0);
        }
      }, [wallet]);
      
      useEffect(() => {
        if (userProfile?.id && tickets !== null && tickets !== undefined) {
           localStorage.setItem('spinTicketsFallback', tickets.toString()); 
        }
      }, [tickets, userProfile]);

      useEffect(() => {
        if (isBuyTicketsModalOpen && userProfile?.bolt_balance !== undefined) {
            setBoltBalance(userProfile.bolt_balance);
        }
      }, [isBuyTicketsModalOpen, userProfile]);


      const handleSpin = async () => {
        if (tickets < 1) {
          toast({ title: t('games:spinAndWin.noTickets'), variant: 'destructive' });
          return;
        }
        if (spinning) return;

        setSpinning(true);
        const newTicketCount = tickets - 1;
        setTickets(newTicketCount);
        await updateTicketsInDB(userProfile?.id, newTicketCount);

        const { winningSegment, targetRotation } = determineWinningSegment();
        setRotation(prevRotation => prevRotation - targetRotation); 

        setTimeout(async () => {
          setSpinning(false);
          await processSpinWin(winningSegment, newTicketCount, userProfile?.id, updateBoltBalance, setTickets, t, toast);
          if (onGameEnd) {
            onGameEnd(0, { reward: winningSegment.label }); 
          }
        }, 5000); 
      };

      const handleBuyTickets = async (currency) => {
        setIsProcessingPayment(true);
        
        const fromParam = `from=spin_win_ticket_purchase_amount_${buyAmount}`;
        if (tonConnectUI) {
            setOptions({
                actionsConfiguration: {
                    twaReturnUrl: `${TWA_RETURN_URL_BASE}?${fromParam}`
                }
            });
        }

        if (currency === 'TON') {
            if (!wallet) {
                toast({ title: t('wallet:notConnected'), description: t('wallet:connectToProceed'), variant: 'destructive' });
                if (tonConnectUI) tonConnectUI.openModal();
                setIsProcessingPayment(false);
                return;
            }
            const totalCostTon = buyAmount * TICKET_PRICE_TON;
             if (tonBalance < totalCostTon && false) { 
                toast({ title: t('games:spinAndWin.buyTicketsModal.purchaseError'), description: t('games:spinAndWin.buyTicketsModal.insufficientTon'), variant: 'destructive' });
                setIsProcessingPayment(false);
                return;
            }
            const transaction = createBuyTicketsTransactionTon(buyAmount, userProfile);
            try {
                toast({ title: t('games:spinAndWin.buyTicketsModal.processingPaymentTitle'), description: t('games:spinAndWin.buyTicketsModal.processingPaymentDescriptionTon', { amount: buyAmount, cost: totalCostTon.toFixed(2) }) });
                const result = await tonConnectUI.sendTransaction(transaction);
                const boc = result.boc;

                const newTotalTickets = tickets + buyAmount;
                setTickets(newTotalTickets);
                if(userProfile?.id) {
                  const { error: dbError } = await supabase.from('users').update({ spin_tickets: newTotalTickets }).eq('id', userProfile.id);
                  if (dbError) {
                    console.error('Error updating tickets (TON) in DB:', dbError);
                    toast({ title: t('common:toast.errorTitle'), description: t('common:dbUpdateError'), variant: 'destructive' });
                    setTickets(tickets);
                  } else {
                    toast({ title: t('games:spinAndWin.buyTicketsModal.purchaseSuccessTitle'), description: t('games:spinAndWin.buyTicketsModal.purchaseSuccessDescription', { amount: buyAmount }), variant: 'success' });
                  }
                } else {
                    toast({ title: t('games:spinAndWin.buyTicketsModal.purchaseSuccessTitle'), description: t('games:spinAndWin.buyTicketsModal.purchaseSuccessDescription', { amount: buyAmount }), variant: 'success' });
                }
            } catch (error) {
                console.error('TON Purchase Error for buying tickets:', error);
                let errorMessage = t('common:toastMessages.transactionFailed');
                if (error && typeof error === 'object' && 'message' in error) {
                    errorMessage = error.message;
                    if (error.message.toLowerCase().includes('user rejected')) errorMessage = t('common:toastMessages.userRejectedTransaction');
                    else if (error.message.toLowerCase().includes('insufficient funds')) errorMessage = t('common:toastMessages.insufficientTonBalance');
                    else if (error.message.toLowerCase().includes("popup_closed")) errorMessage = t('common:toastMessages.popupClosed');
                    else if (error.message.toLowerCase().includes("timeout")) errorMessage = t('common:toastMessages.transactionExpired');
                    else errorMessage = t('common:toastMessages.genericError');
                }
                toast({ title: t('games:spinAndWin.buyTicketsModal.purchaseError'), description: errorMessage, variant: 'destructive' });
            } finally {
                setIsProcessingPayment(false);
                setIsBuyTicketsModalOpen(false);
            }
        } else {
            setIsProcessingPayment(false);
        }
      };

      return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 h-full text-white">
          <motion.h2 
            className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t('games:spinAndWin.gameTitle')}
          </motion.h2>

          <Wheel segments={segments} rotation={rotation} wheelRef={wheelRef} />
          
          <TicketManager 
            t={t} 
            tickets={tickets} 
            onSpin={handleSpin} 
            spinning={spinning} 
            onBuyTickets={() => setIsBuyTicketsModalOpen(true)} 
          />
          
          <BuyTicketsModal
            t={t}
            isOpen={isBuyTicketsModalOpen}
            onClose={() => setIsBuyTicketsModalOpen(false)}
            tonBalance={tonBalance}
            isWalletConnected={!!wallet}
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            onConfirmBuy={handleBuyTickets}
            isProcessingPayment={isProcessingPayment}
            ticketPriceTon={TICKET_PRICE_TON}
            tonConnectUI={tonConnectUI}
            setOptions={setOptions}
          />
        </div>
      );
    };

    export default SpinAndWinGame;