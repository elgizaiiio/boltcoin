import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Loader2 } from 'lucide-react';

    const TWA_RETURN_URL_BASE = 'https://t.me/BoltCoinDev_Bot/BoltCoinDevApp';

    const BuyTicketsModal = ({ 
      t, 
      isOpen, 
      onClose, 
      tonBalance,
      isWalletConnected,
      buyAmount, 
      setBuyAmount, 
      onConfirmBuy, 
      isProcessingPayment,
      ticketPriceTon,
      tonConnectUI, 
      setOptions 
    }) => {
      const totalCostTon = buyAmount * ticketPriceTon;

      React.useEffect(() => {
        if (isOpen && tonConnectUI && setOptions) {
            const fromParam = `from=buy_spin_tickets_modal_open_amount_${buyAmount}`;
            setOptions({
                actionsConfiguration: {
                    twaReturnUrl: `${TWA_RETURN_URL_BASE}?${fromParam}`
                }
            });
        }
      }, [isOpen, tonConnectUI, setOptions, buyAmount]);


      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-800 via-purple-900 to-gray-800 border-purple-500/50 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl text-purple-300">{t('games:spinAndWin.buyTicketsModal.title')}</DialogTitle>
            </DialogHeader>
            
            <DialogDescription className="text-xs sm:text-sm text-gray-400 mb-2">
                {t('games:spinAndWin.buyTicketsModal.descriptionTon')}
            </DialogDescription>
            <div className="space-y-3 sm:space-y-4 py-2">
              <p className="text-sm text-cyan-300">{t('games:spinAndWin.buyTicketsModal.tonBalance', { balance: isWalletConnected ? tonBalance.toFixed(4) : t('common:na') })}</p>
              <p className="text-sm text-sky-400">{t('games:spinAndWin.buyTicketsModal.ticketPriceTon', { price: ticketPriceTon.toFixed(2) })}</p>
              
              <div>
                <label htmlFor="buyAmountTon" className="block text-xs font-medium text-purple-300 mb-1">{t('games:spinAndWin.buyTicketsModal.quantity')}</label>
                <Input 
                  id="buyAmountTon"
                  type="number" 
                  value={buyAmount} 
                  onChange={(e) => setBuyAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="bg-gray-700/50 border-purple-600 text-gray-200 focus:ring-sky-500 text-sm h-9 sm:h-10"
                />
              </div>
              <p className="text-sm font-semibold text-sky-400">{t('games:spinAndWin.buyTicketsModal.totalCostTon', { cost: totalCostTon.toFixed(2) })}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} className="border-gray-500 text-gray-300 hover:bg-gray-700 text-sm sm:text-base">
                {t('common:cancelButton')}
              </Button>
              <Button onClick={() => onConfirmBuy('TON')} disabled={isProcessingPayment || !isWalletConnected} className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-sm sm:text-base">
                {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isProcessingPayment ? t('common:processing') : t('games:spinAndWin.buyTicketsModal.buyButton')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    export default BuyTicketsModal;