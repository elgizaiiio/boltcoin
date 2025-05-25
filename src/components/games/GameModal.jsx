import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    export const GameModal = ({ isOpen, setIsOpen, game, t, updateBoltBalance }) => {
      const { toast } = useToast(); 

      if (!game) return null;

      const handleGameEnd = (score, gameSpecificData = {}) => {
        let toastTitle = t('gamesPage.genericGameEndToast.title');
        let toastDescription;

        if (game.id === 'click-the-coin') {
          toastTitle = t('gamesPage.clickTheCoin.gameOver');
          toastDescription = t('gamesPage.clickTheCoin.finalScoreToast', { score, level: gameSpecificData.level || 1 });
        } else if (game.id === 'lightning-dodger') {
          toastTitle = t('gamesPage.lightningDodger.gameOver');
          toastDescription = t('gamesPage.lightningDodger.finalScoreToast', { score, duration: gameSpecificData.duration || 0 });
        } else if (game.id === 'spin-and-win') {
          toastTitle = t('gamesPage.spinAndWin.congratsTitle');
          toastDescription = t('gamesPage.spinAndWin.wonMessage', { prize: gameSpecificData.reward || 0 });
        } else {
          toastDescription = t('gamesPage.genericGameEndToast.description', { score });
        }
        
        toast({
          title: toastTitle,
          description: toastDescription,
          variant: 'success'
        });
      };
    
      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-[95vw] sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] h-[85vh] sm:h-[80vh] p-0 bg-gray-900 border-purple-500/50 flex flex-col">
            <DialogHeader className="p-3 sm:p-4 bg-gray-800 rounded-t-lg">
              <DialogTitle className="text-lg sm:text-xl text-purple-300">{t(game.titleKey)}</DialogTitle>
              {!game.isCustomGame && <DialogDescription className="text-xs sm:text-sm text-gray-400">{t('gamesPage.loadingGameToast.description', { gameTitle: t(game.titleKey) })}</DialogDescription>}
            </DialogHeader>
            <div className="flex-grow p-1 sm:p-2 overflow-y-auto">
              {game.isCustomGame && game.gameComponent ? (
                React.createElement(game.gameComponent, { t, onGameEnd: handleGameEnd, updateBoltBalance })
              ) : game.gameUrl ? (
                <iframe
                  src={game.gameUrl}
                  title={t(game.titleKey)}
                  className="w-full h-full border-0 rounded-b-lg"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-800 rounded-b-lg p-4 text-center">
                  <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mb-3 sm:mb-4" />
                  <p className="text-lg sm:text-xl font-semibold">{t('gamesPage.gameNotAvailable.title')}</p>
                  <p className="text-sm sm:text-base text-gray-400">{t('gamesPage.gameNotAvailable.description')}</p>
                </div>
              )}
            </div>
            <DialogFooter className="p-3 sm:p-4 bg-gray-800 rounded-b-lg">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-purple-500 text-purple-300 hover:bg-purple-500/20 w-full sm:w-auto text-sm sm:text-base py-1.5 sm:py-2">
                  {t('gamesPage.closeGameButton')}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };