import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Ticket } from 'lucide-react';

    const TicketManager = ({ t, tickets, onSpin, spinning, onBuyTickets }) => {
      return (
        <>
          <p className="text-sm sm:text-base text-purple-300 mb-3 sm:mb-4">
            {t('gamesPage.spinAndWin.ticketsRemaining', { count: tickets })}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-xs">
            <Button
              onClick={onSpin}
              disabled={spinning || tickets < 1}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              {spinning ? t('gamesPage.spinAndWin.spinning') : t('gamesPage.spinAndWin.spinButton')}
            </Button>
            <Button
              variant="outline"
              onClick={onBuyTickets}
              className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 font-bold py-2.5 sm:py-3 text-sm sm:text-base shadow-md transform hover:scale-105 transition-transform duration-200"
            >
              <Ticket className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t('gamesPage.spinAndWin.buyTicketsButton')}
            </Button>
          </div>
        </>
      );
    };

    export default TicketManager;