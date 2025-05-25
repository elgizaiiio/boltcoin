
    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Gamepad2, PlayCircle, Zap } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { GameModal } from '@/components/games/GameModal';
    import { ClickTheCoinGame } from '@/components/games/ClickTheCoinGame';

    const initialGames = (t) => [
      { 
        id: 'click-the-coin', 
        titleKey: 'clickTheCoin.title', 
        descriptionKey: 'clickTheCoin.description', 
        isCustomGame: true,
        gameComponent: ClickTheCoinGame,
        icon: <Zap className="inline-block h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
      }
    ];
    
    const GamesPage = ({ userMembership, updateBoltBalance, userProfile }) => {
      const { t, i18n } = useTranslation(['games', 'common', 'membership']);
      const [games, setGames] = useState(initialGames(t));
      const [selectedGame, setSelectedGame] = useState(null);
      const [isGameModalOpen, setIsGameModalOpen] = useState(false);

      useEffect(() => {
        setGames(initialGames(t));
      }, [t, i18n.language]);

      const handlePlayGame = (game) => {
        setSelectedGame(game);
        setIsGameModalOpen(true);
      };

      return (
        <div className="py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-10"
          >
            <Gamepad2 className="mx-auto h-10 w-10 sm:h-14 sm:w-14 text-yellow-400 mb-2 sm:mb-3 animate-bounce" />
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 px-2">
              {t('mainTitle', { ns: 'games' })}
            </h1>
            <p className="text-sm sm:text-base text-purple-300 mt-1 px-2">
              {t('mainDescription', { ns: 'games' })} {userMembership ? <span className="text-yellow-400 font-bold">({t(userMembership.nameKey, { ns: 'membership' })} {t('memberBonus', { ns: 'games' })})</span> : <Zap className="inline-block h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex"
              >
                <Card className="shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 bg-gray-800/40 backdrop-blur-sm border-purple-500/40 overflow-hidden flex flex-col h-full w-full hover:border-cyan-400 transform hover:-translate-y-1">
                  <CardHeader className="p-3 sm:p-4 flex-grow">
                    <CardTitle className="text-base sm:text-lg text-cyan-300 flex items-center">
                      {game.icon && <span className="mr-1.5 sm:mr-2">{game.icon}</span>}
                      {t(game.titleKey, { ns: 'games' })}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-purple-300 mt-1 min-h-[2.5rem] sm:min-h-[3.5rem]">
                      {t(game.descriptionKey, { ns: 'games' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 mt-auto">
                    <Button 
                      onClick={() => handlePlayGame(game)}
                      className="w-full font-semibold text-xs sm:text-sm py-1.5 sm:py-2 transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg"
                    >
                      <PlayCircle className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {t('playNowButton', { ns: 'games' })}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <GameModal isOpen={isGameModalOpen} setIsOpen={setIsGameModalOpen} game={selectedGame} t={t} updateBoltBalance={updateBoltBalance} userProfile={userProfile} />
        </div>
      );
    };

    export default GamesPage;
  